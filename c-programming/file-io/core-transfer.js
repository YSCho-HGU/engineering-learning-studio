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
  3:{a:"fopen("readings.txt", "r")가 실패하면 반환값은 NULL입니다. 따라서 if (fp == NULL)에서 실패를 감지하고 return 1로 파일을 사용하지 않고 종료합니다. fp != NULL은 성공을 나타내므로 이 위치에 적절하지 않습니다.",b:"읽기 모드 "r"은 이미 존재하는 파일을 열 때 사용합니다. 파일이 없다면 fopen()은 NULL을 반환하며, 그 값을 사용해 fscanf()나 fclose()를 호출해서는 안 됩니다. 새 파일을 생성하는 쓰기 모드 "w"와 구별하세요."},
  4:{a:"두 예제는 파일을 각각 처음부터 새로 열어 실행합니다. %19s는 최대 19개의 공백 아닌 문자를 읽으므로 첫 단어 Hello만 저장합니다. fgets()는 충분한 버퍼가 있으면 Hello World와 줄바꿈 문자까지 읽습니다. 실제로 연속 호출했다면 파일 위치가 달라져 결과가 달라집니다.",b:"fscanf() 반환값은 형식 지정자의 개수가 아니라 실제로 변환하여 변수에 대입한 항목 수입니다. 여기에서는 %d와 %lf가 모두 성공했으므로 2를 반환합니다."},
  5:{a:"fscanf(fp, "%d", &x) == 1은 정수 한 개를 성공적으로 읽은 경우에만 반복문 본문을 실행합니다. !feof(fp)만으로 반복하면 변환 실패 시에도 이전 x 값을 잘못 사용할 수 있습니다.",b:"마지막 정수 30을 정상적으로 읽은 직후에는 파일 끝 표시가 아직 설정되지 않은 것이 일반적입니다. 그다음 읽기 시도가 입력 종료로 실패해야 feof(fp)가 참이 됩니다. 따라서 읽기 함수의 반환값을 먼저 확인하세요."},
  6:{a:"saveStudent(s)는 성공 시 1, 실패 시 0을 반환하므로 !saveStudent(s)는 실패한 경우 참입니다. fclose()는 FILE *를 받으며 구조체 s를 인자로 받을 수 없습니다. main()은 저장의 결과를 확인하고 오류 흐름을 처리합니다.",b:"saveStudent()는 파일 열기·기록·닫기를 내부에서 담당하고, 실패 검사도 수행한 후 결과를 반환합니다. main()은 저장 함수를 호출하고 결과를 확인하여 다른 작업과 전체 흐름을 관리합니다. 역할이 분리되어 코드를 읽고 수정하기 쉬워집니다."},
  8:{a:"첫 번째와 두 번째 fscanf()는 4.0과 6.0을 성공적으로 변환하여 count가 2, sum이 10.0이 됩니다. 세 번째 ABC는 double로 변환되지 않아 반복문 본문을 실행하지 않습니다.",b:"이 입력에서 ABC는 %lf 형식에 맞지 않아 fscanf()가 0을 반환합니다(matching failure). 읽기 시점에 파일 끝에 도달한 것이 아니므로 정상적인 EOF와 다릅니다. 왜 멈췄는지 판별하려면 반환값과 feof()/ferror() 상태를 구별하세요."}
 };
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
  if(!selected.a || !selected.b){box.textContent="두 문제 모두 선택한 뒤 확인하세요. 정답은 제출 후 표시됩니다.";box.dataset.state="attention";return}
  const correct=(selected.a===answerKey[step].a?1:0)+(selected.b===answerKey[step].b?1:0);
  const lines=[correct+"/2 · "+(correct===2?"핵심 개념을 확인했습니다.":"틀린 문항의 이유를 살펴보고 다시 풀어보세요."),
    "① "+(selected.a===answerKey[step].a?"정답":"재검토")+" — "+explanations[step].a,
    "② "+(selected.b===answerKey[step].b?"정답":"재검토")+" — "+explanations[step].b,
    "이 결과는 개념·코드 읽기 형성평가이며, 실제 C 프로그램의 컴파일·실행 숙달 인증이 아닙니다."];
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
   box.textContent="두 문항을 선택한 뒤 결과를 확인하세요.";
   box.dataset.state="";
   state.delete(step);
   try{localStorage.setItem(storageKey,JSON.stringify(Object.fromEntries(state)))}catch(e){}
 }));
})();
