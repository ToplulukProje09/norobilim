import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId, type WithId } from "mongodb";

/* ---- Types ---- */
type Comment = { text: string; createdAt: Date };
type Post = {
  _id: ObjectId | string;
  comments?: Comment[];
};

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentIndex: string }> }
) {
  try {
    const { id, commentIndex } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "id parametresi yok" },
        { status: 400 }
      );
    }

    const index = parseInt(commentIndex, 10);
    if (isNaN(index)) {
      return NextResponse.json(
        { error: "Geçersiz yorum indexi" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const posts = db.collection<Post>("Post"); // ✅ tip eklendi

    const filter = ObjectId.isValid(id)
      ? { _id: new ObjectId(id) }
      : { _id: id };

    const post = (await posts.findOne(filter, {
      projection: { comments: 1 },
    })) as WithId<Post> | null;

    if (!post) {
      return NextResponse.json({ error: "Blog bulunamadı" }, { status: 404 });
    }

    const comments = post.comments ?? [];
    if (index < 0 || index >= comments.length) {
      return NextResponse.json(
        { error: "Yorum indexi geçersiz" },
        { status: 400 }
      );
    }

    comments.splice(index, 1);
    await posts.updateOne(filter, { $set: { comments } });

    return NextResponse.json({ comments });
  } catch (err: any) {
    console.error("DELETE /api/blogs/[id]/comments/[commentIndex] error:", err);
    return NextResponse.json(
      { error: err.message || "Yorum silme hatası" },
      { status: 500 }
    );
  }
}
