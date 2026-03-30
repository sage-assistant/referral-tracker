import { AppError } from "@/lib/errors";
import type { Session } from "@/lib/auth-shared";

export type { Session } from "@/lib/auth-shared";

export const SESSION_COOKIE_NAME = "openclaw_session";

const encoder = new TextEncoder();

function getAuthSecret() {
  return process.env.AUTH_SECRET ?? "openclaw-referral-tracker-secret";
}

function getCredentialConfig() {
  return {
    admin: {
      username: process.env.ADMIN_USER ?? "aaron",
      password: process.env.ADMIN_PASS ?? "openclaw2026"
    },
    referrer: {
      username: process.env.REFERRER_USER ?? "harley",
      password: process.env.REFERRER_PASS ?? "referrals2026"
    }
  };
}

function toBase64Url(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  return atob(`${normalized}${padding}`);
}

async function signValue(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(String.fromCharCode(...new Uint8Array(signature)));
}

async function verifySignature(value: string, signature: string) {
  const expected = await signValue(value);
  return expected === signature;
}

export async function encodeSession(session: Session) {
  const payload = toBase64Url(JSON.stringify(session));
  const signature = await signValue(payload);
  return `${payload}.${signature}`;
}

export async function decodeSession(token?: string | null) {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const isValid = await verifySignature(payload, signature);
  if (!isValid) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as Partial<Session>;
    if (
      (parsed.role === "admin" || parsed.role === "referrer") &&
      typeof parsed.username === "string" &&
      parsed.username.length > 0
    ) {
      return { role: parsed.role, username: parsed.username } satisfies Session;
    }
  } catch {
    return null;
  }

  return null;
}

export async function authenticate(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();
  const credentials = getCredentialConfig();

  if (
    normalizedUsername === credentials.admin.username.toLowerCase() &&
    password === credentials.admin.password
  ) {
    return { role: "admin", username: credentials.admin.username } satisfies Session;
  }

  if (
    normalizedUsername === credentials.referrer.username.toLowerCase() &&
    password === credentials.referrer.password
  ) {
    return { role: "referrer", username: credentials.referrer.username } satisfies Session;
  }

  throw new AppError("Invalid username or password.", 401);
}
