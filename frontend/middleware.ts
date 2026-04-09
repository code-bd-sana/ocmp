import { NextRequest, NextResponse } from "next/server";

const DASHBOARD_PREFIX = "/dashboard";
const ADMIN_PREFIX = "/admin";
const AUTH_ROUTES = new Set(["/signin", "/signup"]);
const SUPER_ADMIN_ROLE = "SUPER_ADMIN";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const isAuthenticated = Boolean(token);

  const isDashboardRoute =
    pathname === DASHBOARD_PREFIX ||
    pathname.startsWith(`${DASHBOARD_PREFIX}/`);
  const isAdminRoute =
    pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  if ((isDashboardRoute || isAdminRoute) && !isAuthenticated) {
    const loginUrl = new URL("/signin", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && isAuthenticated && role && role !== SUPER_ADMIN_ROLE) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (
    isDashboardRoute &&
    isAuthenticated &&
    role &&
    role === SUPER_ADMIN_ROLE
  ) {
    const adminUrl = new URL("/admin", request.url);
    return NextResponse.redirect(adminUrl);
  }

  if (isAuthRoute && isAuthenticated && role) {
    const target = role === SUPER_ADMIN_ROLE ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/signin", "/signup"],
};
