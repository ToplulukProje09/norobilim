import { NextResponse } from "next/server";

export async function POST() {
  // ✅ Cookie'yi hemen expire ediyoruz
  const res = NextResponse.json({ success: true, message: "Çıkış yapıldı" });
  res.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0, // ❌ cookie'yi geçersiz yap
  });

  return res;
}
