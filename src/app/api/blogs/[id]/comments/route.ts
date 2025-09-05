// app/api/blogs/[id]/comments/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { unwrapParams } from "@/utils/unwrapParams";

// ✅ Node.js runtime kullan
export const runtime = "nodejs";

type Comment = { text: string; createdAt: Date };
type Post = {
  _id: ObjectId | string;
  commentsAllowed: boolean;
  comments?: Comment[];
};

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const { id } = await unwrapParams(context.params);
    const { comment } = await req.json();

    const trimmed = (comment ?? "").trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Yorum boş olamaz" }, { status: 400 });
    }

    const db = await getDb();
    const posts = db.collection<Post>("Post");

    const filter = ObjectId.isValid(id)
      ? { _id: new ObjectId(id) }
      : { _id: id };

    const post = await posts.findOne(filter, {
      projection: { commentsAllowed: 1, comments: 1 },
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

    const newComment: Comment = { text: trimmed, createdAt: new Date() };
    await posts.updateOne(filter, { $push: { comments: newComment } });

    const updated = await posts.findOne(filter, {
      projection: { comments: 1 },
    });

    return NextResponse.json({ comments: updated?.comments ?? [] });
  } catch (err: any) {
    console.error("POST /api/blogs/[id]/comments error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
