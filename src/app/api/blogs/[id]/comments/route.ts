// app/api/blogs/[id]/comments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Yorum ekleme (POST)
export async function POST(req: Request, context: any) {
  try {
    const { id } = (await context.params) as { id: string }; // ✅ await eklendi
    const body = await req.json();

    // ✅ Frontend ile aynı key (comment) kullanılıyor
    const { comment } = body;
    const trimmedCommentText = comment?.trim();

    // 1. Postun varlığını ve yorumlara izin verilip verilmediğini kontrol et
    const post = await prisma.post.findUnique({
      where: { id },
      select: { commentsAllowed: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post bulunamadı" }, { status: 404 });
    }

    if (!post.commentsAllowed) {
      return NextResponse.json(
        { error: "Bu gönderiye yorum yapılamaz." },
        { status: 403 }
      );
    }

    if (!trimmedCommentText) {
      return NextResponse.json({ error: "Yorum boş olamaz" }, { status: 400 });
    }

    // 2. Yasaklı kelimeleri kontrol et
    const yasak = await prisma.yasak.findFirst();
    const forbidden = yasak?.wrongWords || [];
    const lowerCommentText = trimmedCommentText.toLowerCase();

    for (const word of forbidden) {
      if (lowerCommentText.includes(word.toLowerCase())) {
        return NextResponse.json(
          { error: "Yorum yasaklı kelime içeriyor" },
          { status: 400 }
        );
      }
    }

    // 3. Kontroller geçtiyse, yorumu ekle
    const newComment = {
      text: trimmedCommentText,
      createdAt: new Date(),
    };

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { comments: { push: newComment } },
    });

    return NextResponse.json({ comments: updatedPost.comments || [] });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Bilinmeyen hata" },
      { status: 500 }
    );
  }
}
