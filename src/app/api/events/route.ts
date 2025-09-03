// app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Event } from "@/types/event";

// ✅ Runtime konfigürasyonu
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
  // ✅ CORS headers ekle
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    console.log("GET /api/events - İstek alındı");

    // ✅ Prisma bağlantısını kontrol et
    await prisma.$connect();
    console.log("Database bağlantısı başarılı");

    const events = await prisma.event.findMany({
      include: {
        eventDays: {
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
        },
      },
      orderBy: {
        id: "desc", // En yeni etkinlikler önce
      },
    });

    console.log(`${events.length} etkinlik bulundu`);

    return NextResponse.json(events, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("GET /api/events error:", err);

    // ✅ Detaylı hata logu
    if (err.code) {
      console.error("Database error code:", err.code);
    }
    if (err.message) {
      console.error("Error message:", err.message);
    }

    return NextResponse.json(
      {
        error: err.message || "Etkinlikler alınamadı",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      {
        status: 500,
        headers,
      }
    );
  } finally {
    // ✅ Bağlantıyı kapat
    await prisma.$disconnect();
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

    await prisma.$connect();

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

    const newEvent = await prisma.event.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        image: data.image?.trim() || null,
        location: data.location.trim(),
        didItHappen: Boolean(data.didItHappen),
        numberOfAttendees: data.numberOfAttendees || null,
        estimatedAttendees: data.estimatedAttendees || null,
        eventImages: Array.isArray(data.eventImages) ? data.eventImages : [],
        eventDays: {
          createMany: {
            data: eventDaysData,
          },
        },
      },
      include: {
        eventDays: {
          orderBy: { date: "asc" },
        },
      },
    });

    console.log("Yeni etkinlik oluşturuldu:", newEvent.id);

    return NextResponse.json(newEvent, {
      status: 201,
      headers,
    });
  } catch (err: any) {
    console.error("POST /api/events error:", err);

    return NextResponse.json(
      {
        error: err.message || "Etkinlik oluşturulamadı",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      {
        status: 500,
        headers,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ OPTIONS handler - CORS için gerekli
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
