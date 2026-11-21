import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type RoleName = "RESTAURANT" | "NGO" | "VOLUNTEER";

// Path prefix -> the single role allowed to access it.
const PROTECTED_ROUTES: { prefix: string; role: RoleName }[] = [
  { prefix: "/donations", role: "RESTAURANT" },
  { prefix: "/discover", role: "NGO" },
  { prefix: "/claims", role: "NGO" },
  { prefix: "/deliveries", role: "NGO" },
  { prefix: "/tasks", role: "VOLUNTEER" },
];

// Public (not matched, so never intercepted): /, /impact, /login, /signup, /api/auth.

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /dashboard is not a real page. Send the signed-in user to their role's home.
  if (pathname === "/dashboard") {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
    const role = token?.role;
    const home =
      role === "RESTAURANT" ? "/restaurant" : role === "NGO" ? "/ngo" : role === "VOLUNTEER" ? "/volunteer" : "/login";
    return NextResponse.redirect(new URL(home, request.url));
  }

  // Allow all authenticated roles to view donation tracking / route pages (/donations/:id, /donations/track)
  if (pathname.startsWith("/donations/") && !pathname.startsWith("/donations/new")) {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // /frpe is accessible to all authenticated roles
  if (pathname.startsWith("/frpe")) {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const route = PROTECTED_ROUTES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!route) {
    return NextResponse.next();
  }

  // Reads the Auth.js JWT cookie directly. Does not import src/auth.ts, which
  // pulls in Prisma and bcrypt and is not edge-safe.
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token.role !== route.role) {
    const home =
      token.role === "RESTAURANT"
        ? "/restaurant"
        : token.role === "NGO"
        ? "/ngo"
        : token.role === "VOLUNTEER"
        ? "/volunteer"
        : "/impact";
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/donations/:path*",
    "/discover/:path*",
    "/claims/:path*",
    "/deliveries/:path*",
    "/tasks/:path*",
    "/frpe/:path*",
  ],
};
