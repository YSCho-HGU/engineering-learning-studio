# 211 — AI-Assisted Coding: Project Prompt Library

## 먼저 시작하기
1. ZIP을 압축 해제하고 `index.html`을 브라우저에서 엽니다.
2. 프로젝트를 하나 골라 실행합니다.
3. Step 1 Prompt를 원하는 AI 코딩 도구에 전달합니다. 생성된 HTML 코드를 새 폴더의 `index.html`에 저장합니다.
4. 기능을 하나씩 개선하면서 예상한 결과와 실제 결과를 비교합니다.

처음에는 HTML/CSS/JavaScript 외 기술을 설치하거나 공부할 필요가 없습니다. 이후 필요한 경우에만 기술 스택을 확장합니다. 모든 프로젝트는 외부 AI 호출 없이 로컬에서 실행되는 참고 예제입니다. 개인정보 및 비밀정보를 입력하지 않습니다. 브라우저 저장은 환경에 따라 제한될 수 있습니다.

## 1. Reaction Time Game — 반응속도 측정 게임
실행 파일: `01-reaction-time.html`

신호가 초록색으로 바뀌는 순간 클릭해 나의 반응속도를 측정해 보세요.

### Step 1 · First success

반응속도를 측정하는 웹 게임을 만들어 줘. Start를 누르면 빨간색으로 바뀌고 1~3초의 임의 시간 후 초록색으로 바뀌게 해 줘. 초록색에서 클릭하면 반응시간을 ms로 표시해 줘. 별도 설치 없이 index.html 하나를 브라우저에서 실행할 수 있게 HTML, CSS, JavaScript를 모두 포함해 줘.

### Step 2 · Improve

현재 게임의 측정 기능은 유지하고, 초록색 전에 클릭하면 False Start로 표시하고 재시도하게 해 줘. 타이머가 중복 실행되지 않도록 해 줘.

### Step 3 · Analyze & visualize

최근 5회의 정상 기록을 배열에 저장하고 최솟값, 평균, 최근 값을 보여 줘. 막대그래프도 추가해 줘. 기록이 없을 때는 계산하지 말고 안내해 줘.

### Step 4 · Persist & verify

localStorage에 최근 5회 기록을 저장하고 Reset 버튼을 추가해 줘. 조기 클릭은 기록하지 않으며, 새로고침 후 저장된 기록을 복구하는지 확인해 줘.

### Step 5 · Learn with AI

상태 변수, 조건문, 배열, 함수가 각각 C에서 배운 어떤 개념에 해당하는지 설명해 줘. 내가 직접 바꿔 볼 수 있는 대기시간 범위 코드도 찾아 줘.

**C와의 연결:** 상태 변수(state), if/else, 배열, 함수, 평균 계산. Timer와 event는 새롭게 만나는 개념입니다.

**기술 확장:** HTML/CSS/JavaScript → UI 상태가 많아지면 React + TypeScript. 여러 기기 기록이 필요할 때만 서버를 고려합니다.

**확인할 결과:**
- 조기 클릭 시 기록이 증가하지 않는가?
- 정상 클릭 시 ms 단위 결과가 표시되는가?
- 6회 측정하면 최근 5개만 남는가?
- Reset 후 기록이 0개인가?

## 2. GPA Calculator — 학점 계산기
실행 파일: `02-gpa-calculator.html`

학점이 다른 과목을 추가하고 가중평균 GPA를 확인하세요.

### Step 1 · First success

과목명, 학점, 평점을 입력하면 GPA를 계산하는 웹 프로그램을 만들어 줘. 4.5 만점 체계를 사용하고 Σ(학점×평점)/Σ학점으로 계산해 줘. 설치 없이 HTML 파일 하나로 만들어 줘.

### Step 2 · Improve

과목 추가와 삭제 기능을 넣고 모든 과목을 표로 보여 줘. 빈 목록과 잘못된 학점은 처리해 줘.

### Step 3 · Persist

localStorage로 새로고침 후에도 입력 자료를 보존해 줘. 전체 초기화 기능을 추가해 줘.

### Step 4 · Direct the technology

현재 기능을 유지하면서 React, TypeScript, Vite로 옮기는 방법을 먼저 설명해 줘. 계산 함수와 UI를 분리하고 필요한 설치와 실행 명령을 알려 줘. 실제 구현은 내가 승인한 후 진행해 줘.

### Step 5 · Verify & learn

