
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
function navigate(i){current=Math.max(0,Math.min(7,i));stages.forEach((s,j)=>s.hidden=j!==current);
document.querySelectorAll("[data-nav]").forEach((b,j)=>{b.classList.toggle("current",j===current);b.classList.toggle("completed",done.has(j));if(j===current)b.setAttribute("aria-current","step");else b.removeAttribute("aria-current")});
$("step-label").textContent="STEP "+String(current+1).padStart(2,"0")+" / 08";
$("step-status").textContent=done.has(current)?"학습 완료":"학습 중";
$("footer-position").textContent=(current+1)+" / 8";$("prev-stage").disabled=current===0;$("next-stage").disabled=current===7;
$("progress-text").textContent=done.size+" / 8";$("progress-fill").style.width=(done.size*12.5)+"%";$("progress-meter").setAttribute("aria-valuenow",done.size);$("completion-message").hidden=done.size<8;
window.scrollTo({top:0,behavior:"instant"});}
document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>navigate(Number(b.dataset.nav))));
$("prev-stage").onclick=()=>navigate(current-1);$("next-stage").onclick=()=>navigate(current+1);
document.querySelectorAll("[data-grade]").forEach(btn=>btn.onclick=()=>{const n=Number(btn.dataset.grade),picked=document.querySelector('input[name="q'+n+'"]:checked'),box=$("answer-"+n);if(!picked){box.textContent="먼저 답을 선택해 보세요.";box.classList.add("incorrect");return;}
const good=picked.value===keys[n];box.classList.toggle("incorrect",!good);box.textContent=(good?"정답입니다. ":"다시 생각해 보세요. ")+explanations[n];
if(good){done.add(n);persist();navigate(current);}});
$("clear-progress").onclick=()=>{if(!confirm("현재 브라우저의 학습 진도를 초기화할까요?"))return;done.clear();persist();document.querySelectorAll(".answer").forEach(el=>{el.textContent="";el.classList.remove("incorrect")});document.querySelectorAll('input[type="radio"]').forEach(el=>el.checked=false);navigate(0)};
$("theme-button").onclick=()=>{document.documentElement.style.colorScheme=document.documentElement.style.colorScheme==="dark"?"light":"dark"};
$("end-process").onclick=()=>{$("memory-value").textContent="(program ended)";$("memory-msg").textContent="실행 중 변수는 사라졌지만, scores.txt 데이터는 그대로 남습니다."};
$("start-process").onclick=()=>{$("memory-value").textContent="score = 0 (new run)";$("memory-msg").textContent="새 실행의 변수는 새 상태로 시작합니다. 파일 데이터는 다시 읽어올 수 있습니다."};
$("stream-target").onchange=()=>{const data={
stdout:["Terminal · 정상 출력",'fprintf(stdout, "READY\\n");',"stdout은 일반 출력용 Stream입니다.","→"],
stderr:["Terminal · 오류 출력",'fprintf(stderr, "Cannot open file\\n");',"stderr는 오류·진단 메시지를 분리할 때 유용합니다.","→"],
file:["sensor.txt · File Stream",'fprintf(fp, "READY\\n");',"fp를 통해 열린 파일로 출력합니다.","→"],
stdin:["Keyboard · 입력",'fgets(line, sizeof line, stdin);',"stdin은 프로그램으로 들어오는 표준 입력 Stream입니다.","←"]
}[$("stream-target").value];$("stream-destination").textContent=data[0];$("stream-code").textContent=data[1];$("stream-explain").textContent=data[2];$("stream-arrow").textContent=data[3]};

