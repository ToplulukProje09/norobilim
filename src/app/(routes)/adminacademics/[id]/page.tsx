// app/(routes)/adminacademics/[id]/page.tsx
import { notFound } from "next/navigation";
import AdminAcademicForm from "../_components/AdminAcademicForm";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { AcademicDoc, Academic } from "@/types/academic";

// Doc → API modeli dönüştürücü helper
function mapAcademic(doc: AcademicDoc): Academic {
  return {
    _id: doc._id.toString(),
    title: doc.title,
    description: doc.description ?? undefined,
    links: doc.links ?? [],
    files: doc.files ?? [],
    tags: doc.tags ?? [],
    published: doc.published ?? false,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt
        : new Date(doc.createdAt as unknown as string),
  };
}

export default async function EditAcademicPage(props: {
  params: Promise<{ id: string }>; // ✅ artık Promise
}) {
  const { id } = await props.params; // ✅ önce await et

  const db = await getDb();
  const academic = await db
    .collection<AcademicDoc>("Academic")
    .findOne({ _id: new ObjectId(id) });

  if (!academic) notFound();

  const academicData = mapAcademic(academic);

  return (
    <AdminAcademicForm _id={academicData._id} initialData={academicData} />
  );
}
