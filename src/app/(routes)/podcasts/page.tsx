import UserPodcasts from "./_components/UserPodcasts";

export default async function PodcastsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/podcasts`, {
    // Bu ayar, her istekte verinin yeniden çekilmesini sağlar.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Podcastleri çekerken bir hata oluştu.");
  }

  const { data } = await res.json();

  return (
    <main className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">🎧 Podcastler</h1>
      <UserPodcasts initialPodcasts={data} />
    </main>
  );
}
