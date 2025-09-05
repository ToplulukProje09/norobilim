// src/app/(routes)/adminblogs/[id]/page.tsx
import BlogForm from "../_components/BlogForm";
import { Post } from "@/types/db"; // ✅ Artık db tipinden Post'u kullanıyoruz
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>; // ✅ Next.js 15'te Promise
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  // ✅ Vercel için fallback URL (NEXT_PUBLIC_APP_URL localde olmayabilir)
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/blogs/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return notFound();
  }

  // ✅ API’den gelen string tarihleri Date’e parse et
  const raw: Post = await res.json();
  const blog: Post = {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{blog.title}</h1>
      <p className="text-gray-700 mt-2">{blog.description}</p>

      {blog.mainPhoto && (
        <div className="mt-4">
          <img
            src={blog.mainPhoto}
            alt={blog.title}
            className="w-full rounded"
          />
        </div>
      )}

      <BlogForm id={id} />
    </div>
  );
};

export default Page;
