import { NextResponse } from "next/server";
import { AppError, getErrorMessage } from "@/lib/errors";

export function handleApiError(error: unknown) {
  const message = getErrorMessage(error);
  const status = error instanceof AppError ? error.status : 500;

  if (!(error instanceof AppError)) {
    console.error(error);
  }

  return NextResponse.json({ error: message }, { status });
}
