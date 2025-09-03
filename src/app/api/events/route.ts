import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Event } from "@/types/event";

export const runtime = "nodejs";

function normalizeTimes(day: any) {
  const rawStart =
    day?.startTime ??
    (typeof day?.time === "string"
      ? day.time.split("-")[0]?.trim()
      : undefined);
  const rawEnd =
    day?.endTime ??
    (typeof day?.time === "string"
      ? day.time.split("-")[1]?.trim()
      : undefined);

  if (!rawStart) {
    throw new Error("Her eventDay için startTime zorunludur.");
  }

  return { startTime: rawStart, endTime: rawEnd };
}

// ✅ GET -> Tüm etkinlikler
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        eventDays: {
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
        },
      },
    });
    return NextResponse.json(events);
  } catch (err: any) {
    console.error("GET /api/events error:", err);
    return NextResponse.json(
      { error: err.message || "Etkinlikler alınamadı" },
      { status: 500 }
    );
  }
}

// ✅ POST -> Yeni etkinlik oluştur
export async function POST(req: Request) {
  try {
    const data: Event = await req.json();

    if (
      !data.title ||
      !data.description ||
      !data.location ||
      !data.eventDays?.length
    ) {
      return NextResponse.json(
        {
          error:
            "title, description, location ve en az bir etkinlik günü gerekli",
        },
        { status: 400 }
      );
    }

    const eventDaysData = data.eventDays.map((day) => {
      const { startTime, endTime } = normalizeTimes(day);
      return {
        date: new Date(day.date),
        startTime,
        endTime,
        details: day.details,
      };
    });

    const newEvent = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        location: data.location,
        didItHappen: data.didItHappen ?? false,
        numberOfAttendees: data.numberOfAttendees,
        estimatedAttendees: data.estimatedAttendees,
        eventImages: Array.isArray(data.eventImages) ? data.eventImages : [],
        eventDays: {
          createMany: { data: eventDaysData },
        },
      },
      include: { eventDays: true },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/events error:", err);
    return NextResponse.json(
      { error: err.message || "Etkinlik oluşturulamadı" },
      { status: 500 }
    );
  }
}
