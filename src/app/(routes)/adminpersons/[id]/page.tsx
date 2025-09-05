// app/(routes)/adminpersons/[id]/page.tsx
import UpdatedPerson from "../_components/UpdatedPerson";

interface PageProps {
  params: Promise<{ id: string }>; // ✅ Promise olmalı
}

export default async function Page({ params }: PageProps) {
  const { id } = await params; // ✅ burada await gerekiyor

  if (!id) {
    return <p className="p-6 text-red-500">ID bulunamadı</p>;
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/persons/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return (
      <p className="p-6 text-red-500">
        Kişi bulunamadı veya yüklenirken bir hata oluştu.
      </p>
    );
  }

  const person = await res.json();

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <UpdatedPerson person={person} />
    </div>
  );
}
