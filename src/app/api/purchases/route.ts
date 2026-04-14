import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function generateTicketNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `HAVEN-${num}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { eventId, ticketId, buyerName, buyerPhone, payMethod, amount } = body;

  // Verify ticket availability
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket || ticket.soldQty >= ticket.totalQty) {
    return NextResponse.json({ error: "Ticket sold out" }, { status: 400 });
  }

  const paymentId = `haven_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Generate unique ticket number
  let ticketNumber = generateTicketNumber();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await prisma.purchase.findUnique({ where: { ticketNumber } });
    if (!existing) break;
    ticketNumber = generateTicketNumber();
    attempts++;
  }

  const purchase = await prisma.purchase.create({
    data: {
      ticketNumber,
      eventId,
      ticketId,
      buyerName,
      buyerPhone,
      paidAmount: amount,
      paymentId,
      payMethod,
    },
  });

  return NextResponse.json({ purchaseId: purchase.id, paymentId });
}
