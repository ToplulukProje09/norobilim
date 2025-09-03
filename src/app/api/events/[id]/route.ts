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

// ✅ GET -> Tek etkinlik
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: { eventDays: { orderBy: { date: "asc" } } },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Etkinlik bulunamadı" },
        { status: 404 }
      );
    }
    return NextResponse.json(event);
  } catch (err: any) {
    console.error("GET /api/events/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Etkinlik getirilemedi" },
      { status: 500 }
    );
  }
}

// ✅ PATCH -> Etkinlik güncelle
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data: Event = await req.json();

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return NextResponse.json({ error: "Etkinlik yok" }, { status: 404 });
    }

    if (data.eventDays) {
      await prisma.eventDay.deleteMany({ where: { eventId: id } });
    }

    const toCreate =
      data.eventDays?.map((day) => {
        const { startTime, endTime } = normalizeTimes(day);
        return {
          date: new Date(day.date),
          startTime,
          endTime,
          details: day.details,
        };
      }) ?? [];

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        location: data.location,
        didItHappen: data.didItHappen,
        numberOfAttendees: data.numberOfAttendees,
        estimatedAttendees: data.estimatedAttendees,
        eventImages: Array.isArray(data.eventImages)
          ? data.eventImages
          : undefined,
        eventDays: data.eventDays
          ? { createMany: { data: toCreate } }
          : undefined,
      },
      include: { eventDays: true },
    });

    return NextResponse.json(updatedEvent);
  } catch (err: any) {
    console.error("PATCH /api/events/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Etkinlik güncellenemedi" },
      { status: 500 }
    );
  }
}

// ✅ DELETE -> Etkinlik sil
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return NextResponse.json({ error: "Etkinlik yok" }, { status: 404 });
    }

    await prisma.eventDay.deleteMany({ where: { eventId: id } });
    await prisma.event.delete({ where: { id } });

    return NextResponse.json({ message: "Etkinlik başarıyla silindi" });
  } catch (err: any) {
    console.error("DELETE /api/events/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Etkinlik silinemedi" },
      { status: 500 }
    );
  }
}
