import { NextRequest } from "next/server";

export function checkIsAuthenticated(request: NextRequest): boolean {
  const tokenFromCookie = request.cookies.get("dgs_access_token")?.value;
  if (tokenFromCookie === "authenticated_user") return true;

  const rawCookie = request.headers.get("cookie") || "";
  const match = rawCookie.match(/dgs_access_token=([^;]+)/);
  if (match && decodeURIComponent(match[1]) === "authenticated_user") return true;

  return false;
}
