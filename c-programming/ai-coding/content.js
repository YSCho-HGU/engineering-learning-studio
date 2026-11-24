window.AICodingLessons = [
  {
    "title": "11.1 From C to Modern Software",
    "ko": "C에서 현대 소프트웨어로",
    "body": "A C program already has data, control flow, functions, state and persistence. A web app adds a user interface; its logic still transforms inputs into outputs. Choose technologies by role: UI (HTML/CSS), logic (JavaScript/TypeScript or Python), data (CSV or SQL), infrastructure (Git, APIs, hosting). These are not one-to-one equivalents.",
    "kr": "C에서 배운 변수·배열은 데이터, 조건문·반복문은 로직, 함수는 모듈, 구조체는 레코드, 파일은 지속성, 포인터와 동적 메모리는 자원 관리로 이어진다. 웹 앱도 입력을 처리해 출력을 만드는 프로그램이다. 기술은 UI·로직·데이터·인프라 역할에 따라 선택한다. 정확한 일대일 대응은 아니다.",
    "task": "Match each C foundation to a software role, then explain why the browser UI is not the algorithm.",
    "taskKo": "C 기초 개념과 소프트웨어 역할을 연결하고 UI와 알고리즘의 차이를 설명하자."
  },
  {
    "title": "11.2 Vibe Coding and Coding Agents",
    "ko": "바이브 코딩과 코딩 에이전트",
    "body": "Vibe coding is useful for exploring a prototype quickly. A coding agent may inspect files, propose a plan, edit and run tests within its permissions. Chat-based help, an IDE, a coding agent and Git are different tools. A working prototype is not proof of correctness.",
    "kr": "자연어로 아이디어를 설명하고 결과를 보며 수정하는 Vibe Coding은 탐색에 유용하다. Coding Agent는 허용된 범위에서 파일을 읽고 계획·수정·테스트를 할 수 있다. Codex, Cursor, Copilot, Claude Code 등은 기능과 권한이 다르다. 실행된다고 정확한 것은 아니다.",
    "task": "Try the Bubble Sort lab. Predict each comparison before stepping; compare the animation with the C code.",
    "taskKo": "Bubble Sort 실습에서 비교 결과를 먼저 예측한 뒤 단계 실행하고 C 코드와 비교하자."
  },
  {
    "title": "11.3 Specification, Plan and Context",
    "ko": "명세·계획·맥락",
    "body": "A specification defines goal, context, requirements, constraints, acceptance criteria and verification. Ask for a plan before editing files. Provide README, requirements, sample input and expected output. For GPA, 3 credits at 4.5 and 2 at 3.5 give 4.10, not 4.00. Empty input must not divide by zero.",
    "kr": "목표·맥락·요구사항·제약·완료 기준·검증 방법을 명세로 정한다. 먼저 계획만 요청하고 승인 후 구현한다. README, 요구사항, 예제 입력과 기대 출력을 제공한다. 3학점 4.5와 2학점 3.5의 GPA는 4.10이다. 빈 목록은 0으로 나누지 않는다.",
    "task": "Build a specification below; copy it to your chosen coding tool. Do not paste secrets or personal data.",
    "taskKo": "아래에서 명세를 작성하고 선택한 코딩 도구에 복사한다. 비밀정보와 개인정보는 넣지 않는다."
  },
  {
    "title": "11.4 Agent Workflow and Git",
    "ko": "에이전트 작업 흐름과 Git",
    "body": "Specify → plan → implement one task → run and test → review diff → fix → commit → deploy. Save a known-good commit before agent edits. git status lists changes; git diff shows unstaged tracked changes; git diff --staged shows staged changes. New files must be opened and reviewed separately. Branches isolate experiments; a pull request supports review.",
    "kr": "명세 → 계획 → 작은 작업 구현 → 실행·테스트 → diff 검토 → 수정 → commit → 배포 순서로 진행한다. 변경 전 기준점을 저장한다. git status는 변경 목록, git diff는 stage 전 추적 파일 변경, git diff --staged는 stage된 변경을 보여준다. 새 파일은 직접 열어 확인한다. Branch는 실험을 분리하고 PR은 검토를 돕는다.",
    "task": "Use the Git checkpoint simulation; explain what should happen if a test fails.",
    "taskKo": "Git 기준점 모형에서 테스트 실패 시 어떤 조치를 해야 하는지 설명하자."
  },
  {
    "title": "11.5 Verification and Review",
    "ko": "검증과 코드 리뷰",
    "body": "It runs ≠ it is correct. Read the actual diff and derive expected results independently. If the requirement says strictly above threshold, changing > to >= is a bug at equality. Test normal, boundary and invalid inputs; reproduce, isolate, fix and rerun earlier tests.",
    "kr": "실행된다는 것이 정확하다는 뜻은 아니다. 실제 diff를 읽고 기대값을 독립적으로 계산한다. 임계값을 초과하는 값만 경고해야 할 때 >를 >=로 바꾸면 경계 오류가 발생한다. 정상·경계·잘못된 입력을 검사하고 오류 수정 후 기존 테스트도 다시 실행한다.",
    "task": "Predict the result at value=30, threshold=30, then run the independent tests in the Diff lab.",
    "taskKo": "value=30, threshold=30에서 결과를 예측하고 Diff 실습의 독립 테스트를 실행하자."
  },
  {
    "title": "11.6 Responsible Development",
    "ko": "책임 있는 개발",
    "body": "Use the smallest necessary permissions. Never share passwords, API keys, private keys or real student grades. .gitignore is not access control. Review dependencies and licenses, avoid unnecessary packages, and inspect commands before approving. Deploy only reviewed files; retest the deployed URL. AI writes code; you own the software.",
    "kr": "필요한 최소 권한만 부여한다. 비밀번호·API key·private key·실제 학생 성적을 공유하지 않는다. .gitignore는 접근 차단 장치가 아니다. 의존성과 라이선스를 검토하고 명령 실행 전 확인한다. 검토한 파일만 배포하고 배포 URL에서도 테스트한다. 최종 책임은 개발자에게 있다.",
    "task": "Decide which actions are safe before deployment; check the rationale.",
    "taskKo": "배포 전 어떤 행동이 안전한지 판단하고 근거를 확인하자."
  },
  {
    "title": "11.7 Capstone — Sensor Data Dashboard",
    "ko": "통합 프로젝트: 센서 데이터 대시보드",
    "body": "Generate or use a synthetic CSV with time,value rows. Parse and validate the records, calculate min/mean/max, draw the graph and count values strictly above a threshold. Start with a local static app: no server, login, database or AI key is required. Independently check [10,20,40,30]: min=10, mean=25, max=40, alerts=1 at threshold=30.",
    "kr": "가상 센서 CSV(time,value)를 읽어 검증하고 최솟값·평균·최댓값, 그래프, 임계값 초과 개수를 구한다. 처음에는 서버·로그인·DB·AI key가 필요 없는 로컬 정적 앱으로 시작한다. [10,20,40,30]에서 최소 10, 평균 25, 최대 40, 임계값 30 초과 1개를 직접 계산한다.",
    "task": "Change the threshold, upload a synthetic CSV and compare expected results. Then try invalid and empty data.",
    "taskKo": "임계값을 변경하고 가상 CSV를 올려 기대 결과와 비교한다. 잘못된 데이터와 빈 데이터도 검사하자."
  },
  {
    "title": "11.8 Wrap-Up — AI Coding Literacy",
    "ko": "학습 정리",
    "body": "Your final deliverable is evidence, not just a screenshot: specification, approved plan, changed files and diff explanation, two independent tests with expected/actual results, and a commit ID or verified local files and demo. Explain one thing you corrected in the AI output.",
    "kr": "최종 제출은 화면만이 아니라 증거이다. 명세, 승인한 계획, 변경 파일과 diff 설명, 직접 만든 테스트 2개(기대/실제), commit ID 또는 검증한 로컬 파일과 시연 기록을 제출한다. AI 결과에서 직접 수정한 부분을 설명한다.",
    "task": "Use the checklist and complete the guided project with a coding tool of your choice. The browser activities are simulations, not a live AI agent.",
    "taskKo": "체크리스트를 확인하고 원하는 코딩 도구로 통합 실습을 완료한다. 이 페이지는 실제 AI agent가 아닌 브라우저 학습 모형이다."
  }
];
