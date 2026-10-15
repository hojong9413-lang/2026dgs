import { NextRequest, NextResponse } from "next/server";

const VALID_PASSWORD = process.env.DGS_ACCESS_PASSWORD;
const AUTH_COOKIE_NAME = "dgs_access_token";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!VALID_PASSWORD) {
      console.error("DGS_ACCESS_PASSWORD environment variable is not configured.");
      return NextResponse.json(
        { success: false, message: "서버 보안 환경변수(DGS_ACCESS_PASSWORD)가 설정되지 않았습니다. 관리자에게 문의하십시오." },
        { status: 500 }
      );
    }

    if (!password) {
      return NextResponse.json({ success: false, message: "비밀번호를 입력해 주십시오." }, { status: 400 });
    }

    if (password === VALID_PASSWORD) {
      const response = NextResponse.json({ success: true, message: "인증에 성공하였습니다." });
      
      // 보안 쿠키 발급 (30일 유효)
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: "authenticated_user",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30일
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: "비밀번호가 일치하지 않습니다. 다시 확인해 주십시오." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
