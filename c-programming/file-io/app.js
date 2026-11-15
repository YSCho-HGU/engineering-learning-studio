
(() => {
"use strict";
const $ = id => document.getElementById(id);
const stages = [...document.querySelectorAll(".stage")];
const keys = ["b","b",null,"b",null,"b","c","b"];
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
const conceptKey="els-concept-fileio-v1";
let conceptDone=new Set();
try{const c=JSON.parse(localStorage.getItem(conceptKey)||"[]");if(Array.isArray(c))conceptDone=new Set(c.filter(n=>Number.isInteger(n)&&n>=0&&n<8))}catch(e){}
function markConcept(n){conceptDone.add(n);try{localStorage.setItem(conceptKey,JSON.stringify([...conceptDone]))}catch(e){};updateConceptStatus()}
function updateConceptStatus(){const el=$("concept-count");if(el)el.textContent="Concept Check Passed "+conceptDone.size+"/8 (별도 기록)"}
window.addEventListener("els:conceptPassed",e=>{const n=Number(e.detail?.stage);if(Number.isInteger(n)&&n>=0&&n<8)markConcept(n)});

try{
 const newer=localStorage.getItem("els-fileio-progress-v2");
 const stored=JSON.parse(newer ?? localStorage.getItem("els-fileio-progress-v1") ?? "[]");
 if(Array.isArray(stored))done=new Set(stored.filter(x=>Number.isInteger(x)&&x>=0&&x<8));
 if(newer===null){
  done.delete(2);done.delete(4);
  if(localStorage.getItem("els-fileio-integrated-m3-reflection")==="saved")done.add(2);
  if(localStorage.getItem("els-fileio-integrated-m4-reflection")==="saved")done.add(4);
 }
}catch(e){}
const persist=()=>{try{localStorage.setItem("els-fileio-progress-v2",JSON.stringify([...done]))}catch(e){}};
window.addEventListener("els:labEvidence",e=>{const n=e.detail?.mission==="m3"?2:e.detail?.mission==="m4"?4:-1;if(n<0||e.detail?.state!=="reflected")return;done.add(n);persist();navigate(current,false);const status=$("step-status");if(status)status.textContent="예측·실험·설명 기록";});
function navigate(i,doScroll=true){current=Math.max(0,Math.min(7,i));stages.forEach((s,j)=>s.hidden=j!==current);
document.querySelectorAll("[data-nav]").forEach((b,j)=>{b.classList.toggle("current",j===current);b.classList.toggle("completed",done.has(j));if(j===current)b.setAttribute("aria-current","step");else b.removeAttribute("aria-current")});
$("step-label").textContent="STEP "+String(current+1).padStart(2,"0")+" / 08";
$("step-status").textContent=done.has(current)?"개념 확인 완료":"학습 중";
$("footer-position").textContent=(current+1)+" / 8";$("prev-stage").disabled=current===0;$("next-stage").disabled=current===7;
$("progress-text").textContent=done.size+" / 8 (학습 활동)";$("progress-fill").style.width=(done.size*12.5)+"%";$("progress-meter").setAttribute("aria-valuenow",done.size);$("completion-message").hidden=done.size<8;updateConceptStatus();
if(doScroll){const target=$("lesson");if(target)target.scrollIntoView({block:"start",behavior:"instant"});if(target)target.focus({preventScroll:true});}}
document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>navigate(Number(b.dataset.nav))));
$("prev-stage").onclick=()=>navigate(current-1);$("next-stage").onclick=()=>navigate(current+1);
document.querySelectorAll("[data-grade]").forEach(btn=>btn.onclick=()=>{const n=Number(btn.dataset.grade),picked=document.querySelector('input[name="q'+n+'"]:checked'),box=$("answer-"+n);if(!picked){box.textContent="먼저 답을 선택해 보세요.";box.classList.add("incorrect");return;}
const good=picked.value===keys[n];box.classList.toggle("incorrect",!good);box.textContent=(good?"정답입니다. ":"다시 생각해 보세요. ")+explanations[n];
if(good){done.add(n);markConcept(n);persist();navigate(current,false);}});
$("clear-progress").onclick=()=>{if(!confirm("현재 브라우저의 학습 진도를 초기화할까요?"))return;done.clear();conceptDone.clear();try{localStorage.setItem(conceptKey,"[]")}catch(e){}updateConceptStatus();persist();document.querySelectorAll(".answer").forEach(el=>{el.textContent="";el.classList.remove("incorrect")});document.querySelectorAll('input[type="radio"]').forEach(el=>el.checked=false);navigate(0)};
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
/* Lesson 07: edited text is the only input for the browser teaching model. */
const sensorModel=window.SensorModel;
if(!sensorModel)throw Error("SensorModel must load before app.js");
let sensorHasRun=false;
const baseSensorCSource=$("sensor-c-source").textContent;
function updateDisplayedSensorC(){
 const threshold=Number($("sensor-threshold").value).toFixed(1);
 $("sensor-c-source").textContent=baseSensorCSource.replace('const double threshold = 3.0;','const double threshold = '+threshold+';');
}
function downloadSensorBlob(text,filename,type){
 const blob=new Blob([text],{type:type||"text/plain;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function sensorInputsChanged(){
 sensorHasRun=false;
 $("threshold-label").textContent=Number($("sensor-threshold").value).toFixed(2);
 updateDisplayedSensorC();
 $("sensor-run-status").textContent="내용이 바뀌었습니다. 새 결과를 확인하려면 Simulate Run을 누르세요.";
 $("sensor-run-status").dataset.state="dirty";
 $("sensor-count").textContent="—";$("sensor-mean").textContent="—";$("sensor-alerts").textContent="—";
 $("sensor-list").replaceChildren();
 $("sensor-stdout").textContent="(not executed)";$("sensor-stderr").textContent="(not executed)";
 $("sensor-trace").textContent="파일을 수정했습니다. 다음 실행 후 반환값이 표시됩니다.";
 $("sensor-return").textContent="최종 반환값: — · 프로그램 종료 코드: —";
 $("sensor-msg").textContent="먼저 평균과 경보 횟수를 예측하세요.";
}
function runSensor(){
 const data=$("sensor-edit").value;
 const threshold=Number($("sensor-threshold").value);
 $("threshold-label").textContent=threshold.toFixed(2);
 let result;
 try{result=sensorModel.simulate(data,threshold)}catch(err){
  $("sensor-run-status").textContent="실습 입력 제한: "+err.message;
  $("sensor-run-status").dataset.state="error";return;
 }
 if(!result.supported){
  $("sensor-run-status").textContent="시뮬레이션 범위 밖의 데이터입니다.";
  $("sensor-run-status").dataset.state="error";
  $("sensor-msg").textContent=result.reason;
  $("sensor-count").textContent="—";$("sensor-mean").textContent="—";$("sensor-alerts").textContent="—";
  $("sensor-list").replaceChildren();
  $("sensor-stdout").textContent="(unsupported)";$("sensor-stderr").textContent="(unsupported)";
  $("sensor-trace").textContent="숫자 형식이 지원되지 않아 계산을 중단했습니다.";
  $("sensor-return").textContent="최종 반환값: 지원 범위 밖 · 프로그램 종료 코드: —";
  return;
 }
 sensorHasRun=true;
 $("sensor-count").textContent=String(result.count);
 $("sensor-mean").textContent=result.successful?(result.average===null?"N/A":result.average.toFixed(3)):"—";
 $("sensor-alerts").textContent=String(result.alerts.length);
 $("sensor-list").replaceChildren();
 for(const r of result.records){
  const item=document.createElement("div");item.className="data-item"+(r.alert?" alert":"");
  const tm=document.createElement("span");tm.textContent="time "+r.time.toFixed(1)+" s";
  const val=document.createElement("strong");val.textContent=r.value.toFixed(2)+(r.alert?" · ALERT":"");
  item.append(tm,val);$("sensor-list").append(item);
 }
 $("sensor-stdout").textContent=result.stdout||"(no output)";
 $("sensor-stderr").textContent=result.stderr||"(no error)";
 $("sensor-trace").replaceChildren();
 for(const event of result.trace){
  const row=document.createElement("div");
  row.className="sensor-trace-row"+(event.fields===2?"":" sensor-trace-terminal");
  const code=document.createElement("strong");
  code.textContent="READ "+event.attempt+" · fscanf → "+event.lastReturn;
  const message=document.createElement("span");message.textContent=event.detail;
  row.append(code,message);$("sensor-trace").append(row);
 }
 $("sensor-return").textContent="최종 fscanf 반환값: "+result.lastReturn+" · 종료 코드: "+result.exitCode;
 $("sensor-run-status").textContent=result.successful?"시뮬레이션 정상 종료 · 정상 EOF":"시뮬레이션 입력 오류 · 파일을 수정하고 다시 실행해 보세요";
 $("sensor-run-status").dataset.state=result.successful?"ok":"error";
 $("sensor-msg").textContent=result.successful?
 "성공한 레코드 "+result.count+"개, 평균 "+(result.average===null?"N/A":result.average.toFixed(3))+", 임계값 "+threshold.toFixed(2)+" 초과 "+result.alerts.length+"개":
 "오류 이전에 읽은 정상 레코드는 "+result.count+"개입니다. 프로그램은 오류를 보고하고 평균 결과를 출력하지 않습니다. 원인: "+result.reason;
}
$("sensor-run").onclick=runSensor;
$("sensor-edit").oninput=sensorInputsChanged;
$("sensor-threshold").oninput=sensorInputsChanged;
$("sensor-scenario").onchange=()=>{
 const key=$("sensor-scenario").value;
 $("sensor-edit").value=sensorModel.cases[key]??sensorModel.sample;
 sensorInputsChanged();
};
$("sensor-restore").onclick=()=>{
 $("sensor-scenario").value="original";
 $("sensor-edit").value=sensorModel.sample;
 $("sensor-threshold").value="3.0";
 sensorInputsChanged();
 $("sensor-run-status").textContent="원본 sensor_log.txt가 복원되었습니다. 실행을 누르면 결과를 확인할 수 있습니다.";
};
$("sensor-download").onclick=()=>downloadSensorBlob($("sensor-edit").value,"sensor_log.txt");
$("sensor-download-c").onclick=()=>downloadSensorBlob($("sensor-c-source").textContent,"sensor_log_analyzer.c","text/x-csrc;charset=utf-8");
sensorInputsChanged();
$("build-check").onclick=()=>{const good=$("blank-mode").value==="r"&&$("blank-read").value==="good"&&$("blank-close").value==="fclose";$("build-feedback").textContent=good?"올바른 선택입니다. fopen 실패 확인, 읽기 반환값, fclose를 모두 갖췄습니다.":"수정이 필요합니다: 읽기 모드 r, fscanf 반환값 == 1, fclose(fp)를 선택하세요."};
navigate(0,false);
})();
