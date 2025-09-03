import ShowEventsList from "./_components/ShowEventsList";
import { prisma } from "@/lib/prisma";
import type { EventWithDays } from "@/types/event";
import { normalizeEvent } from "@/types/event";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EventsListPage() {
  try {
    // Prisma’dan gelen ham veri
    const eventsFromDb: EventWithDays[] = await prisma.event.findMany({
      include: { eventDays: { orderBy: { date: "asc" } } },
    });

    // Normalize edip Event[] tipine dönüştür
    const events = eventsFromDb.map(normalizeEvent);

    return <ShowEventsList events={events} />;
  } catch (error: any) {
    console.error("Failed to fetch events:", error);
    return <div>Etkinlikler yüklenemedi.</div>;
  }
}
