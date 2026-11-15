/* Formative assessment for Sensor Log Part B. Answers are only revealed after submission.
   This is NOT a validated independent programming competency test. */
(() => {
 "use strict";
 const form=document.getElementById("sensor-assessment-form");
 if(!form)return;
 const feedback=document.getElementById("sensor-assessment-feedback");
 const explanation=document.getElementById("sensor-assessment-explain");
 const answers={sa1:"b",sa2:"b",sa3:"a"};
 const rationales={
  sa1:"fscanf는 줄바꿈도 공백으로 취급해 0.0과 2.51을 한 쌍으로 읽을 수 있습니다. fgets 기반의 한 줄 검사는 첫 행에 필드가 하나뿐임을 감지합니다.",
  sa2:"요구사항이 '각 행에 정확히 두 값'이라면 fgets로 행 경계를 유지하고 strtod 변환 성공과 추가 문자 여부를 검사하는 편이 명확합니다.",
  sa3:"첫 값 0.1 변환에는 성공해 fscanf가 1을 반환할 수 있습니다. 별도의 줄 검증 코드는 두 번째 행의 비정상 필드를 식별합니다."
 };
 const clean=t=>String(t??"").trim();
 const savedKey="els-fileio-robust-assessment-v1";
 function show(html,kind){feedback.textContent="";feedback.dataset.state=kind;
   const lines=html.split("\n");for(const [i,line] of lines.entries()){const p=document.createElement("p");p.textContent=line;if(i===0)p.style.fontWeight="800";feedback.append(p)}}
 form.addEventListener("submit",ev=>{
  ev.preventDefault();
  const choices={};for(const key of Object.keys(answers)){
   choices[key]=form.querySelector('input[name="'+key+'"]:checked')?.value||null;
  }
  if(Object.values(choices).some(v=>!v)){
   show("세 문제의 답을 모두 선택하세요. 아직 정답은 공개하지 않았습니다.","attention");return;
  }
  const written=clean(explanation.value);
  if(written.length<20){
   show("판단 근거를 20자 이상 작성해 보세요. 반환값·줄 경계·오류 위치 중 두 개 이상을 활용하면 좋습니다.","attention");return;
  }
  let correct=0;
  const lines=[];
  for(let i=1;i<=3;i++){
   const key="sa"+i,ok=choices[key]===answers[key];
   if(ok)correct++;
   lines.push("Q"+i+" · "+(ok?"정답":"다시 생각해 보기")+" — "+rationales[key]);
  }
  const result=correct+"/3 · 개념 확인 "+(correct===3?"모든 문항 정답":"복습 권장");
  show(result+"\n"+lines.join("\n")+
    "\n작성한 근거는 자동 채점하지 않습니다. 다른 예제에 적용할 때의 설계 판단을 스스로 점검하세요.",
    correct===3?"good":"review");
  try{localStorage.setItem(savedKey,JSON.stringify({choices,rationale:written,correct,total:3,at:new Date().toISOString()}))}catch(err){}
 });
 document.getElementById("sensor-assessment-reset").onclick=()=>{
  form.reset();feedback.textContent="답안을 초기화했습니다. 새로 예측해 보세요.";feedback.dataset.state="";
 };
})();
