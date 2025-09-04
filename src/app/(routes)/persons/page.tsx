import ShowPerson from "./_components/ShowPerson";

export default async function Page() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/persons`, {
    cache: "no-store", // her zaman güncel veriyi getir
  });

  if (!res.ok) {
    // Hata yönetimi
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 font-semibold">
          Kişiler alınırken bir hata oluştu.
        </p>
      </div>
    );
  }

  const persons = await res.json();

  return (
    <div>
      <ShowPerson persons={persons} />
    </div>
  );
}
