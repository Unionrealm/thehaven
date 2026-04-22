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
    .select("id, ticketId, paidAmount")
    .eq("id", purchaseId)
    .single();

  if (error || !purchase) {
    return NextResponse.json({ status: "not_found" }, { status: 404 });
  }

  const row = purchase as Record<string, unknown>;
  const paid = typeof row.paidAmount === "number" && (row.paidAmount as number) > 0;

  return NextResponse.json({
    status: paid ? "paid" : "pending",
    ticketId: row.ticketId as string,
  });
}
