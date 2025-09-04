import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  try {
    // ✅ Artık await gerekiyor
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("auth_token");
    const token = tokenCookie?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token yok" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
    };

    return NextResponse.json({
      success: true,
      user: { id: decoded.id, username: decoded.username },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Geçersiz veya süresi dolmuş token" },
      { status: 401 }
    );
  }
}
