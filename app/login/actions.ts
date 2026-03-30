"use server";

import { redirect } from "next/navigation";
import { AppError } from "@/lib/errors";
import { authenticate, createSession } from "@/lib/auth";

export async function loginAction(_: { error: string | null }, formData: FormData) {
  try {
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");
    const session = await authenticate(username, password);
    await createSession(session.role, session.username);
    redirect("/");
  } catch (error) {
    return {
      error: error instanceof AppError ? error.message : "Unable to sign in."
    };
  }
}
