import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const CONFIG_FILE_PATH = path.join(
  process.cwd(),
  "vault",
  "50_FGI",
  ".fgi-webhook.json"
);

const DEFAULT_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyv9G0PeXu1FNHnzGgZh8lVId0h02XedYqdevPYgIRpTlqdN1f51DnYgyTKNpTI70gy/exec";

function getSavedScriptUrl(): string {
  if (process.env.NEXT_PUBLIC_FGI_SCRIPT_URL) {
    return process.env.NEXT_PUBLIC_FGI_SCRIPT_URL.trim();
  }
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const raw = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed?.scriptUrl && typeof parsed.scriptUrl === "string") {
        return parsed.scriptUrl.trim();
      }
    }
  } catch (e) {
    console.error("Failed to read FGI webhook config:", e);
  }
  return DEFAULT_SCRIPT_URL;
}

// 연동 URL 설정 전에도 즉시 화면을 확인할 수 있도록 현재 시트의 2건 테스트 응답을 반영한 기본 데이터
const INITIAL_PREVIEW_RECORDS = [
  {
    id: 1,
    timestamp: "2026-10-18T13:26:40+09:00",
    channel: "대한민국 구석구석 앱 알림(푸시)",
    birthYear: 1985,
    age: 41,
    ageGroup: "40대",
    gender: "여성",
    region: "서울",
    attend: "예, 참석할 수 있습니다",
    sessions: "11월 19일(목) 오후 13:00~14:30, 11월 20일(금) 오전 10:00~11:30",
    exp: "회원이고, 최근 3개월 안에 이용한 적이 있다",
    joinReason: "디지털 관광주민증을 발급받으려고",
    freq: "일주일에 2~3번",
    device: "스마트폰 앱",
    services: "여행기사·여행지 정보 보기, AI콕콕(AI 추천·플래너), 디지털 관광주민증",
    mainPurpose: "여행지·코스 등 여행 계획에 필요한 정보를 얻으려고",
    push: "받고 있고, 관심 있는 알림은 눌러서 본다",
    badgeRank: "없다",
    stopReason: "",
    mainScreen: "",
    searchFreq: "",
    otherApps: "",
    tripCount: "4~6번",
    tripDist: "가까운 곳과 먼 곳을 비슷하게 간다",
    infoSource: "포털 검색(네이버·다음 등), 인스타그램, 대한민국 구석구석",
    genAi: "몇 번 써 보았다",
    stampReward: "끝까지 참여해 보상을 받은 적이 있다",
    isMember: "예",
    opinion: "지역별 숨은 맛집이나 주차장 혼잡도 정보가 함께 제공되면 좋겠습니다.",
    targetGroup: "G2 (핫·콘텐츠/탐색형)",
    isEligible: true,
    excludeReasons: [],
  },
  {
    id: 2,
    timestamp: "2026-10-18T13:38:05+09:00",
    channel: "대한민국 구석구석 앱 알림(푸시)",
    birthYear: 1973,
    age: 53,
    ageGroup: "50대",
    gender: "남성",
    region: "경기",
    attend: "예, 참석할 수 있습니다",
    sessions: "11월 19일(목) 오전 10:00~11:30, 11월 20일(금) 오후 13:00~14:30",
    exp: "회원이고, 최근 3개월 안에 이용한 적이 있다",
    joinReason: "이벤트·경품 응모를 하려고",
    freq: "일주일에 1번 정도",
    device: "스마트폰 앱",
    services: "가볼래-터 미션·여행복권, 퀴즈·룰렛 등 이벤트 참여, 배지랜드(배지 모으기)",
    mainPurpose: "미션·이벤트·배지 등 참여하고 보상을 받는 재미로",
    push: "받고 있고, 관심 있는 알림은 눌러서 본다",
    badgeRank: "없다",
    stopReason: "",
    mainScreen: "",
    searchFreq: "",
    otherApps: "",
    tripCount: "2~3번",
    tripDist: "사는 곳에서 2시간 안쪽의 가까운 곳이 대부분이다",
    infoSource: "포털 검색(네이버·다음 등), 블로그·카페, 유튜브",
    genAi: "써 본 적은 없지만 써 볼 생각이 있다",
    stampReward: "끝까지 참여해 보상을 받은 적이 있다",
    isMember: "예",
    opinion: "이벤트 참여 절차가 조금 더 간소화되고 당첨 결과 확인이 편했으면 합니다.",
    targetGroup: "G1 (핫·리워드/혜택형)",
    isEligible: true,
    excludeReasons: [],
  },
];

export async function GET(request: NextRequest) {
  try {
    const queryUrl = request.nextUrl.searchParams.get("scriptUrl")?.trim();
    const activeUrl = queryUrl || getSavedScriptUrl();

    if (!activeUrl) {
      return NextResponse.json({
        success: true,
        isPreview: true,
        configuredUrl: "",
        updatedAt: new Date().toISOString(),
        sheetName: "Form_Responses (연동 대기중 · 샘플 미리보기)",
        totalCount: INITIAL_PREVIEW_RECORDS.length,
        eligibleCount: INITIAL_PREVIEW_RECORDS.filter((r) => r.isEligible).length,
        records: INITIAL_PREVIEW_RECORDS,
      });
    }

    const res = await fetch(activeUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `구글 시트 웹 앱 응답 오류 (HTTP ${res.status})`,
          configuredUrl: activeUrl,
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      ...data,
      isPreview: false,
      configuredUrl: activeUrl,
    });
  } catch (error: any) {
    console.error("FGI recruitment fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "구글 스프레드시트 Apps Script URL에서 데이터를 가져오지 못했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const scriptUrl = typeof body?.scriptUrl === "string" ? body.scriptUrl.trim() : "";

    if (
      scriptUrl &&
      !scriptUrl.startsWith("https://script.google.com/macros/s/")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "올바른 Google Apps Script 웹 앱 URL(https://script.google.com/macros/s/.../exec)을 입력해 주세요.",
        },
        { status: 400 }
      );
    }

    try {
      const dir = path.dirname(CONFIG_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        CONFIG_FILE_PATH,
        JSON.stringify(
          {
            scriptUrl,
            updatedAt: new Date().toISOString(),
          },
          null,
          2
        ),
        "utf-8"
      );
    } catch (fsErr) {
      // Vercel 서버리스(읽기 전용 파일시스템) 환경에서는 파일 쓰기 생략 (클라이언트 localStorage 및 .fgi-webhook.json 커밋으로 연동)
      console.warn("Serverless read-only filesystem, skipping local file write:", fsErr);
    }

    return NextResponse.json({
      success: true,
      scriptUrl,
    });
  } catch (error: any) {
    console.error("FGI webhook save error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "설정을 저장하는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
