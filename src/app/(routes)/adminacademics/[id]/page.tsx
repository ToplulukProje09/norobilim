// app/(routes)/adminacademics/[id]/page.tsx
import { notFound } from "next/navigation";
import AdminAcademicForm from "../_components/AdminAcademicForm";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { AcademicDoc, Academic } from "@/types/academic";

// Doc → API modeli dönüştürücü helper
function mapAcademic(doc: AcademicDoc): Academic {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description ?? null,
    links: doc.links ?? [],
    files: doc.files ?? [],
    tags: doc.tags ?? [],
    published: doc.published ?? false,
    createdAt: doc.createdAt
      ? doc.createdAt.toISOString()
      : new Date().toISOString(),
  };
}

// ✅ Next.js 15 → params artık Promise döner
export default async function EditAcademicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ Promise açıyoruz

  const db = await getDb();
  const academic = await db
    .collection<AcademicDoc>("Academic")
    .findOne({ _id: new ObjectId(id) });

  if (!academic) notFound();

  const academicData = mapAcademic(academic);

  return <AdminAcademicForm initialData={academicData} id={id} />;
}
