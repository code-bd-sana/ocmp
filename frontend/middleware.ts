import { NextRequest, NextResponse } from "next/server";

const DASHBOARD_PREFIX = "/dashboard";
const AUTH_ROUTES = new Set(["/signin", "/signup"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const isAuthenticated = Boolean(token);

  const isDashboardRoute =
    pathname === DASHBOARD_PREFIX ||
    pathname.startsWith(`${DASHBOARD_PREFIX}/`);
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  if (isDashboardRoute && !isAuthenticated) {
    const loginUrl = new URL("/signin", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup"],
};
