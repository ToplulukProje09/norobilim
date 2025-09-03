// src/app/(routes)/blogs/[id]/page.tsx

import BlogForm from "../_components/BlogForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  // params'ı await et
  const { id } = await params;

  if (!id) {
    return <p>ID bulunamadı</p>;
  }

  return (
    <div>
      <BlogForm id={id} />
    </div>
  );
};

export default Page;