3학점 4.5와 2학점 3.5가 GPA 4.10인지 직접 테스트해 줘. 구조체 배열과 가중평균 계산에 해당하는 코드를 C와 비교해 설명해 줘.

**C와의 연결:** struct Student와 유사한 record, 배열, 반복문, 함수, 가중평균, 입력 검증.

**기술 확장:** 작은 개인용 앱은 HTML로 충분합니다. UI가 복잡해지면 React + TypeScript + Vite를 선택할 수 있습니다.

**확인할 결과:**
- 3학점 4.5 + 2학점 3.5 → 4.10인가?
- 과목 삭제 시 GPA가 즉시 다시 계산되는가?
- 빈 목록에서 0으로 나누지 않는가?
- 학점 0 또는 7은 추가되지 않는가?

## 3. Sorting Visualizer — 정렬 알고리즘 시각화
실행 파일: `03-sorting-visualizer.html`

C에서 배운 Bubble Sort를 막대그래프로 직접 추적해 보세요.

### Step 1 · First success

C의 Bubble Sort 알고리즘을 웹에서 시각화해 줘. [5,2,4]를 막대그래프로 표시하고 Step 버튼을 누를 때마다 인접한 두 원소를 비교하여 필요할 때 교환하는 모습을 보여 줘. 단일 HTML 파일로 실행되게 해 줘.

### Step 2 · Explore

배열을 직접 입력하게 하고 Random 버튼과 Reset을 추가해 줘. 현재 비교 중인 두 원소를 다른 색으로 표시해 줘.

### Step 3 · Control

Previous, Play, Pause, 실행 속도 조절 기능을 추가해 줘. 비교 횟수와 교환 횟수도 보여 줘.

### Step 4 · Verify

정렬된 배열, 역순 배열, 중복 값, 음수, 원소 하나를 테스트해 줘. C 코드의 루프 범위와 웹 시각화 결과가 일치하는지 검토해 줘.

### Step 5 · Learn & extend

C의 중첩 for문과 swap 코드를 JavaScript 구현과 나란히 설명해 줘. 선택 정렬을 비교하는 선택 기능을 추가하려면 어떤 구조가 좋은지 제안해 줘.

**C와의 연결:** 배열, 인덱스, 중첩 반복문, if, swap, 알고리즘 추적.

**기술 확장:** SVG/Canvas로 충분합니다. 여러 알고리즘을 비교하는 앱으로 발전시키려면 React 등 UI 프레임워크를 고려합니다.

**확인할 결과:**
- [5,2,4]의 첫 두 Step이 [2,5,4], [2,4,5]인가?
- [2,2,1]은 [1,2,2]로 정렬되는가?
- [-3,0,-5]도 올바르게 정렬되는가?
- Previous와 Reset이 정확한 상태를 복원하는가?

## 4. Signal Generator — 파형 생성기
실행 파일: `04-signal-generator.html`

진폭과 주파수를 바꾸며 수학 함수가 실제 파형으로 표현되는 것을 관찰하세요.

### Step 1 · First success

진폭 A와 주파수 f를 슬라이더로 조절하는 사인파 생성기를 만들어 줘. x(t)=A sin(2πft)를 0~1초 동안 그래프로 그려 줘. 단일 HTML 파일로 실행하고 축 이름과 단위를 표시해 줘.

### Step 2 · Explore

위상 φ를 도 단위로 입력받아 라디안으로 변환해 줘. cosine, square, triangle 파형을 선택할 수 있게 해 줘.

### Step 3 · Data exchange

401개의 시간-값 샘플을 생성하고 time,value 헤더를 가진 CSV를 다운로드하는 버튼을 추가해 줘.

### Step 4 · Technology extension

이 프로그램을 Python, NumPy, Streamlit, Plotly로 구현하는 대안도 제안해 줘. 각각의 기술 역할과 실행 방법을 알려 줘. 기존 웹 프로그램은 유지해 줘.

### Step 5 · Verify & learn

A=1, f=2Hz, φ=0에서 x(0)=0이고 1초 동안 2주기인지 확인해 줘. C의 math.h sin() 및 for문과 비교하여 샘플을 생성하는 코드를 설명해 줘.

**C와의 연결:** math.h, sin(), cos(), 반복문, 배열, double, File I/O와 CSV.

**기술 확장:** 공학 계산과 대시보드는 Python + NumPy + Streamlit + Plotly로 확장할 수 있습니다.

