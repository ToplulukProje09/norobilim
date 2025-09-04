// app/academics/page.tsx

import UserAcademicList, { Academic } from "./_components/UserAcademic";

export default async function AcademicsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/academic`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Akademik kayıtlar alınamadı");
  }

  const { data: academics }: { data: Academic[] } = await res.json();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <UserAcademicList initialAcademics={academics} />
    </div>
  );
}
