// app/(routes)/adminevents/[id]/page.tsx
import UpdateEvents from "../_components/UpdateEvents";
import { Event } from "@/types/event";

// API'den etkinliği çekme
async function getEvent(id: string): Promise<Event | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/events/${id}`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Etkinlik alınırken hata:", error);
    return null;
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ params'ı await etmelisin
  const event = await getEvent(id);

  if (!event) {
    return (
      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-bold text-red-500">
          Etkinlik bulunamadı ❌
        </h2>
      </div>
    );
  }

  // ✅ Sadece event props gönderiyoruz
  return <UpdateEvents event={event} />;
}
