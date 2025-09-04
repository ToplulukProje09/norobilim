// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET!;

type JwtPayload = {
  id: string;
  username: string;
  iat: number;
  exp: number;
};

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token yok" },
        { status: 401 }
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return NextResponse.json(
        { success: false, message: "Geçersiz veya süresi dolmuş token" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: { id: decoded.id, username: decoded.username },
    });
  } catch (error) {
    console.error("❌ Auth check hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
