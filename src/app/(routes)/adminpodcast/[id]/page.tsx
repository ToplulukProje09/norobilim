import AdminPodcast from "../_components/AdminPodcast";

export default async function EditPodcastPage({ params }: { params: any }) {
  const id = params.id as string;

  return (
    <div>
      <AdminPodcast _id={id} />
    </div>
  );
}
