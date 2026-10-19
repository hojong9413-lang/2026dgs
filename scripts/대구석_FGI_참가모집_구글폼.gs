/**
 * 2026 대한민국 구석구석 FGI — 이용자(핫·콜드·잠재) 참가모집 구글 설문폼 생성 스크립트
 * 기준 문서: 「대구석 FGI 이용자 참가모집 문항(안)」(2026-10-16)
 *
 * 사용 방법
 *  1) script.google.com → 새 프로젝트 → 이 코드 전체 붙여넣기 → 저장
 *  2) 아래 CONFIG 확인(특히 P1_IMAGE_FILE_ID, SHOW_CODES)
 *  3) 함수 선택 → createRecruitForm 실행 → 권한 승인
 *  4) 실행 로그에 나오는 '응답 링크'·'편집 링크'·'응답 시트' 확인
 *  5) 응모 마감 후(또는 중간 분류 시점) classifyResponses 실행 → 응답 시트에 '판정' 탭 생성
 *
 * 주의
 *  - 체크박스 문항은 구글폼에서 '답변에 따라 섹션 이동'이 안 되므로,
 *    D1(직업 배제)·C1(G4 여행횟수 조건)은 폼에서 종료시키지 않고 classifyResponses에서 판정합니다.
 *  - 핫·콜드 최종 판정은 운영사 로그 대조로 확정합니다. 여기서의 그룹은 '후보 그룹'입니다.
 */

// ===================== 설정 =====================
const CONFIG = {
  FORM_TITLE: '2026 대한민국 구석구석 FGI(집단 심층 인터뷰) 참가 신청',
  // 문항 앞에 A1·B3 같은 번호를 보일지 (분석·운영 편의용. 응답자에게 숨기려면 false)
  SHOW_CODES: true,
  // P1 화면 확인용 이미지(로고·서비스명을 가린 메인 화면 캡처)의 구글 드라이브 파일 ID. 비워 두면 안내 문구로 대체
  P1_IMAGE_FILE_ID: '',
  // 기준 연도(나이 계산용)와 출생연도 허용 범위(만 19세 이상)
  BASE_YEAR: 2026,
  BIRTH_YEAR_MIN: 1920,
  BIRTH_YEAR_MAX: 2007,
  // FGI 세션
  SESSIONS: [
    '11월 19일(목) 오전 10:00~11:30',
    '11월 19일(목) 오후 13:00~14:30',
    '11월 20일(금) 오전 10:00~11:30',
    '11월 20일(금) 오후 13:00~14:30',
  ],
};

