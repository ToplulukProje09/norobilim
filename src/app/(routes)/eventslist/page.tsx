// app/eventslist/page.tsx
import ShowEventsList from "./_components/ShowEventsList";
import type { Event } from "@/types/event";
import { getBaseUrl } from "@/lib/getBaseUrl";
import { unstable_noStore as noStore } from "next/cache";

// ✅ Bu, rotanın her zaman dinamik olarak renderlanmasını sağlar.
export const dynamic = "force-dynamic";

export default async function EventsListPage() {
  noStore(); // ✅ Sayfanın önbelleğe alınmamasını sağlar

  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/events`);

    if (!res.ok) {
      throw new Error(`API hata: ${res.status} - ${res.statusText}`);
    }

    const events: Event[] = await res.json();
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
