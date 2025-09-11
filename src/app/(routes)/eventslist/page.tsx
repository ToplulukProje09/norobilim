import ShowEventsList from "./_components/ShowEventsList";
import { Event } from "@/types/event";

export default async function EventsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/events`, {
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

  return <ShowEventsList events={events} />;
}
