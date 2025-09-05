// src/app/(routes)/adminblogs/[id]/page.tsx

import BlogForm from "../_components/BlogForm";

interface PageProps {
  params: Promise<{ id: string }>; // ✅ Next.js 15 kesin Promise bekliyor
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params; // ✅ Promise olduğu için await şart

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