// ===================== 선택지(판정 로직과 공유) =====================
const OPT = {
  A0: ['대한민국 구석구석 앱 알림(푸시)', '대한민국 구석구석 앱·웹의 이벤트·공지 화면', '오디(Odii)', 'VisitKorea',
       'SNS(인스타그램·페이스북·블로그 등)', '리서치 패널·조사기관 안내'],
  A2: ['남성', '여성'],
  A3: ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'],
  GATE: ['예, 참석할 수 있습니다', '아니요, 참석이 어렵습니다'],
  B1: [
    '회원이고, 최근 3개월 안에 이용한 적이 있다',
    '회원이지만, 최근 3개월 동안 거의 또는 전혀 이용하지 않았다',
    '회원이지만 1년 넘게 이용하지 않았다',
    '회원은 아니지만 검색 등으로 페이지를 본 적은 있다',
    '이용하거나 본 적이 없다 / 잘 모르겠다',
  ],
  B2: ['디지털 관광주민증을 발급받으려고', '대한민국 반값여행을 신청하려고', '이벤트·경품 응모를 하려고',
       '가볼래-터(여행 뉴스레터)를 받으려고', '여행지·코스 정보를 보다가', '기억나지 않는다'],
  B3: ['거의 매일', '일주일에 2~3번', '일주일에 1번 정도', '2주에 1번 정도', '한 달에 1번 정도', '그보다 드물게 / 들어오지 않았다'],
  B4: ['스마트폰 앱', '스마트폰 인터넷 브라우저(모바일웹)', 'PC', '앱과 모바일웹을 비슷하게'],
  B5: ['여행기사·여행지 정보 보기', '여행코스 보기·만들기', 'AI콕콕(AI 추천·플래너)', '가볼래-터 미션·여행복권',
       '퀴즈·룰렛 등 이벤트 참여', '배지랜드(배지 모으기)', '발도장(여행지 현장 방문 인증)', '좋아요·댓글·여행후기 작성',
       '디지털 관광주민증', '대한민국 반값여행', '여행상품 홍보관', '기억나는 것이 없다'],
  B6: ['여행지·코스 등 여행 계획에 필요한 정보를 얻으려고', '미션·이벤트·배지 등 참여하고 보상을 받는 재미로',
       '관광주민증·반값여행 등 혜택을 쓰려고', '여행 기사를 읽는 것 자체가 좋아서'],
  B7: ['받고 있고, 관심 있는 알림은 눌러서 본다', '받고 있지만 거의 누르지 않는다', '알림을 꺼 두었다', '앱을 설치하지 않았다 / 잘 모르겠다'],
  B8: ['있다', '없다', '잘 모르겠다'],
  B9: ['처음 목적(혜택·이벤트 등)을 이미 이뤘다', '다른 앱·검색·SNS가 더 편하다', '원하는 정보가 부족하거나 오래됐다',
       '쓰기 불편했다(메뉴·로그인·글씨 등)', '알림이나 홍보가 너무 잦았다', '여행을 자주 가지 않게 되었다', '특별한 이유는 없다'],
  P1: ['본 적이 있고, 서비스 이름도 알고 있다', '본 것 같지만 서비스 이름은 몰랐다', '본 적이 없다'],
  P2: ['주 3회 이상', '주 1~2회', '한 달에 2~3회', '그보다 드물게'],
  P3: ['네이버·카카오 지도', '야놀자·여기어때·트립닷컴 등 예약 플랫폼', '마이리얼트립·클룩 등 액티비티 플랫폼',
       '지자체·공공 관광 사이트', '따로 쓰는 앱은 없다'],
  C1: ['없다', '1번', '2~3번', '4~6번', '7번 이상'],
  C2: ['사는 곳에서 2시간 안쪽의 가까운 곳이 대부분이다', '가까운 곳과 먼 곳을 비슷하게 간다', '2시간이 넘는 먼 곳이 대부분이다'],
  C3: ['포털 검색(네이버·다음 등)', '블로그·카페', '유튜브', '인스타그램', '예약 플랫폼의 후기·기획전', 'ChatGPT 등 생성형 AI',
       '지자체·공공 관광 사이트', '대한민국 구석구석', '주변 사람의 추천'],
  C4: ['자주 쓴다', '몇 번 써 보았다', '써 본 적은 없지만 써 볼 생각이 있다', '써 본 적도, 생각도 없다'],
  C5: ['끝까지 참여해 보상을 받은 적이 있다', '시작했지만 중간에 그만뒀다', '알고는 있지만 참여하지 않았다', '이런 활동이 있는 줄 몰랐다'],
  D1: ['한국관광공사', '대한민국 구석구석 운영·개발 협력사', '여행사·숙박·관광지 운영 등 관광·여행업', '광고·마케팅·홍보',
       '시장조사·여론조사', '신문·방송 등 언론', '해당 없음'],
  D2: ['있다', '없다'],
  D3: ['있다', '없다'],
  D5: ['1번', '2번', '3번', '4번'],
  AGREE: ['동의합니다'],
  AGREE_LOG: ['동의합니다', '회원이 아니어서 해당 없음'],
  AGREE_OPT: ['동의합니다', '동의하지 않습니다'],
};

