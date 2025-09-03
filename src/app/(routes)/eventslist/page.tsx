import ShowEventsList from "./_components/ShowEventsList";
import { prisma } from "@/lib/prisma";
import type { EventWithDays } from "@/types/event";
import { normalizeEvent } from "@/types/event";

// ✅ Bu route her zaman runtime'da çalışsın (static build denemesin)
export const dynamic = "force-dynamic";

export default async function EventsListPage() {
  try {
    // Prisma’dan gelen ham veriyi al
    const eventsFromDb: EventWithDays[] = await prisma.event.findMany({
      include: { eventDays: { orderBy: { date: "asc" } } },
    });

    // Tarihleri string’e çevir, tipleri normalize et
    const events = eventsFromDb.map(normalizeEvent);

    return <ShowEventsList events={events} />;
  } catch (error: any) {
    console.error("Failed to fetch events:", error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 font-semibold">
          Etkinlikler yüklenemedi: {error.message}
        </p>
      </div>
    );
  }
}
