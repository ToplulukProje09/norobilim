import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("auth_token="))
      ?.split("=")[1];

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

    return NextResponse.json({
      success: true,
      user: { id: decoded.id, username: decoded.username },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Geçersiz token" },
      { status: 401 }
    );
  }
}
