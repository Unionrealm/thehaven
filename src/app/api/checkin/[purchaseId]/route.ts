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
    .select()
    .single();

  if (error || !purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, checkedIn: (purchase as Record<string, unknown>).checkedIn });
}
