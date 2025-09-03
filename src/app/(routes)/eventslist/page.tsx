// eventslist/page.tsx
import ShowEventsList from "./_components/ShowEventsList";
import type { Event } from "@/types/event";

// Bu fonksiyon gerçek API çağrısını simüle ediyor.
// Kendi veritabanı veya API mantığınızı buraya ekleyebilirsiniz.
async function getEvents(): Promise<Event[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error("Etkinlikler yüklenirken bir hata oluştu.");
    }
    const events = await res.json();
    return events;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

export default async function EventsListPage() {
  const events = await getEvents();

  return <ShowEventsList events={events} />;
}
