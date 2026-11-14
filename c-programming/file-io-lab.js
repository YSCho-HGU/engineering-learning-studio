
/* File I/O Studio: pedagogical simulation, not C execution or persistent browser storage. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const initial = ["25.0", "26.5"];
  let disk = [...initial], opened = false, activeMode = null, cursor = 0, output = [];
  let currentLine = null, fontSize = 16;
  const mode = $("mode"), code = $("file-code");
  const escapeHtml = v => String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const tokenRx = /(#include\s*<[^>]+>|\/\/.*|\/\*.*?\*\/|"(?:\\.|[^"\\])*"|\b(?:FILE|NULL|int|char|void|return|while|if|sizeof)\b|\b(?:fopen|fclose|fprintf|fgets|fputs)\b|\b\d+(?:\.\d+)?\b)/g;
  function colorize(raw) {
    let html = "", at = 0;
    for (const match of raw.matchAll(tokenRx)) {
      html += escapeHtml(raw.slice(at, match.index));
      const t = match[0];
      const kind = t.startsWith("#include") ? "header" : t.startsWith("//") || t.startsWith("/*") ? "comment" : t.startsWith('"') ? "str" : /^\d/.test(t) ? "numeral" : /^(fopen|fclose|fprintf|fgets|fputs)$/.test(t) ? "fn" : "key";
      html += '<span class="tok-' + kind + '">' + escapeHtml(t) + '</span>';
      at = match.index + t.length;
    }
    return html + escapeHtml(raw.slice(at));
  }
  function linesFor(m) {
    const l = [
      ["header","#include <stdio.h>"],
      ["blank1",""],
      ["main","int main(void) {"],
      ["open",'    FILE *fp = fopen("sensor.txt", "' + m + '");'],
      ["check","    if (fp == NULL) return 1;"],
      ["blank2",""]
    ];
    if (m === "r") {
      l.push(["declare","    char line[80];"]);
      l.push(["read","    while (fgets(line, sizeof line, fp) != NULL) {"]);
      l.push(["print","        fputs(line, stdout);"]);
      l.push(["endloop","    }"]);
    } else {
      l.push(["write",'    if (fprintf(fp, "%.1f\\n", 27.2) < 0) {']);
      l.push(["writeclose","        fclose(fp);"]);
      l.push(["writeerror","        return 1;"]);
      l.push(["endwrite","    }"]);
    }
    l.push(["blank3",""]);
    l.push(["close","    if (fclose(fp) == EOF) return 1;"]);
    l.push(["return","    return 0;"]);
    l.push(["end","}"]);
    return l;
  }
  function renderCode() {
    const displayMode = opened ? activeMode : mode.value;
    const items = linesFor(displayMode);
    code.innerHTML = items.map(([key,raw],i) => '<div class="fio-code-line' + (key === currentLine ? ' is-active' : '') + '" data-line="' + key + '" role="listitem"' + (key === currentLine ? ' aria-current="step"' : '') + '><span class="fio-no" aria-hidden="true">' + (i+1) + '</span><span class="fio-src">' + (raw ? colorize(raw) : '&nbsp;') + '</span></div>').join("");
  }
  function focusLine(line,headline,detail,tone="neutral") {
    currentLine = line;
    $("code-explain").textContent = headline;
    $("file-message").textContent = detail;
    $("fio-event").dataset.tone = tone;
    renderCode();
    // Scroll only the *code viewport*, never the whole page away from its buttons.
    if (line) {
      const row = [...code.querySelectorAll(".fio-code-line")].find(el => el.dataset.line === line);
      const window = $("fio-code-window");
      if (row && window) {
        const center = row.offsetTop - code.offsetTop - window.clientHeight / 2 + row.clientHeight / 2;
        window.scrollTop = Math.max(0, center);
      }
    }
  }
  function redraw() {
    $("disk").textContent = disk.length ? disk.join("\n") : "(empty file)";
    $("readout").textContent = output.length ? output.join("\n") : "(no output yet)";
    $("file-status").textContent = opened ? "OPEN · " + activeMode : "CLOSED";
    $("file-position").textContent = opened && activeMode === "r" ? cursor + " / " + disk.length + " lines" : "—";
    $("file-count").textContent = disk.length + (disk.length === 1 ? " line" : " lines");
    $("open").disabled = opened;
    $("read-file").disabled = !opened || activeMode !== "r";
    $("write-file").disabled = !opened || activeMode === "r";
    $("close").disabled = !opened;
    mode.disabled = opened;
  }
  $("open").addEventListener("click", () => {
    if (opened) return;
    activeMode = mode.value;
    opened = true;
    cursor = activeMode === "a" ? disk.length : 0;
    if (activeMode === "w") disk = [];
    output = [];
    redraw();
    const effect = activeMode === "w" ? '기존 내용 삭제 → 빈 파일로 열기' : activeMode === "a" ? '기존 내용 유지 → 파일 끝에 쓰기 준비' : '기존 내용 유지 → 첫 줄부터 읽기';
    focusLine("open", 'fopen("sensor.txt", "' + activeMode + '")', effect, "success");
  });
  $("write-file").addEventListener("click", () => {
    if (!opened || activeMode === "r") return;
    disk.push("27.2");
    cursor = disk.length;
    redraw();
    focusLine("write","fprintf() · 데이터 쓰기", "sensor.txt에 27.2를 추가했습니다.", "success");
  });
  $("read-file").addEventListener("click", () => {
    if (!opened || activeMode !== "r") return;
    if (cursor >= disk.length) {
      focusLine("read","fgets() → NULL (EOF)", "읽을 데이터가 없습니다. C에서는 이 시점에 반복 읽기를 종료합니다.", "neutral");
      return;
    }
    const item = disk[cursor++];
    output.push(item);
    redraw();
    focusLine("read","fgets() · " + cursor + "번째 줄 읽기", "읽은 값: " + item + " · 다음 읽기 위치: " + cursor, "success");
  });
  $("close").addEventListener("click", () => {
    if (!opened) return;
    opened = false;
    redraw();
    focusLine("close","fclose() · Stream 닫기", "프로그램의 파일 연결을 닫았습니다. 파일 내용은 유지됩니다.", "success");
  });
  $("restart").addEventListener("click", () => {
    opened = false; activeMode = null; cursor = 0; output = [];
    redraw();
    focusLine(null,"Restart program · 프로그램 상태 초기화","가상 파일은 변경된 그대로 유지됩니다. 이 버튼은 C 표준 함수가 아닌 실습 동작입니다.");
  });
  $("reset-lab").addEventListener("click", () => {
    opened = false; activeMode = null; cursor = 0; output = []; disk = [...initial];
    mode.value = "r";
    redraw();
    focusLine(null,"Reset Lab · 샘플 복원","sensor.txt의 초기값 25.0, 26.5를 복원했습니다. 실제 C 프로그램의 재시작과는 다른 실습용 기능입니다.","success");
  });
  mode.addEventListener("change", () => {
    focusLine(null,mode.value + " 모드 선택","fopen()을 눌러 모드를 적용해 보세요.");
  });
  function font(delta) {
    fontSize = Math.min(22, Math.max(14,fontSize+delta));
    $("file-code").style.setProperty("--fio-code-size",fontSize+"px");
    $("font-size").textContent = fontSize + "px";
  }
  $("font-minus").addEventListener("click",()=>font(-1));
  $("font-plus").addEventListener("click",()=>font(1));
  redraw(); renderCode();
})();
