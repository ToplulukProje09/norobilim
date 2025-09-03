import ShowEvents from "./_components/ShowEvents";
import { Event } from "@/types/event";

export default async function EventsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <p className="p-6 text-red-500">
        Etkinlikler yüklenirken bir hata oluştu.
      </p>
    );
  }

  const events = (await res.json()) as Event[];

  return <ShowEvents events={events} />;
}
