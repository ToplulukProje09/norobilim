// app/api/blogs/[id]/comments/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId, type Collection, type WithId } from "mongodb";

/* ---- Types (Prisma şemasıyla birebir) ---- */
type Comment = {
  text: string;
  createdAt: Date;
};

type Post = {
  _id: ObjectId;
  commentsAllowed: boolean;
  comments?: Comment[]; // optional bırak: eski kayıtlarda olmayabilir
};

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // id doğrulama
    let objId: ObjectId;
    try {
      objId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: "Geçersiz id" }, { status: 400 });
    }

    const { comment } = await req.json();
    const trimmed = (comment ?? "").trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Yorum boş olamaz" }, { status: 400 });
    }

    const db = await getDb();
    const posts: Collection<Post> = db.collection<Post>("Post");
    const yasakCol = db.collection<{ wrongWords?: string[] }>("Yasak");

    // 1) Post var mı & yorumlara izin var mı?
    const post = (await posts.findOne(
      { _id: objId },
      { projection: { commentsAllowed: 1, comments: 1 } }
    )) as WithId<Post> | null;

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

    // 3) $push — TS ve runtime güvenli:
    // - comments alanı yoksa MongoDB $push otomatik oluşturur
    // - Tip güvenliği için $each kullanıyoruz
    const newComment: Comment = { text: trimmed, createdAt: new Date() };

    await posts.updateOne(
      { _id: objId },
      {
        $push: { comments: { $each: [newComment] } }, // ✅ $each ile tip uyumlu
      }
    );

    // Güncel yorumları döndür
    const updated = await posts.findOne(
      { _id: objId },
      { projection: { comments: 1 } }
    );

    return NextResponse.json({ comments: updated?.comments ?? [] });
  } catch (err: any) {
    console.error("POST /api/blogs/[id]/comments error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Bilinmeyen hata" },
      { status: 500 }
    );
  }
}
