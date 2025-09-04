// app/api/blogs/[id]/comments/[commentIndex]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentIndex: string }> }
) {
  try {
    const { id, commentIndex } = await params;

    // ✅ ObjectId kontrolü
    let objId: ObjectId;
    try {
      objId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: "Geçersiz blog id" }, { status: 400 });
    }

    // ✅ index doğrulama
    const index = parseInt(commentIndex, 10);
    if (isNaN(index)) {
      return NextResponse.json(
        { error: "Geçersiz yorum indexi" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const posts = db.collection("Post");

    // Post var mı?
    const post = await posts.findOne(
      { _id: objId },
      { projection: { comments: 1 } }
    );
    if (!post) {
      return NextResponse.json({ error: "Blog bulunamadı" }, { status: 404 });
    }

    const comments = post.comments || [];
    if (index < 0 || index >= comments.length) {
      return NextResponse.json(
        { error: "Yorum indexi geçersiz" },
        { status: 400 }
      );
    }

    // ✅ Array'den index ile yorumu sil
    comments.splice(index, 1);

    await posts.updateOne(
      { _id: objId },
      { $set: { comments } } // push ile eklediğimiz array’i yeniden set ediyoruz
    );

    return NextResponse.json({ comments });
  } catch (err: any) {
    console.error("DELETE /api/blogs/[id]/comments/[commentIndex] error:", err);
    return NextResponse.json(
      { error: err.message || "Yorum silme hatası" },
      { status: 500 }
    );
  }
}
