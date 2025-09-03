import ShowEventsList from "./_components/ShowEventsList";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export default async function EventsListPage() {
  try {
    // ✅ API'ye istek atıyoruz
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/events`, {
      cache: "no-store", // static build engelle
    });

    if (!res.ok) {
      throw new Error("Etkinlikler alınamadı");
    }

    const events = await res.json();

    return <ShowEventsList events={events} />;
  } catch (error) {
    console.error("Failed to load events:", error);
    return <ShowEventsList events={[]} />;
  }
}
