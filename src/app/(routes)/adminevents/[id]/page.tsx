// app/(routes)/adminevents/[id]/page.tsx
import UpdateEvents from "../_components/UpdateEvents";
import { Event } from "@/types/event";
import { headers } from "next/headers";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ params artık Promise -> await etmeliyiz
  const { id } = await params;

  if (!id) {
    return <p className="p-6 text-red-500">ID bulunamadı</p>;
  }

  // ✅ headers da Promise döndürüyor
  const h = await headers();
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  // Etkinlik verisini API'den çek
  const res = await fetch(`${baseUrl}/api/events/${id}`, {
    cache: "no-store",
  });

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
