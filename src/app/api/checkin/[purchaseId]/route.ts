import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ purchaseId: string }>;
}

export async function PATCH(_request: NextRequest, { params }: RouteParams) {
  const { purchaseId } = await params;

  const { data: purchase, error } = await supabase
    .from("Purchase")
    .update({
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
    })
    .eq("id", purchaseId)
    .select("id, checkedIn, checkedInAt")
    .single();

  if (error) {
    // PGRST116 = no rows matched — treat as not found; others are server errors
    const status = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json(
      { error: status === 404 ? "Purchase not found" : error.message },
      { status }
    );
  }

  const row = purchase as Record<string, unknown>;
  return NextResponse.json({
    ok: true,
    checkedIn: row.checkedIn as boolean,
    checkedInAt: row.checkedInAt as string,
  });
}
