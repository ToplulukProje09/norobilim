// app/eventslist/page.tsx
import ShowEventsList from "./_components/ShowEventsList";
import type { Event } from "@/types/event";

// ✅ Force dynamic rendering - bu satır çok önemli
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchEvents(): Promise<Event[]> {
  try {
    // ✅ Absolute URL kullanımı - Vercel için kritik
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
      ? "https://norobilimadu.vercel.app"
      : "http://localhost:3000";

    console.log("Base URL:", baseUrl); // Debug için

    const res = await fetch(`${baseUrl}/api/events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // ✅ Cache'i tamamen devre dışı bırak
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error(`API Error: ${res.status} - ${res.statusText}`);
      throw new Error(`API hatası: ${res.status}`);
    }

    const data = await res.json();
    console.log("Fetched events count:", data.length); // Debug için
    return data;
  } catch (error) {
    console.error("Events fetch error:", error);
    // ✅ Hata durumunda boş array döndür
    return [];
  }
}

export default async function EventsListPage() {
  const events = await fetchEvents();

  return (
    <div>
      <ShowEventsList events={events} />
    </div>
  );
}
