import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Admin routes
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }

    // Client routes
    if (pathname.startsWith("/client")) {
      if (!token || token.role !== "CLIENT") {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }

    // API routes protection
    if (pathname.startsWith("/api/admin")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    if (pathname.startsWith("/api/client")) {
      if (!token || token.role !== "CLIENT") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes
        if (
          pathname === "/" ||
          pathname.startsWith("/auth") ||
          pathname.startsWith("/api/auth") ||
          pathname === "/api/payment/notify"
        ) {
          return true;
        }

        // Protected routes require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/client/:path*",
    "/api/admin/:path*",
    "/api/client/:path*",
    "/api/payment/:path*",
  ],
};
