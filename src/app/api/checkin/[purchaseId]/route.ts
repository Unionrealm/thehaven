import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ purchaseId: string }>;
}

export async function PATCH(_request: NextRequest, { params }: RouteParams) {
  const { purchaseId } = await params;

  const purchase = await prisma.purchase.update({
    where: { id: purchaseId },
    data: {
      checkedIn: true,
      checkedInAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, checkedIn: purchase.checkedIn });
}
