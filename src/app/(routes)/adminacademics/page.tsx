import AcademicList from "./_components/AcademicList";

// Bu bir Sunucu Bileşeni'dir, veriyi getirmekle sorumludur.
export default async function Page() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/academic`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Akademik kayıtları çekerken hata oluştu");
  }

  const { data } = await res.json(); // Sunucu Bileşeni, getirilen veriyi bir İstemci Bileşeni'ne iletiyor.

  return (
    <div>
            <AcademicList initialAcademics={data} />   {" "}
    </div>
  );
}
