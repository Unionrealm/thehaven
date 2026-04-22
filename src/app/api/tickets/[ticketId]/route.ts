import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ ticketId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { ticketId } = await params;

  const { data: purchase, error } = await supabase
    .from("Purchase")
    .select("id, ticketNumber, checkedIn")
    .eq("id", ticketId)
    .single();

  if (error || !purchase) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(purchase);
}
