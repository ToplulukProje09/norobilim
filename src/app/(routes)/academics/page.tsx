// app/academics/page.tsx

import UserAcademicList, { Academic } from "./_components/UserAcademic";

export default async function AcademicsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/academic`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Akademik kayıtlar alınamadı");
  }

  // API'den gelen veriyi doğru şekilde ayrıştırın
  // Veri, { data: [...] } formatında bir nesne içinde geliyor.
  const { data: academics }: { data: Academic[] } = await res.json();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <UserAcademicList initialAcademics={academics} />
    </div>
  );
}
