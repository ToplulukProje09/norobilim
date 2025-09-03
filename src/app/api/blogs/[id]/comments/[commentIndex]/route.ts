import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Yorum silme
export async function DELETE(
  req: NextRequest,
  // DİKKAT: params tipi tekrar Promise olarak değiştirildi
  { params }: { params: Promise<{ id: string; commentIndex: string }> }
) {
  try {
    const { id, commentIndex } = await params; // await burada gerekli olacak

    const index = parseInt(commentIndex, 10);

    if (isNaN(index)) {
      return NextResponse.json(
        { error: "Geçersiz yorum indexi" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Blog bulunamadı" }, { status: 404 });
    }

    const comments = [...(post.comments || [])];
    if (index < 0 || index >= comments.length) {
      return NextResponse.json(
        { error: "Yorum indexi geçersiz" },
        { status: 400 }
      );
    }

    comments.splice(index, 1);

    await prisma.post.update({
      where: { id },
      data: { comments },
    });

    return NextResponse.json({ comments });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Yorum silme hatası" },
      { status: 500 }
    );
  }
}
