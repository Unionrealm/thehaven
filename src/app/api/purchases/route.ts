import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
  const { data: ticket, error: ticketError } = await supabase
    .from("Ticket")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 400 });
  }

  const row = ticket as Record<string, unknown>;
  if ((row.soldQty as number) >= (row.totalQty as number)) {
    return NextResponse.json({ error: "Ticket sold out" }, { status: 400 });
  }

  const paymentId = `haven_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Generate unique ticket number
  let ticketNumber = generateTicketNumber();
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from("Purchase")
      .select("id")
      .eq("ticketNumber", ticketNumber)
      .single();
    if (!existing) break;
    ticketNumber = generateTicketNumber();
    attempts++;
  }

  const { data: purchase, error: createError } = await supabase
    .from("Purchase")
    .insert({
      ticketNumber,
      eventId,
      ticketId,
      buyerName,
      buyerPhone,
      paidAmount: amount,
      paymentId,
      payMethod,
    })
    .select()
    .single();

  if (createError || !purchase) {
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
  }

  return NextResponse.json({ purchaseId: (purchase as Record<string, unknown>).id, paymentId });
}
