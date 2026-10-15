import { NextRequest, NextResponse } from "next/server";
import { checkIsAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authenticated = checkIsAuthenticated(request);
  return NextResponse.json({ authenticated });
}
