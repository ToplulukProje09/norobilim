import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { unwrapParams } from "@/utils/unwrapParams";

type Comment = { text: string; createdAt: Date };
type Post = { _id: ObjectId | string; comments?: Comment[] };

interface RouteContext {
  params: Promise<{ id: string; commentIndex: string }>;
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    // unwrapParams sayesinde hem Promise hem object olsa çözebilir
    const { id, commentIndex } = await unwrapParams(context.params);

    const index = parseInt(commentIndex, 10);
    if (isNaN(index)) {
      return NextResponse.json(
        { error: "Geçersiz yorum indexi" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const posts = db.collection<Post>("Post");

    const filter = ObjectId.isValid(id)
      ? { _id: new ObjectId(id) }
      : { _id: id };

    const post = await posts.findOne(filter, { projection: { comments: 1 } });
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

    // Yorumu sil
    comments.splice(index, 1);
    await posts.updateOne(filter, { $set: { comments } });

    return NextResponse.json({ comments });
  } catch (err: any) {
    console.error("DELETE /api/blogs/[id]/comments/[commentIndex] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
