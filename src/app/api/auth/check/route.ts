import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "dgs_access_token";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME);
  const isAuthenticated = token?.value === "authenticated_user";

  return NextResponse.json({ authenticated: isAuthenticated });
}
