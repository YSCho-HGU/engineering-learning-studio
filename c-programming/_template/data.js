/* Template only. Copy to a new chapter and replace EVERY placeholder. No mandated step/task count. */
window.C_JOURNEY={
  "slug": "replace-this-slug",
  "title": "Replace With Chapter Title",
  "book": "000_Chapter_Title",
  "related": "../",
  "relatedTitle": "C Programming",
  "summary": "학생이 이 단원에서 수행할 수 있는 행동 중심 학습 목표를 작성하세요.",
  "phases": [
    "Before Class: 핵심 개념을 이해합니다.",
    "In Class: 코드를 분석하고 직접 실험합니다.",
    "After Class: 코딩 문제로 학습 내용을 확인합니다."
  ],
  "phaseBreaks": [
    1,
    2
  ],
  "contentRevision": 1,
  "authoringVersion": 1,
  "lessons": [
    {
      "title": "핵심 개념 A",
      "goal": "학생이 수행할 수 있는 구체적인 목표",
      "concept": "핵심 원리와 실제 사용 맥락을 설명합니다.",
      "code": "#include <stdio.h>\nint main(void) {\n    printf(\"A\\n\");\n    return 0;\n}",
      "predict": "어떤 결과가 출력되나요? 근거도 설명하세요.",
      "output": "A",
      "quiz": {
        "q": "printf(\"A\\n\")의 결과는 무엇인가요?",
        "options": [
          "A",
          "B",
          "컴파일 오류"
        ],
        "correct": 0,
        "explain": "문자 A와 줄바꿈이 출력됩니다."
      },
      "transfer": "printf의 문자열을 B로 바꾸면 무엇이 출력되나요?",
      "guide": "출력 내용과 줄바꿈을 함께 확인합니다.",
      "minutes": 10,
      "model": {
        "title": "개념 모델 A",
        "kind": "scenario",
        "controlLabel": "모델 입력",
        "min": 1,
        "max": 5,
        "step": 1,
        "initial": 3,
        "valueLabel": "n",
        "note": "C 코드의 실행이 아니라 개념 실험입니다.",
        "cases": [
          "n=1: 핵심 원리 시각화",
          "n=2: 핵심 원리 시각화",
          "n=3: 핵심 원리 시각화",
          "n=4: 핵심 원리 시각화",
          "n=5: 핵심 원리 시각화"
        ]
      },
      "trace": [
        {
          "match": "printf(",
          "state": "stdout: A",
          "meaning": "문자 A와 개행을 출력합니다."
        }
      ]
    },
    {
      "title": "핵심 개념 B",
      "goal": "독립적인 두 번째 학습 목표",
      "concept": "새 개념이 필요한 경우에만 단계를 추가합니다.",
      "code": "#include <stdio.h>\nint main(void) {\n    printf(\"B\\n\");\n    return 0;\n}",
      "predict": "출력 결과를 예측하세요.",
      "output": "B",
      "quiz": {
        "q": "출력되는 문자는?",
        "options": [
          "C",
          "B",
          "A"
        ],
        "correct": 1,
        "explain": "문자 B를 출력합니다."
      },
      "transfer": "다른 문자로 바꾸어 실행을 예상해 보세요.",
      "guide": "출력 문자를 확인하세요.",
      "minutes": 10,
      "model": {
        "title": "개념 모델 B",
        "kind": "scenario",
        "controlLabel": "모델 입력",
        "min": 1,
        "max": 5,
        "step": 1,
        "initial": 3,
        "valueLabel": "n",
        "note": "이 모델은 C 실행이 아닙니다.",
        "cases": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ]
      },
      "trace": [
        {
          "match": "printf(",
          "state": "stdout: B",
          "meaning": "B를 출력합니다."
        }
      ]
    },
    {
      "title": "응용 및 종합 확인",
      "goal": "배운 내용을 실제 코드로 연결합니다.",
      "concept": "응용 목표가 독립적으로 필요하지 않다면 이 단계를 제거하고 phaseBreaks도 수정합니다.",
      "code": "#include <stdio.h>\nint main(void) {\n    printf(\"AB\\n\");\n    return 0;\n}",
      "predict": "결과를 예측하세요.",
      "output": "AB",
      "quiz": {
        "q": "어떤 글자가 출력되나요?",
        "options": [
          "BA",
          "A",
          "AB"
        ],
        "correct": 2,
        "explain": "AB가 출력됩니다."
      },
      "transfer": "이 출력을 다른 방식으로 구성해 보세요.",
      "guide": "배운 문법을 재활용합니다.",
      "minutes": 10,
      "model": {
        "title": "응용 개념 모델",
        "kind": "scenario",
        "controlLabel": "모델 입력",
        "min": 1,
        "max": 5,
        "step": 1,
        "initial": 3,
        "valueLabel": "n",
        "note": "개념 모델",
        "cases": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ]
      },
      "trace": [
        {
          "match": "printf(",
          "state": "stdout: AB",
          "meaning": "AB를 출력합니다."
        }
      ]
    }
  ],
  "practice": [
    {
      "title": "핵심 목표 코딩",
      "task": "실제 학생 과제로 교체하세요.",
      "starter": "#include <stdio.h>\nint main(void) {\n    /* TODO: 출력 코드를 작성하세요. */\n    return 0;\n}",
      "expected": "A"
    }
  ]
};
