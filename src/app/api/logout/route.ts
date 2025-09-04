// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json(
    { success: true, message: "Çıkış yapıldı" },
    { status: 200 }
  );

  // ✅ Cookie'yi güvenli şekilde sil
  res.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: true, // Vercel production HTTPS
    sameSite: "none", // cross-site cookie için gerekli
    path: "/",
    maxAge: 0, // anında sil
  });

  return res;
}
