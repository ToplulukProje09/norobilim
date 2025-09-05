import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// The secret key must be encoded as a Uint8Array for the `jose` library.
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const currentPath = req.nextUrl.pathname;

  // An array of protected routes.
  const protectedRoutes = [
    "/adminacademics",
    "/adminblogs",
    "/adminevents",
    "/adminmainmenu",
    "/adminpersons",
    "/adminpodcast",
    "/adminyasaklar",
  ];

  // Check if the current path is one of the protected routes.
  if (protectedRoutes.some((path) => currentPath.startsWith(path))) {
    // Redirect to the login page if no token is found.
    if (!token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    try {
      // Verify the token's validity and signature.
      await jwtVerify(token, JWT_SECRET);
      // If valid, allow the request to proceed.
      return NextResponse.next();
    } catch {
      // If the token is invalid or expired, redirect to login and clear the cookie.
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

  // If the route is not protected, continue as normal.
  return NextResponse.next();
}

// Configuration to specify which paths the middleware should run on.
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
};
