import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { paymentId, status } = body;

  if (status !== "PAID") {
    return NextResponse.json({ ok: false });
  }

  // Find purchase by paymentId
  const { data: purchase, error } = await supabase
    .from("Purchase")
    .select("id, ticketId")
    .eq("paymentId", paymentId)
    .single();

  if (error || !purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  const row = purchase as Record<string, unknown>;
  const ticketId = row.ticketId as string;

  // Read current soldQty fresh from DB (not from join cache) before incrementing
  const { data: ticket, error: ticketReadError } = await supabase
    .from("Ticket")
    .select("soldQty")
    .eq("id", ticketId)
    .single();

  if (ticketReadError || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const currentSoldQty = (ticket as Record<string, unknown>).soldQty as number;

  const { error: updateError } = await supabase
    .from("Ticket")
    .update({ soldQty: currentSoldQty + 1 })
    .eq("id", ticketId);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update ticket count" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, purchaseId: row.id });
}
