import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId, type Collection, type WithId } from "mongodb";

/* ---- Types ---- */
type Comment = {
  text: string;
  createdAt: Date;
};

type Post = {
  _id: ObjectId | string;
  commentsAllowed: boolean;
  comments?: Comment[];
};

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> } // ✅ Next.js 15'te Promise
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "id parametresi yok" },
        { status: 400 }
      );
    }

    // 🔍 Debug
    console.log("🔍 Gelen id:", id);
    console.log("🔍 ObjectId valid mi:", ObjectId.isValid(id));

    const { comment } = await req.json();
    const trimmed = (comment ?? "").trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Yorum boş olamaz" }, { status: 400 });
    }

    const db = await getDb();
    const posts: Collection<Post> = db.collection<Post>("Post");
    const yasakCol = db.collection<{ wrongWords?: string[] }>("Yasak");

    // ✅ hem ObjectId hem string ile ara
    const filters: any[] = [];
    if (ObjectId.isValid(id)) {
      filters.push({ _id: new ObjectId(id) });
    }
    filters.push({ _id: id });

    const filter = { $or: filters };

    // 1) Post var mı & yorumlara izin var mı?
    const post = (await posts.findOne(filter, {
      projection: { commentsAllowed: 1, comments: 1 },
    })) as WithId<Post> | null;

    if (!post) {
      return NextResponse.json({ error: "Post bulunamadı" }, { status: 404 });
    }
    if (!post.commentsAllowed) {
      return NextResponse.json(
        { error: "Bu gönderiye yorum yapılamaz." },
        { status: 403 }
      );
    }

    // 2) Yasaklı kelimeler
    const yasak = await yasakCol.findOne({});
    const forbidden = Array.isArray(yasak?.wrongWords)
      ? yasak!.wrongWords!
      : [];
    const lower = trimmed.toLowerCase();
    if (forbidden.some((w) => lower.includes(String(w).toLowerCase()))) {
      return NextResponse.json(
        { error: "Yorum yasaklı kelime içeriyor" },
        { status: 400 }
      );
    }

    // 3) Yorum ekle
    const newComment: Comment = { text: trimmed, createdAt: new Date() };

    await posts.updateOne(filter, {
      $push: { comments: { $each: [newComment] } },
    });

    // Güncel yorumları döndür
    const updated = await posts.findOne(filter, {
      projection: { comments: 1 },
    });

    return NextResponse.json({ comments: updated?.comments ?? [] });
  } catch (err: any) {
    console.error("POST /api/blogs/[id]/comments error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Bilinmeyen hata" },
      { status: 500 }
    );
  }
}