// ===================== 고지문 =====================
const NOTICE = [
  '한국관광공사는 더 나은 국내여행 정보 서비스를 만들기 위해 여행자 여러분의 의견을 듣고자 합니다.',
  '대한민국 구석구석을 써 보신 분도, 써 보지 않으신 분도 신청하실 수 있습니다.',
  '',
  '■ 일시: 2026년 11월 19일(목)~20일(금) 중 배정된 1회, 90분',
  '■ 장소: 서울 강남구(압구정역 인근), 대면 진행',
  '■ 참가 사례: 모바일 상품권 10만 원(교통비 별도 지원 없음)',
  '■ 신청 기간: 2026년 10월 19일(월)~30일(금)',
  '■ 선정 방법: 설문 응답과 참가 조건을 바탕으로 선정하며, 회원은 대한민국 구석구석 이용기록을 함께 확인합니다. 조건에 맞는 분이 정원보다 많으면 무작위 추첨합니다.',
  '■ 선정 안내: 11월 10일(화)까지 선정된 분께 개별 연락드립니다.',
  '■ 참가가 어려운 분: 한국관광공사·조사수행사 임직원과 그 가족, 관광·여행·광고·시장조사·언론 업계 종사자, 최근 6개월 안에 비슷한 좌담회·FGI에 참여한 분',
  '',
  '※ 꼭 확인해 주세요. FGI는 기록과 분석을 위해 녹음·녹화하며, 공사 담당자가 참관할 수 있습니다. 녹음·녹화에 동의하지 않으시면 참가가 어렵습니다. 자세한 처리 범위는 선정 후 동의서에서 다시 안내드립니다.',
  '',
  '응답 시간은 약 3~5분입니다.',
].join('\n');

const END_MESSAGE = '응답해 주셔서 감사합니다. 아쉽지만 이번 FGI의 참가 조건에 해당하지 않습니다.\n'
  + '아래 [제출]을 눌러 마쳐 주세요. 제출하신 정보는 선정이 끝난 뒤 바로 파기합니다.';

const CONFIRM_MESSAGE = '신청이 완료되었습니다. 선정된 분께는 11월 10일까지 개별로 연락드리며, '
  + '한국관광공사 담당자가 참조로 함께 안내합니다. 선정되지 않은 분의 정보는 선정이 끝난 뒤 바로 파기합니다.';

