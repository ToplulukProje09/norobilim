// app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Event } from "@/types/event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ Zaman normalizasyonu fonksiyonu
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
export async function GET(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    console.log("GET /api/events - İstek alındı");

    const db = await getDb();
    const events = await db
      .collection("Event")
      .find({})
      .sort({ _id: -1 }) // En yeni önce
      .toArray();

    console.log(`${events.length} etkinlik bulundu`);

    return NextResponse.json(events, { status: 200, headers });
  } catch (err: any) {
    console.error("GET /api/events error:", err);
    return NextResponse.json(
      {
        error: err.message || "Etkinlikler alınamadı",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      { status: 500, headers }
    );
  }
}

// ✅ POST -> Yeni etkinlik oluştur
export async function POST(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    console.log("POST /api/events - İstek alındı");

    const data: Event = await req.json();
    console.log("Gelen veri:", JSON.stringify(data, null, 2));

    // ✅ Validasyon
    if (
      !data.title?.trim() ||
      !data.description?.trim() ||
      !data.location?.trim()
    ) {
      return NextResponse.json(
        { error: "Başlık, açıklama ve konum alanları zorunludur" },
        { status: 400, headers }
      );
    }

    if (!data.eventDays?.length) {
      return NextResponse.json(
        { error: "En az bir etkinlik günü eklenmelidir" },
        { status: 400, headers }
      );
    }

    const db = await getDb();

    // ✅ EventDays verilerini hazırla
    const eventDaysData = data.eventDays.map((day) => {
      const { startTime, endTime } = normalizeTimes(day);
      return {
        date: new Date(day.date),
        startTime,
        endTime: endTime || null,
        details: day.details || null,
      };
    });

    const newEvent = {
      title: data.title.trim(),
      description: data.description.trim(),
      image: data.image?.trim() || null,
      location: data.location.trim(),
      didItHappen: Boolean(data.didItHappen),
      numberOfAttendees: data.numberOfAttendees || null,
      estimatedAttendees: data.estimatedAttendees || null,
      eventImages: Array.isArray(data.eventImages) ? data.eventImages : [],
      eventDays: eventDaysData,
      createdAt: new Date(),
    };

    const result = await db.collection("Event").insertOne(newEvent);

    return NextResponse.json(
      { ...newEvent, _id: result.insertedId },
      { status: 201, headers }
    );
  } catch (err: any) {
    console.error("POST /api/events error:", err);
    return NextResponse.json(
      {
        error: err.message || "Etkinlik oluşturulamadı",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      { status: 500, headers }
    );
  }
}

// ✅ OPTIONS handler - CORS için gerekli
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
