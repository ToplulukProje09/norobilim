import ShowEventsList from "./_components/ShowEventsList";
import type { Event } from "@/types/event";

export const dynamic = "force-dynamic"; // ✅ runtime'da çalışsın

export default async function EventsListPage() {
  try {
    // ✅ Base URL belirle
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // ✅ API’den al
    const res = await fetch(`${baseUrl}/api/events`, {
      cache: "no-store", // revalidate = 0 yerine bu
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
