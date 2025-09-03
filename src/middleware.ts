// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token"); // ✅ cookie kontrolü

  // Korunan sayfalar
  const protectedRoutes = [
    "/adminacademics",
    "/adminevents",
    "/adminmainmenu",
    "/adminpersons",
    "/adminpodcast",
    "/blogs",
  ];

  const currentPath = req.nextUrl.pathname;

  // Eğer korunan route'lara girilmeye çalışılıyorsa ve token yoksa
  if (protectedRoutes.some((path) => currentPath.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/adminacademics/:path*",
    "/adminevents/:path*",
    "/adminmainmenu/:path*",
    "/adminpersons/:path*",
    "/adminpodcast/:path*",
    "/blogs/:path*",
  ],
};
