// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // ✅ Cookie'yi expire ediyoruz
  const res = NextResponse.json(
    { success: true, message: "Çıkış yapıldı" },
    { status: 200 }
  );

  res.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0, // cookie hemen silinsin
    expires: new Date(0), // geçmiş bir tarih
  });

  return res;
}
