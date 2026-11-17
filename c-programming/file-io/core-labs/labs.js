(() => {
"use strict";
const $=id=>document.getElementById(id);
const language=window.ELSLanguage;
const translations={
skip:["본문 바로가기","Skip to main content"],back:["← File I/O 개념 학습","← File I/O concepts"],title:["File I/O 필수 코딩 실습","File I/O Essential Coding Labs"],
intro:["1학년이 먼저 익혀야 할 세 가지 프로그램입니다. 전체 C 코드를 읽고, 데이터를 바꾸고, 실행 결과를 예측한 다음 확인하세요. 오류 복구와 복잡한 파싱은 심화 과정에서 다룹니다.","Three essential programs for first-year students. Read the complete C code, change the input, predict the result, then test it. Advanced error recovery and parsing are taught separately."],
shortWrite:["01 · 파일에 쓰기","01 · Write a file"],shortRead:["02 · 한 줄 읽기","02 · Read one line"],shortStudent:["03 · 학생 레코드","03 · Student record"],
coreLabel:["필수 실습 · 순서대로","Core labs · In order"],navWrite:["파일에 한 줄 저장하기","Write One Line to a File"],navRead:["파일에서 한 줄 읽고 출력하기","Read One Line and Print It"],navStudent:["학생 레코드를 구조체에 읽고 학점 계산하기","Read a Student Record and Calculate a Grade"],
advancedLabel:["심화 과정 · 선택","Advanced · Optional"],advancedDesc:["기본 코드를 이해한 다음에만 진행하세요. 여러 학생 처리, 엄격한 데이터 검증, 센서 로그 등은 별도의 과제입니다.","Complete the basics first. Multiple records, strict validation and sensor logs belong to separate advanced tasks."],
advancedGo:["심화 코딩 과제 P3–P6","Advanced coding challenges P3–P6"],editorGo:["직접 코딩하기 · 기존 Practice Lab","Write code yourself · Existing Practice Lab"],
modelTitle:["실행 방식","How this works"],model:["이 페이지는 C 코드를 실제로 컴파일하지 않습니다. 코드는 GCC C11용 전체 예제이며, 버튼은 같은 입력에 대한 교육용 모의 실행을 보여 줍니다. 실제 코딩은 아래의 Practice Lab에서 .c 파일로 저장해 GCC로 확인하세요.","This page does not compile C code. It shows complete GCC C11 examples; each button simulates the corresponding operation using your input. Use the Practice Lab to save a .c file and verify it with GCC."],
writeTitle:["파일에 한 줄 저장하기","Write One Line to a File"],writeIntro:["상황: 프로그램이 실행되면 message.txt를 새로 만들거나 기존 내용을 지우고, 한 줄을 기록합니다. 코드를 읽은 뒤 어떤 내용이 파일에 남을지 먼저 예측하세요.","Scenario: The program creates message.txt or clears its previous contents, then writes one line. Before running, predict what the file will contain."],
fullProgram:["전체 C11 프로그램","Complete C11 program"],codeWriteNote:["입력 문장을 바꾸면 fprintf()의 문자열도 바뀝니다.","Changing the input changes the string passed to fprintf()."],
writeExplain:['파일을 열고(NULL 검사), 한 줄을 기록한 뒤 닫습니다. "w" 모드는 기존 파일 내용을 덮어씁니다.','Open the file, check for NULL, write a line and close it. Mode "w" replaces the previous contents.'],writeInput:["파일에 기록할 한 줄","One line to write"],writePredict:["예측: fprintf()가 실행된 후 message.txt에는 무엇이 남을까요?","Predict: What remains in message.txt after fprintf() runs?"],writeRun:["파일 쓰기 모의 실행","Simulate writing the file"],
beforeRun:["실행 전에 결과를 예측해 보세요.","Predict the output before running."],toRead:["다음: 저장한 파일을 읽어 보기 →","Next: Read the saved file →"],
readTitle:["파일에서 한 줄 읽고 출력하기","Read One Line and Print It"],readIntro:["상황: message.txt에는 여러 줄이 들어 있습니다. fgets()를 단 한 번 호출하면 첫 줄만 읽습니다. 화면에 출력되는 내용을 먼저 예측하세요.","Scenario: message.txt contains multiple lines. One call to fgets() reads only the first line or as much as fits in the buffer. Predict the screen output."],
codeReadNote:["첫 번째 줄만 읽는 기본 프로그램","A simple program that reads once"],readExplain:["fgets()는 버퍼 크기를 전달받아 한 번에 문자열 일부 또는 한 줄을 읽습니다. 성공했을 때만 fputs()로 출력합니다.","fgets() reads at most one line or the portion that fits in the buffer. fputs() prints only when reading succeeds."],
readInput:["message.txt 내용","Contents of message.txt"],useSaved:["01에서 저장한 데이터 사용","Use the data saved in Lab 01"],readPredict:["예측: 두 번째 줄도 출력될까요? 빈 파일이라면 어떨까요?","Predict: Will the second line print? What if the file is empty?"],readRun:["한 줄 읽기 모의 실행","Simulate reading one line"],toStudent:["다음: 구조체에 읽어 들이기 →","Next: Read into a structure →"],
studentTitle:["학생 레코드를 구조체에 읽고 학점 계산하기","Read a Student Record and Calculate a Grade"],studentIntro:["상황: students.txt의 한 레코드에는 학번, 이름, 점수가 기록되어 있습니다. 세 값을 struct Student에 넣고, 점수를 A~F 학점으로 환산해 출력합니다. 먼저 한 명을 정확히 처리하는 법을 익힙니다.","Scenario: One record in students.txt holds a student ID, name and score. Read the three fields into struct Student, calculate an A–F grade, then print the result. Start with one student."],
codeStudentNote:["학생 한 명을 처리하는 기본 형태","A complete program for one student"],studentExplain:["fscanf()가 3을 반환하면 학번·이름·점수를 모두 성공적으로 읽은 것입니다. 정수·실수에는 &, 문자 배열 이름에는 & 없이 전달합니다.","A return value of 3 from fscanf() means that ID, name and score were all converted. Use & for the integer and double fields, but not for the character array name."],
studentInput:["students.txt 내용 · 첫 학생","students.txt contents · First student"],studentPredict:["예측: s.id, s.name, s.score와 A~F 학점은 각각 무엇일까요?","Predict: What are s.id, s.name, s.score and the A–F grade?"],studentRun:["구조체 저장·학점 환산 모의 실행","Simulate reading and grading"],
studentRule:["성적 기준: A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, F < 60 (실습용 기준)","Grade thresholds: A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, F < 60 (example only)"],
finishTitle:["이제 직접 작성해 보세요","Now Write the Code Yourself"],finishText:["세 프로그램의 전체 흐름을 이해했다면 기존 Practice Lab에서 코드를 직접 작성하세요. P1은 파일 쓰기, M1은 한 줄 복사, P2는 여러 숫자 읽기입니다.","After understanding the three complete programs, write code in the existing Practice Lab. P1 writes files, M1 copies one line and P2 reads and averages numbers."],
practiceWrite:["P1 · 직접 파일 쓰기","P1 · Write a File"],practiceRead:["M1 · 한 줄 복사","M1 · Copy One Line"],practiceNumbers:["P2 · 숫자 평균 계산","P2 · Average Numbers"],advancedSummary:["심화 과정은 별도로 펼치기","Expand optional advanced topics"],advancedText:["기본 프로그램을 익힌 뒤 여러 학생 레코드, 형식 오류 감지, 파일 복사, 센서 로그 검증 등은 선택 심화 코딩 과제에서 연습합니다.","After the basics, practice multiple student records, malformed data, file copying and sensor validation in optional advanced exercises."],
footer:["기본 3개 실습의 실행 기록은 기존 Chapter 17 진도와 별도 저장됩니다. 실제 컴파일 성공을 의미하지 않습니다.","The three simulation completion markers are stored separately from Chapter 17 progress; they do not indicate successful C compilation."]
};
const getMode=()=>language?.get()||"mixed";
const tr=(k)=>{const t=translations[k];return t?(getMode()==="en"?t[1]:t[0]):k};
function renderLanguage(){document.documentElement.lang=getMode()==="en"?"en":"ko";for(const node of document.querySelectorAll("[data-i18n]"))node.textContent=tr(node.dataset.i18n);$("language-mode").value=getMode();updateProgress()}
$("language-mode").value=getMode();
$("language-mode").addEventListener("change",e=>language?.set(e.target.value));
language?.subscribe(renderLanguage);
const completed=new Set();
try {const x=JSON.parse(localStorage.getItem("els-fileio-core-labs-v1")||"[]");if(Array.isArray(x))for(const id of x)if(["write","read","student"].includes(id))completed.add(id)}catch(e){}
function updateProgress(){for(const node of document.querySelectorAll("[data-lab-link]"))node.classList.toggle("completed",completed.has(node.dataset.labLink));$("lab-progress").textContent=(getMode()==="en"?"Simulation activities: ":"모의 실행 활동: ")+completed.size+"/3"}
function mark(id){completed.add(id);try{localStorage.setItem("els-fileio-core-labs-v1",JSON.stringify([...completed]))}catch(e){}updateProgress()}
function refreshNav(){let hash=location.hash.slice(1);if(!["write","read","student"].includes(hash))hash="write";document.querySelectorAll("[data-lab-link]").forEach(x=>x.classList.toggle("active",x.dataset.labLink===hash))}
window.addEventListener("hashchange",refreshNav);refreshNav();
let lastSaved=null;
const escapedC=v=>v.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\t/g,"\\t");
function updateWriteCode(){
 const v=$("input-write").value;
 $("code-write").textContent='#include <stdio.h>\nint main(void) {\n    FILE *fp = fopen("message.txt", "w");\n    if (fp == NULL) return 1;\n\n    fprintf(fp, "%s\\n", "'+escapedC(v)+'");\n    fclose(fp);\n    return 0;\n}';
}
$("input-write").addEventListener("input",updateWriteCode);updateWriteCode();
$("run-write").addEventListener("click",()=>{
 const v=$("input-write").value;
 if(/[\r\n]/.test(v)){ $("out-write").textContent=getMode()==="en"?"Enter one line only.":"한 줄만 입력하세요.";return }
 lastSaved=v+"\n";
 $("out-write").textContent=(getMode()==="en"?"message.txt (simulated):\n":"message.txt (모의 파일):\n")+lastSaved+(getMode()==="en"?"\nPrevious contents were replaced.":"\n이전 내용은 덮어썼습니다.");
 mark("write");
});
$("use-saved").addEventListener("click",()=>{
 if(lastSaved===null){$("out-read").textContent=getMode()==="en"?"Run Lab 01 first.":"먼저 실습 01을 실행하세요.";return}
 $("input-read").value=lastSaved;
 $("out-read").textContent=getMode()==="en"?"Loaded the simulated file from Lab 01. Predict the result and run.":"실습 01의 모의 파일을 불러왔습니다. 결과를 예측한 뒤 실행하세요.";
});
$("run-read").addEventListener("click",()=>{
 const v=$("input-read").value.replace(/\r\n?/g,"\n");
 if(!/^[\x00-\x7f]*$/.test(v)){ $("out-read").textContent=getMode()==="en"?"This basic byte-buffer simulation accepts ASCII only. UTF-8 input requires a separate byte-level example.":"기본 버퍼 모의 실행은 ASCII 입력만 지원합니다. 한글 등 UTF-8은 바이트 단위 처리가 필요합니다.";return}
 if(!v){$("out-read").textContent=getMode()==="en"?"fgets() returned NULL (empty file). No output.":"fgets()가 NULL을 반환했습니다(빈 파일). 출력 없음.";mark("read");return}
 const line=v.slice(0,79),nl=line.indexOf("\n"),output=nl>=0?line.slice(0,nl+1):line;
 $("out-read").textContent=(getMode()==="en"?"fgets() succeeded.\nstdout:\n":"fgets() 읽기 성공.\n화면 출력:\n")+output+(output.endsWith("\n")?"":"\n")+(getMode()==="en"?"Only one fgets() call was made.":"fgets()는 한 번만 호출했습니다.");mark("read");
});
const grade=n=>n>=90?"A":n>=80?"B":n>=70?"C":n>=60?"D":"F";
$("run-student").addEventListener("click",()=>{
 const input=$("input-student").value.trim();
 const tokens=input.split(/\s+/);
 const id=tokens[0],name=tokens[1],scoreText=tokens[2];
 const idOK=/^[+-]?\d+$/.test(id||"")&&Number.isInteger(Number(id))&&Number(id)>=-2147483648&&Number(id)<=2147483647;
 const scoreOK=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(scoreText||"")&&Number.isFinite(Number(scoreText));
 const nameOK=/^[!-~]{1,39}$/.test(name||"");
 if(tokens.length<3||!idOK||!nameOK||!scoreOK){
 $("out-student").textContent=getMode()==="en"?"fscanf() failed to convert all three fields. No record was printed.":"fscanf()가 세 항목 모두 변환하지 못했습니다. 학생을 출력하지 않습니다.";return}
 const sc=Number(scoreText);
 if(sc<0||sc>100){$("out-student").textContent=getMode()==="en"?"Score outside 0–100. Program exits without a grade.":"점수가 0~100 범위를 벗어나 학점을 출력하지 않고 종료합니다.";return}
 $("out-student").textContent="struct Student s:\n  id = "+Number(id)+"\n  name = \""+name+"\"\n  score = "+sc.toFixed(1)+"\n\nstdout:\n"+Number(id)+" "+name+" "+sc.toFixed(1)+" "+grade(sc);
 mark("student");
});
renderLanguage();
})();