// app/eventslist/page.tsx
import ShowEventsList from "./_components/ShowEventsList";
import { prisma } from "@/lib/prisma";

// ✅ Bu satırlar MUTLAKA olmalı - hiç değiştirme
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ✅ Hiç fetch kullanmıyoruz - sadece Prisma
async function getEventsDirectly() {
  try {
    // ✅ Direct Prisma call - NO API, NO FETCH
    const rawEvents = await prisma.event.findMany({
      include: {
        eventDays: {
          orderBy: { date: "asc" },
        },
      },
      orderBy: { id: "desc" },
    });

    // ✅ Date serialization - JSON için gerekli
    return rawEvents.map((event) => ({
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
  } catch (error) {
    console.error("Database error:", error);
    return []; // ✅ Empty array if error
  }
}

export default async function EventsListPage() {
  const events = await getEventsDirectly();

  return (
    <main>
      <ShowEventsList events={events} />
    </main>
  );
}
