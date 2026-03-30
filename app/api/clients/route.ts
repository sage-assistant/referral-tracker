import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/data";
import { handleApiError } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = createClient(body);
    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
