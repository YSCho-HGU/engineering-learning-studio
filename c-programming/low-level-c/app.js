/* Chapter 19: synchronized educational C/code/device simulator, not a C interpreter. */
(function(){
"use strict";
const D=window.C191_DATA,L=window.ELSLanguage;
if(!D||!L)throw Error("C191 data and language required");
const byId=id=>document.getElementById(id);
const tr=(ko,en)=>L.get()==="en"?en:L.get()==="ko"?ko:en+" · "+ko;
const esc=t=>String(t==null?"":t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const binary=n=>(n&255).toString(2).padStart(8,"0");
const hex=n=>"0x"+(n&255).toString(16).toUpperCase().padStart(2,"0");
const state=n=>(n&18)?"ERROR_STATE":(n&1)?"RUNNING":"IDLE";
const read=(key,def)=>{try{return JSON.parse(localStorage.getItem(key))??def}catch(e){return def}};
const initial=()=>({byte:181,target:1,op:"set",operator:"or",step:0,build:0,calls:0,argv:"./sensor data.txt -v",choice:-1,checked:false,note:"",changed:0,trace:"",prediction:null});
let timer=null;const stop=()=>{if(timer!==null){clearTimeout(timer);timer=null;}};
let selected=0;
const match=location.hash.match(/^#s(\d+)$/);
if(match)selected=Math.max(0,Math.min(10,Number(match[1])-1));
let states=read("els-c191-model-v1",{}),done=read("els-c191-done-v1",[]);
if(!Array.isArray(done))done=[];
const initialFor=i=>{const v=initial();if(i===1)v.byte=5;else if(i===2)v.byte=4;else if(i===3)v.byte=0;return v;};
const S=()=>states[selected]||(states[selected]=initialFor(selected));
const save=()=>{try{localStorage.setItem("els-c191-model-v1",JSON.stringify(states));localStorage.setItem("els-c191-done-v1",JSON.stringify(done))}catch(e){}};
const nav=byId("lesson-nav"),stage=byId("lesson");
const btn=(label,action)=>'<button type="button" data-action="'+action+'">'+label+'</button>';
const options=(entries,value)=>entries.map(([v,label])=>'<option value="'+v+'" '+(value==v?"selected":"")+'>'+label+'</option>').join("");
function bits(s){
 return '<div class="c191-bits" role="group" aria-label="Bit register">'+Array.from({length:8},(_,i)=>{
  const b=7-i,on=!!(s.byte&(1<<b));
  return '<button type="button" class="c191-bit '+(on?"on ":"")+(s.target===b?"hot ":"")+(s.changed&(1<<b)?"changed":"")+'" data-bit="'+b+'" aria-label="Bit '+b+' '+(on?"ON":"OFF")+'" aria-pressed="'+on+'"><small>b'+b+'</small><b>'+(on?1:0)+'</b></button>';
 }).join("")+'</div><div class="c191-metrics"><span>Binary '+binary(s.byte)+'</span><span>Hex '+hex(s.byte)+'</span><span>Decimal '+s.byte+'</span></div>';
}
function device(s){
 const names=[[0,"READY"],[1,"ERROR"],[4,"ALARM"],[5,"LOW_BAT"]];
 return '<div class="c191-device"><div class="c191-device-head"><span>'+tr("장치 상태","Device status")+'</span><span>'+state(s.byte)+'</span></div><div class="c191-leds">'+
 names.map(([b,name])=>'<div class="c191-led"><div class="c191-led-dot '+(s.byte&(1<<b)?"on ":"")+(b===1||b===4?"alarm ":"")+(s.changed&(1<<b)?"changed":"")+'" aria-label="'+name+' '+(s.byte&(1<<b)?"ON":"OFF")+'"></div><small>'+name+'</small><small>'+(s.byte&(1<<b)?"ON":"OFF")+'</small></div>').join("")+'</div>'+signalDiagram(s)+'</div>';
}
function signalDiagram(s){
 const alarming=(s.byte&18)!==0,ready=(s.byte&1)!==0;
 const color=alarming?"#e16b73":ready?"#30b692":"#829bac";
 return '<svg class="c191-hardware" viewBox="0 0 580 132" role="img" aria-label="Sensor byte to C logic to device output model">'+
 '<rect x="6" y="28" width="132" height="70" rx="12" class="c191-hardware-box"/>'+
 '<text x="72" y="52" text-anchor="middle" class="c191-hardware-label">SENSOR</text>'+
 '<text x="72" y="77" text-anchor="middle" class="c191-hardware-sub">8-bit byte</text>'+
 '<path d="M142 63 H184" stroke="'+color+'" stroke-width="4" class="c191-hardware-wire" fill="none"/>'+
 '<polygon points="185,63 174,57 174,69" fill="'+color+'"/>'+
 '<rect x="191" y="28" width="150" height="70" rx="12" class="c191-hardware-box"/>'+
 '<text x="266" y="52" text-anchor="middle" class="c191-hardware-label">C MASK / enum</text>'+
 '<text x="266" y="77" text-anchor="middle" class="c191-hardware-sub">'+hex(s.byte)+'</text>'+
 '<path d="M345 63 H388" stroke="'+color+'" stroke-width="4" class="c191-hardware-wire" fill="none"/>'+
 '<polygon points="389,63 378,57 378,69" fill="'+color+'"/>'+
 '<rect x="395" y="28" width="175" height="70" rx="12" class="c191-hardware-box"/>'+
 '<circle cx="418" cy="62" r="11" fill="'+color+'"/>'+
 '<text x="487" y="56" text-anchor="middle" class="c191-hardware-label">DEVICE</text>'+
 '<text x="487" y="79" text-anchor="middle" class="c191-hardware-sub">'+(alarming?"ALARM":ready?"RUNNING":"IDLE")+'</text></svg>';
}
function maskExpression(s){const m="(1u << "+s.target+")";return s.op==="set"?"value |= "+m:s.op==="clear"?"value &= ~"+m:s.op==="toggle"?"value ^= "+m:"result = value & "+m;}
function terminal(s,scene){
 if(scene==="lifetime")return "next_id() → "+(s.calls?1000+s.calls:"not called");
 if(scene==="preprocessor")return ["Source: SQUARE(1+2)","Expanded: 1+2*1+2","Expression result: 5, not 9"][s.build%3];
 if(scene==="modules")return ["Header interface declarations","Source translation units","Two compiled object files","Linker resolves references","Executable sensor program"][s.build%5];
 if(scene==="optional")return "Recursive frames: "+s.build+" / 3";
 if(scene==="cli"){const a=s.argv.trim().split(/\s+/).filter(Boolean);return "argc = "+a.length+"\n"+a.map((t,i)=>"argv["+i+"] = "+t).join("\n");}
 return "status = "+hex(s.byte)+" | "+binary(s.byte)+"\nREADY="+Number(!!(s.byte&1))+"  ERROR="+Number(!!(s.byte&2))+"  ALARM="+Number(!!(s.byte&16))+"\nstate = "+state(s.byte);
}
function sceneHTML(){
 const s=S(),scene=D.lessons[selected].scene;
 let html='<h3>'+tr("시각 모델 · 장치 관찰","Visual model · Device observation")+'</h3>';
 if(["bits","operators","register","state","capstone","review"].includes(scene))html+=bits(s)+device(s);
 if(["operators","register","review"].includes(scene)){
  html+='<div class="c191-task"><label>'+tr("대상 비트","Target bit")+' <select data-setting="target">'+options(Array.from({length:8},(_,i)=>[i,"b"+i]),s.target)+'</select></label><label>'+tr("연산","Operation")+' <select data-setting="op">'+options([["check","Check &"],["set","Set |"],["clear","Clear &~"],["toggle","Toggle ^"]],s.op)+'</select></label>'+btn(tr("마스크 적용","Apply mask"),"mask")+'</div>';
  html+='<p class="c191-legend">'+esc(maskExpression(s))+';</p>';
 }
 if(scene==="operators")html+='<div class="c191-task"><select data-setting="operator">'+options([["and","& 0x02"],["or","| 0x02"],["xor","^ 0x02"],["not","~ (8-bit)"],["left","<< 1"],["right",">> 1"]],s.operator)+'</select>'+btn(tr("비트 연산 실행","Execute operator"),"operator")+'</div>';
 if(scene==="state"||scene==="capstone"){
  html+='<div class="c191-task">'+[[-1,"Reset status"],[0,"READY"],[1,"ERROR"],[4,"ALARM"],[5,"LOW_BAT"]].map(([b,t])=>'<button type="button" data-action="flag" data-flag="'+b+'">'+t+'</button>').join("")+'</div>';
  html+='<p class="c191-caption">'+tr("판정 우선순위: ERROR/ALARM → READY → IDLE","Decision priority: ERROR/ALARM → READY → IDLE")+'</p><div class="c191-states">'+["IDLE","RUNNING","ERROR_STATE"].map(t=>'<span class="c191-state '+(state(s.byte)===t?"active":"")+'">'+t+'</span>').join("")+'</div>';
 }
 if(scene==="preprocessor"||scene==="modules"||scene==="optional"){
  const items=scene==="preprocessor"?["#define","1+2*1+2","5"]:scene==="modules"?["status.h","main.c + status.c","main.o + status.o","Linker","sensor.exe"]:["count_down(3)","count_down(2)","count_down(1)"];
  html+='<div class="c191-files">'+items.map((x,i)=>'<div class="c191-file '+(s.build===i?"active":"")+'">'+esc(x)+'</div>').join('<span class="c191-arrow">→</span>')+'</div>';
  html+='<div class="c191-task">'+btn(tr("다음 단계","Next stage"),"build")+btn("Reset","reset-build")+'</div>';
 }
 if(scene==="lifetime")html+='<div class="c191-memory"><div><small>automatic local</small><br/><strong>new each call</strong></div><div><small>static local</small><br/><strong>'+(1000+s.calls)+'</strong></div><div><small>calls</small><br/><strong>'+s.calls+'</strong></div></div><div class="c191-task">'+btn("Call next_id()","call")+btn("Reset","reset-call")+'</div>';
 if(scene==="cli")html+='<label for="c191-command">'+tr("실행 명령 (간단한 공백 분리 모델)","Command line (simplified whitespace model)")+'</label><div class="c191-task"><input id="c191-command" data-setting="argv" style="flex:1;min-width:170px" value="'+esc(s.argv)+'"/>'+btn(tr("인자 분석","Parse arguments"),"parse")+'</div>';
 if(scene==="review")html+='<p class="c191-caption">'+tr("AI에게 정답을 먼저 요청하지 말고 본인의 bit diagram과 마스크를 검토받으세요.","Draft your bit diagram and masks before using AI for review.")+'</p>';
 html+='<p class="c191-caption c191-trace" aria-live="polite">'+esc(s.trace||tr("Step을 실행하거나 비트를 변경하며 결과를 관찰하세요.","Step through the code or change a bit to observe its effect."))+'</p><div class="c191-terminal" aria-live="polite">'+esc(terminal(s,scene))+'</div>';
 return html;
}
function advance(){
 const s=S(),lines=D.lessons[selected].code.split("\n"),scene=D.lessons[selected].scene;
 if(s.step>=lines.length)return false;
 const before=s.byte;s.step++;
 if(scene==="operators"&&s.step===3)s.byte=0x05|0x02;
 if(scene==="register"&&s.step===2)s.byte=0x04|2;
 if(s.step===lines.length||(scene==="register"&&s.step===2)||(scene==="operators"&&s.step===3))markObserved(s);
 s.changed=(before^s.byte)&255;
 s.trace=tr("실행 단계 ","Execution step ")+s.step+"/"+lines.length+": "+lines[s.step-1].trim()+
 (s.changed?" · "+hex(before)+" → "+hex(s.byte):" · "+tr("레지스터 변경 없음","register unchanged"));
 return true;
}
function play(){
 if(!advance()){stop();refreshVisual();return;}
 if(S().prediction?.observed)render();
 if(S().step<D.lessons[selected].code.split("\n").length)timer=setTimeout(play,650);
 else stop();
 refreshVisual();
}

const predictionScenes=new Set(["bits","operators","register","state","capstone","review"]);
const ledNames=[[0,"READY"],[1,"ERROR"],[4,"ALARM"],[5,"LOW_BAT"]];
function miniBits(n,diff){
 return '<div class="c191-mini-bits">'+Array.from({length:8},(_,i)=>{const b=7-i;return '<span class="'+(n&(1<<b)?"one ":"")+(diff&(1<<b)?"mismatch":"")+'"><small>b'+b+'</small><strong>'+Number(!!(n&(1<<b)))+'</strong></span>';}).join("")+'</div>';
}
function miniLeds(n){return '<div class="c191-mini-leds">'+ledNames.map(([b,name])=>'<span><i class="'+(n&(1<<b)?"lit ":"")+(b===1||b===4?"alarm":"")+'"></i>'+name+'</span>').join("")+'</div>';}
function predictionHTML(s,scene){
 if(!predictionScenes.has(scene))return "";
 const p=s.prediction,stateOnly=scene==="state"||scene==="capstone",expected=p?.expectedByte;
 let h='<section class="c191-panel c191-prediction"><span class="c191-eyebrow">'+tr("1단계 · 먼저 예측","Step 1 · Predict first")+'</span><h3>'+tr("내 예상 결과","My expected result")+'</h3><p class="c191-caption">'+(stateOnly?tr("현재 입력 Byte에 대한 상태를 예측하세요.","Predict the state for the current input byte."):tr("코드를 실행하거나 비트를 조작한 후의 Byte를 예측하세요.","Predict the byte after stepping through code or changing a bit."))+'</p><div class="c191-pred-controls"><div><small>'+tr("현재 Byte","Current byte")+'</small><strong>'+hex(s.byte)+' · '+binary(s.byte)+'</strong></div>'+
 (stateOnly?'<label>'+tr("예상 상태","Expected state")+' <select id="c191-pred-state" '+(p?"disabled":"")+'>'+options([["IDLE","IDLE"],["RUNNING","RUNNING"],["ERROR_STATE","ERROR_STATE"]],p?.expectedState||"IDLE")+'</select></label>':
 '<label>'+tr("예상 Byte (0–255)","Expected byte (0–255)")+' <input id="c191-pred-byte" type="number" min="0" max="255" step="1" value="'+(expected??s.byte)+'" '+(p?"disabled":"")+' /></label>')+
 (p?btn(tr("예측 수정","Edit prediction"),"predict-edit"):btn(tr("예측 고정","Lock prediction"),"predict-save"))+'</div>';
 if(p){
 const diff=p.observed?(expected^s.byte):0;
 h+='<div class="c191-pred-compare"><div class="c191-pred-side"><strong>'+tr("예상 결과","Prediction")+'</strong>'+(stateOnly?'<p>State: <strong>'+p.expectedState+'</strong></p><p class="c191-caption">'+tr("상태만 예측합니다. Byte/LED는 실행 결과에서 확인하세요.","Predict the state only. Inspect bytes and LEDs after execution.")+'</p>':'<div class="c191-pred-value">'+hex(expected)+' · '+binary(expected)+'</div>'+miniBits(expected,diff)+miniLeds(expected)+'<p>State: '+p.expectedState+'</p>')+'</div>'+
 '<div class="c191-pred-side"><strong>'+tr("실행 결과","Observed result")+'</strong>'+(p.observed?'<div class="c191-pred-value">'+hex(s.byte)+' · '+binary(s.byte)+'</div>'+miniBits(s.byte,diff)+miniLeds(s.byte)+'<p>State: '+state(s.byte)+'</p>':'<p class="c191-pred-pending">'+tr("Step/Run 또는 비트 조작 후 표시됩니다.","Revealed after Step/Run or bit interaction.")+'</p>')+'</div></div>';
 if(p.observed){
 const matched=stateOnly?p.expectedState===state(s.byte):expected===s.byte;
 h+='<p class="c191-pred-feedback '+(matched?"matched":"unmatched")+'" role="status">'+(matched?tr("예측이 일치합니다. 어떤 연산·조건이 그 결과를 만들었나요?","Prediction matches. Which operation or condition produced it?"):tr("예측과 다릅니다. 강조된 비트 및 상태 판정 조건을 다시 추적하세요.","Prediction differs. Trace the highlighted bits and state conditions."))+'</p>';
 }
 }else h+='<p class="c191-caption">'+tr("예측을 고정한 뒤 실행하면 두 결과를 비교할 수 있습니다.","Lock your prediction before running to compare both outcomes.")+'</p>';
 return h+'</section>';
}
function markObserved(s){if(s.prediction)s.prediction.observed=true;}
function renderNav(){
 nav.replaceChildren();
 D.groups.forEach(group=>{
  const block=document.createElement("div");block.className="c191-toc-group";
  const title=document.createElement("strong");title.textContent=tr(group.ko,group.title);block.append(title);
  for(let i=group.start;i<group.end;i++){
   const b=document.createElement("button");b.type="button";b.className="c191-nav"+(i===selected?" active":"");b.dataset.lesson=String(i);
   b.textContent=(done.includes(i)?"✓ ":"")+"19."+(i+1)+" "+D.lessons[i].title;
   if(i===selected)b.setAttribute("aria-current","step");block.append(b);
  }nav.append(block);
 });
 byId("progress-text").textContent=tr("학습 확인 ","Sections reviewed ")+done.length+"/11";
 byId("progress-bar").style.width=(100*done.length/11)+"%";
 document.querySelector(".meter")?.setAttribute("aria-valuenow",String(done.length));
 byId("assessment-status").textContent=tr("학습 확인 ","Sections reviewed ")+done.length+"/11";
}
function render(){
 const l=D.lessons[selected],s=S();
 const answerLabels=l.answers.map((a,i)=>l.answersEn?tr(a,l.answersEn[i]):a);
 const intro=byId("c191-intro");if(intro)intro.textContent=tr("하나의 Sensor Status Byte가 C 코드, 상태도, LED 패널과 어떻게 연결되는지 예측하고 관찰합니다.","Predict and observe how one sensor status byte connects C code, a state diagram and LED indicators.");
 const codeLines=l.code.split("\n");
 stage.innerHTML='<div class="c191-flow"><article><span class="c191-eyebrow">CHAPTER 19 · '+(selected+1)+'/11</span><h2>19.'+(selected+1)+' '+esc(l.title)+'</h2><div class="c191-story"><p>'+esc(tr(l.ko,l.en))+'</p><p class="c191-caption">'+esc(tr(l.conceptKo,l.conceptEn))+'</p></div></article>'+predictionHTML(s,l.scene)+
 '<div class="c191-grid"><section class="c191-panel" aria-label="C reference code"><h3>'+tr("코드 실행 줄 추적","Code execution trace")+'</h3><div class="c191-code">'+codeLines.map((line,i)=>'<span class="c191-line '+(s.step>0&&i===Math.min(codeLines.length-1,s.step-1)?"current":"")+'">'+(esc(line)||" ")+'</span>').join("")+'</div><div class="c191-task">'+btn("Step","step")+btn(timer!==null?tr("일시정지","Pause"):"Run","run")+btn("Reset","reset-step")+'</div><p class="c191-caption">'+tr("교육용 C 로직 시각화입니다. GCC 실행 결과는 별도 Coding Challenge로 검증합니다.","Educational C logic model, not an actual compiler. Verify C11 behavior in Coding Challenges.")+'</p></section><section class="c191-panel" id="c191-visual" aria-label="Visual experiment">'+sceneHTML()+'</section></div>'+
 '<div class="c191-grid"><section class="c191-panel"><h3>'+tr("예상 결과 먼저 생각하기","Predict before running")+'</h3><p>'+esc(tr(l.qko,l.qen))+'</p><div class="c191-quiz">'+answerLabels.map((answer,i)=>'<label><input name="c191-answer" type="radio" value="'+i+'" '+(s.choice===i?"checked":"")+'/> '+esc(answer)+'</label>').join("")+'</div><div class="c191-task">'+btn(tr("예측 확인","Check prediction"),"check")+'</div><div class="c191-result" role="status">'+(s.checked?(s.choice===l.correct?tr("정답입니다. 코드와 장치의 관계를 설명해 보세요.","Correct. Explain the code-device relationship."):tr("비트와 실행 조건을 다시 관찰하세요.","Revisit the bits and conditions.")):tr("답을 고른 뒤 확인하세요.","Choose your answer before checking."))+'</div></section>'+
 '<section class="c191-panel"><h3>'+tr("원리 설명과 응용","Explain and apply")+'</h3><p>'+esc(tr(l.insightKo,l.insightEn))+'</p><label for="c191-note">'+tr("내 생각 기록","My reasoning notes")+'</label><textarea id="c191-note" rows="4" style="width:100%;background:var(--els-surface-alt);color:var(--els-ink);border:1px solid var(--els-border);border-radius:8px;padding:9px">'+esc(s.note)+'</textarea><div class="c191-task">'+btn(done.includes(selected)?tr("학습 기록됨 ✓","Reviewed ✓"):tr("학습 확인 기록","Record review"),"complete")+'</div></section></div>'+
 '<nav class="c191-links"><a href="./practice/#p'+Math.min(selected+1,6)+'">'+tr("관련 Coding Challenge","Related Coding Challenge")+' →</a>'+(selected<10?'<a href="#s'+(selected+2)+'">'+tr("다음 Section","Next section")+' →</a>':'')+'</nav></div>';
 renderNav();
 window.ELSCourseShell?.refreshArrows?.();
}
function changeSection(index){
 if(index<0||index>10)return;
 stop();selected=index;history.replaceState(null,"","#s"+(index+1));render();
 window.scrollTo({top:0,behavior:"instant"});
}
function refreshVisual(){
 byId("c191-visual").innerHTML=sceneHTML();
 const lines=stage.querySelectorAll(".c191-line"),s=S();
 const runBtn=stage.querySelector('button[data-action="run"]');if(runBtn)runBtn.textContent=timer!==null?tr("일시정지","Pause"):"Run";
 lines.forEach((el,i)=>el.classList.toggle("current",s.step>0&&i===Math.min(lines.length-1,s.step-1)));
 save();
}
nav.addEventListener("click",event=>{
 const b=event.target.closest("button[data-lesson]");if(b)changeSection(Number(b.dataset.lesson));
});
stage.addEventListener("click",event=>{
 const b=event.target.closest("button[data-action],button[data-bit]");if(!b)return;
 const s=S(),scene=D.lessons[selected].scene;
 if(b.dataset.bit!==undefined){stop();const before=s.byte;s.byte^=1<<Number(b.dataset.bit);s.byte&=255;s.changed=before^s.byte;s.step=0;s.trace="b"+b.dataset.bit+": "+hex(before)+" → "+hex(s.byte);markObserved(s);render();return;}
 const action=b.dataset.action,mask=1<<s.target;
 if(action==="predict-save"){const stateOnly=scene==="state"||scene==="capstone";const input=byId("c191-pred-byte");const n=stateOnly?s.byte:Number(input?.value);if(!stateOnly&&(!input?.value.trim()||!Number.isInteger(n)||n<0||n>255)){input?.setCustomValidity(tr("0–255 정수를 입력하세요.","Enter an integer from 0 to 255."));input?.reportValidity();return;}s.prediction={expectedByte:n,expectedState:stateOnly?byId("c191-pred-state").value:state(n),observed:false};save();render();return;}
 if(action==="predict-edit"){s.prediction=null;save();render();return;}
 if(action==="run"){
  if(timer!==null)stop();
  else {if(s.step>=D.lessons[selected].code.split("\n").length){s.step=0;s.byte=initialFor(selected).byte;s.changed=0;if(s.prediction)s.prediction.observed=false;}play();return;}
 }
 if(action!=="run")stop();
 if(action==="step"){advance();if(s.prediction?.observed){render();return;}}
 if(action==="reset-step"){const original=initialFor(selected);s.byte=original.byte;s.step=0;s.build=0;s.calls=0;s.changed=0;s.prediction=null;s.trace=tr("초기 상태 복원","Initial state restored");}
 if(action==="mask"){const before=s.byte;if(s.op==="set")s.byte|=mask;else if(s.op==="clear")s.byte&=~mask;else if(s.op==="toggle")s.byte^=mask;s.byte&=255;s.changed=before^s.byte;s.step=0;s.trace=maskExpression(s)+"; "+hex(before)+" → "+hex(s.byte);markObserved(s);}
 if(action==="operator"){const n=s.byte,op=s.operator;s.byte=op==="and"?n&2:op==="or"?n|2:op==="xor"?n^2:op==="not"?(~n)&255:op==="left"?(n<<1)&255:n>>>1;s.changed=n^s.byte;s.step=0;s.trace=hex(n)+" "+({and:"& 0x02",or:"| 0x02",xor:"^ 0x02",not:"~ (8-bit)",left:"<< 1",right:">> 1"}[op])+" → "+hex(s.byte);markObserved(s);}
 if(action==="flag"){const before=s.byte,bit=Number(b.dataset.flag);s.byte=bit===-1?0:s.byte^(1<<bit);s.changed=before^s.byte;s.step=0;s.trace=tr("입력 변경","Input changed")+": "+hex(before)+" → "+hex(s.byte)+"; "+state(s.byte);markObserved(s);}
 if(action==="build")s.build=(s.build+1)%(scene==="modules"?5:3);
 if(action==="reset-build")s.build=0;
 if(action==="call")s.calls++;
 if(action==="reset-call")s.calls=0;
 if(["reset-step","build","reset-build","call","reset-call","parse"].includes(action))s.changed=0;
 if(action==="parse"){s.step=0;s.trace=tr("인자 분석 완료","Arguments parsed");}
 if(action==="check")s.checked=s.choice>=0;
 if(action==="complete"){if(!done.includes(selected))done.push(selected);save();render();return;}
 if(["mask","operator","flag","reset-step"].includes(action))render();else refreshVisual();
});
stage.addEventListener("change",event=>{
 const e=event.target,s=S();
 if(e.name==="c191-answer"){s.choice=Number(e.value);s.checked=false;save();render();return;}
 if(e.dataset.setting){stop();s[e.dataset.setting]=e.dataset.setting==="target"?Number(e.value):e.value;s.changed=0;refreshVisual();}
});
stage.addEventListener("input",event=>{
 if(event.target.id==="c191-note")S().note=event.target.value;
 if(event.target.id==="c191-command")S().argv=event.target.value;
 save();
});
window.addEventListener("hashchange",()=>{
 const m=location.hash.match(/^#s(\d+)$/);
 if(m&&Number(m[1])-1!==selected){stop();selected=Math.max(0,Math.min(10,Number(m[1])-1));render();}
});
L.subscribe(()=>{
 stop();
 const isNote=document.activeElement?.id==="c191-note";
 const cursor=isNote?document.activeElement.selectionStart:0;
 const x=window.scrollX,y=window.scrollY;render();
 if(isNote){byId("c191-note").focus({preventScroll:true});byId("c191-note").setSelectionRange(cursor,cursor);}
 requestAnimationFrame(()=>window.scrollTo(x,y));
});
render();
})();