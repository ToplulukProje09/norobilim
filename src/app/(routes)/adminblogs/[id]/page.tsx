// app/(routes)/adminblogs/[id]/page.tsx
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

// helper: params unwrap
async function unwrapParams(params: Promise<{ id: string }> | { id: string }) {
  return params instanceof Promise ? await params : params;
}

// helper: ObjectId kontrol
function isValidObjectId(id: string) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

async function getBlog(id: string) {
  const client = await clientPromise;
  const db = client.db();
  const blog = await db.collection("Post").findOne({ _id: new ObjectId(id) });
  if (!blog) return null;
  return {
    ...blog,
    _id: blog._id.toString(),
    createdAt: blog.createdAt
      ? new Date(blog.createdAt).toISOString()
      : undefined,
    updatedAt: blog.updatedAt
      ? new Date(blog.updatedAt).toISOString()
      : undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await unwrapParams(params);

  if (!isValidObjectId(id)) {
    return notFound(); // 404 sayfasına yönlendir
  }

  const blog = await getBlog(id);
  if (!blog) {
    return notFound();
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
            className="w-full max-w-lg rounded-lg shadow"
          />
        )}
      </div>
      <p className="text-sm text-gray-500 mt-4">
        Son güncelleme: {blog.updatedAt}
      </p>
    </div>
  );
}
