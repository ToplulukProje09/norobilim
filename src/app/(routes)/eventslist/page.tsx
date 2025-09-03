// app/(routes)/eventslist/page.tsx
import ShowEventsList from "./_components/ShowEventsList";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // ✅ static build hatasını engeller

export default async function EventsListPage() {
  try {
    const events = await prisma.event.findMany({
      include: { eventDays: true },
    });

    // ✅ serialize et (Date vs. için)
    const safeEvents = JSON.parse(JSON.stringify(events));

    return <ShowEventsList events={safeEvents} />;
  } catch (error) {
    console.error("Failed to load events:", error);
    return <ShowEventsList events={[]} />;
  }
}
