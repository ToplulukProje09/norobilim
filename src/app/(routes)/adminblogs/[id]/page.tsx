// src/app/(routes)/adminblogs/[id]/page.tsx
import BlogForm from "../_components/BlogForm";
import { Post } from "@/types/blog";

interface PageProps {
  params: Promise<{ id: string }>; // Next.js 15 bug → Promise gerekiyor
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;

  if (!id) {
    return <p>ID bulunamadı</p>;
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/${id}`,
    {
      cache: "no-store",
    }
  );
  const blog: Post = await res.json();

  if (!blog) {
    return <p>Blog bulunamadı</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{blog.title}</h1>
      <p className="text-gray-700 mt-2">{blog.description}</p>
      <div className="mt-4">
        {blog.mainPhoto && (
          <img
            src={blog.mainPhoto}
            alt={blog.title}
            className="w-full rounded"
          />
        )}
      </div>
      <BlogForm id={id} />
    </div>
  );
};

export default Page;
