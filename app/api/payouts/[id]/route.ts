import { NextRequest, NextResponse } from "next/server";
import { setPayoutPaid } from "@/lib/data";
import { handleApiError } from "@/lib/api";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    if (Number.isNaN(Number(params.id))) {
      return NextResponse.json({ error: "Payout id is invalid." }, { status: 400 });
    }
    const body = (await request.json()) as { paid?: boolean };
    setPayoutPaid(Number(params.id), Boolean(body.paid));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
