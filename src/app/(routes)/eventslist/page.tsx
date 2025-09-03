// app/eventslist/page.tsx - KESIN ÇÖZÜM
import { Suspense } from "react";
import ShowEventsList from "./_components/ShowEventsList";
import type { Event } from "@/types/event";
import { prisma } from "@/lib/prisma";

// ✅ Bu export'lar çok kritik
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// ✅ Loading component
function EventsLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

// ✅ Server Component - Fetch function
async function EventsList() {
  try {
    console.log("🔄 Server: Events fetch başlatılıyor...");

    // ✅ Direkt database bağlantısı - NO FETCH
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

    console.log(`✅ Server: ${events.length} event bulundu`);

    // ✅ JSON serialization için Date'leri string'e çevir
    const serializedEvents: Event[] = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      image: event.image,
      didItHappen: event.didItHappen,
      numberOfAttendees: event.numberOfAttendees,
      location: event.location,
      estimatedAttendees: event.estimatedAttendees,
      eventImages: event.eventImages,
      eventDays: event.eventDays.map((day) => ({
        id: day.id,
        date: day.date.toISOString(), // ✅ Date -> string
        startTime: day.startTime,
        endTime: day.endTime,
        details: day.details,
        eventId: day.eventId,
      })),
    }));

    return <ShowEventsList events={serializedEvents} />;
  } catch (error: any) {
    console.error("❌ Server: Events fetch hatası:", error);

    // ✅ Error fallback
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          Etkinlikler Yüklenemedi
        </h2>
        <p className="text-gray-600 text-center">
          Database bağlantı sorunu yaşanıyor. Lütfen daha sonra tekrar deneyin.
        </p>
        <details className="mt-4 text-sm text-gray-500">
          <summary>Teknik Detay</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded">{error.message}</pre>
        </details>
      </div>
    );
  }
}

// ✅ Main page component
export default function EventsListPage() {
  return (
    <Suspense fallback={<EventsLoading />}>
      <EventsList />
    </Suspense>
  );
}
