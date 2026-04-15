import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Required-field validation up front so failures become readable errors,
    // not opaque Prisma exceptions.
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

    // TODO: Upload poster to Supabase Storage
    // const poster = formData.get("poster") as File | null;

    const event = await prisma.event.create({
      data: {
        slug: generateSlug(eventName),
        title: eventName,
        category,
        date,
        endTime: endTime || null,
        location,
        description,
        seatInfo: seatInfo || null,
        hostId: "temp-host-id", // TODO: get from session
        tickets: {
          create: validTickets.map((t) => ({
            name: t.name,
            price: parseInt(t.price, 10),
            totalQty: parseInt(t.qty, 10),
          })),
        },
        extraQuestions: {
          create: questions.map((q) => ({ label: q })),
        },
      },
    });

    return NextResponse.json({ eventId: event.id });
  } catch (err) {
    // Surface DB/connection errors with a user-friendly hint instead of a
    // generic 500. The most common cause is `DATABASE_URL` not being set on
    // the deployment environment.
    const message =
      err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.";
    const isDbConnectionError =
      /DATABASE_URL|connection|ECONNREFUSED|ENOTFOUND|placeholder/i.test(
        message
      );

    return NextResponse.json(
      {
        error: isDbConnectionError
          ? "데이터베이스가 연결되지 않았어요. Vercel 환경변수에 DATABASE_URL을 설정해주세요."
          : `이벤트 생성 실패: ${message}`,
      },
      { status: 500 }
    );
  }
}
