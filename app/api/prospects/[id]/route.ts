import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth";
import { updateProspectStatus } from "@/lib/data";
import { handleApiError } from "@/lib/api";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminRequest(request);

    if (Number.isNaN(Number(params.id))) {
      return NextResponse.json({ error: "Prospect id is invalid." }, { status: 400 });
    }

    const body = (await request.json()) as { status?: string };
    updateProspectStatus(Number(params.id), body.status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
