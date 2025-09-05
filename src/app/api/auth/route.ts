import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Collection } from "mongodb";

// Your secret key for signing JWTs.
const JWT_SECRET = process.env.JWT_SECRET!;
// A unique identifier for the user account in the database.
const AUTH_ID = "singleton";

// Define the structure of the user document in MongoDB.
type AuthDoc = {
  _id: string;
  username: string;
  password: string; // This will be the hashed password.
};

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const db = await getDb();
    const col: Collection<AuthDoc> = db.collection<AuthDoc>("Auth");
    const auth = await col.findOne({ _id: AUTH_ID });

    // Check if the user exists.
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Compare the provided password with the hashed password in the database.
    const isMatch = await bcrypt.compare(password, auth.password);

    // Check for a password match and correct username.
    if (!isMatch || auth.username !== username) {
      return NextResponse.json(
        { success: false, message: "Geçersiz kullanıcı adı veya şifre" },
        { status: 401 }
      );
    }

    // Create a JSON Web Token (JWT) that is valid for 10 minutes.
    const token = jwt.sign(
      { id: auth._id, username: auth.username },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    const isProd = process.env.NODE_ENV === "production";
    const res = NextResponse.json({ success: true, message: "Giriş başarılı" });

    // Set a session cookie. It's httpOnly for security and won't have a maxAge or expires,
    // so it will be automatically deleted when the browser session ends.
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("❌ Login hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