let file=["25.0","26.5"],streamOpen=false,streamMode="r",position=0,readOutput=[],readFinished=false,wrote=false;
function escapeSource(v){return v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function codeFor(m){
 if(m==="r")return [
 ["open",'FILE *fp = fopen("sensor.txt", "r");'],
 ["check","if (fp == NULL) return 1;"],
 ["declaration","char line[80];"],
 ["read","while (fgets(line, sizeof line, fp) != NULL) {"],
 ["out","    fputs(line, stdout);"],
 ["loopend","}"],
 ["close","fclose(fp);"]];
 return [["open",'FILE *fp = fopen("sensor.txt", "'+m+'");'],
 ["check","if (fp == NULL) return 1;"],
 ["write",'fprintf(fp, "%.1f\\n", 27.2);'],
 ["close","fclose(fp);"]];
}
function renderFile(line,message){
 const m=streamOpen?streamMode:$("open-mode").value;
 $("mode-file").textContent=file.length?file.join("\n"):"(empty file)";
 $("mode-output").textContent=readOutput.length?readOutput.join("\n"):"(no output)";
 $("mode-status").textContent=streamOpen?"Stream: OPEN ("+streamMode+"), position "+position+" / "+file.length:"Stream: CLOSED";
 $("mode-explain").textContent=message;
 $("mode-open").disabled=streamOpen;
 $("mode-read").hidden=m!=="r";
 $("mode-write").hidden=m==="r";
 $("mode-read").disabled=!streamOpen||m!=="r"||readFinished;
 $("mode-write").disabled=!streamOpen||m==="r"||wrote;
 $("mode-close").disabled=!streamOpen||(m==="r"&&!readFinished)||(m!=="r"&&!wrote);
 $("open-mode").disabled=streamOpen;
 $("mode-path").textContent=m==="r"?"READ PATH · fopen → fgets + fputs (반복) → EOF → fclose":m==="w"?"WRITE PATH · fopen (기존 내용 삭제) → fprintf → fclose":"APPEND PATH · fopen → fprintf → fclose";
 $("mode-code").innerHTML=codeFor(m).map(([key,src],i)=>'<div role="listitem" class="live-row'+(key===line?' selected':'')+'"><span>'+(i+1)+'</span><span>'+escapeSource(src)+'</span></div>').join("");
 let title,detail;
 if(!streamOpen){title="다음 동작: fopen()";detail="파일 열기 모드를 선택하세요."}
 else if(m==="r"&&!readFinished){title="다음 동작: fgets()";detail=position<file.length?"성공하면 fputs()가 자동으로 이어서 실행됩니다.":"두 줄을 읽었지만 종료는 아직 아닙니다. 세 번째 fgets()에서 NULL을 확인하세요."}
 else if(m==="r"){title="다음 동작: fclose()";detail="세 번째 fgets()가 NULL을 반환했으므로 while 조건이 거짓입니다."}
 else if(!wrote){title="다음 동작: fprintf()";detail="쓰기 모드로 열었습니다. 27.2 한 줄을 기록하세요."}
 else {title="다음 동작: fclose()";detail="쓰기 작업이 끝났습니다. Stream을 닫으세요."}
 $("mode-next-title").textContent=title;$("mode-next-detail").textContent=detail;
}
$("mode-open").onclick=()=>{if(streamOpen)return;streamMode=$("open-mode").value;streamOpen=true;position=0;readFinished=false;wrote=false;readOutput=[];if(streamMode==="w")file=[];if(streamMode==="a")position=file.length;
 renderFile("open",streamMode==="r"?"r 모드: 첫 줄부터 읽습니다.":streamMode==="w"?"w 모드: 파일을 열면서 기존 내용이 삭제되었습니다.":"a 모드: 기존 내용을 유지하고 파일 끝에 추가합니다.")};
$("mode-read").onclick=()=>{if(!streamOpen||streamMode!=="r"||readFinished)return;if(position>=file.length){readFinished=true;renderFile("read","fgets() → NULL. while 조건이 거짓이므로 반복문 종료. 다음은 fclose(fp)입니다.");return}
 const item=file[position++];readOutput.push(item);renderFile("out","fgets()가 "+item+"을 읽고 fputs()가 자동 실행되어 stdout에 출력했습니다. 이제 while 조건으로 되돌아갑니다.")};
$("mode-write").onclick=()=>{if(!streamOpen||streamMode==="r"||wrote)return;file.push("27.2");position=file.length;wrote=true;renderFile("write","fprintf()가 27.2를 기록했습니다. 다음은 fclose(fp)입니다.")};
$("mode-close").onclick=()=>{if(!streamOpen)return;streamOpen=false;renderFile("close","fclose(fp) 완료. 파일 내용은 유지됩니다. 다른 모드를 선택하여 다시 열 수 있습니다.")};
$("mode-restart").onclick=()=>{streamOpen=false;position=0;readFinished=false;wrote=false;readOutput=[];renderFile(null,"프로그램 상태만 초기화했습니다. 저장된 파일은 유지됩니다.")};
$("mode-reset").onclick=()=>{file=["25.0","26.5"];streamOpen=false;position=0;readFinished=false;wrote=false;readOutput=[];$("open-mode").value="r";renderFile(null,"원본 sensor.txt(25.0, 26.5)를 복원했습니다.")};
$("open-mode").onchange=()=>renderFile(null,"새 모드를 선택했습니다. fopen()을 눌러 실행 경로를 시작하세요.");
const patterns={line:['fgets',"char line[120];\nwhile (fgets(line, sizeof line, fp) != NULL) {\n    fputs(line, stdout);\n}"],values:['fscanf','int id; double value;\nif (fscanf(fp, "%d %lf", &id, &value) == 2) {\n    /* both values read */\n}'],write:['fprintf','fprintf(fp, "%d %.1f\\n", id, score);'],char:['fgetc','int ch;\nwhile ((ch = fgetc(fp)) != EOF) {\n    putchar(ch);\n}']};
$("io-check").onclick=()=>{const which=$("io-task").value,want=patterns[which][0],actual=$("io-fn").value;$("io-feedback").textContent=!actual?"먼저 함수를 선택하세요.":actual===want?"정답! 데이터의 단위와 함수 반환값을 함께 확인하세요.":"요구된 데이터 형식을 다시 확인하고 다른 함수를 선택하세요.";if(actual===want)$("io-pattern").textContent=patterns[which][1];};
$("io-task").onchange=()=>{$("io-fn").value="";$("io-feedback").textContent="먼저 사용할 함수를 예측하세요."};
let eof=0;
function eofReset(){eof=0;$("eof-attempts").textContent="0";$("eof-result").textContent="아직 읽지 않음";$("eof-flag").textContent="feof(fp) = 0";$("eof-trace").textContent="읽기 버튼을 누르면 기록이 나타납니다.";$("eof-message").textContent="3번의 성공적인 읽기 후 네 번째 시도에 주목하세요."}
$("eof-read").onclick=()=>{eof++;$("eof-attempts").textContent=String(eof);const good=eof<=3,vals=[10,20,30];$("eof-result").textContent=good?"return 1 · x = "+vals[eof-1]:"return EOF · no conversion";$("eof-flag").textContent="feof(fp) = "+(good?0:1);const note="Attempt "+eof+": "+(good?"read "+vals[eof-1]+", return 1":"read failed at EOF, return EOF");$("eof-trace").textContent=($("eof-trace").textContent.startsWith("읽기 버튼")?"":$("eof-trace").textContent+"\n")+note;$("eof-message").textContent=good?"읽기가 성공했으므로 루프 본문을 실행합니다.":"읽기 실패 뒤 EOF가 설정됩니다. while (fscanf(...) == 1)은 종료됩니다."};
$("eof-reset").onclick=eofReset;
let record=null;
$("rec-save").onclick=()=>{const id=Number($("rec-id").value),name=$("rec-name").value.trim(),score=Number($("rec-score").value);
if(!Number.isInteger(id)||id<0||id>999999||!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)||name.length>39||!Number.isFinite(score)||score<0||score>100){$("rec-message").textContent="ID는 0 이상 정수, 이름은 공백 없는 영문·숫자·밑줄, 점수는 0~100 범위로 입력하세요.";return;}
record={id,name,score};$("rec-file").textContent=id+" "+name+" "+score.toFixed(1);$("rec-result").textContent="(load required)";$("rec-message").textContent="fprintf()가 구조체의 멤버를 텍스트 한 줄로 직렬화했습니다."};
$("rec-load").onclick=()=>{if(!record){$("rec-message").textContent="먼저 Serialize를 수행하세요.";return;}$("rec-result").textContent="Student {\n  id: "+record.id+",\n  name: \""+record.name+"\",\n  score: "+record.score.toFixed(1)+"\n}";$("rec-message").textContent="fscanf()가 3개 항목을 모두 읽은 경우에만 구조체 레코드를 복원합니다."};
const sensor=[[0.0,2.51],[0.1,2.55],[0.2,2.48],[0.3,3.82]];
function renderSensor(){const threshold=Number($("sensor-threshold").value),avg=sensor.reduce((s,x)=>s+x[1],0)/sensor.length;const alerts=sensor.filter(x=>x[1]>threshold);$("threshold-label").textContent=threshold.toFixed(2);$("sensor-count").textContent=sensor.length;$("sensor-mean").textContent=avg.toFixed(3);$("sensor-alerts").textContent=String(alerts.length);$("sensor-list").innerHTML=sensor.map(([t,v])=>'<div class="data-item'+(v>threshold?' alert':'')+'"><span>time '+t.toFixed(1)+' s</span><strong>'+v.toFixed(2)+(v>threshold?' · ALERT':'')+'</strong></div>').join("");$("sensor-msg").textContent="평균 "+avg.toFixed(3)+", 임계값 "+threshold.toFixed(2)+" 초과 "+alerts.length+"개";} $("sensor-threshold").oninput=renderSensor;
$("build-check").onclick=()=>{const good=$("blank-mode").value==="r"&&$("blank-read").value==="good"&&$("blank-close").value==="fclose";$("build-feedback").textContent=good?"올바른 선택입니다. fopen 실패 확인, 읽기 반환값, fclose를 모두 갖췄습니다.":"수정이 필요합니다: 읽기 모드 r, fscanf 반환값 == 1, fclose(fp)를 선택하세요."};
renderFile(null,"먼저 r 모드로 열고 한 줄씩 읽어 보세요.");eofReset();renderSensor();navigate(0);
})();
