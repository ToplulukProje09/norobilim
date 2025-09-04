// app/api/auth/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { ObjectId, Collection } from "mongodb";

const AUTH_ID = "singleton";

/* ----------------------------- Types ----------------------------- */
interface AuthDoc {
  _id: string | ObjectId;
  username: string;
  password: string;
}

/* ----------------------------- Zod Schema ----------------------------- */
const authSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı."),
});
const authUpdateSchema = authSchema.partial();

/* ----------------------------- Helpers -------------------------------- */
async function getAuthDoc(): Promise<{
  col: Collection<AuthDoc>;
  doc: AuthDoc | null;
}> {
  const db = await getDb();
  const col = db.collection<AuthDoc>("Auth");
  let doc = await col.findOne({ _id: AUTH_ID });
  if (!doc) doc = await col.findOne({});
  return { col, doc };
}

function normalizeId(id: string | ObjectId): string | ObjectId {
  return typeof id === "object" ? new ObjectId(id) : id;
}

function safeDoc(doc: AuthDoc | null) {
  if (!doc) return null;
  const { password, ...rest } = doc;
  return {
    ...rest,
    _id: typeof doc._id === "object" ? doc._id.toHexString() : doc._id,
  };
}

/* -------------------------------- GET --------------------------------- */
export async function GET() {
  try {
    const { doc } = await getAuthDoc();
    if (!doc)
      return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
    return NextResponse.json(safeDoc(doc));
  } catch (err) {
    console.error("❌ GET hata:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

/* -------------------------------- POST -------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = authSchema.parse(body);

    const { col, doc } = await getAuthDoc();
    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    if (doc) {
      await col.updateOne(
        { _id: normalizeId(doc._id) },
        { $set: { username: parsed.username, password: hashedPassword } }
      );
    } else {
      await col.insertOne({
        _id: AUTH_ID,
        username: parsed.username,
        password: hashedPassword,
      });
    }

    return NextResponse.json(
      { message: "Auth kaydı oluşturuldu/yenilendi." },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ POST hata:", err);
    return NextResponse.json(
      { error: err?.errors ?? err?.message ?? "Geçersiz istek" },
      { status: 400 }
    );
  }
}

/* -------------------------------- PUT --------------------------------- */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const parsedUpdate = authUpdateSchema.parse(body);

    const { col, doc } = await getAuthDoc();
    if (!doc) {
      return NextResponse.json(
        { error: "Kayıt bulunamadı. Önce POST ile oluşturun." },
        { status: 404 }
      );
    }

    const updateData: Partial<AuthDoc> = {};
    if (parsedUpdate.username) updateData.username = parsedUpdate.username;
    if (parsedUpdate.password)
      updateData.password = await bcrypt.hash(parsedUpdate.password, 10);

    await col.updateOne({ _id: normalizeId(doc._id) }, { $set: updateData });

    return NextResponse.json({ message: "Auth kaydı güncellendi." });
  } catch (err: any) {
    console.error("❌ PUT hata:", err);
    return NextResponse.json(
      { error: err?.errors ?? err?.message ?? "Geçersiz istek" },
      { status: 400 }
    );
  }
}

/* ------------------------------- DELETE -------------------------------- */
export async function DELETE() {
  try {
    const { col, doc } = await getAuthDoc();
    if (!doc) return NextResponse.json({ message: "Silinecek kayıt yok." });
    await col.deleteOne({ _id: normalizeId(doc._id) });
    return NextResponse.json({ message: "Auth kaydı silindi." });
  } catch (err: any) {
    console.error("❌ DELETE hata:", err);
    return NextResponse.json(
      { error: err?.message ?? "Silme işlemi başarısız" },
      { status: 400 }
    );
  }
}
