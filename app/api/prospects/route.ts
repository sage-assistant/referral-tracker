import { NextRequest, NextResponse } from "next/server";
import { requireReferrerRequest } from "@/lib/auth";
import { createProspect } from "@/lib/data";
import { handleApiError } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const session = await requireReferrerRequest(request);
    const body = await request.json();
    const prospect = createProspect(session.username, body);
    return NextResponse.json({ prospect }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
