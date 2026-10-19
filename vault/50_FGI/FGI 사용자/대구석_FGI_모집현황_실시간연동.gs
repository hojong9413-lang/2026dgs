/**
 * 2026 대한민국 구석구석 FGI 참가 신청(응답) — 실시간 통계 대시보드 연동용 Apps Script
 *
 * [설치 및 배포 방법 (약 1분 소요)]
 * 1. 구글 스프레드시트 「2026 대한민국 구석구석 FGI(집단 심층 인터뷰) 참가 신청(응답)-최종」 상단 메뉴에서
 *    [확장 프로그램] > [Apps Script]를 클릭합니다.
 * 2. 기존에 적혀 있는 `function myFunction() {}`을 지우고, 아래 코드를 전체 복사해 붙여넣은 뒤 저장(Ctrl+S)합니다.
 * 3. 우측 상단 파란색 [배포] 버튼 > [새 배포]를 클릭합니다.
 * 4. 왼쪽 톱니바퀴(유형 선택) > [웹 앱]을 선택합니다.
 *    - 설명: FGI 실시간 모집현황 API
 *    - 다음 사용자 인증 정보로 실행: [나 (본인 계정)]
 *    - 액세스 권한이 있는 사용자: [모든 사용자] (※ 중요: '모든 사용자'로 해야 웹 대시보드에서 로그인 없이 통계를 불러옵니다)
 * 5. [배포] 클릭 후 권한 승인([고급] > [...(안전하지 않음)으로 이동] > [허용])을 진행합니다.
 * 6. 생성된 [웹 앱 URL] (https://script.google.com/macros/s/.../exec)을 복사하여
 *    2026dgs 웹 포털의 [FGI 모집현황] 대시보드 설정 창에 붙여넣으면 실시간 연동이 완료됩니다.
 *
 * [보안 안내]
 * - 본 스크립트는 스프레드시트의 데이터를 읽기만(Read-only) 하며, 설문폼이나 원본 시트를 절대 수정하지 않습니다.
 * - Ⅴ-2(성함), Ⅴ-3(휴대전화), Ⅴ-4(이메일), Ⅴ-5-1(회원 ID/이메일) 열은 스크립트 내부에서 완전히 제외되어
 *   외부 네트워크나 웹 브라우저로 절대 전송되지 않습니다.
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Form_Responses') || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();

    if (!data || data.length <= 1) {
      return createJsonResponse({
        success: true,
        updatedAt: new Date().toISOString(),
        sheetName: sheet.getName(),
        totalCount: 0,
        records: []
      });
    }

    var headers = data[0].map(function(h) { return String(h || '').trim(); });

    // 문항 코드(예: "Ⅰ-1", "Ⅱ-5") 또는 키워드로 열 인덱스를 안전하게 찾는 헬퍼 함수
    function findCol(codePrefix, fallbackIdx) {
      for (var i = 0; i < headers.length; i++) {
        if (headers[i].indexOf(codePrefix) !== -1) return i;
      }
      return fallbackIdx;
    }

    var COL = {
      TIMESTAMP: 0,
      I1_CHANNEL: findCol('Ⅰ-1', 1),
      I2_BIRTH: findCol('Ⅰ-2', 2),
      I3_GENDER: findCol('Ⅰ-3', 3),
      I4_REGION: findCol('Ⅰ-4', 4),
      I5_ATTEND: findCol('Ⅰ-5', 5),
      I6_SESSIONS: findCol('Ⅰ-6', 6),
      II1_EXP: findCol('Ⅱ-1', 7),
      II2_JOIN_REASON: findCol('Ⅱ-2', 8),
      II3_FREQ: findCol('Ⅱ-3', 9),
      II4_DEVICE: findCol('Ⅱ-4', 10),
      II5_SERVICES: findCol('Ⅱ-5', 11),
      II6_MAIN_PURPOSE: findCol('Ⅱ-6', 12),
      II7_PUSH: findCol('Ⅱ-7', 13),
      II8_BADGE_RANK: findCol('Ⅱ-8', 14),
      II9_STOP_REASON: findCol('Ⅱ-9', 15),
      II10_MAIN_SCREEN: findCol('Ⅱ-10', 16),
      II11_SEARCH_FREQ: findCol('Ⅱ-11', 17),
      II12_OTHER_APPS: findCol('Ⅱ-12', 18),
      III1_TRIP_COUNT: findCol('Ⅲ-1', 19),
      III2_TRIP_DIST: findCol('Ⅲ-2', 20),
      III3_INFO_SOURCE: findCol('Ⅲ-3', 21),
      III4_GEN_AI: findCol('Ⅲ-4', 22),
      III5_STAMP_REWARD: findCol('Ⅲ-5', 23),
      IV1_JOB_EXCLUDE: findCol('Ⅳ-1', 24),
      IV2_ATTENTION: findCol('Ⅳ-2', 25),
      IV3_PAST_FGI: findCol('Ⅳ-3', 26),
      V1_OPINION: findCol('Ⅴ-1', 27),
      // V-2(성함: 28), V-3(휴대전화: 29), V-4(이메일: 30), V-5-1(회원ID: 32)는 개인정보이므로 읽지 않음
      V5_IS_MEMBER: findCol('Ⅴ-5.', 31),
      V6_AGREE_COLLECT: findCol('Ⅴ-6', 33),
      V7_AGREE_LOG: findCol('Ⅴ-7', 34),
      V8_AGREE_THIRD: findCol('Ⅴ-8', 35),
      V9_AGREE_REC: findCol('Ⅴ-9', 36)
    };

    var records = [];
    var baseYear = 2026;

    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      // 빈 행 건너뛰기
      if (!row[COL.TIMESTAMP] && !row[COL.I1_CHANNEL] && !row[COL.I2_BIRTH]) continue;

      var rawTs = row[COL.TIMESTAMP];
      var isoTs = '';
      if (rawTs instanceof Date) {
        isoTs = rawTs.toISOString();
      } else {
        isoTs = String(rawTs || '').trim();
      }

      var birthYear = parseInt(String(row[COL.I2_BIRTH] || '').replace(/\D/g, ''), 10);
      var age = (birthYear && birthYear > 1900 && birthYear <= baseYear) ? (baseYear - birthYear) : null;
      var ageGroup = '미상';
      if (age !== null) {
        if (age < 20) ageGroup = '10대 이하';
        else if (age < 30) ageGroup = '20대';
        else if (age < 40) ageGroup = '30대';
        else if (age < 50) ageGroup = '40대';
        else if (age < 60) ageGroup = '50대';
        else ageGroup = '60대 이상';
      }

      var attend = String(row[COL.I5_ATTEND] || '').trim();
      var exp = String(row[COL.II1_EXP] || '').trim();
      var freq = String(row[COL.II3_FREQ] || '').trim();
      var services = String(row[COL.II5_SERVICES] || '').trim();
      var purpose = String(row[COL.II6_MAIN_PURPOSE] || '').trim();
      var badgeRank = String(row[COL.II8_BADGE_RANK] || '').trim();
      var mainScreen = String(row[COL.II10_MAIN_SCREEN] || '').trim();
      var searchFreq = String(row[COL.II11_SEARCH_FREQ] || '').trim();
      var tripCount = String(row[COL.III1_TRIP_COUNT] || '').trim();
      var jobExclude = String(row[COL.IV1_JOB_EXCLUDE] || '').trim();
      var attention = String(row[COL.IV2_ATTENTION] || '').trim();
      var pastFgi = String(row[COL.IV3_PAST_FGI] || '').trim();
      var opinion = String(row[COL.V1_OPINION] || '').trim();
      var isMember = String(row[COL.V5_IS_MEMBER] || '').trim();
      var agreeCollect = String(row[COL.V6_AGREE_COLLECT] || '').trim();
      var agreeThird = String(row[COL.V8_AGREE_THIRD] || '').trim();
      var agreeRec = String(row[COL.V9_AGREE_REC] || '').trim();

      // 1차 후보 그룹 자동 판정 (G1~G4)
      var targetGroup = '미분류';
      if (exp.indexOf('최근 3개월') !== -1 && exp.indexOf('이용한 적이 있다') !== -1) {
        if (purpose.indexOf('보상') !== -1 || purpose.indexOf('이벤트') !== -1 || purpose.indexOf('미션') !== -1 || purpose.indexOf('혜택') !== -1) {
          targetGroup = 'G1 (핫·리워드/혜택형)';
        } else if (purpose.indexOf('정보') !== -1 || purpose.indexOf('기사') !== -1 || purpose.indexOf('코스') !== -1) {
          targetGroup = 'G2 (핫·콘텐츠/탐색형)';
        } else {
          targetGroup = 'G1/G2 (핫 유저)';
        }
      } else if (exp.indexOf('거의 또는 전혀') !== -1 || exp.indexOf('1년') !== -1 || exp.indexOf('이용하지 않았다') !== -1) {
        targetGroup = 'G3 (콜드·휴면/이탈)';
      } else if (exp.indexOf('회원은 아니') !== -1 || exp.indexOf('본 적이 없다') !== -1 || exp.indexOf('모르겠다') !== -1 || exp.indexOf('비회원') !== -1) {
        targetGroup = 'G4 (잠재·비회원)';
      }

      // 스크리닝 배제 사유 판정
      var excludeReasons = [];
      if (attend.indexOf('어렵습니다') !== -1 || attend.indexOf('아니요') !== -1) {
        excludeReasons.push('대면참석 불가');
      }
      if (age !== null && age < 19) {
        excludeReasons.push('연령 미달(만19세 미만)');
      }
      if (badgeRank.indexOf('있다') !== -1 || badgeRank.indexOf('예') !== -1) {
        excludeReasons.push('배지랜드 상위랭커(아웃라이어)');
      }
      if (targetGroup.indexOf('G4') !== -1) {
        if (mainScreen.indexOf('이름도 알고 있다') !== -1) {
          excludeReasons.push('잠재고객 기인지자');
        }
        if (searchFreq.indexOf('한 달에') !== -1 || searchFreq.indexOf('드물게') !== -1) {
          excludeReasons.push('여행정보 탐색빈도 낮음');
        }
        if (tripCount === '없다' || tripCount === '1번' || tripCount === '1회') {
          excludeReasons.push('연간 숙박여행 2회 미만');
        }
      }
      if (jobExclude && jobExclude.indexOf('해당 없음') === -1 && jobExclude.indexOf('없다') === -1) {
        excludeReasons.push('배제 업종 해당');
      }
      if (attention && attention.indexOf('3') === -1) {
        excludeReasons.push('주의확인 문항 오답');
      }
      if (pastFgi.indexOf('있다') !== -1 || pastFgi.indexOf('예') !== -1) {
        excludeReasons.push('최근 좌담회 참여이력');
      }
      // 설문 끝까지 도달하지 않고 중도 종료된 경우 체크
      var completedForm = Boolean(agreeCollect && agreeThird && agreeRec);
      if (!completedForm && excludeReasons.length === 0) {
        excludeReasons.push('중도 종료/미동의');
      }

      var isEligible = excludeReasons.length === 0 && completedForm;

      records.push({
        id: r, // 응답 순번 (#1, #2...)
        timestamp: isoTs,
        channel: String(row[COL.I1_CHANNEL] || '').trim(),
        birthYear: birthYear || null,
        age: age,
        ageGroup: ageGroup,
        gender: String(row[COL.I3_GENDER] || '').trim(),
        region: String(row[COL.I4_REGION] || '').trim(),
        attend: attend,
        sessions: String(row[COL.I6_SESSIONS] || '').trim(),
        exp: exp,
        joinReason: String(row[COL.II2_JOIN_REASON] || '').trim(),
        freq: freq,
        device: String(row[COL.II4_DEVICE] || '').trim(),
        services: services,
        mainPurpose: purpose,
        push: String(row[COL.II7_PUSH] || '').trim(),
        badgeRank: badgeRank,
        stopReason: String(row[COL.II9_STOP_REASON] || '').trim(),
        mainScreen: mainScreen,
        searchFreq: searchFreq,
        otherApps: String(row[COL.II12_OTHER_APPS] || '').trim(),
        tripCount: tripCount,
        tripDist: String(row[COL.III2_TRIP_DIST] || '').trim(),
        infoSource: String(row[COL.III3_INFO_SOURCE] || '').trim(),
        genAi: String(row[COL.III4_GEN_AI] || '').trim(),
        stampReward: String(row[COL.III5_STAMP_REWARD] || '').trim(),
        isMember: isMember,
        opinion: opinion,
        targetGroup: targetGroup,
        isEligible: isEligible,
        excludeReasons: excludeReasons
      });
    }

    return createJsonResponse({
      success: true,
      updatedAt: new Date().toISOString(),
      sheetName: sheet.getName(),
      totalCount: records.length,
      eligibleCount: records.filter(function(item) { return item.isEligible; }).length,
      records: records
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: String(err && err.message ? err.message : err)
    });
  }
}

function createJsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
