import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Collection } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;
const AUTH_ID = "singleton";

type AuthDoc = {
  _id: string;
  username: string;
  password: string; // hash
};

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const db = await getDb();
    const col: Collection<AuthDoc> = db.collection<AuthDoc>("Auth");
    const auth = await col.findOne({ _id: AUTH_ID });

    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, auth.password);

    if (!isMatch || auth.username !== username) {
      return NextResponse.json(
        { success: false, message: "Geçersiz kullanıcı adı veya şifre" },
        { status: 401 }
      );
    }

    // Token oluştur
    const token = jwt.sign(
      { id: auth._id, username: auth.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Güvenli cookie ayarı
    const res = NextResponse.json({ success: true, message: "Giriş başarılı" });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: true, // her zaman HTTPS
      sameSite: "none", // cross-site de çalışsın
      path: "/",
      maxAge: 60 * 60, // 1 saat
    });

    return res;
  } catch (error) {
    console.error("❌ Login hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
