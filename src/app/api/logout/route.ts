// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  // Cookie'yi temizle
  const res = NextResponse.json(
    { success: true, message: "Çıkış yapıldı" },
    { status: 200 }
  );

  res.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // ❗ daha kullanıcı dostu (strict yerine önerilen)
    path: "/",
    maxAge: 0, // cookie hemen silinsin
    expires: new Date(0),
  });

  return res;
}
