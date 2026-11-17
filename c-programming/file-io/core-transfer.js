/* First-year core transfer checkpoints, intentionally not a C compiler. */
(() => {
 "use strict";
 const answerKey={
   3:{a:"b",b:"b"},
   4:{a:"a",b:"b"},
   5:{a:"c",b:"a"},
   6:{a:"a",b:"b"},
   8:{a:"b",b:"c"}
 };
 const explanations={
  "3": {
    "a": "fopen(\"readings.txt\", \"r\")가 실패하면 반환값은 NULL입니다. if (fp == NULL)에서 실패를 감지하고 파일을 사용하지 않고 종료합니다.",
    "b": "읽기 모드 \"r\"은 파일을 자동으로 생성하지 않습니다. 파일이 없으면 fopen()이 NULL을 반환하므로 그 포인터로 파일 작업을 수행해서는 안 됩니다."
  },
  "4": {
    "a": "두 예제는 파일을 각각 처음부터 새로 열어 실행합니다. %19s는 Hello까지만 읽지만 fgets()는 버퍼가 충분하다면 Hello World와 줄바꿈까지 읽습니다.",
    "b": "fscanf()는 성공적으로 변환하여 저장한 항목 수를 반환합니다. 정수와 실수 변환이 모두 성공했으므로 반환값은 2입니다."
  },
  "5": {
    "a": "fscanf(fp, \"%d\", &x) == 1은 정수 하나를 실제로 읽은 경우에만 본문을 실행합니다. !feof(fp)만 검사하면 형식이 맞지 않는 값에서 이전 데이터를 다시 사용할 수 있습니다.",
    "b": "마지막 정수 30을 읽은 직후에는 일반적으로 EOF 표시가 아직 설정되지 않았습니다. 이후 파일 끝에서 읽기가 실패하면 feof(fp)가 참이 됩니다."
  },
  "6": {
    "a": "saveStudent(s)는 성공하면 1, 실패하면 0을 반환하므로 !saveStudent(s)가 참이면 실패 처리로 들어갑니다. fclose()에는 구조체가 아니라 FILE *가 필요합니다.",
    "b": "saveStudent()가 파일 열기·쓰기·닫기와 오류 검사를 담당하고 main()은 함수를 호출해 결과를 확인합니다. 역할을 분리하여 가독성과 유지보수성을 높입니다."
  },
  "8": {
    "a": "4.0과 6.0을 읽어 count는 2, sum은 10.0이 됩니다. ABC는 double 형식에 맞지 않으므로 세 번째 반복문 본문은 실행되지 않습니다.",
    "b": "이 입력에서 ABC는 실수로 변환되지 않아 fscanf()가 0을 반환합니다. 이는 정상적인 파일 끝(EOF)에 도달한 경우와 다릅니다."
  }
};
 const explanationsEn={
  "3": {
    "a": "If fopen(\"readings.txt\", \"r\") fails, it returns NULL. The condition fp == NULL detects this failure and exits before the file is used.",
    "b": "Read mode \"r\" does not create a missing file. If fopen() returns NULL, do not use that pointer for file operations."
  },
  "4": {
    "a": "The two examples open the file separately from the beginning. With %19s, fscanf() reads only Hello, while fgets() can read Hello World and the newline when the buffer is large enough.",
    "b": "fscanf() returns the number of values successfully converted and assigned. Here, both the integer and floating-point conversions succeed, so it returns 2."
  },
  "5": {
    "a": "The condition fscanf(fp, \"%d\", &x) == 1 executes the loop body only when one integer is read successfully. Checking only !feof(fp) may reuse stale data when a conversion fails.",
    "b": "The EOF indicator is usually not set immediately after reading the final integer 30. It is set when a later read attempts to read past the end of the file."
  },
  "6": {
    "a": "saveStudent(s) returns 1 on success and 0 on failure, so !saveStudent(s) is true when saving fails. fclose() requires FILE *, not a Student structure.",
    "b": "saveStudent() handles opening, writing, closing, and checking errors, while main() calls the function and checks the result. This separation improves clarity and maintainability."
  },
  "8": {
    "a": "The first two values, 4.0 and 6.0, are read successfully, leaving count at 2 and sum at 10.0. ABC cannot be converted to double, so the loop body does not execute a third time.",
    "b": "ABC cannot be converted to a floating-point number, so fscanf() returns 0. This is a matching failure, not a normal end-of-file."
  }
};
 const isEnglish=()=>window.ELSLanguage?.get()==="en";
 const state=new Map();
 const storageKey="els-fileio-core-transfer-v1";
 function evaluate(step){
  const card=document.querySelector('[data-core-step="'+step+'"]');
  const box=document.getElementById("core-result-"+step);
  if(!card || !box)return;
  const selected={};
  for(const suffix of ["a","b"]){
   selected[suffix]=card.querySelector('input[name="core-'+step+'-'+suffix+'"]:checked')?.value||null;
  }
  if(!selected.a || !selected.b){box.textContent=isEnglish()?"Select an answer to both questions before checking. The answers will be shown after submission.":"두 문제 모두 선택한 뒤 확인하세요. 정답은 제출 후 표시됩니다.";box.dataset.state="attention";return}
  const correct=(selected.a===answerKey[step].a?1:0)+(selected.b===answerKey[step].b?1:0);
  const english=isEnglish(), feedback=english?explanationsEn[step]:explanations[step];
  const lines=[correct+"/2 · "+(english?(correct===2?"Core concept confirmed.":"Review the explanations and try again."):(correct===2?"핵심 개념을 확인했습니다.":"틀린 문항의 이유를 살펴보고 다시 풀어보세요.")),
    "① "+(selected.a===answerKey[step].a?(english?"Correct":"정답"):(english?"Review":"재검토"))+" — "+feedback.a,
    "② "+(selected.b===answerKey[step].b?(english?"Correct":"정답"):(english?"Review":"재검토"))+" — "+feedback.b,
    english?"This is a formative concept and code-reading assessment, not certification of successful C compilation or execution.":"이 결과는 개념·코드 읽기 형성평가이며, 실제 C 프로그램의 컴파일·실행 숙달 인증이 아닙니다."];
  box.replaceChildren();
  for(const line of lines){const p=document.createElement("p");p.textContent=line;box.append(p)}
  box.dataset.state=correct===2?"success":"review";
  if(correct===2)window.dispatchEvent(new CustomEvent("els:conceptPassed",{detail:{stage:step-1}}));
  state.set(step,{selected,correct,at:new Date().toISOString()});
  try{localStorage.setItem(storageKey,JSON.stringify(Object.fromEntries(state)))}catch(e){}
 }
 document.querySelectorAll("[data-core-check]").forEach(btn=>btn.addEventListener("click",()=>evaluate(Number(btn.dataset.coreCheck))));
 document.querySelectorAll("[data-core-reset]").forEach(btn=>btn.addEventListener("click",()=>{
   const step=Number(btn.dataset.coreReset);
   const card=document.querySelector('[data-core-step="'+step+'"]');
   for(const radio of card.querySelectorAll('input[type="radio"]'))radio.checked=false;
   const box=document.getElementById("core-result-"+step);
   box.textContent=isEnglish()?"Select answers to both questions, then check your results.":"두 문항을 선택한 뒤 결과를 확인하세요.";
   box.dataset.state="";
   state.delete(step);
   try{localStorage.setItem(storageKey,JSON.stringify(Object.fromEntries(state)))}catch(e){}
 }));
})();
