// app/eventslist/page.tsx
import ShowEventsList from "./_components/ShowEventsList";
import type { Event } from "@/types/event";
import { prisma } from "@/lib/prisma";

// ✅ Bu ayarlar çok kritik - dynamic rendering için
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

// ✅ Direct database çağrısı - fetch yerine
async function getEvents(): Promise<Event[]> {
  try {
    console.log("🔄 Events getiriliyor...");

    // ✅ Direkt Prisma kullan - fetch kullanma
    const events = await prisma.event.findMany({
      include: {
        eventDays: {
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    console.log(`✅ ${events.length} event bulundu`);

    // ✅ Date serialization için transform
    const serializedEvents = events.map((event) => ({
      ...event,
      eventDays: event.eventDays.map((day) => ({
        ...day,
        date: day.date.toISOString(), // Date'i string'e çevir
      })),
    }));

    return serializedEvents;
  } catch (error: any) {
    console.error("❌ Events fetch error:", error);

    // ✅ Error durumunda boş array döndür
    return [];
  }
}

export default async function EventsListPage() {
  console.log("🎯 EventsListPage rendering...");

  // ✅ Direct database call
  const events = await getEvents();

  console.log(`📊 Rendering ${events.length} events`);

  return (
    <div>
      <ShowEventsList events={events} />
    </div>
  );
}
