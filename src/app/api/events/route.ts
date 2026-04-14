import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  const formData = await request.formData();

  const eventName = formData.get("eventName") as string;
  const category = formData.get("category") as string;
  const dateStr = formData.get("date") as string;
  const endTime = formData.get("endTime") as string;
  const location = formData.get("location") as string;
  const description = formData.get("description") as string;
  const seatInfo = formData.get("seatInfo") as string;
  const ticketsJson = formData.get("tickets") as string;
  const questionsJson = formData.get("questions") as string;

  const tickets = JSON.parse(ticketsJson) as { name: string; price: string; qty: string }[];
  const questions = JSON.parse(questionsJson) as string[];

  // TODO: Upload poster to Supabase Storage
  // const poster = formData.get("poster") as File | null;

  const event = await prisma.event.create({
    data: {
      slug: generateSlug(eventName),
      title: eventName,
      category,
      date: new Date(dateStr),
      endTime: endTime || null,
      location,
      description,
      seatInfo: seatInfo || null,
      hostId: "temp-host-id", // TODO: get from session
      tickets: {
        create: tickets
          .filter((t) => t.name && t.price && t.qty)
          .map((t) => ({
            name: t.name,
            price: parseInt(t.price),
            totalQty: parseInt(t.qty),
          })),
      },
      extraQuestions: {
        create: questions.map((q) => ({ label: q })),
      },
    },
  });

  return NextResponse.json({ eventId: event.id });
}
