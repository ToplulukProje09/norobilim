// app/(routes)/eventslist/page.tsx
import ShowEventsList from "./_components/ShowEventsList";
import { getDb } from "@/lib/mongodb";

// ✅ Bu satırlar MUTLAKA olmalı
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ✅ Direct MongoDB call - NO API, NO FETCH
async function getEventsDirectly() {
  try {
    const db = await getDb();

    const rawEvents = await db
      .collection("Event")
      .aggregate([
        {
          $lookup: {
            from: "EventDay", // ilişkili collection
            localField: "_id",
            foreignField: "eventId",
            as: "eventDays",
          },
        },
        { $sort: { _id: -1 } },
      ])
      .toArray();

    // ✅ Date serialization - JSON için gerekli
    return rawEvents.map((event: any) => ({
      _id: event._id.toString(), // ✅ artık _id kullanıyoruz
      title: event.title,
      description: event.description,
      image: event.image,
      didItHappen: event.didItHappen,
      numberOfAttendees: event.numberOfAttendees,
      location: event.location,
      estimatedAttendees: event.estimatedAttendees,
      eventImages: event.eventImages || [],
      eventDays: (event.eventDays || []).map((day: any) => ({
        _id: day._id.toString(), // ✅ güncellendi
        date: day.date ? new Date(day.date).toISOString() : null,
        startTime: day.startTime,
        endTime: day.endTime,
        details: day.details,
        eventId: day.eventId?.toString(),
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
