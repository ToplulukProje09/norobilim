import ShowEventsList from "./_components/ShowEventsList";
import { prisma } from "@/lib/prisma";
import { normalizeEvent } from "@/types/event";

export const dynamic = "force-dynamic"; // ✅ Her istekte yeniden oluşturulur, statik derleme hatasını engeller.
export const runtime = "nodejs"; // ✅ Prisma için Node.js çalışma zamanını zorunlu kılar.

export default async function EventsListPage() {
  try {
    const events = await prisma.event.findMany({
      include: {
        eventDays: { orderBy: [{ date: "asc" }, { startTime: "asc" }] },
      },
    });

    const normalized = events.map(normalizeEvent);
    return <ShowEventsList events={normalized} />;
  } catch (err) {
    console.error("❌ Failed to fetch events:", err);
    return <ShowEventsList events={[]} />;
  }
}
