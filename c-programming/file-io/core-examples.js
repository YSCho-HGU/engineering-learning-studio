/* File I/O core walkthroughs: browser teaching models, not a C runtime. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const english = window.ELSLanguage?.get() === "en";
  const englishReplacements=[["이 예제는 C의 char[80] 버퍼를 이해하기 위해 ASCII 입력만 모의 실행합니다. 한글은 실제로 UTF-8에서 여러 바이트를 사용하므로 별도로 확인해야 합니다.","This model accepts ASCII input only to demonstrate a C char[80] buffer. UTF-8 characters such as Korean letters can require multiple bytes and need separate handling."],["fgets() 반환값: NULL (빈 파일)","fgets() return value: NULL (empty file)"],["화면 출력: 없음","Screen output: none"],["파일을 닫고 종료합니다.","Close the file and exit."],["fgets() 반환값: NULL 아님 (읽기 성공)","fgets() return value: non-NULL (read succeeded)"],["읽은 내용: ","Text read: "],["[읽은 문자열 끝 — 줄바꿈 없음]","[End of text read — no newline]"],["두 번째 줄은 읽지 않았습니다.","The second line was not read."],["주의: 80바이트 버퍼이므로 첫 줄 일부만 읽었습니다.","Note: Only part of the first line was read because the buffer holds 80 bytes."],["입력 파일이 비어 있습니다. 저장된 구조체 레코드 0개.","The input file is empty. No student records were stored."],[": 레코드 형식이 맞지 않아 읽기를 중단했습니다.",": Invalid record format; processing stopped."],[": 정수/문자열/점수 범위를 벗어나 읽기를 중단했습니다.",": ID, name, or score is out of range; processing stopped."],["배열 최대 용량 10명에 도달했습니다.","The array reached its maximum capacity of 10 students."],["구조체 배열에 저장된 학생: ","Students stored in structure array: "],["학점 규칙: A≥90, B≥80, C≥70, D≥60, F<60","Grade thresholds: A≥90, B≥80, C≥70, D≥60, F<60"]];
  const translateOutput = value => english
    ? englishReplacements.reduce((text, [ko, en]) => text.split(ko).join(en), value)
        .replace(/행 (\d+)/g, "Row $1")
        .replace(/학생: (\d+)명/g, "students: $1")
    : value;
  const writeOutput = (id, value) => {
    $(id).textContent = translateOutput(value);
  };
  const lineButton = $("ex-line-run");
  const studentButton = $("ex-student-run");
  if (!lineButton || !studentButton) return;

  lineButton.addEventListener("click", () => {
    const source = $("ex-line-input").value.replace(/\r\n?/g, "\n");
    const first = source.split("\n")[0];
    const hasNewline = source.includes("\n");
    // fgets(line, sizeof line, fp) reads at most 79 bytes plus terminating NUL.
    // The lesson model limits input to ASCII to match the byte-based buffer.
    if (!/^[\x00-\x7F]*$/.test(source)) {
      writeOutput("ex-line-result",
        "이 예제는 C의 char[80] 버퍼를 이해하기 위해 ASCII 입력만 모의 실행합니다. 한글은 실제로 UTF-8에서 여러 바이트를 사용하므로 별도로 확인해야 합니다.");
      return;
    }
    if (source === "") {
      writeOutput("ex-line-result", "fgets() 반환값: NULL (빈 파일)\n화면 출력: 없음\n파일을 닫고 종료합니다.");
      return;
    }
    const read = first.slice(0, 79);
    const complete = first.length < 79 && hasNewline;
    const result = read + (complete ? "\n" : "");
    writeOutput("ex-line-result",
      "fgets() 반환값: NULL 아님 (읽기 성공)\n" +
      "읽은 내용: " + JSON.stringify(result) + "\n" +
      "stdout:\n" + result +
      (result.endsWith("\n") ? "" : "\n[읽은 문자열 끝 — 줄바꿈 없음]") +
      "\n두 번째 줄은 읽지 않았습니다." +
      (first.length > 79 ? "\n주의: 80바이트 버퍼이므로 첫 줄 일부만 읽었습니다." : ""));
  });

  const grade = x => x >= 90 ? "A" : x >= 80 ? "B" : x >= 70 ? "C" : x >= 60 ? "D" : "F";
  studentButton.addEventListener("click", () => {
    const rows = $("ex-student-input").value.replace(/\r\n?/g, "\n").trim().split("\n");
    const output = [], parsed = [];
    if (rows.length === 1 && rows[0].trim() === "") {
      writeOutput("ex-student-result", "입력 파일이 비어 있습니다. 저장된 구조체 레코드 0개.");
      return;
    }
    for (let i = 0; i < rows.length && parsed.length < 10; i++) {
      const tokens = rows[i].trim().split(/\s+/);
      if (tokens.length !== 3 || !/^[+-]?\d+$/.test(tokens[0]) ||
          !/^[^\s]{1,39}$/.test(tokens[1]) ||
          !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(tokens[2])) {
        output.push("행 " + (i + 1) + ": 레코드 형식이 맞지 않아 읽기를 중단했습니다.");
        break;
      }
      const id = Number(tokens[0]), score = Number(tokens[2]);
      if (!Number.isSafeInteger(id) || id < -2147483648 || id > 2147483647 ||
          !Number.isFinite(score) || score < 0 || score > 100 ||
          !/^[\x21-\x7E]+$/.test(tokens[1])) {
        output.push("행 " + (i + 1) + ": 정수/문자열/점수 범위를 벗어나 읽기를 중단했습니다.");
        break;
      }
      parsed.push({id, name:tokens[1], score});
    }
    if (rows.length > 10 && parsed.length === 10) output.push("배열 최대 용량 10명에 도달했습니다.");
    output.unshift("구조체 배열에 저장된 학생: " + parsed.length + "명");
    if (parsed.length) {
      output.push("stdout (ID  Name  Score  Grade):");
      for (const s of parsed) output.push(s.id + " " + s.name + " " + s.score.toFixed(1) + " " + grade(s.score));
    }
    output.push("학점 규칙: A≥90, B≥80, C≥70, D≥60, F<60");
    writeOutput("ex-student-result", output.join("\n"));
  });
})();
