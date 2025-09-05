import AdminPodcast from "../_components/AdminPodcast";

export default async function EditPodcastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ params Promise olduğu için await gerekiyor
  const { id } = await params;

  return (
    <div>
      <AdminPodcast _id={id} />
    </div>
  );
}
