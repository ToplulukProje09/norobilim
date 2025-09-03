// app/podcast/page.tsx
import ShowPodcast from "./_components/ShowPodcast";

// This is a Server Component, responsible for fetching data.
export default async function Page() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/podcasts`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Podcastleri çekerken hata oluştu");
  }

  const { data } = await res.json(); // ✅ sadece array'i alıyoruz

  // The Server Component passes the fetched data to a Client Component.
  return (
    <div>
      <ShowPodcast initialPodcasts={data} />
    </div>
  );
}
