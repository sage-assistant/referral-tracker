import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth";
import { deleteClient, updateClient } from "@/lib/data";
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
      return NextResponse.json({ error: "Client id is invalid." }, { status: 400 });
    }
    const body = await request.json();
    const client = updateClient(Number(params.id), body);
    return NextResponse.json({ client });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminRequest(_);
    if (Number.isNaN(Number(params.id))) {
      return NextResponse.json({ error: "Client id is invalid." }, { status: 400 });
    }
    deleteClient(Number(params.id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
