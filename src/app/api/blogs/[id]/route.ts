import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

// GET blog by id
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Next.js 15'te params async

    const post = await prisma.post.findUnique({ where: { id } });
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

// PATCH update blog
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const data = await req.json();
    const existingBlog = await prisma.post.findUnique({ where: { id } });
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

    const updatedBlog = await prisma.post.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedBlog);
  } catch (err: any) {
    console.error("PATCH /api/blogs/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Blog güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE blog
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const existingBlog = await prisma.post.findUnique({ where: { id } });
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

    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ message: "Post başarıyla silindi" });
  } catch (err: any) {
    console.error("DELETE /api/blogs/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Blog silinemedi" },
      { status: 500 }
    );
  }
}
