
(() => {
"use strict";
const $ = id => document.getElementById(id);
const stages = [...document.querySelectorAll(".stage")];
const keys = ["b","b","b","b","b","b","c","b"];
const explanations = [
"파일에 기록된 데이터는 프로그램 종료 후에도 다음 실행에서 읽을 수 있습니다. 변수의 실행 중 메모리 상태와 구분하세요.",
"FILE *는 열린 Stream을 다루는 라이브러리 객체를 가리킵니다. 파일 이름 문자열 자체가 아닙니다.",
"성공적인 w 모드 열기는 기존 내용을 지웁니다. 기록을 유지하면서 뒤에 추가하려면 a를 사용하세요.",
"요청한 두 변환이 성공해야 fscanf() 반환값은 2가 됩니다.",
"성공한 읽기에 따라서만 데이터를 처리합니다. feof()는 끝을 넘는 읽기가 실패한 뒤 설정됩니다.",
"배열인 s.name은 함수 호출에서 첫 요소의 주소로 변환됩니다. 정수와 실수 멤버에는 주소 연산자 &가 필요합니다.",
"두 %lf 항목이 모두 정상 변환되면 반환값 2입니다. 성공한 쌍만 처리하세요.",
"안전한 순서는 파일 열기 → NULL 확인 → 읽기 결과 확인 → fclose()입니다."
];
let current=0;let done=new Set();
try{const stored=JSON.parse(localStorage.getItem("els-fileio-progress-v1")||"[]");if(Array.isArray(stored))done=new Set(stored.filter(x=>Number.isInteger(x)&&x>=0&&x<8))}catch(e){}
const persist=()=>{try{localStorage.setItem("els-fileio-progress-v1",JSON.stringify([...done]))}catch(e){}};
function navigate(i,doScroll=true){current=Math.max(0,Math.min(7,i));stages.forEach((s,j)=>s.hidden=j!==current);
document.querySelectorAll("[data-nav]").forEach((b,j)=>{b.classList.toggle("current",j===current);b.classList.toggle("completed",done.has(j));if(j===current)b.setAttribute("aria-current","step");else b.removeAttribute("aria-current")});
$("step-label").textContent="STEP "+String(current+1).padStart(2,"0")+" / 08";
$("step-status").textContent=done.has(current)?"학습 완료":"학습 중";
$("footer-position").textContent=(current+1)+" / 8";$("prev-stage").disabled=current===0;$("next-stage").disabled=current===7;
$("progress-text").textContent=done.size+" / 8";$("progress-fill").style.width=(done.size*12.5)+"%";$("progress-meter").setAttribute("aria-valuenow",done.size);$("completion-message").hidden=done.size<8;
if(doScroll){const target=$("lesson");if(target)target.scrollIntoView({block:"start",behavior:"instant"});if(target)target.focus({preventScroll:true});}}
document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>navigate(Number(b.dataset.nav))));
$("prev-stage").onclick=()=>navigate(current-1);$("next-stage").onclick=()=>navigate(current+1);
document.querySelectorAll("[data-grade]").forEach(btn=>btn.onclick=()=>{const n=Number(btn.dataset.grade),picked=document.querySelector('input[name="q'+n+'"]:checked'),box=$("answer-"+n);if(!picked){box.textContent="먼저 답을 선택해 보세요.";box.classList.add("incorrect");return;}
const good=picked.value===keys[n];box.classList.toggle("incorrect",!good);box.textContent=(good?"정답입니다. ":"다시 생각해 보세요. ")+explanations[n];
if(good){done.add(n);persist();navigate(current,false);}});
$("clear-progress").onclick=()=>{if(!confirm("현재 브라우저의 학습 진도를 초기화할까요?"))return;done.clear();persist();document.querySelectorAll(".answer").forEach(el=>{el.textContent="";el.classList.remove("incorrect")});document.querySelectorAll('input[type="radio"]').forEach(el=>el.checked=false);navigate(0)};
$("theme-button").onclick=()=>{const root=document.documentElement;const next=root.dataset.theme==="dark"?"light":"dark";root.dataset.theme=next;$("theme-button").setAttribute("aria-pressed",String(next==="dark"));try{localStorage.setItem("els-theme",next)}catch(e){}};
try{const theme=localStorage.getItem("els-theme");if(theme==="dark"||theme==="light"){document.documentElement.dataset.theme=theme;$("theme-button").setAttribute("aria-pressed",String(theme==="dark"))}}catch(e){}
$("end-process").onclick=()=>{$("memory-value").textContent="(program ended)";$("memory-msg").textContent="실행 중 변수는 사라졌지만, scores.txt 데이터는 그대로 남습니다."};
$("start-process").onclick=()=>{$("memory-value").textContent="score = 0.0 (new run)";$("memory-msg").textContent="새 실행의 변수는 새 상태로 시작합니다. 파일 데이터는 다시 읽어올 수 있습니다."};
$("stream-target").onchange=()=>{const data={
stdout:["Terminal · 정상 출력",'fprintf(stdout, "READY\\n");',"stdout은 일반 출력용 Stream입니다.","→"],
stderr:["Terminal · 오류 출력",'fprintf(stderr, "Cannot open file\\n");',"stderr는 오류·진단 메시지를 분리할 때 유용합니다.","→"],
file:["sensor.txt · File Stream",'fprintf(fp, "READY\\n");',"fp를 통해 열린 파일로 출력합니다.","→"],
stdin:["Keyboard · 입력",'fgets(line, sizeof line, stdin);',"stdin은 프로그램으로 들어오는 표준 입력 Stream입니다.","←"]
}[$("stream-target").value];$("stream-destination").textContent=data[0];$("stream-code").textContent=data[1];$("stream-explain").textContent=data[2];$("stream-arrow").textContent=data[3]};


