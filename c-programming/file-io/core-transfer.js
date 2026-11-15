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
  3:{a:"fopen()이 실패하면 NULL을 반환합니다. fp를 사용하기 전에 fp == NULL을 확인해야 합니다.",b:"r 모드는 없는 파일을 자동 생성하지 않습니다. 열린 스트림이 없으면 fscanf 등의 파일 작업을 수행할 수 없습니다."},
  4:{a:"%s는 공백에서 멈추지만 fgets()는 버퍼 크기 범위 내에서 줄바꿈까지 포함하여 한 줄을 읽을 수 있습니다.",b:"%d와 %lf라는 두 개의 변환이 성공했으므로 fscanf() 반환값은 2입니다."},
  5:{a:"반복문은 파일 끝 여부를 읽기 전에 추측하는 대신, fscanf()가 정수 한 개를 실제로 변환했는지 확인해야 합니다.",b:"마지막 값을 성공적으로 읽었다고 feof()가 곧바로 참이 되는 것은 아닙니다. 이후 EOF에 도달하는 읽기 시도가 실패하면 EOF indicator가 설정됩니다."},
  6:{a:"main()에서는 saveStudent(s)의 반환값으로 저장 성공 여부를 확인합니다. FILE *가 아닌 구조체 s를 fclose에 전달하면 안 됩니다.",b:"함수 안에서 fopen/fprintf/fclose를 수행하고 성공 여부를 반환하면 main()은 전체 제어 흐름에 집중할 수 있습니다."},
  8:{a:"4.0과 6.0을 각각 변환한 후 ABC를 만나 반복문이 종료되므로 count=2, sum=10.0입니다.",b:"ABC처럼 숫자가 아닌 토큰을 만난 경우 matching failure로 반환값 0일 수 있습니다. 정상적인 EOF와는 다릅니다."}
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
