// app/api/blogs/[id]/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import { ObjectId } from "mongodb";

// ✅ Next.js 15 standartlarına göre context tipi
interface RouteContext {
  params: { id: string };
}

function safeDoc(doc: any) {
  if (!doc) return null;
  return {
    ...doc,
    _id: doc._id?.toString(),
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : undefined,
    updatedAt: doc.updatedAt
      ? new Date(doc.updatedAt).toISOString()
      : undefined,
  };
}

/* ---------------------------- GET blog by id ---------------------------- */
export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = context.params;

    const client = await clientPromise;
    const db = client.db();

    const post = await db.collection("Post").findOne({ _id: new ObjectId(id) });
    if (!post) {
      return NextResponse.json({ error: "Post bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(safeDoc(post));
  } catch (err: any) {
    console.error("GET /api/blogs/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Post getirilemedi" },
      { status: 500 }
    );
  }
}

/* --------------------------- PATCH update blog -------------------------- */
export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const data = await req.json();

    const client = await clientPromise;
    const db = client.db();

    const existingBlog = await db
      .collection("Post")
      .findOne({ _id: new ObjectId(id) });
    if (!existingBlog) {
      return NextResponse.json({ error: "Blog yok" }, { status: 404 });
    }

    if (data.mainPhoto && data.mainPhoto !== existingBlog.mainPhoto) {
      try {
        const publicId = existingBlog.mainPhoto
          ?.split("/")
          .pop()
          ?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`blogs/${publicId}`);
        }
      } catch (err) {
        console.warn("Eski mainPhoto silinemedi:", err);
      }
    }

    const updateData = {
      ...Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      ),
      updatedAt: new Date(),
    };

    await db
      .collection("Post")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    const updatedBlog = await db
      .collection("Post")
      .findOne({ _id: new ObjectId(id) });

    return NextResponse.json(safeDoc(updatedBlog));
  } catch (err: any) {
    console.error("PATCH /api/blogs/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Blog güncellenemedi" },
      { status: 500 }
    );
  }
}

/* --------------------------- DELETE blog -------------------------- */
export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { id } = context.params;

    const client = await clientPromise;
    const db = client.db();

    const existingBlog = await db
      .collection("Post")
      .findOne({ _id: new ObjectId(id) });
    if (!existingBlog) {
      return NextResponse.json({ error: "Blog yok" }, { status: 404 });
    }

    try {
      const publicId = existingBlog.mainPhoto?.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`blogs/${publicId}`);
      }

      if (existingBlog.images?.length) {
        for (const url of existingBlog.images) {
          const pid = url.split("/").pop()?.split(".")[0];
          if (pid) {
            await cloudinary.uploader.destroy(`blogs/${pid}`);
          }
        }
      }
    } catch (err) {
      console.warn("Resimler silinemedi:", err);
    }

    await db.collection("Post").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: "Post başarıyla silindi" });
  } catch (err: any) {
    console.error("DELETE /api/blogs/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Blog silinemedi" },
      { status: 500 }
    );
  }
}