const patterns={line:['fgets',"char line[120];\nwhile (fgets(line, sizeof line, fp) != NULL) {\n    fputs(line, stdout);\n}"],values:['fscanf','int id; double value;\nif (fscanf(fp, "%d %lf", &id, &value) == 2) {\n    /* both values read */\n}'],write:['fprintf','fprintf(fp, "%d %.1f\\n", id, score);'],char:['fgetc','int ch;\nwhile ((ch = fgetc(fp)) != EOF) {\n    putchar(ch);\n}']};
$("io-check").onclick=()=>{const which=$("io-task").value,want=patterns[which][0],actual=$("io-fn").value;$("io-feedback").textContent=!actual?"먼저 함수를 선택하세요.":actual===want?"정답! 데이터의 단위와 함수 반환값을 함께 확인하세요.":"요구된 데이터 형식을 다시 확인하고 다른 함수를 선택하세요.";if(actual===want)$("io-pattern").textContent=patterns[which][1];};
$("io-task").onchange=()=>{$("io-fn").value="";$("io-feedback").textContent="먼저 사용할 함수를 예측하세요."};

/* Lesson 7.5: load must parse the serialized file, never the original object. */
let savedRecordText=null;
$("rec-save").onclick=()=>{
 const id=Number($("rec-id").value),name=$("rec-name").value.trim(),score=Number($("rec-score").value);
 if(!Number.isInteger(id)||id<0||id>999999||!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)||name.length>39||$("rec-score").value.trim()===""||!Number.isFinite(score)||score<0||score>100){
  $("rec-message").textContent="ID는 0 이상 정수, 이름은 공백 없는 영문·숫자·밑줄, 점수는 0~100 범위로 입력하세요.";
  return;
 }
 savedRecordText=id+" "+name+" "+score.toFixed(1)+"\n";
 $("rec-file").textContent=savedRecordText;
 $("rec-result").textContent="(load required)";
 $("rec-message").textContent="fprintf()가 구조체 멤버를 텍스트 한 줄로 저장했습니다. 입력 폼을 바꾼 뒤 Load를 눌러 보세요.";
};
$("rec-load").onclick=()=>{
 if(savedRecordText===null){$("rec-message").textContent="먼저 Serialize를 눌러 파일 데이터를 만들어 주세요.";return;}
 const parts=savedRecordText.trim().split(/\s+/);
 if(parts.length!==3||!Number.isInteger(Number(parts[0]))||!Number.isFinite(Number(parts[2]))){
  $("rec-message").textContent="저장된 파일이 기대한 ID 이름 점수 형식이 아닙니다.";return;
 }
 const loaded={id:Number(parts[0]),name:parts[1],score:Number(parts[2])};
 $("rec-result").textContent="struct Student loaded = {\n  id: "+loaded.id+",\n  name: \""+loaded.name+"\",\n  score: "+loaded.score.toFixed(1)+"\n}";
 $("rec-message").textContent="파일의 텍스트를 다시 파싱해 세 항목을 복원했습니다. 원래 입력 폼이나 저장 직전 메모리 값을 다시 사용하지 않았습니다.";
};
const sensor=[[0.0,2.51],[0.1,2.55],[0.2,2.48],[0.3,3.82]];
function renderSensor(){const threshold=Number($("sensor-threshold").value),avg=sensor.reduce((s,x)=>s+x[1],0)/sensor.length;const alerts=sensor.filter(x=>x[1]>threshold);$("threshold-label").textContent=threshold.toFixed(2);$("sensor-count").textContent=sensor.length;$("sensor-mean").textContent=avg.toFixed(3);$("sensor-alerts").textContent=String(alerts.length);$("sensor-list").innerHTML=sensor.map(([t,v])=>'<div class="data-item'+(v>threshold?' alert':'')+'"><span>time '+t.toFixed(1)+' s</span><strong>'+v.toFixed(2)+(v>threshold?' · ALERT':'')+'</strong></div>').join("");$("sensor-msg").textContent="평균 "+avg.toFixed(3)+", 임계값 "+threshold.toFixed(2)+" 초과 "+alerts.length+"개";} $("sensor-threshold").oninput=renderSensor;
$("build-check").onclick=()=>{const good=$("blank-mode").value==="r"&&$("blank-read").value==="good"&&$("blank-close").value==="fclose";$("build-feedback").textContent=good?"올바른 선택입니다. fopen 실패 확인, 읽기 반환값, fclose를 모두 갖췄습니다.":"수정이 필요합니다: 읽기 모드 r, fscanf 반환값 == 1, fclose(fp)를 선택하세요."};
renderSensor();navigate(0,false);
})();
