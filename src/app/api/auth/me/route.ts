// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getDb } from "@/lib/mongodb";
import type { Collection } from "mongodb";

// (İsteğe bağlı) jsonwebtoken Node API gerektirir; edge runtime kullanmıyorsan sorun yok.
// Eğer edge kullanıyorsan kaldır:
export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET!;

// Auth dokümanı tipimiz (_id string)
type AuthDoc = {
  _id: string; // "singleton"
  username: string;
  password: string; // hash
};

export async function GET(req: NextRequest) {
  try {
    // ✅ Cookie'den token al (NextRequest ile; next/headers kullanmıyoruz)
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token yok" },
        { status: 401 }
      );
    }

    // ✅ Token doğrula
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
    };

    // ✅ MongoDB’den kullanıcıyı doğrula (Auth _id her zaman string "singleton")
    const db = await getDb();
    const col: Collection<AuthDoc> = db.collection<AuthDoc>("Auth");
    const auth = await col.findOne({ _id: "singleton" });

    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: "singleton",
        username: auth.username, // DB’deki güncel kullanıcı adı
      },
    });
  } catch (error) {
    console.error("❌ Auth check hata:", error);
    return NextResponse.json(
      { success: false, message: "Geçersiz veya süresi dolmuş token" },
      { status: 401 }
    );
  }
}
