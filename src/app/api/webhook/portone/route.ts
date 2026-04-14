import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { paymentId, status } = body;

  if (status !== "PAID") {
    return NextResponse.json({ ok: false });
  }

  // Find purchase by paymentId
  const purchase = await prisma.purchase.findUnique({
    where: { paymentId },
    include: { ticket: true },
  });

  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  // TODO: Verify payment amount with Portone API using PORTONE_API_SECRET

  // Update ticket sold count
  await prisma.$transaction([
    prisma.ticket.update({
      where: { id: purchase.ticketId },
      data: { soldQty: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ ok: true, purchaseId: purchase.id });
}
