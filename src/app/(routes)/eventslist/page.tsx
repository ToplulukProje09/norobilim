import ShowEventsList from "./_components/ShowEventsList";
import type { Event } from "@/types/event";
import { getBaseUrl } from "@/lib/getBaseUrl";

export const dynamic = "force-dynamic"; // ✅ sadece bu olsun, revalidate=0 sil

export default async function EventsListPage() {
  try {
    const baseUrl = getBaseUrl();

    const res = await fetch(`${baseUrl}/api/events`, {
      cache: "no-store", // ✅ runtime'da fetch et
    });

    if (!res.ok) {
      throw new Error(`API hata: ${res.status}`);
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
