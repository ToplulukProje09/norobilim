// app/admin/adminposts/[id]/page.tsx
import AdminPodcast from "../_components/AdminPodcast";

export default async function EditPodcastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ dikkat: params artık Promise

  return (
    <div>
      <AdminPodcast id={id} />
    </div>
  );
}
