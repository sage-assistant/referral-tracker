import "server-only";

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, Session, authenticate, decodeSession, encodeSession } from "@/lib/session";
import type { UserRole } from "@/lib/auth-shared";
import { AppError } from "@/lib/errors";

export async function getSession() {
  const cookieStore = cookies();
  return decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function createSession(role: UserRole, username: string) {
  const token = await encodeSession({ role, username });
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireSession();

  if (session.role !== "admin") {
    redirect("/");
  }

  return session;
}

export async function requireAdminRequest(request: NextRequest) {
  const session = await decodeSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    throw new AppError("Authentication required.", 401);
  }

  if (session.role !== "admin") {
    throw new AppError("Admin access required.", 403);
  }

  return session;
}

export async function requireReferrerRequest(request: NextRequest) {
  const session = await decodeSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    throw new AppError("Authentication required.", 401);
  }

  if (session.role !== "referrer") {
    throw new AppError("Referrer access required.", 403);
  }

  return session;
}

export { authenticate };
