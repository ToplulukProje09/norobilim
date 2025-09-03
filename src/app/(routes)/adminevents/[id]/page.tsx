// app/(routes)/adminevents/[id]/page.tsx
import UpdateEvents from "../_components/UpdateEvents";
import { Event } from "@/types/event";

export default async function EventDetailPage({ params }: any) {
  const { id } = (await params) as { id: string };

  if (!id) {
    return <p className="p-6 text-red-500">ID bulunamadı</p>;
  }

  // Etkinlik verisini API'den çekiyoruz
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return (
      <p className="p-6 text-red-500">
        Etkinlik yüklenirken bir hata oluştu veya bulunamadı.
      </p>
    );
  }

  const event: Event = await res.json();

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <UpdateEvents event={event} />
    </div>
  );
}
