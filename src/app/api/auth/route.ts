import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Eksik bilgi" },
        { status: 400 }
      );
    }

    // ✅ Auth kaydı bul
    const auth = await prisma.auth.findUnique({ where: { id: "singleton" } });
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // ✅ Username check
    if (auth.username !== username) {
      return NextResponse.json(
        { success: false, message: "Hatalı kullanıcı adı" },
        { status: 401 }
      );
    }

    // ✅ Password check
    const validPassword = await bcrypt.compare(password, auth.password);
    if (!validPassword) {
      return NextResponse.json(
        { success: false, message: "Hatalı şifre" },
        { status: 401 }
      );
    }

    // ✅ JWT üret (10 dakika geçerli)
    const token = jwt.sign(
      { id: auth.id, username: auth.username },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    // ✅ Response + HttpOnly cookie
    const res = NextResponse.json({ success: true, message: "Giriş başarılı" });
    res.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10, // 10 dakika
    });

    return res;
  } catch (error) {
    console.error("Auth API hatası:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
