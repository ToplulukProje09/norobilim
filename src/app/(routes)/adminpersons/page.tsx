import AdminPerson from "./_components/AdminPerson";

export default async function Page() {
  // Server Component’te direkt fetch ile kişileri al
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/persons`, {
    cache: "no-store", // her zaman güncel veriyi getir
  });
  const persons = await res.json();

  return (
    <div>
      <AdminPerson persons={persons} />
    </div>
  );
}