// ===================== 폼 생성 =====================
function createRecruitForm() {
  const form = FormApp.create(CONFIG.FORM_TITLE);
  form.setDescription(NOTICE)
      .setProgressBar(true)
      .setCollectEmail(false)
      .setAllowResponseEdits(false)
      .setShowLinkToRespondAgain(false)
      .setConfirmationMessage(CONFIRM_MESSAGE);

  const ids = {};               // 문항코드 → item ID (판정용)
  const t = (code, title) => (CONFIG.SHOW_CODES ? code + '. ' : '') + title;

  const mc = (code, title, choices, opts = {}) => {
    const it = form.addMultipleChoiceItem().setTitle(t(code, title)).setRequired(opts.required !== false);
    if (opts.help) it.setHelpText(opts.help);
    if (choices) it.setChoiceValues(choices);
    if (opts.other) it.showOtherOption(true);
    ids[code] = it.getId();
    return it;
  };
  const cb = (code, title, choices, opts = {}) => {
    const it = form.addCheckboxItem().setTitle(t(code, title)).setChoiceValues(choices).setRequired(opts.required !== false);
    if (opts.help) it.setHelpText(opts.help);
    if (opts.other) it.showOtherOption(true);
    if (opts.max) it.setValidation(FormApp.createCheckboxValidation().requireSelectAtMost(opts.max).build());
    ids[code] = it.getId();
    return it;
  };
  const txt = (code, title, opts = {}) => {
    const it = form.addTextItem().setTitle(t(code, title)).setRequired(opts.required !== false);
    if (opts.help) it.setHelpText(opts.help);
    if (opts.validation) it.setValidation(opts.validation);
    ids[code] = it.getId();
    return it;
  };
  const page = (title, help) => {
    const pb = form.addPageBreakItem().setTitle(title);
    if (help) pb.setHelpText(help);
    return pb;
  };

  // ---------- 1. 기본 정보 (Part A) ----------
  form.addSectionHeaderItem().setTitle('기본 정보');
  mc('A0', '이 설문을 어디에서 보고 들어오셨나요?', OPT.A0, { other: true });
  txt('A1', '태어난 해를 숫자 4자리로 입력해 주세요.', {
    help: '예: 1975',
    validation: FormApp.createTextValidation()
      .requireNumberBetween(CONFIG.BIRTH_YEAR_MIN, CONFIG.BIRTH_YEAR_MAX)
      .setHelpText('만 19세 이상(' + CONFIG.BIRTH_YEAR_MAX + '년 이전 출생)만 신청할 수 있습니다. 4자리 숫자로 입력해 주세요.')
      .build(),
  });
  mc('A2', '성별을 선택해 주세요.', OPT.A2);
  const a3 = form.addListItem().setTitle(t('A3', '현재 거주하시는 시·도를 선택해 주세요.')).setChoiceValues(OPT.A3).setRequired(true);
  ids['A3'] = a3.getId();
  const gate = mc('A4a', '11월 19일(목)~20일(금) 중 서울 강남구에서 열리는 90분 대면 FGI에 직접 참석하실 수 있나요?', null);

  // ---------- 2. 이용 경험 ----------
  const pbB = page('이용 경험');
  cb('A4b', '참석하실 수 있는 시간을 모두 골라 주세요.', CONFIG.SESSIONS, { help: '그룹 배정 후 해당 시간에 참석 가능한 분만 선정합니다.' });
  const b1 = mc('B1', '대한민국 구석구석(앱 또는 웹)을 이용한 경험에 가장 가까운 것을 골라 주세요.', null);

  // ---------- 3. 회원 경로 (G1·G2·G3) ----------
  const pbMember = page('대한민국 구석구석 이용 행태');
  mc('B2', '대한민국 구석구석에 처음 가입하신 계기는 무엇인가요?', OPT.B2, { other: true });
  mc('B3', '최근 2개월 동안 대한민국 구석구석에 얼마나 자주 들어오셨나요?', OPT.B3);
  mc('B4', '주로 어떤 방법으로 이용하시나요?', OPT.B4);
  cb('B5', '최근 3개월 동안 이용한 서비스를 모두 골라 주세요.', OPT.B5);
  mc('B6', '대한민국 구석구석을 쓰는 가장 큰 이유 하나를 골라 주세요.', OPT.B6, { other: true });
  mc('B7', '대한민국 구석구석 앱 알림(푸시)을 어떻게 받고 계신가요?', OPT.B7);
  mc('B8', '최근 1년 안에 배지랜드 월간·연간 랭킹 10위 안에 든 적이 있나요?', OPT.B8);
  cb('B9', '(최근 이용이 줄었거나 멈춘 분만) 이용이 줄었거나 멈추신 이유를 모두 골라 주세요.', OPT.B9,
     { required: false, other: true, help: '최근에도 자주 이용하고 계시면 비워 두고 넘어가세요.' });

  // ---------- 4. 잠재 경로 (G4) ----------
  const pbP1 = page('화면 확인');
  if (CONFIG.P1_IMAGE_FILE_ID) {
    form.addImageItem().setTitle('아래 화면을 봐 주세요.')
        .setImage(DriveApp.getFileById(CONFIG.P1_IMAGE_FILE_ID).getBlob());
  } else {
    form.addSectionHeaderItem().setTitle('[운영 메모] 로고·서비스명을 가린 메인 화면 캡처를 여기에 넣으세요.')
        .setHelpText('CONFIG.P1_IMAGE_FILE_ID에 드라이브 파일 ID를 넣고 다시 생성하거나, 폼 편집 화면에서 이미지를 직접 추가한 뒤 이 안내를 지웁니다.');
  }
  const p1 = mc('P1', '위 화면은 국내여행 정보 서비스 \'대한민국 구석구석\'의 메인 화면입니다. 이 화면을 본 적이 있나요?', null);

  const pbP2 = page('여행 정보 탐색');
  const p2 = mc('P2', '여행 정보를 찾아보기 위해 앱·검색·SNS 등을 얼마나 자주 이용하시나요?', null);

  const pbP3 = page('여행 정보 탐색(계속)');
  cb('P3', '여행할 때 주로 쓰는 앱·서비스를 모두 골라 주세요.', OPT.P3, { other: true });

  // ---------- 5. 여행 행태 (Part C, 공통) ----------
  const pbC = page('여행 행태');
  mc('C1', '최근 1년 동안 국내에서 1박 이상 여행을 몇 번 다녀오셨나요?', OPT.C1);
  mc('C2', '국내여행은 주로 어느 거리로 다니시나요? (당일치기 포함)', OPT.C2);
  cb('C3', '국내여행 정보를 찾을 때 주로 쓰는 곳을 최대 3개 골라 주세요.', OPT.C3, { other: true, max: 3 });
  mc('C4', '여행 계획을 세울 때 ChatGPT·제미나이 등 생성형 AI를 써 보셨나요?', OPT.C4);
  mc('C5', '여행지에 실제로 가서 방문을 인증하고 보상을 받는 활동에 참여해 보셨나요? (스탬프 투어, 발도장, 방문 인증 이벤트 등)', OPT.C5);

  // ---------- 6. 참가 확인 (Part D) ----------
  const pbD = page('참가 확인');
  cb('D1', '본인 또는 가족 중에 아래 기관·업종에서 일하는 분이 있나요?', OPT.D1);
  mc('D3', '한국관광공사가 연 대한민국 구석구석·가볼래-터·SNS 관련 좌담회에 참여한 적이 있나요? (기간 무관)', OPT.D3);
  txt('D4', '이번 FGI에 함께 신청한 가족·지인이 있다면 성함을 적어 주세요.', { required: false });
  mc('D5', '이 문항은 성의 있는 응답을 확인하기 위한 것입니다. \'3번\'을 골라 주세요.', OPT.D5);
  const d2 = mc('D2', '최근 6개월 안에 좌담회·FGI·심층 인터뷰에 참여하고 사례를 받은 적이 있나요?', null);

  // ---------- 7. 의견·연락처·동의 (Part E) ----------
  const pbE = page('의견·연락처·동의');
  const e1 = form.addParagraphTextItem()
    .setTitle(t('E1', '국내여행 정보를 찾을 때 가장 불편했던 점이나 있었으면 하는 것을 한두 문장으로 적어 주세요.'))
    .setRequired(true)
    .setValidation(FormApp.createParagraphTextValidation().requireTextLengthGreaterThanOrEqualTo(20)
      .setHelpText('20자 이상 적어 주세요.').build());
  ids['E1'] = e1.getId();
  txt('E2_NAME', '성함');
  txt('E2_PHONE', '휴대전화 번호', {
    help: '예: 010-1234-5678',
    validation: FormApp.createTextValidation().requireTextMatchesPattern('^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$')
      .setHelpText('휴대전화 번호 형식으로 입력해 주세요.').build(),
  });
  txt('E2_EMAIL', '이메일', {
    validation: FormApp.createTextValidation().requireTextIsEmail().setHelpText('이메일 형식으로 입력해 주세요.').build(),
  });
  txt('E2_ID', '대한민국 구석구석 가입 이메일 또는 회원 ID (회원만)', {
    required: false, help: '이용기록 확인에 쓰입니다. 비회원은 비워 두세요.',
  });

  form.addSectionHeaderItem().setTitle('개인정보 수집·이용 및 제공 동의')
    .setHelpText('필수 항목에 동의하지 않으시면 신청하실 수 없습니다.');
  cb('E3_COLLECT', '[필수] 개인정보 수집·이용 동의', OPT.AGREE, {
    help: '수집 항목: 성명·휴대전화·이메일·출생연도·성별·거주 지역·설문 응답 / 목적: FGI 참가자 선정·연락 / '
        + '보유 기간: 미선정자는 선정 종료 즉시, 선정자는 과업 종료 시(2026년 12월) 파기',
  });
  mc('E3_LOG', '[필수·회원] 대한민국 구석구석 이용기록 확인 동의', OPT.AGREE_LOG, {
    help: '회원인 경우 선정을 위해 이용기록(방문 빈도·이용 서비스·가입 시기)을 확인하는 데 동의합니다.',
  });
  cb('E3_THIRD', '[필수] 개인정보 제3자 제공 동의', OPT.AGREE, {
    help: '제공받는 자: 조사수행사(투어리즘인사이트) / 목적: 참가자 선정·연락·FGI 운영 / 보유 기간: 위와 같음',
  });
  cb('E3_REC', '[필수] 녹음·녹화 사전 고지 확인', OPT.AGREE, {
    help: '선정되면 FGI를 녹음·녹화하고 공사 담당자가 참관할 수 있음을 확인합니다. 개별 동의는 최종 선정 때 따로 받습니다.',
  });
  mc('E3_FUTURE', '[선택] 이번에 선정되지 않아도 다음 조사 참여 안내를 받으시겠어요?', OPT.AGREE_OPT);

  // ---------- 8. 종료 섹션 ----------
  const pbEnd = page('응답해 주셔서 감사합니다', END_MESSAGE);

  // ===================== 분기 설정 =====================
  gate.setChoices([
    gate.createChoice(OPT.GATE[0], FormApp.PageNavigationType.CONTINUE),
    gate.createChoice(OPT.GATE[1], pbEnd),
  ]);
  b1.setChoices([
    b1.createChoice(OPT.B1[0], pbMember),
    b1.createChoice(OPT.B1[1], pbMember),
    b1.createChoice(OPT.B1[2], pbMember),
    b1.createChoice(OPT.B1[3], pbP1),
    b1.createChoice(OPT.B1[4], pbP1),
  ]);
  pbP1.setGoToPage(pbC);          // 회원 경로 섹션이 끝나면 → 여행 행태(C)
  p1.setChoices([
    p1.createChoice(OPT.P1[0], pbEnd),
    p1.createChoice(OPT.P1[1], pbP2),
    p1.createChoice(OPT.P1[2], pbP2),
  ]);
  p2.setChoices([
    p2.createChoice(OPT.P2[0], pbP3),
    p2.createChoice(OPT.P2[1], pbP3),
    p2.createChoice(OPT.P2[2], pbEnd),
    p2.createChoice(OPT.P2[3], pbEnd),
  ]);
  d2.setChoices([
    d2.createChoice(OPT.D2[0], pbEnd),
    d2.createChoice(OPT.D2[1], pbE),
  ]);
  pbEnd.setGoToPage(FormApp.PageNavigationType.SUBMIT);   // 동의 섹션이 끝나면 종료 섹션을 건너뛰고 제출

  // ===================== 응답 시트 연결 =====================
  const ss = SpreadsheetApp.create(CONFIG.FORM_TITLE + ' (응답)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  const props = PropertiesService.getScriptProperties();
  props.setProperty('FORM_ID', form.getId());
  props.setProperty('SHEET_ID', ss.getId());
  props.setProperty('ITEM_IDS', JSON.stringify(ids));

  Logger.log('응답 링크: ' + form.getPublishedUrl());
  Logger.log('편집 링크: ' + form.getEditUrl());
  Logger.log('응답 시트: ' + ss.getUrl());
}

// ===================== 응답 판정 =====================
/**
 * 응답을 읽어 후보 그룹(G1~G4)과 미선정 코드(Q·C·T·E1~E5)를 매기고 응답 시트의 '판정' 탭에 씁니다.
 * 컷오프·최종 그룹은 운영사 로그 대조 후 확정하므로, 결과는 1차 분류입니다.
 */
function classifyResponses() {
  const props = PropertiesService.getScriptProperties();
  const form = FormApp.openById(props.getProperty('FORM_ID'));
  const ids = JSON.parse(props.getProperty('ITEM_IDS'));
  const ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));

  const idToCode = {};
  Object.keys(ids).forEach(c => (idToCode[ids[c]] = c));

  const rows = [];
  const phoneCount = {};
  const parsed = form.getResponses().map(r => {
    const a = {};
    r.getItemResponses().forEach(ir => {
      const code = idToCode[ir.getItem().getId()];
      if (code) a[code] = ir.getResponse();
    });
    a._time = r.getTimestamp();
    const phone = String(a.E2_PHONE || '').replace(/\D/g, '');
    if (phone) phoneCount[phone] = (phoneCount[phone] || 0) + 1;
    a._phone = phone;
    return a;
  });

  const arr = v => (Array.isArray(v) ? v : v ? [v] : []);
  const idx = (list, v) => list.indexOf(v);          // 0부터
  const countIn = (sel, list, picks) => arr(sel).filter(s => picks.indexOf(idx(list, s)) >= 0).length;

  parsed.forEach(a => {
    const codes = [];
    const memo = [];
    let group = '';

    // 1) 폼 안에서 종료된 경우
    if (a.A4a === OPT.GATE[1]) codes.push('Q');
    if (a.P1 === OPT.P1[0]) codes.push('T');
    if (a.P2 && idx(OPT.P2, a.P2) >= 2) codes.push('T');
    if (a.D2 === OPT.D2[0]) codes.push('E3');

    // 2) 배제
    const d1 = arr(a.D1);
    if (countIn(d1, OPT.D1, [0, 1]) > 0) codes.push('E1');
    if (countIn(d1, OPT.D1, [2, 3, 4, 5]) > 0) codes.push('E2');
    if (a.D3 === OPT.D3[0]) memo.push('공사 좌담회 참여 이력(후순위)');
    if (a.D5 && a.D5 !== OPT.D5[2]) codes.push('E4');
    if (a._phone && phoneCount[a._phone] > 1) codes.push('E4');
    if (a.D4) memo.push('동반 신청: ' + a.D4 + '(같은 그룹 1명만)');

    // 3) 동의 (폼에서 필수라 보통 충족)
    if (a.E2_NAME && (!a.E3_COLLECT || !a.E3_THIRD || !a.E3_REC)) codes.push('C');
    if (a.E3_LOG === OPT.AGREE_LOG[1] && idx(OPT.B1, a.B1) <= 2 && idx(OPT.B1, a.B1) >= 0) {
      codes.push('C'); memo.push('회원인데 이용기록 확인 미동의');
    }

    // 4) 후보 그룹
    const b1 = idx(OPT.B1, a.B1);
    if (b1 === 0) {
      const freq = idx(OPT.B3, a.B3);
      const reward = countIn(a.B5, OPT.B5, [3, 4, 5, 6]);
      const content = countIn(a.B5, OPT.B5, [0, 1, 2, 7]);
      const b6 = idx(OPT.B6, a.B6);
      if (freq >= 4) {
        group = 'G3?'; memo.push('최근 이용 응답이나 방문 빈도 낮음 → 로그로 핫/콜드 확인');
      } else if (reward >= 2 && content >= 2) {
        group = b6 === 1 ? 'G1' : (b6 === 0 || b6 === 3) ? 'G2' : 'G1/G2';
        if (group === 'G1/G2') memo.push('리워드·콘텐츠 모두 해당, 주 목적 불명확');
      } else if (reward >= 2) {
        group = 'G1';
      } else if (content >= 2) {
        group = 'G2';
      } else {
        group = '핫?'; memo.push('B5 영역 기준 미달 → 로그로 확인');
      }
      if (arr(a.B5).indexOf(OPT.B5[2]) >= 0 && group.indexOf('G2') >= 0) memo.push('AI콕콕 이용(G2 우대)');
      if (a.B8 === OPT.B8[0]) { codes.push('E5'); memo.push('배지랜드 랭킹 상위(아웃라이어)'); }
    } else if (b1 === 1 || b1 === 2) {
      group = 'G3';
      if (b1 === 2) memo.push('1년 이상 미이용 회원 → 로그로 G3/G4 중복 확인');
      if (idx(OPT.B2, a.B2) === 0 || idx(OPT.B2, a.B2) === 1) memo.push('혜택 목적 가입');
    } else if (b1 === 3 || b1 === 4) {
      group = a.P1 === OPT.P1[1] ? 'G4-a' : a.P1 === OPT.P1[2] ? 'G4-b' : 'G4';
      if (idx(OPT.C1, a.C1) >= 0 && idx(OPT.C1, a.C1) < 2) { codes.push('T'); memo.push('최근 1년 숙박여행 2회 미만'); }
    }

    // 5) 나이
    const by = parseInt(a.A1, 10);
    const age = by ? CONFIG.BASE_YEAR - by : '';
    if (age && age < 19) codes.push('Q');

    rows.push([
      a._time, a.E2_NAME || '', a.E2_PHONE || '', a.E2_EMAIL || '', a.E2_ID || '',
      arr(a.A0).join(', '), by || '', age, ageBand_(age), a.A2 || '', a.A3 || '', arr(a.A4b).join(' / '),
      group, unique_(codes).join(','), unique_(codes).length ? '미선정' : '적격(로그 대조 대기)',
      a.B4 || '', a.C1 || '', a.C2 || '', a.C5 || '', a.B2 || '', memo.join(' / '),
    ]);
  });

  const header = ['응답 시각', '성명', '휴대전화', '이메일', '회원 이메일/ID', '유입 경로', '출생연도', '나이(' + CONFIG.BASE_YEAR + ')',
    '연령대', '성별', '거주지', '참석 가능 시간', '후보 그룹', '미선정 코드', '1차 판정',
    '이용 채널(B4)', '숙박여행(C1)', '여행 거리(C2)', '방문 인증 리워드(C5)', '가입 계기(B2)', '검토 메모'];

  let sh = ss.getSheetByName('판정');
  if (sh) sh.clear(); else sh = ss.insertSheet('판정');
  sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold').setBackground('#EEF2F7');
  if (rows.length) sh.getRange(2, 1, rows.length, header.length).setValues(rows);
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, header.length);

  // 그룹별 집계
  const summary = {};
  rows.forEach(r => {
    const g = r[12] || '(미분류)';
    summary[g] = summary[g] || { total: 0, ok: 0 };
    summary[g].total++;
    if (!r[13]) summary[g].ok++;
  });
  const sumRows = Object.keys(summary).sort().map(g => [g, summary[g].total, summary[g].ok]);
  const col = header.length + 2;
  sh.getRange(1, col, 1, 3).setValues([['후보 그룹', '응모', '1차 적격']]).setFontWeight('bold').setBackground('#EEF2F7');
  if (sumRows.length) sh.getRange(2, col, sumRows.length, 3).setValues(sumRows);

  Logger.log('판정 완료: ' + rows.length + '건 → ' + ss.getUrl());
}

function ageBand_(age) {
  if (!age) return '';
  if (age < 30) return '20대 이하';
  if (age >= 70) return '70세 이상';
  return Math.floor(age / 10) * 10 + '대';
}

function unique_(list) {
  return list.filter((v, i) => list.indexOf(v) === i);
}
