import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ ticketId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { ticketId } = await params;

  const purchase = await prisma.purchase.findUnique({
    where: { id: ticketId },
    select: { id: true, ticketNumber: true, checkedIn: true },
  });

  if (!purchase) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(purchase);
}
