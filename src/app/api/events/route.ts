import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function generateSlug(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 50) +
    "-" +
    Date.now().toString(36)
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const eventName = (formData.get("eventName") as string | null) ?? "";
    const category = (formData.get("category") as string | null) ?? "";
    const dateStr = (formData.get("date") as string | null) ?? "";
    const endTime = (formData.get("endTime") as string | null) ?? "";
    const location = (formData.get("location") as string | null) ?? "";
    const description = (formData.get("description") as string | null) ?? "";
    const seatInfo = (formData.get("seatInfo") as string | null) ?? "";
    const ticketsJson = (formData.get("tickets") as string | null) ?? "[]";
    const questionsJson = (formData.get("questions") as string | null) ?? "[]";

    const missing: string[] = [];
    if (!eventName) missing.push("이벤트 이름");
    if (!category) missing.push("카테고리");
    if (!dateStr) missing.push("날짜/시간");
    if (!location) missing.push("장소");
    if (!description) missing.push("상세 설명");
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `필수 항목이 비어 있어요: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "날짜 형식이 올바르지 않아요." },
        { status: 400 }
      );
    }

    let tickets: { name: string; price: string; qty: string }[] = [];
    let questions: string[] = [];
    try {
      tickets = JSON.parse(ticketsJson);
      questions = JSON.parse(questionsJson);
    } catch {
      return NextResponse.json(
        { error: "티켓/질문 데이터가 손상됐어요." },
        { status: 400 }
      );
    }

    const validTickets = tickets.filter((t) => t.name && t.price && t.qty);
    if (validTickets.length === 0) {
      return NextResponse.json(
        { error: "티켓을 최소 1개 이상 등록해주세요." },
        { status: 400 }
      );
    }

    const eventId = crypto.randomUUID();
    const slug = generateSlug(eventName);

    const { error: eventError } = await supabase.from("Event").insert({
      id: eventId,
      slug,
      title: eventName,
      category,
      date: date.toISOString(),
      endTime: endTime || null,
      location,
      description,
      seatInfo: seatInfo || null,
      hostId: "temp-host-id",
    });

    if (eventError) {
      return NextResponse.json(
        { error: `이벤트 생성 실패: ${eventError.message}` },
        { status: 500 }
      );
    }

    const ticketRows = validTickets.map((t) => ({
      id: crypto.randomUUID(),
      eventId,
      name: t.name,
      price: parseInt(t.price, 10),
      totalQty: parseInt(t.qty, 10),
      soldQty: 0,
    }));

    const { error: ticketError } = await supabase
      .from("Ticket")
      .insert(ticketRows);

    if (ticketError) {
      return NextResponse.json(
        { error: `티켓 생성 실패: ${ticketError.message}` },
        { status: 500 }
      );
    }

    if (questions.length > 0) {
      const questionRows = questions.map((q) => ({
        id: crypto.randomUUID(),
        eventId,
        label: q,
      }));
      await supabase.from("Question").insert(questionRows);
    }

    return NextResponse.json({ eventId });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.";
    return NextResponse.json(
      { error: `이벤트 생성 실패: ${message}` },
      { status: 500 }
    );
  }
}
