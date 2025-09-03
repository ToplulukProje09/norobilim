// app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ ObjectId validasyonu
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// ✅ Context type tanımı - Next.js 15 için
type RouteContext = {
  params: Promise<{ id: string }>;
};

// ✅ GET -> Tek etkinlik
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    console.log("GET /api/events/[id] - İstek alındı");

    // ✅ Params'ı await ile al
    const { id } = await context.params;
    console.log("Event ID:", id);

    // ✅ ObjectId formatını kontrol et
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Geçersiz etkinlik ID formatı" },
        { status: 400, headers: corsHeaders }
      );
    }

    await prisma.$connect();

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        eventDays: {
          orderBy: { date: "asc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Etkinlik bulunamadı" },
        { status: 404, headers: corsHeaders }
      );
    }

    console.log("Etkinlik bulundu:", event.title);

    return NextResponse.json(event, {
      headers: corsHeaders,
    });
  } catch (err: any) {
    console.error("GET /api/events/[id] error:", err);
    return NextResponse.json(
      {
        error: err.message || "Etkinlik getirilemedi",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ PATCH -> Etkinlik güncelle
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    console.log("PATCH /api/events/[id] - İstek alındı");

    const { id } = await context.params;
    console.log("Update Event ID:", id);

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Geçersiz etkinlik ID formatı" },
        { status: 400, headers: corsHeaders }
      );
    }

    const data = await req.json();
    console.log("Update data:", JSON.stringify(data, null, 2));

    await prisma.$connect();

    // ✅ Mevcut etkinliği kontrol et
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return NextResponse.json(
        { error: "Güncellenecek etkinlik bulunamadı" },
        { status: 404, headers: corsHeaders }
      );
    }

    // ✅ Transaction kullanarak güncelleme yap
    const updatedEvent = await prisma.$transaction(async (tx) => {
      // ✅ Eğer eventDays güncelleniyorsa, önce eskilerini sil
      if (data.eventDays && Array.isArray(data.eventDays)) {
        await tx.eventDay.deleteMany({ where: { eventId: id } });

        // ✅ Yeni eventDays'leri hazırla
        const eventDaysToCreate = data.eventDays.map((day: any) => ({
          date: new Date(day.date),
          startTime: day.startTime,
          endTime: day.endTime || null,
          details: day.details || null,
          eventId: id,
        }));

        // ✅ Yeni eventDays'leri oluştur
        if (eventDaysToCreate.length > 0) {
          await tx.eventDay.createMany({
            data: eventDaysToCreate,
          });
        }
      }

      // ✅ Event'i güncelle
      return await tx.event.update({
        where: { id },
        data: {
          title: data.title?.trim(),
          description: data.description?.trim(),
          image: data.image?.trim() || null,
          location: data.location?.trim(),
          didItHappen:
            data.didItHappen !== undefined
              ? Boolean(data.didItHappen)
              : undefined,
          numberOfAttendees: data.numberOfAttendees || null,
          estimatedAttendees: data.estimatedAttendees || null,
          eventImages: Array.isArray(data.eventImages)
            ? data.eventImages
            : undefined,
        },
        include: {
          eventDays: {
            orderBy: { date: "asc" },
          },
        },
      });
    });

    console.log("Etkinlik güncellendi:", updatedEvent.id);

    return NextResponse.json(updatedEvent, {
      headers: corsHeaders,
    });
  } catch (err: any) {
    console.error("PATCH /api/events/[id] error:", err);
    return NextResponse.json(
      {
        error: err.message || "Etkinlik güncellenemedi",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ DELETE -> Etkinlik sil
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    console.log("DELETE /api/events/[id] - İstek alındı");

    const { id } = await context.params;
    console.log("Delete Event ID:", id);

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Geçersiz etkinlik ID formatı" },
        { status: 400, headers: corsHeaders }
      );
    }

    await prisma.$connect();

    // ✅ Mevcut etkinliği kontrol et
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return NextResponse.json(
        { error: "Silinecek etkinlik bulunamadı" },
        { status: 404, headers: corsHeaders }
      );
    }

    // ✅ Transaction ile silme işlemi
    await prisma.$transaction(async (tx) => {
      // ✅ Önce eventDay'leri sil
      await tx.eventDay.deleteMany({ where: { eventId: id } });
      // ✅ Sonra event'i sil
      await tx.event.delete({ where: { id } });
    });

    console.log("Etkinlik silindi:", id);

    return NextResponse.json(
      { message: "Etkinlik başarıyla silindi" },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("DELETE /api/events/[id] error:", err);
    return NextResponse.json(
      {
        error: err.message || "Etkinlik silinemedi",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ OPTIONS handler - CORS için
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
