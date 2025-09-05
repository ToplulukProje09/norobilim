import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json(
    { success: true, message: "Çıkış yapıldı" },
    { status: 200 }
  );

  // Delete the cookie by setting its maxAge to 0 and its value to an empty string.
  res.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}
