(()=>{"use strict";
const $=id=>document.getElementById(id);
const tasks=[
{id:"P1",title:"Write Numbers",desc:"사용자에게서 정수 5개를 입력받아 numbers.txt에 한 줄에 하나씩 저장하세요.",objective:"fopen(\"w\") · fprintf · fclose · 오류 검사",input:"stdin:\n10 20 30 40 50",output:"numbers.txt:\n10\n20\n30\n40\n50",hint:"int x; for문에서 scanf(\"%d\", &x)의 반환값을 확인하고 fprintf(fp, \"%d\\n\", x)를 사용하세요.",checks:[["쓰기 모드",/fopen\s*\([^;]*["']w["']/],["5개 반복",/for\s*\(/],["입력 성공 확인",/scanf\s*\([^;]*==\s*1|scanf\s*\([^;]*!=\s*1/],["fprintf 기록",/fprintf\s*\(/],["파일 닫기",/fclose\s*\(/]],starter:'#include <stdio.h>\n\nint main(void) {\n    FILE *fp;\n    int x, i;\n    /* TODO: open numbers.txt for writing */\n    /* TODO: read exactly five integers and write each on its own line */\n    /* TODO: close file and check errors */\n    return 0;\n}\n'},
{id:"P2",title:"Read and Average",desc:"values.txt에서 double 값을 읽어 개수와 평균을 출력하세요. 빈 파일도 안전하게 처리합니다.",objective:"fscanf == 1 · count · sum · EOF와 형식 오류",input:"values.txt:\n1.5\n2.5\n4.0",output:"stdout:\nCount = 3\nAverage = 2.667",hint:"while (fscanf(fp, \"%lf\", &x) == 1)로 읽기 성공을 검사합니다. count == 0이면 0으로 나누지 마세요.",checks:[["읽기 모드",/fopen\s*\([^;]*["']r["']/],["double 읽기 성공",/fscanf\s*\([^;]*==\s*1/],["누적 합",/sum\s*\+=/],["개수 증가",/count\s*\+\+|\+\+count/],["빈 파일 처리",/count\s*(?:>|!=)\s*0|count\s*==\s*0/],["닫기",/fclose\s*\(/]],starter:'#include <stdio.h>\n\nint main(void) {\n    FILE *fp;\n    double x, sum = 0.0;\n    int count = 0;\n    /* TODO: open values.txt and read until conversion fails */\n    /* TODO: distinguish EOF from malformed data */\n    /* TODO: print count and average, avoid division by zero */\n    return 0;\n}\n'},
{id:"P3",title:"Copy Lines",desc:"input.txt의 모든 줄을 fgets()로 읽고 fputs()로 copy.txt에 복사하세요.",objective:"두 FILE* · fgets · fputs · close both",input:"input.txt:\nfirst line\nsecond line\n",output:"copy.txt:\nfirst line\nsecond line\n",hint:"두 파일이 모두 열렸는지 확인하고, 읽기 성공 여부를 while (fgets(...) != NULL)로 검사하세요.",checks:[["읽기 파일",/fopen\s*\([^;]*["']r["']/],["쓰기 파일",/fopen\s*\([^;]*["']w["']/],["fgets 반복",/while\s*\([^)]*fgets\s*\(/],["fputs 복사",/fputs\s*\(/],["두 Stream 닫기",/fclose\s*\(/]],starter:'#include <stdio.h>\n\nint main(void) {\n    FILE *src, *dst;\n    char line[128];\n    /* TODO: open input.txt for reading and copy.txt for writing */\n    /* TODO: copy each successfully read chunk */\n    /* TODO: close both streams */\n    return 0;\n}\n'},
{id:"P4",title:"Save Students",desc:"Student 구조체 배열을 students.txt에 ID·이름·점수 순서로 저장하세요.",objective:"struct Student · array · fprintf · bounds",input:"records:\n101 Mina 92.5\n102 Joon 88.0",output:"students.txt:\n101 Mina 92.5\n102 Joon 88.0",hint:"struct Student { int id; char name[40]; double score; }; 배열을 순회하며 fprintf(fp, \"%d %s %.1f\\n\", ...)로 기록합니다.",checks:[["구조체 선언",/struct\s+Student/],["구조체 배열",/struct\s+Student\s+\w+\s*\[/],["쓰기 모드",/fopen\s*\([^;]*["']w["']/],["배열 반복",/for\s*\(/],["fprintf 기록",/fprintf\s*\(/],["파일 닫기",/fclose\s*\(/]],starter:'#include <stdio.h>\n\nstruct Student {\n    int id;\n    char name[40];\n    double score;\n};\n\nint main(void) {\n    struct Student students[2] = {{101, "Mina", 92.5}, {102, "Joon", 88.0}};\n    FILE *fp;\n    int i;\n    /* TODO: write two student records to students.txt */\n    return 0;\n}\n'},
{id:"P5",title:"Load Students",desc:"students.txt를 읽어 구조체 배열에 저장하고 최고 점수 학생을 출력하세요. 배열 용량을 초과하지 않도록 합니다.",objective:"fscanf == 3 · %39s · capacity · max",input:"students.txt:\n101 Mina 92.5\n102 Joon 88.0\n103 Ara 95.0",output:"stdout:\nHighest: 103 Ara 95.0",hint:"fscanf(fp, \"%d %39s %lf\", &s[i].id, s[i].name, &s[i].score) == 3을 사용하고 최대 레코드 수를 제한하세요.",checks:[["구조체 배열",/struct\s+Student\s+\w+\s*\[/],["읽기 모드",/fopen\s*\([^;]*["']r["']/],["읽기 변환 3개",/fscanf\s*\([^;]*==\s*3/],["이름 버퍼 제한",/%39s/],["배열 용량 검사",/<\s*(?:MAX|CAPACITY|[0-9]+)|>=\s*(?:MAX|CAPACITY|[0-9]+)/],["최고 점수 비교",/score\s*>|>\s*\w+\.score/],["파일 닫기",/fclose\s*\(/]],starter:'#include <stdio.h>\n#define MAX 20\n\nstruct Student {\n    int id;\n    char name[40];\n    double score;\n};\n\nint main(void) {\n    struct Student students[MAX];\n    FILE *fp;\n    int count = 0;\n    /* TODO: read records while capacity allows */\n    /* TODO: report malformed records and find highest score */\n    return 0;\n}\n'},
{id:"P6",title:"Sensor Alert",desc:"센서 시간·측정값 쌍을 읽어 임계값 3.0 초과 항목을 출력하고 alerts.txt에도 저장하세요.",objective:"fscanf == 2 · threshold · fprintf · 2 files",input:"sensor_log.txt:\n0.0 2.10\n0.1 3.82\n0.2 2.70\n0.3 3.20",output:"stdout & alerts.txt:\nALERT 0.1 3.82\nALERT 0.3 3.20",hint:"fscanf(fp, \"%lf %lf\", &time, &value) == 2로 읽고, value > threshold일 때 printf와 fprintf를 모두 호출하세요.",checks:[["읽기 모드",/fopen\s*\([^;]*["']r["']/],["쓰기 모드",/fopen\s*\([^;]*["']w["']/],["두 값 읽기",/fscanf\s*\([^;]*==\s*2/],["임계값 비교",/value\s*>\s*(?:threshold|3(?:\.0)?)|threshold\s*<\s*value/],["화면 출력",/printf\s*\(/],["파일 기록",/fprintf\s*\(/],["파일 닫기",/fclose\s*\(/]],starter:'#include <stdio.h>\n\nint main(void) {\n    FILE *input, *alerts;\n    double time, value, threshold = 3.0;\n    /* TODO: open sensor_log.txt and alerts.txt */\n    /* TODO: read pairs and write alerts above threshold */\n    /* TODO: close both streams */\n    return 0;\n}\n'},
{id:"M1",
title:"One-Line Copy with fgets() and fputs()",
desc:"[필수 미니 실습 · 약 10~15분] message.txt의 첫 줄만 fgets()로 읽어 preview.txt에 fputs()로 기록하세요. 두 번째 줄은 복사하지 않습니다. 파일 열기에 실패하면 접근하지 않고, 사용한 두 FILE*를 닫으세요.",
objective:"fopen(\"r\"/\"w\") · fgets 1회 · fputs · NULL/EOF 판단 · fclose 2회",
input:"message.txt:\nSensor online\nsecond line ignored\n",
output:"preview.txt:\nSensor online\n",
hint:"읽기 파일을 먼저 열고 NULL을 확인한 다음 쓰기 파일을 엽니다. src를 연 뒤 dst를 열지 못했다면 fclose(src) 하세요. if (fgets(line, sizeof line, src) != NULL) 안에서 fputs(line, dst) == EOF를 확인합니다. fgets는 버퍼에 맞게 읽으며 개행이 포함될 수 있고 fputs는 개행을 자동 추가하지 않습니다. 빈 파일에서는 복사할 첫 줄이 없습니다.",
starter:"#include <stdio.h>\n\nint main(void) {\n    FILE *src;\n    FILE *dst;\n    char line[80];\n\n    /* TODO 1: open message.txt for reading and check src. */\n    /* TODO 2: open preview.txt for writing; close src on failure. */\n    /* TODO 3: call fgets once, then fputs only if a line was read. */\n    /* TODO 4: check the write result and close BOTH files. */\n    return 0;\n}\n",
sampleFilename:"message.txt",
sampleContent:"Sensor online\nsecond line ignored\n",
 checks:[["읽기 파일 열기",/fopen\s*\([^;]*["']r["']/],["쓰기 파일 열기",/fopen\s*\([^;]*["']w["']/],["FILE* 열기 실패 검사",/if\s*\([\s\S]*?(?:src|dst)\s*(?:==\s*NULL|!)/],["fgets 1회로 버퍼 크기를 지정",/fgets\s*\(\s*line\s*,\s*sizeof\s*\(?\s*line\s*\)?\s*,\s*src\s*\)/],["읽은 경우에만 fputs 사용",/fputs\s*\(\s*line\s*,\s*dst\s*\)/],["쓰기 실패 검사",/fputs\s*\([^;]*?(?:==\s*EOF|<\s*0)|if\s*\(\s*ferror\s*\(\s*dst\s*\)/],["스트림 닫기",/fclose\s*\(\s*src\s*\)[\s\S]*fclose\s*\(\s*dst\s*\)|fclose\s*\(\s*dst\s*\)[\s\S]*fclose\s*\(\s*src\s*\)/]]}
];
/* Student-facing task descriptions are localized, but starter C code, expected
   results, task indices and localStorage keys remain unchanged. */
const tasksEN={
 P1:{title:"Write Five Numbers to a File",desc:"Read exactly five integers from standard input and write them to numbers.txt, one number per line. Check the input conversion and fopen result, and close the stream after writing.",objective:"fopen(\"w\") · scanf result · fprintf · fclose",hint:"Check the return value of scanf(\"%d\", &x) on every iteration and write each successful integer with fprintf(fp, \"%d\\n\", x)."},
 P2:{title:"Read and Average File Values",desc:"Read double values from values.txt, count the successful conversions, and calculate the average. Handle an empty file without division by zero and distinguish normal EOF from malformed input.",objective:"fscanf == 1 · counter · sum · EOF vs conversion failure",hint:"Use while (fscanf(fp, \"%lf\", &x) == 1). Check for an empty file before computing the average."},
 P3:{title:"Copy All Lines between Files (Optional)",desc:"Read every available chunk from input.txt using fgets and write it to copy.txt using fputs. Check both stream opens and close both streams, including on errors.",objective:"two FILE* objects · fgets loop · fputs · cleanup",hint:"Check that both streams opened successfully, and copy only after fgets returns a non-NULL pointer."},
 P4:{title:"Save Student Records (Optional)",desc:"Write a fixed array of Student records to students.txt in the order ID, name, and score. Preserve the required text format, check file opening, and close the stream.",objective:"struct Student · array traversal · fprintf · record format",hint:"Use struct Student { int id; char name[40]; double score; }; and fprintf(fp, \"%d %s %.1f\\n\", ...) for each record."},
 P5:{title:"Load Student Records (Optional)",desc:"Read student records into a bounded array, verifying that all three fields converted. Use a width-limited %39s for names, avoid exceeding array capacity, and print the student with the highest score.",objective:"fscanf == 3 · %39s · capacity · maximum search",hint:"Check fscanf(fp, \"%d %39s %lf\", &s[i].id, s[i].name, &s[i].score) == 3, and stop before exceeding the record capacity."},
 P6:{title:"Generate a Sensor Alert File (Optional)",desc:"Read time-value pairs from sensor_log.txt. Whenever a measurement exceeds the 3.0 threshold, print a matching alert and write it to alerts.txt. Handle both file streams correctly.",objective:"fscanf == 2 · strict threshold > 3.0 · printf/fprintf · cleanup",hint:"Use fscanf(fp, \"%lf %lf\", &time, &value) == 2 and issue alerts only when value > threshold."},
 M1:{title:"Copy Only the First Line with fgets() and fputs()",desc:"Core mini challenge (10–15 min): read only the first line of message.txt with one fgets call and write it to preview.txt using fputs. Do not copy the second line. Check both open results and close every opened stream.",objective:"fopen(\"r\",\"w\") · one fgets · conditional fputs · NULL/EOF · two fclose calls",hint:"Open the source and check for NULL, then open the destination. If the second open fails, close the first stream. Call fgets once and call fputs only when a line was read. Check the write result and close both streams."}
};
const checkEN={
 P1:["Open write mode","Five-iteration loop","Check input conversion","Write with fprintf","Close the stream"],
 P2:["Open read mode","Check double conversion","Accumulate sum","Increment count","Handle empty input","Close the stream"],
 P3:["Open source","Open destination","Read with fgets loop","Write with fputs","Close both streams"],
 P4:["Declare structure","Declare structure array","Open write mode","Traverse array","Write records","Close stream"],
 P5:["Use structure array","Open read mode","Require three conversions","Limit name width","Check array capacity","Compare highest score","Close stream"],
 P6:["Open source","Open alerts file","Convert both fields","Compare threshold","Print alert","Write alert","Close streams"],
 M1:["Open source","Open destination","Check open failure","Read one bounded line","Write only if read","Check write failure","Close both streams"]
};
const langMode=()=>window.ELSLanguage?.get?.()||"mixed";
const langText=(ko,en)=>langMode()==="en"?en:langMode()==="ko"?ko:en+"\\n"+ko;
const taskView=t=>{
 const en=tasksEN[t.id];
 return {title:en?.title||t.title,desc:langText(t.desc,en?.desc||t.desc),objective:langText(t.objective,en?.objective||t.objective),hint:langText(t.hint,en?.hint||t.hint)};
};
let active=0;const key=i=>tasks[i].id==="M1"?"els-c-fileio-practice-m1-v1":"els-c-fileio-practice-p"+(i+1);
const evidenceKey="els-code-evidence-fileio-v1";
const taskOrder=[0,1,6,2,3,4,5]; // Preserve P1-P6 indexes and drafts.
let evidence={};try{evidence=JSON.parse(localStorage.getItem(evidenceKey)||"{}")||{}}catch(e){}
function persistEvidence(){try{localStorage.setItem(evidenceKey,JSON.stringify(evidence))}catch(e){}}
document.getElementById("gcc-confirm").addEventListener("change",e=>{if(e.target.checked)evidence[active]={checked:true,at:new Date().toISOString()};else delete evidence[active];persistEvidence()});
document.getElementById("editor").addEventListener("input",()=>{if(evidence[active]){delete evidence[active];persistEvidence();document.getElementById("gcc-confirm").checked=false}});

const commonGuides=window.C_PRACTICE_GUIDES?.["file-io"]||{};
function renderCoreGuide(task){
 const root=$("fileio-guided"), guide=commonGuides[task.id]?.[window.ELSLanguage?.get()==="en"?"en":"ko"];
 if(!root)return;
 root.hidden=!guide;
 if(!guide)return;
 const en=window.ELSLanguage?.get()==="en";
 $("fileio-guide-heading").textContent=en?"Scenario · What are you building?":"문제 상황 · 무엇을 만들까요?";
 $("fileio-guide-scene").textContent=guide.scene;
 $("fileio-guide-steps-title").textContent=en?"Writing the Code · Step by Step":"코드 작성 순서 · 단계별 가이드";
 $("fileio-guide-steps").replaceChildren();
 guide.steps.forEach((step,index)=>{
  const li=document.createElement("li"),button=document.createElement("button"),help=document.createElement("p");
  button.type="button";button.className="fileio-guide-reveal";
  button.textContent=(en?"Step ":"단계 ")+(index+1)+(en?" · Show hint":" · 힌트 보기");
  help.className="fileio-guide-hint";help.textContent=step;help.hidden=true;
  button.setAttribute("aria-expanded","false");
  button.addEventListener("click",()=>{
    help.hidden=!help.hidden;button.setAttribute("aria-expanded",String(!help.hidden));
    button.textContent=(en?"Step ":"단계 ")+(index+1)+(help.hidden?(en?" · Show hint":" · 힌트 보기"):(en?" · Hide hint":" · 힌트 닫기"));
  });
  li.append(button,help);$("fileio-guide-steps").append(li);
 });
 $("fileio-guide-check-title").textContent=en?"Verify Your Result":"실행 결과 확인";
 $("fileio-guide-check").textContent=guide.check;
}
function load(i){active=i;document.getElementById("gcc-confirm").checked=!!evidence[i];const t=tasks[i],v=taskView(t);$("task-id").textContent=(t.id==="M1"?"CORE MINI CHALLENGE · ":"CODING CHALLENGE ")+t.id+" · "+(t.id==="M1"||i<2?langText("필수","Core"):langText("선택 심화","Optional"));
$("mini-overview").hidden=t.id!=="M1";$("sample-input").hidden=!t.sampleContent;document.querySelectorAll("[data-go-task]").forEach(b=>{const selected=Number(b.dataset.goTask)===i;b.classList.toggle("active",selected);b.setAttribute("aria-current",selected?"step":"false")});$("task-title").textContent=v.title;$("task-desc").textContent=v.desc;renderCoreGuide(t);$("task-objective").textContent=v.objective;$("test-input").textContent=t.input;$("test-output").textContent=t.output;$("hint").textContent=v.hint;let draft=null;try{draft=localStorage.getItem(key(i))}catch(e){}$("editor").value=draft===null?t.starter:draft;$("feedback").textContent="직접 코드를 작성하세요. 핵심 구문 점검은 GCC 컴파일을 대체하지 않습니다.";renderNav();window.dispatchEvent(new CustomEvent("c-fileio-task-change",{detail:{id:t.id}}))}
function renderNav(){
 const nav=$("task-nav");const shellControls=[...nav.querySelectorAll(":scope > .c-sidebar-topline, :scope > .c-course-task-links")];nav.replaceChildren(...shellControls);
 const preserved=nav.dataset.openGroup||"core";
 const sections=[["core",langText("Coding Challenges · 필수 코딩","Coding Challenges · Core"),true],["advanced",langText("Coding Challenges · 선택 심화","Coding Challenges · Optional"),false]];
 const lists={};
 for(const [id,label,initialOpen] of sections){
  const details=document.createElement("details");details.className="c-learning-group";details.dataset.group=id;
  details.open=id===preserved||(!preserved&&initialOpen);
  const heading=document.createElement("summary");heading.textContent=label;details.append(heading);
  const list=document.createElement("div");list.className="c-learning-group-items";details.append(list);nav.append(details);
  lists[id]=list;
  details.addEventListener("toggle",()=>{if(details.open)nav.dataset.openGroup=id});
 }
 taskOrder.forEach(i=>{
  const t=tasks[i],v=taskView(t),essential=i<2||t.id==="M1";
  const b=document.createElement("button");b.type="button";b.dataset.task=String(i);b.dataset.core=String(essential);
  b.className=i===active?"active":"";
  b.replaceChildren();const strong=document.createElement("strong"),small=document.createElement("small");strong.textContent=(essential?langText("필수","Core"):langText("선택","Optional"))+" · "+t.id;small.textContent=v.objective;b.append(strong,document.createTextNode(" · "+v.title),small);
  (essential?lists.core:lists.advanced).append(b);
  b.onclick=()=>load(i);
 });
 nav.querySelectorAll("details").forEach(d=>{if(d.querySelector("button.active")){d.open=true;nav.dataset.openGroup=d.dataset.group}});
}
function cleanCode(source){return source.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\/\/[^\n]*/g,"").replace(/"(?:\\.|[^"\\])*"/g,m=>m).replace(/'(?:\\.|[^'\\])*'/g,m=>m)}
$("editor").addEventListener("input",()=>{try{localStorage.setItem(key(active),$("editor").value)}catch(e){}});
$("check").onclick=()=>{const t=tasks[active],s=cleanCode($("editor").value);const tests=t.checks.map(([label,re],idx)=>({label:langText(label,checkEN[t.id]?.[idx]||label),ok:re.test(s)}));const passed=tests.filter(x=>x.ok).length;const results=tests.map(x=>(x.ok?"✓ ":"✗ ")+x.label).join("\n");$("feedback").textContent="핵심 구문 점검: "+passed+" / "+tests.length+"\n"+results+"\n\n※ 정규식 기반의 학습 보조 점검입니다. 실행 결과·문법 정확성·예외 처리를 검증하지 않습니다. 예시 입력으로 GCC에서 실제 실행해 확인하세요."; $("feedback").className="feedback "+(passed===tests.length?"pass":"fail")};
$("save").onclick=()=>{try{localStorage.setItem(key(active),$("editor").value);$("feedback").textContent="이 브라우저에 초안을 저장했습니다. 다른 기기와 동기화되지 않습니다."}catch(e){$("feedback").textContent="브라우저 저장이 차단되어 있습니다. .c 다운로드를 이용하세요."}};
$("reset").onclick=()=>{if(!confirm("현재 편집 내용을 Starter Code로 바꾸시겠습니까?"))return;try{localStorage.removeItem(key(active))}catch(e){};delete evidence[active];persistEvidence();$("gcc-confirm").checked=false;$("editor").value=tasks[active].starter;$("feedback").textContent="Starter Code와 저장 초안을 함께 초기화했습니다."};
$("download").onclick=()=>{const blob=new Blob([$("editor").value],{type:"text/x-csrc;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=tasks[active].id.toLowerCase()+"_file_io.c";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)};
$("sample-input").addEventListener("click",()=>{const t=tasks[active];if(!t.sampleContent)return;const blob=new Blob([t.sampleContent],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=t.sampleFilename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)});
const hashTask=()=>({p1:0,p2:1,p3:2,p4:3,p5:4,p6:5,m1:6})[location.hash.slice(1).toLowerCase()];
document.querySelectorAll("[data-go-task]").forEach(btn=>btn.addEventListener("click",()=>{const i=Number(btn.dataset.goTask);if(!Number.isInteger(i))return;load(i);history.replaceState(null,"","#"+tasks[i].id.toLowerCase());document.querySelector(".work")?.scrollIntoView({behavior:"instant",block:"start"})}));
load(hashTask()??0);
window.addEventListener("hashchange",()=>{const task=hashTask();if(task!==undefined)load(task)});
})();