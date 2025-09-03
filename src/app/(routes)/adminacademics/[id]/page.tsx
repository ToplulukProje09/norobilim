import { notFound } from "next/navigation";
import AdminAcademicForm from "../_components/AdminAcademicForm";
import { prisma } from "@/lib/prisma";

export default async function EditAcademicPage({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ Promise tipinde
}) {
  const { id } = await params; // ✅ await ile açıyoruz

  const academic = await prisma.academic.findUnique({
    where: { id },
  });

  if (!academic) {
    notFound();
  }

  return <AdminAcademicForm initialData={academic} id={id} />; // ✅ artık id kullanılıyor
}
