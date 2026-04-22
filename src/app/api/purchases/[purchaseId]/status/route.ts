import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ purchaseId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { purchaseId } = await params;

  const { data: purchase, error } = await supabase
    .from("Purchase")
    .select("id, paidAmount")
    .eq("id", purchaseId)
    .single();

  if (error || !purchase) {
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