**확인할 결과:**
- f=2 Hz일 때 주기 매개변수는 0.5초인가?
- A=0이면 모든 값이 0인가?
- f를 높이면 같은 시간 내 주기 수가 늘어나는가?
- CSV 헤더와 401개 데이터 행이 맞는가?

## 5. Study Planner — 학습 계획 관리
실행 파일: `05-study-planner.html`

학습할 일을 추가하고 완료할 때마다 진행률이 올라가는 것을 확인하세요.

### Step 1 · First success

할 일을 입력하고 추가, 완료 체크, 삭제할 수 있는 간단한 학습 계획표를 만들어 줘. 모바일에서도 보기 좋고 HTML 파일 하나로 실행하게 해 줘.

### Step 2 · Improve

전체 할 일과 완료한 할 일의 수, 완료율을 표시하고 진행률 막대를 추가해 줘. 완료/미완료 항목을 필터링할 수 있게 해 줘.

### Step 3 · Persist

새로고침 후에도 목록과 완료 상태가 유지되도록 localStorage를 사용해 줘. 완료한 항목만 정리하는 기능도 넣어 줘.

### Step 4 · Publish

이 정적 웹 프로그램을 GitHub Pages에서 공개하려면 무엇을 해야 하는지 단계별로 안내해 줘. 개인정보와 비밀 키가 없는지 먼저 확인해 줘.

### Step 5 · Think about growth

여러 기기에서 같은 할 일을 보려면 어떤 backend, database, 인증이 필요한지 설명해 줘. Supabase를 사용하는 경우 사용자별 접근 제어를 포함한 계획만 제안해 줘.

**C와의 연결:** 구조체 배열, 상태 flag, 추가/삭제, 반복문, 조건문, 파일 저장의 개념.

**기술 확장:** 개인용은 localStorage, 여러 사용자와 기기 동기화가 필요하면 React + Supabase 등을 검토합니다. 인증과 접근 제어가 추가로 필요합니다.

**확인할 결과:**
- 3개 중 1개 완료 시 33%인가?
- 체크 변경 시 진행률과 필터가 즉시 갱신되는가?
- 완료 항목 정리 후 미완료 항목은 남는가?
- 새로고침 후 목록이 복원되는가?

## 6. Sensor Data Dashboard — 센서 데이터 대시보드
실행 파일: `06-sensor-dashboard.html`

CSV 파일을 읽어 통계와 그래프를 만들고 임계값 초과를 확인하세요.

### Step 1 · First success

time,value 형식의 가상 센서 CSV를 입력하면 값의 최솟값, 평균, 최댓값과 선 그래프를 표시하는 웹 프로그램을 만들어 줘. 예시 데이터는 0,10 / 1,20 / 2,40 / 3,30이야. 설치 없이 단일 HTML 파일로 실행하게 해 줘.

### Step 2 · Improve

CSV 파일 업로드와 임계값 입력을 추가해 줘. value > threshold인 값만 다른 색으로 표시하고 경고 개수를 계산해 줘. 같으면 경고하지 않아.

### Step 3 · Verify

예제에서 min=10, mean=25, max=40이고 threshold=30이면 alerts=1인지 확인해 줘. 빈 CSV, 문자, 누락값, 잘못된 헤더를 거부하고 오류 시 이전 결과를 지워 줘.

### Step 4 · Direct the technology

Python, Pandas, Streamlit, Plotly를 이용한 버전의 구현 계획을 제안해 줘. 어떤 데이터 처리 기능이 C의 File I/O, 배열, 함수에 해당하는지 설명해 줘.

### Step 5 · Connect the projects

Signal Generator에서 만든 time,value CSV를 이 대시보드에서 분석하고 결과를 비교해 줘. 실제 센서 연결은 가상 데이터 검증이 끝난 뒤 별도의 단계로 계획해 줘.

**C와의 연결:** File I/O, 구조체/레코드, 배열, 반복문, min/max/average, 조건문과 반환값 검사.

**기술 확장:** Python + Pandas + Streamlit + Plotly, 이후 필요한 경우 MQTT와 실제 센서를 연결합니다.

**확인할 결과:**
- 기본 데이터의 평균 25, 경고 1개인가?
- threshold=40이면 경고 0개인가?
- NaN, 빈 값, 잘못된 헤더를 거부하는가?
- 04 Signal Generator의 CSV를 분석할 수 있는가?