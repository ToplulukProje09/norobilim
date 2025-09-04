import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Eksik bilgi" },
        { status: 400 }
      );
    }

    const auth = await prisma.auth.findUnique({ where: { id: "singleton" } });
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    if (auth.username !== username) {
      return NextResponse.json(
        { success: false, message: "Hatalı kullanıcı adı" },
        { status: 401 }
      );
    }

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

    // ✅ Session cookie → tarayıcı kapanınca silinir
    const res = NextResponse.json({ success: true, message: "Giriş başarılı" });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ✅ localde secure değil
      sameSite: "lax", // 'strict' bazı redirectlerde sorun yapıyor
      path: "/",
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
