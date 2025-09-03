import UserPodcasts from "./_components/UserPodcasts";

export default async function PodcastsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/podcasts`, {
    // Bu ayar, her istekte verinin yeniden çekilmesini sağlar.
    cache: "no-store",
  });

  if (!res.ok) {
    // API'dan veri çekerken bir sorun olursa hata fırlatıyoruz.
    throw new Error("Podcastleri çekerken bir hata oluştu.");
  }

  // Gelen JSON verisinden sadece 'data' bölümünü alıyoruz.
  const { data } = await res.json();

  return (
    <main className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">🎧 Podcastler</h1>
      {/* Sunucu bileşeni, veriyi istemci bileşenine prop olarak iletiyor. */}
      <UserPodcasts initialPodcasts={data} />
    </main>
  );
}
