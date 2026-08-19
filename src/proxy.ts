import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ROLE_HOME, ROLES } from "@/lib/constants";

const ROLE_PREFIX: Record<string, string[]> = {
  "/hotel": [ROLES.ADMIN, ROLES.HOTEL_STAFF],
  "/taxi": [ROLES.ADMIN, ROLES.TAXI_STAFF],
  "/driver": [ROLES.ADMIN, ROLES.DRIVER],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const prefix = Object.keys(ROLE_PREFIX).find((p) => pathname.startsWith(p));
  if (!prefix) return NextResponse.next();

  const session = req.auth;
  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const allowedRoles = ROLE_PREFIX[prefix];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.redirect(new URL(ROLE_HOME[session.user.role], req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/hotel/:path*", "/taxi/:path*", "/driver/:path*"],
};
