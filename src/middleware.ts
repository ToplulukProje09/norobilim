import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const currentPath = req.nextUrl.pathname;

  const protectedRoutes = [
    "/adminacademics",
    "/adminblogs",
    "/adminevents",
    "/adminmainmenu",
    "/adminpersons",
    "/adminpodcast",
    "/adminyasaklar",
  ];

  // Eğer protected route'a gidiliyorsa
  if (protectedRoutes.some((path) => currentPath.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch {
      // Token geçersiz/expired → cookie'yi silip login sayfasına yönlendir
      const res = NextResponse.redirect(new URL("/admin", req.url));
      res.cookies.set("auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/adminacademics/:path*",
    "/adminblogs/:path*",
    "/adminevents/:path*",
    "/adminmainmenu/:path*",
    "/adminpersons/:path*",
    "/adminpodcast/:path*",
    "/adminyasaklar/:path*",
  ],
  runtime: "nodejs", // ✅ Edge değil Node.js runtime
};
