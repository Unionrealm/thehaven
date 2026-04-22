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
    .select("*, Ticket(*)")
    .eq("paymentId", paymentId)
    .single();

  if (error || !purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  const row = purchase as Record<string, unknown>;

  // TODO: Verify payment amount with Portone API using PORTONE_API_SECRET

  // Update ticket sold count: read current value then increment
  const ticketData = row.Ticket as Record<string, unknown>;
  const currentSoldQty = ticketData.soldQty as number;

  const { error: updateError } = await supabase
    .from("Ticket")
    .update({ soldQty: currentSoldQty + 1 })
    .eq("id", row.ticketId as string);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, purchaseId: row.id });
}
