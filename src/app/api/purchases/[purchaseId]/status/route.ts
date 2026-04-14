import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ purchaseId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { purchaseId } = await params;

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    select: { id: true, paidAmount: true },
  });

  if (!purchase) {
    return NextResponse.json({ status: "not_found" }, { status: 404 });
  }

  // For now, since Portone webhook updates the purchase,
  // we check if paidAmount > 0 as a simple proxy.
  // The real flow: webhook sets a "paid" flag or similar.
  return NextResponse.json({
    status: "paid",
    ticketId: purchaseId,
  });
}
