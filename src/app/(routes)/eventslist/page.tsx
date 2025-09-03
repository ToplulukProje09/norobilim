// app/(routes)/eventslist/page.tsx
import ShowEventsList from "./_components/ShowEventsList";
import { prisma } from "@/lib/prisma";
import { normalizeEvent, EventWithDays } from "@/types/event";

export const dynamic = "force-dynamic"; // SSR zorunlu
export const runtime = "nodejs"; // Prisma için nodejs runtime

export default async function EventsListPage() {
  try {
    const events: EventWithDays[] = await prisma.event.findMany({
      include: {
        eventDays: {
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
        },
      },
    });

    // ✅ normalize edip string date'e çeviriyoruz
    const normalized = events.map(normalizeEvent);

    return <ShowEventsList events={normalized} />;
  } catch (error) {
    console.error("❌ Failed to load events:", error);
    return <ShowEventsList events={[]} />;
  }
}
