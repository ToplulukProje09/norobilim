// src/app/(routes)/adminblogs/[id]/page.tsx

import BlogForm from "../_components/BlogForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params; // ✅ Next.js 15 gerektiriyor

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
