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

  if (!eventId || !ticketId || !buyerName || !buyerPhone || !payMethod || amount == null) {
    return NextResponse.json({ error: "필수 항목이 누락됐어요." }, { status: 400 });
  }

  // Verify ticket exists and has availability
  const { data: ticket, error: ticketError } = await supabase
    .from("Ticket")
    .select("id, soldQty, totalQty")
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    return NextResponse.json({ error: "티켓을 찾을 수 없어요." }, { status: 400 });
  }

  const row = ticket as Record<string, unknown>;
  if ((row.soldQty as number) >= (row.totalQty as number)) {
    return NextResponse.json({ error: "매진된 티켓이에요." }, { status: 400 });
  }

  const paymentId = `haven_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Generate a unique ticket number
  let ticketNumber = generateTicketNumber();
  for (let i = 0; i < 10; i++) {
    const { data: existing } = await supabase
      .from("Purchase")
      .select("id")
      .eq("ticketNumber", ticketNumber)
      .maybeSingle();
    if (!existing) break;
    ticketNumber = generateTicketNumber();
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
      payMethod: payMethod ?? "KAKAO_PAY",
      checkedIn: false,
    })
    .select("id, paymentId")
    .single();

  if (createError || !purchase) {
    return NextResponse.json(
      { error: `구매 생성 실패: ${createError?.message ?? "unknown"}` },
      { status: 500 }
    );
  }

  const p = purchase as Record<string, unknown>;
  return NextResponse.json({ purchaseId: p.id, paymentId: p.paymentId });
}
