// app/api/blogs/[id]/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import { ObjectId } from "mongodb";

// ✅ GET blog by id
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const client = await clientPromise;
    const db = client.db();

    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(id) });
    if (!post) {
      return NextResponse.json({ error: "Post bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (err: any) {
    console.error("GET /api/blogs/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Post getirilemedi" },
      { status: 500 }
    );
  }
}

// ✅ PATCH update blog
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const existingBlog = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(id) });
    if (!existingBlog) {
      return NextResponse.json({ error: "Blog yok" }, { status: 404 });
    }

    // mainPhoto değişirse eskiyi sil
    if (data.mainPhoto && data.mainPhoto !== existingBlog.mainPhoto) {
      try {
        const publicId = existingBlog.mainPhoto.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`blogs/${publicId}`);
        }
      } catch (err) {
        console.warn("Eski mainPhoto silinemedi:", err);
      }
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    await db
      .collection("posts")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    const updatedBlog = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(id) });
    return NextResponse.json(updatedBlog);
  } catch (err: any) {
    console.error("PATCH /api/blogs/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Blog güncellenemedi" },
      { status: 500 }
    );
  }
}

// ✅ DELETE blog
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const client = await clientPromise;
    const db = client.db();

    const existingBlog = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(id) });
    if (!existingBlog) {
      return NextResponse.json({ error: "Blog yok" }, { status: 404 });
    }

    // mainPhoto sil
    try {
      const publicId = existingBlog.mainPhoto.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`blogs/${publicId}`);
      }

      // diğer fotoğrafları sil
      if (existingBlog.images?.length) {
        for (const url of existingBlog.images) {
          const publicId = url.split("/").pop()?.split(".")[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`blogs/${publicId}`);
          }
        }
      }
    } catch (err) {
      console.warn("Resimler silinemedi:", err);
    }

    await db.collection("posts").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: "Post başarıyla silindi" });
  } catch (err: any) {
    console.error("DELETE /api/blogs/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Blog silinemedi" },
      { status: 500 }
    );
  }
}
