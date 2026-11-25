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
const initial=()=>({byte:181,target:1,op:"set",operator:"or",step:0,build:0,calls:0,argv:"./sensor data.txt",choice:-1,checked:false,note:"",changed:0,trace:"",prediction:null});
let timer=null;const stop=()=>{if(timer!==null){clearTimeout(timer);timer=null;}};
let selected=0;
const match=location.hash.match(/^#s(\d+)$/);
if(match)selected=Math.max(0,Math.min(10,Number(match[1])-1));
let states=read("els-c191-model-v1",{}),done=read("els-c191-done-v1",[]);
if(!states||typeof states!=="object"||Array.isArray(states))states={};
if(!Array.isArray(done))done=[];
const initialFor=i=>{const v=initial();if(i===1){v.byte=0;v.step=0;v.operator="or";v.experimentByte=5;}else if(i===2)v.byte=4;else if(i===3)v.byte=0;return v;};
const S=()=>states[selected]||(states[selected]=initialFor(selected));
// Versioned reset: older Chapter 19.2 records used a sensor byte, not three variables.
if(states[1]&&!states[1].operatorModelV2){const keep={note:states[1].note||"",choice:states[1].choice??-1};states[1]={...initialFor(1),...keep,operatorModelV2:true};}
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
 const register=D.lessons[selected].scene==="register";
 const names=register?Array.from({length:8},(_,bit)=>[bit,"LED"+bit]):[[0,"READY"],[1,"ERROR"],[4,"ALARM"],[5,"LOW_BAT"]];
 return '<div class="c191-device"><div class="c191-device-head"><span>'+(register?tr("LED 출력 레지스터","LED output register"):tr("장치 상태","Device status"))+'</span><span>'+(register?hex(s.byte):state(s.byte))+'</span></div><div class="c191-leds">'+
 names.map(([b,name])=>'<div class="c191-led"><div class="c191-led-dot '+(s.byte&(1<<b)?"on ":"")+(!register&&(b===1||b===4)?"alarm ":"")+(s.changed&(1<<b)?"changed":"")+'" aria-label="'+name+' '+(s.byte&(1<<b)?"ON":"OFF")+'"></div><small>'+name+'</small><small>'+(s.byte&(1<<b)?"ON":"OFF")+'</small></div>').join("")+'</div>'+signalDiagram(s)+'</div>';
}
function signalDiagram(s){
 const register=D.lessons[selected].scene==="register";
 const alarming=!register&&(s.byte&18)!==0,ready=(s.byte&1)!==0;
 const color=register?"#30b692":alarming?"#e16b73":ready?"#30b692":"#829bac";
 return '<svg class="c191-hardware" viewBox="0 0 580 132" role="img" aria-label="Sensor byte to C logic to device output model">'+
 '<rect x="6" y="28" width="132" height="70" rx="12" class="c191-hardware-box"/>'+
 '<text x="72" y="52" text-anchor="middle" class="c191-hardware-label">'+(register?"LED REGISTER":"SENSOR")+'</text>'+
 '<text x="72" y="77" text-anchor="middle" class="c191-hardware-sub">8-bit byte</text>'+
 '<path d="M142 63 H184" stroke="'+color+'" stroke-width="4" class="c191-hardware-wire" fill="none"/>'+
 '<polygon points="185,63 174,57 174,69" fill="'+color+'"/>'+
 '<rect x="191" y="28" width="150" height="70" rx="12" class="c191-hardware-box"/>'+
 '<text x="266" y="52" text-anchor="middle" class="c191-hardware-label">'+(register?"C LED MASK":"C MASK / enum")+'</text>'+
 '<text x="266" y="77" text-anchor="middle" class="c191-hardware-sub">'+hex(s.byte)+'</text>'+
 '<path d="M345 63 H388" stroke="'+color+'" stroke-width="4" class="c191-hardware-wire" fill="none"/>'+
 '<polygon points="389,63 378,57 378,69" fill="'+color+'"/>'+
 '<rect x="395" y="28" width="175" height="70" rx="12" class="c191-hardware-box"/>'+
 '<circle cx="418" cy="62" r="11" fill="'+color+'"/>'+
 '<text x="487" y="56" text-anchor="middle" class="c191-hardware-label">'+(register?"LED ARRAY":"DEVICE")+'</text>'+
 '<text x="487" y="79" text-anchor="middle" class="c191-hardware-sub">'+(register?"LED OUTPUT":alarming?"ALARM":ready?"RUNNING":"IDLE")+'</text></svg>';
}
function maskExpression(s){const m="(1u << "+s.target+")";return s.op==="set"?"value |= "+m:s.op==="clear"?"value &= ~"+m:s.op==="toggle"?"value ^= "+m:"result = value & "+m;}
function terminal(s,scene){
 if(scene==="lifetime")return "next_id() → "+(s.calls?1000+s.calls:"not called");
 if(scene==="preprocessor")return ["Source: SQUARE(1+2)","Expanded: 1+2*1+2","Expression result: 5, not 9"][s.build%3];
 if(scene==="modules")return ["Header interface declarations","Source translation units","Two compiled object files","Linker resolves references","Executable sensor program"][s.build%5];
 if(scene==="optional")return ["union shares storage","function pointer stores an address","DEBUG is enabled only when defined"][s.build%3];
 if(scene==="cli"){if(!s.parsed)return tr("Parse arguments를 누르면 argc와 argv가 나타납니다.","Press Parse arguments to inspect argc and argv.");const a=s.argv.trim().split(/\s+/).filter(Boolean);return "argc = "+a.length+"\n"+a.map((t,i)=>"argv["+i+"] = "+t).join("\n")+"\n"+(a.length===2?"argc == 2: file path accepted":"argc != 2: return 1");}
 return "status = "+hex(s.byte)+" | "+binary(s.byte)+"\nREADY="+Number(!!(s.byte&1))+"  ERROR="+Number(!!(s.byte&2))+"  ALARM="+Number(!!(s.byte&16))+"\nstate = "+state(s.byte);
}

function operatorVars(s){
 const step=Math.min(Math.max(0,s.step),3);
 const cells=[["a",step>=1?5:null],["b",step>=2?2:null],["result",step>=3?7:null]];
 return '<div class="c191-op-flow">'+cells.map(([name,n],i)=>
 '<div class="c191-op-variable '+(step===i+1?"current":"")+'" data-variable="'+name+'"><div class="c191-op-variable-head"><strong>'+name+'</strong><span>'+ (n===null?tr("초기화 전","Not initialized"):tr("초기화됨","Initialized"))+'</span></div>'+
 (n===null?'<div class="c191-op-unknown">'+tr("Unknown","Unknown")+'</div><div class="c191-op-unknown-bits">'+Array.from({length:8},(_,j)=>'<span><small>b'+(7-j)+'</small><b>?</b></span>').join("")+'</div>':
 '<div class="c191-op-number">'+hex(n)+' <small>('+n+')</small></div>'+miniBits(n,0))+'</div>').join('<span class="c191-op-join">→</span>')+'</div>'+
 '<div class="c191-op-equation" aria-live="polite">'+(step<3?
 tr("a와 b가 초기화되면 OR 연산으로 result를 계산합니다.","After a and b are initialized, OR computes result."):
 '<code>0000 0101 | 0000 0010 = 0000 0111</code>')+'</div>'+
 '<p class="c191-caption">'+tr("순서: a 초기화 → b 초기화 → result = a | b. Unknown은 아직 선언·초기화된 값을 보여주지 않았다는 교육용 표시이며 실제 C 값이 아닙니다.","Order: initialize a → initialize b → result = a | b. Unknown is a visual placeholder before declarations execute, not a real C value.")+'</p>';
}
function operatorExperiment(s){
 const n=Number.isInteger(s.experimentByte)?s.experimentByte:5;
 const op=s.operator||"or";
 return '<section class="c191-panel c191-op-experiment"><span class="c191-eyebrow">'+tr("추가 실험 · 독립된 변수","Extra exploration · Separate value")+'</span><h3>'+tr("다른 비트 연산도 실험하기","Try other bitwise operations")+'</h3>'+
 '<p class="c191-caption">'+tr("위의 a, b, result 예제에는 영향을 주지 않습니다. 별도 실험 레지스터에만 적용됩니다.","This experiment changes only its own register; it never changes a, b, or result above.")+'</p>'+
 '<div class="c191-task"><label>'+tr("연산","Operation")+' <select data-setting="operator">'+options([["and","& 0x02"],["or","| 0x02"],["xor","^ 0x02"],["not","~ (8-bit)"],["left","<< 1"],["right",">> 1"]],op)+'</select></label>'+btn(tr("실험 실행","Try operation"),"operator")+btn("Reset","reset-operator")+'</div>'+
 miniBits(n,0)+'<div class="c191-metrics"><span>Binary '+binary(n)+'</span><span>Hex '+hex(n)+'</span><span>Decimal '+n+'</span></div><p class="c191-caption" aria-live="polite">'+esc(s.experimentTrace||tr("초기 실험값 0x05. 연산을 선택해 결과를 관찰하세요.","Experiment starts at 0x05. Choose an operator to observe the result."))+'</p></section>';
}


function sceneTitle(scene){
 const labels={
 bits:["Byte와 비트 표현","Byte and bit representation"],
 operators:["변수 초기화와 OR 결과","Variable initialization and OR result"],
 register:["LED 출력 레지스터","LED output register"],
 state:["상태 판정과 우선순위","State decoding and priority"],
 preprocessor:["매크로 확장 과정","Macro expansion stages"],
 modules:["파일과 빌드 단계","Files and build stages"],
 lifetime:["함수 호출과 변수 수명","Function calls and lifetime"],
 cli:["명령행 인자와 파일 열기","Arguments and file opening"],
 capstone:["센서 입력과 상태 출력","Sensor input and decoded state"],
 optional:["선택적 C 기능","Optional C concepts"],
 review:["마스크의 변화 추적","Trace the mask operation"]
 };
 return tr(...(labels[scene]||["시각 모델","Visual model"]));
}
function extraHTML(s,scene){
 if(scene==="operators")return operatorExperiment(s);
 if(scene==="register"||scene==="review"){
  return '<section class="c191-panel c191-extra"><span class="c191-eyebrow">'+tr("별도 연습","Independent exploration")+'</span><h3>'+tr("비트 마스크 직접 실험","Explore a bit mask")+'</h3><p class="c191-caption">'+tr("여기에서 실행하는 Set/Clear/Toggle은 위의 예제 코드와 독립된 조작입니다.","Set, Clear and Toggle here are separate from the reference code above.")+'</p>'+
  '<div class="c191-task"><label>'+tr("대상 비트","Target bit")+' <select data-setting="target">'+options(Array.from({length:8},(_,i)=>[i,"b"+i]),s.target)+'</select></label><label>'+tr("연산","Operation")+' <select data-setting="op">'+options([["check","Check &"],["set","Set |"],["clear","Clear &~"],["toggle","Toggle ^"]],s.op)+'</select></label>'+btn(tr("마스크 적용","Apply mask"),"mask")+btn("Reset","reset-mask")+'</div>'+miniBits(Number.isInteger(s.maskByte)?s.maskByte:s.byte,0)+'<p class="c191-legend">'+esc(s.maskTrace||maskExpression(s))+';</p></section>';
 }
 if(scene==="state"||scene==="capstone"){
  return '<section class="c191-panel c191-extra"><span class="c191-eyebrow">'+tr("추가 입력 실험","Explore another input")+'</span><h3>'+tr("센서 플래그 바꾸기","Change sensor flags")+'</h3><p class="c191-caption">'+tr("입력 비트를 바꾸면 우선순위 규칙에 따라 상태를 다시 판정합니다.","Changing the input bits re-evaluates the state according to the priority rule.")+'</p>'+
  '<div class="c191-task">'+[[-1,"Reset status"],[0,"READY"],[1,"ERROR"],[4,"ALARM"],[5,"LOW_BAT"]].map(([b,name])=>'<button type="button" data-action="flag" data-flag="'+b+'">'+name+'</button>').join("")+'</div></section>';
 }
 return "";
}
function traceModel(s,scene){
 const k=Math.max(0,s.step||0),args=s.argv.trim().split(/\s+/).filter(Boolean),argc=args.length;
 const stages={
  preprocessor:[
   ["#define SQUARE(x) x*x",tr("매크로 정의: 아직 함수를 호출하지 않았습니다.","Macro definition; no function is called."),0],
   ["SQUARE(1+2)",tr("소스의 매크로 호출을 확인합니다.","Locate the macro invocation."),1],
   ["1+2*1+2",tr("전처리기가 토큰을 치환합니다.","Preprocessor substitutes tokens."),1],
   ["5",tr("컴파일된 식을 계산하면 5입니다. 9가 아닙니다.","C evaluates the expanded expression to 5, not 9."),1]
  ],
  modules:[
   ["status.h",tr("헤더에서 led_set의 선언을 확인합니다.","Read the led_set declaration in the header."),3],
   ["main.c + status.c",tr("각 소스 파일은 헤더를 포함하여 별도 번역 단위가 됩니다.","Each .c file is a separate translation unit."),5],
   ["main.o + status.o",tr("각 번역 단위를 컴파일합니다.","Compile each translation unit."),5],
   ["Linker",tr("링커가 main.o의 호출을 status.o의 정의에 연결합니다.","Linker resolves main.o's call using the definition in status.o."),6],
   ["Executable",tr("정의가 있으면 링크되어 실행 파일이 만들어집니다.","The executable is created if all references resolve."),6]
  ]
 };
 if(scene==="preprocessor"||scene==="modules"){
  const rows=stages[scene],idx=k===0?-1:Math.min(k-1,rows.length-1);
  return {rows,idx,focus:idx<0?null:rows[idx][2],message:idx<0?tr("Step을 눌러 첫 단계부터 확인하세요.","Use Step to start the trace."):rows[idx][1],done:idx===rows.length-1};
 }
 if(scene==="lifetime"){
  const phase=k===0?0:(k-1)%4,call=k===0?0:Math.ceil(k/4),value=1000+Math.max(0,call-1)+(phase===3?1:0);
  const stages=[
   tr("첫 호출 전: static 객체의 초기화 값은 1000입니다.","Before the first call, the static object's initializer is 1000."),
   tr("함수에 진입합니다. static 저장 공간은 새로 생성되지 않습니다.","Enter function. Static storage is not recreated."),
   tr("count는 이전 호출에서 유지된 값을 갖습니다.","count keeps the value retained from the previous call."),
   tr("++count가 값을 1 증가시킵니다.","++count increments the retained value."),
   tr("증가된 값을 반환하고 함수 프레임이 종료됩니다.","Return the incremented value and leave the call frame.")
  ];
  return {idx:phase,call,value,focus:phase===1?0:phase===2?1:phase===3?2:null,message:stages[k===0?0:phase+1],done:false};
 }
 if(scene==="cli"){
  const valid=argc===2,passed=!!s.fileAvailable;
  const rows=[
   [tr("프로그램 시작","Program entry"),tr("argc와 argv 배열을 전달받습니다.","Receive argc and argv."),0],
   ["argc != 2",valid?tr("조건이 거짓이므로 계속 실행합니다.","Condition is false; continue."):tr("인자 수가 맞지 않아 return 1로 종료합니다.","Wrong argument count: return 1."),1],
   ["fopen(argv[1], \"r\")",tr("파일 열기를 요청합니다. 실제 파일을 열지는 않습니다.","Request a file open; this visualization does not open a real file."),2],
   ["fp == NULL",passed?tr("모의 파일 열기 성공, NULL이 아닙니다.","Simulated open succeeds; fp is not NULL."):tr("모의 파일 열기 실패, fp == NULL이므로 return 1입니다.","Simulated open fails; fp == NULL, return 1."),3],
   ["fclose(fp)",tr("파일을 닫고 정상 경로를 마칩니다.","Close the file and finish the successful path."),4]
  ];
  let idx=k===0?-1:Math.min(k-1,valid?(passed?4:3):1);
  return {rows,idx,focus:idx<0?null:rows[idx][2],message:idx<0?tr("인자를 입력하고 Step으로 분기를 추적하세요.","Enter arguments and trace branches with Step."):rows[idx][1],done:idx===(valid?(passed?4:3):1),valid,passed,args,argc};
 }
 return null;
}
function specializedScene(s,scene){
 const model=traceModel(s,scene);
 if(scene==="preprocessor"||scene==="modules"){
  return '<p class="c191-caption">'+(scene==="preprocessor"?tr("매크로는 전처리 시점에 치환되고, 산술 결과는 C 식의 평가입니다.","Macro expansion occurs during preprocessing; arithmetic is evaluated afterward."):tr("선언과 정의를 구별한 뒤 두 소스 파일의 컴파일·링킹을 확인합니다.","Distinguish declarations from definitions, then examine compilation and linking."))+'</p>'+
  '<div class="c191-stage-list">'+model.rows.map(([label],i)=>'<div class="c191-file '+(i===model.idx?"active":"")+' '+(i>model.idx?"pending":"")+'"><small>'+tr("단계 ","Stage ")+(i+1)+'</small><strong>'+(i>model.idx?tr("실행 전","Not yet executed"):esc(label))+'</strong></div>').join("")+'</div>'+
  '<p class="c191-stage-explain" role="status">'+esc(model.message)+'</p>';
 }
 if(scene==="lifetime"){
  return '<div class="c191-memory"><div><small>static count</small><strong>'+model.value+'</strong></div><div><small>'+tr("함수 호출","Call number")+'</small><strong>'+model.call+'</strong></div><div><small>'+tr("현재 위치","Current phase")+'</small><strong>'+(s.step===0?tr("시작 전","Before entry"):["Enter","Retain","Increment","Return"][model.idx])+'</strong></div></div>'+
  '<p class="c191-stage-explain" role="status">'+esc(model.message)+'</p>'+
  '<p class="c191-caption">'+tr("Step 4개가 함수 호출 1회입니다. Reset은 static 값을 1000으로 되돌립니다. 이는 실행 시뮬레이션입니다.","Four steps make one function call. Reset restores the simulated static value to 1000.")+'</p>';
 }
 if(scene==="cli"){
  return '<label for="c191-command">'+tr("실행 명령","Command line")+'</label><div class="c191-task"><input id="c191-command" data-setting="argv" style="flex:1;min-width:170px" value="'+esc(s.argv)+'"/></div>'+
  '<div class="c191-argv"><div><strong>argc = '+model.argc+'</strong></div>'+model.args.map((arg,i)=>'<div><small>argv['+i+']</small><code>'+esc(arg)+'</code></div>').join("")+'</div>'+
  '<label class="c191-task"><input type="checkbox" data-setting="fileAvailable" '+(model.passed?"checked":"")+'/> '+tr("모의 파일 열기 성공","Simulate file-open success")+'</label>'+
  '<div class="c191-stage-list">'+model.rows.map(([label],i)=>'<div class="c191-file '+(i===model.idx?"active":i>model.idx?"pending":"")+'"><small>'+tr("단계 ","Stage ")+(i+1)+'</small><strong>'+esc(label)+'</strong></div>').join("")+'</div>'+
  '<p class="c191-stage-explain" role="status">'+esc(model.message)+'</p>'+
  '<p class="c191-caption">'+tr("단순 공백 분리 모델이며 실제 파일이나 C 프로그램을 실행하지 않습니다.","Whitespace-only argument model; it does not actually open a file or execute C.")+'</p>';
 }
 return "";
}

function sceneHTML(){
 const s=S(),scene=D.lessons[selected].scene;
 let html='<h3>'+sceneTitle(scene)+'</h3>';
 if(scene==="operators")html+=operatorVars(s);
 else if(["preprocessor","modules","lifetime","cli"].includes(scene))html+=specializedScene(s,scene);
 else if(["bits","optional"].includes(scene))html+=conceptSceneHTML(s,scene);
 else if(["register","state","capstone","review"].includes(scene)){
  html+=bits(s);
  if(["register","state","capstone"].includes(scene))html+=device(s);
  if(scene==="state"||scene==="capstone"){
   html+='<p class="c191-caption">'+tr("우선순위: ERROR/ALARM → READY → IDLE","Priority: ERROR/ALARM → READY → IDLE")+'</p>'+
   '<div class="c191-states">'+["IDLE","RUNNING","ERROR_STATE"].map(v=>'<span class="c191-state '+(state(s.byte)===v?"active":"")+'">'+v+'</span>').join("")+'</div>';
  }
  if(scene==="review")html+='<p class="c191-caption">'+tr("마스크를 적용한 전후의 값에서 바뀐 비트만 확인하세요.","Check only the bits changed by the mask.")+'</p>';
 }
 html+='<p class="c191-caption c191-trace" aria-live="polite">'+esc(s.trace||tr("코드를 단계별로 실행해 보세요.","Step through the code."))+'</p>';
 if(!["operators","bits","review","preprocessor","modules","lifetime","cli"].includes(scene))html+='<div class="c191-terminal" aria-live="polite">'+esc(terminal(s,scene))+'</div>';
 return html;
}
function advance(){
 const s=S(),scene=D.lessons[selected].scene,lines=D.lessons[selected].code.split("\n");
 const special=["preprocessor","modules","lifetime","cli"].includes(scene);
 const model=traceModel(s,scene);
 const max=scene==="preprocessor"?4:scene==="modules"?5:scene==="cli"?(model.valid?(model.passed?5:4):2):scene==="lifetime"?Infinity:lines.length;
 if(s.step>=max)return false;
 const before=s.byte;s.step++;
 if(scene==="operators"){s.byte=s.step===3?7:0;s.trace=["","a = 0x05 (0000 0101)","b = 0x02 (0000 0010)","result = a | b = 0x07 (0000 0111)"][s.step];}
 if(scene==="register"&&s.step===2)s.byte=0x04|2;
 if(scene==="bits"&&s.step===2)s.byte=181;
 if(special){
  const now=traceModel(s,scene);
  s.focus=now.focus;
  s.trace=now.message;
  if(scene==="lifetime")s.calls=Math.floor(s.step/4);
 }else{
  s.focus=s.step-1;
  s.trace=scene==="operators"?s.trace:tr("실행 단계 ","Execution step ")+s.step+"/"+lines.length+": "+lines[s.focus].trim()+
   (before!==s.byte?" · "+hex(before)+" → "+hex(s.byte):"");
 }
 if(s.step===max||(scene==="register"&&s.step===2))markObserved(s);
 s.changed=(before^s.byte)&255;
 return true;
}
function play(){
 if(!advance()){stop();refreshVisual();return;}
 if(["preprocessor","modules","lifetime","cli"].includes(D.lessons[selected].scene)||S().prediction?.observed)render();
 if((D.lessons[selected].scene==="lifetime"&&S().step%4!==0)||(!["lifetime","preprocessor","modules","cli"].includes(D.lessons[selected].scene)&&S().step<D.lessons[selected].code.split("\n").length)||(["preprocessor","modules","cli"].includes(D.lessons[selected].scene)&&!traceModel(S(),D.lessons[selected].scene).done))timer=setTimeout(play,650);
 else stop();
 refreshVisual();
}

const predictionScenes=new Set(["bits","operators","register","state","capstone","review"]);
const ledNames=[[0,"READY"],[1,"ERROR"],[4,"ALARM"],[5,"LOW_BAT"]];
function miniBits(n,diff){
 return '<div class="c191-mini-bits">'+Array.from({length:8},(_,i)=>{const b=7-i;return '<span class="'+(n&(1<<b)?"one ":"")+(diff&(1<<b)?"mismatch":"")+'"><small>b'+b+'</small><strong>'+Number(!!(n&(1<<b)))+'</strong></span>';}).join("")+'</div>';
}
function miniLeds(n,register=false){const names=register?Array.from({length:8},(_,b)=>[b,"LED"+b]):ledNames;return '<div class="c191-mini-leds">'+names.map(([b,name])=>'<span><i class="'+(n&(1<<b)?"lit ":"")+(!register&&(b===1||b===4)?"alarm":"")+'"></i>'+name+'</span>').join("")+'</div>';}
function predictionHTML(s,scene){
 if(!predictionScenes.has(scene))return "";
 const p=s.prediction,stateOnly=scene==="state"||scene==="capstone",operatorOnly=scene==="operators",expected=p?.expectedByte;
 let h='<section class="c191-panel c191-prediction"><span class="c191-eyebrow">'+tr("1단계 · 먼저 예측","Step 1 · Predict first")+'</span><h3>'+tr("내 예상 결과","My expected result")+'</h3><p class="c191-caption">'+(stateOnly?tr("현재 입력 Byte에 대한 상태를 예측하세요.","Predict the state for the current input byte."):operatorOnly?tr("a=0x05, b=0x02일 때 result의 값을 예측하세요.","Predict result when a=0x05 and b=0x02."):tr("코드를 실행하거나 비트를 조작한 후의 Byte를 예측하세요.","Predict the byte after stepping through code or changing a bit."))+'</p><div class="c191-pred-controls"><div><small>'+(operatorOnly?tr("현재 result","Current result"):tr("현재 Byte","Current byte"))+'</small><strong>'+(operatorOnly&&s.step<3?tr("Unknown (초기화 전)","Unknown (not initialized)"):hex(s.byte)+' · '+binary(s.byte))+'</strong></div>'+
 (stateOnly?'<label>'+tr("예상 상태","Expected state")+' <select id="c191-pred-state" '+(p?"disabled":"")+'>'+options([["IDLE","IDLE"],["RUNNING","RUNNING"],["ERROR_STATE","ERROR_STATE"]],p?.expectedState||"IDLE")+'</select></label>':
 '<label>'+tr("예상 Byte (0–255)","Expected byte (0–255)")+' <input id="c191-pred-byte" type="number" min="0" max="255" step="1" value="'+(expected??(operatorOnly?"":s.byte))+'" '+(p?"disabled":"")+' /></label>')+
 (p?btn(tr("예측 수정","Edit prediction"),"predict-edit"):btn(tr("예측 고정","Lock prediction"),"predict-save"))+'</div>';
 if(p){
 const diff=p.observed?(expected^s.byte):0;
 h+='<div class="c191-pred-compare"><div class="c191-pred-side"><strong>'+tr("예상 결과","Prediction")+'</strong>'+
 (stateOnly?'<p>State: <strong>'+p.expectedState+'</strong></p><p class="c191-caption">'+tr("상태만 예측합니다. Byte/LED는 실행 결과에서 확인하세요.","Predict the state only. Inspect bytes and LEDs after execution.")+'</p>':
 '<div class="c191-pred-value">'+hex(expected)+' · '+binary(expected)+'</div>'+miniBits(expected,diff)+(operatorOnly?'':miniLeds(expected,scene==="register")+(scene==="register"?'':'<p>State: '+p.expectedState+'</p>')))+'</div>'+
 '<div class="c191-pred-side"><strong>'+tr("실행 결과","Observed result")+'</strong>'+
 (p.observed?'<div class="c191-pred-value">'+hex(s.byte)+' · '+binary(s.byte)+'</div>'+miniBits(s.byte,diff)+(operatorOnly?'':miniLeds(s.byte,scene==="register")+(scene==="register"?'':'<p>State: '+state(s.byte)+'</p>')):
 '<p class="c191-pred-pending">'+tr("Step/Run 또는 비트 조작 후 표시됩니다.","Revealed after Step/Run or bit interaction.")+'</p>')+'</div></div>';
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
 const intro=byId("c191-intro");if(intro)intro.textContent=tr("코드를 따라 변수·비트·상태·빌드 단계의 변화를 관찰하고 직접 검증합니다.","Follow C code to observe and verify variables, bits, states and build steps.");
 const codeLines=l.code.split("\n");
 stage.innerHTML='<div class="c191-flow"><article><span class="c191-eyebrow">CHAPTER 19 · '+(selected+1)+'/11</span><h2>19.'+(selected+1)+' '+esc(l.title)+'</h2><div class="c191-story"><p>'+esc(tr(l.ko,l.en))+'</p><p class="c191-caption">'+esc(tr(l.conceptKo,l.conceptEn))+'</p></div></article>'+predictionHTML(s,l.scene)+
 '<div class="c191-grid"><section class="c191-panel" aria-label="C reference code"><h3>'+tr("코드 실행","Execute code")+'</h3><div class="c191-code">'+codeLines.map((line,i)=>'<span class="c191-line '+(s.step>0&&i===(Number.isInteger(s.focus)?s.focus:Math.min(codeLines.length-1,s.step-1))?"current":"")+'">'+(esc(line)||" ")+'</span>').join("")+'</div><div class="c191-task">'+btn("Step","step")+btn(timer!==null?tr("일시정지","Pause"):"Run","run")+btn("Reset","reset-step")+'</div></section><section class="c191-panel" id="c191-visual" aria-label="Visual experiment">'+sceneHTML()+'</section></div>'+
 extraHTML(s,l.scene)+'<details class="c191-panel c191-concept-check" '+(s.checked?'open':'')+'><summary>'+tr("개념 확인 문제","Check your understanding")+'</summary><div class="c191-concept-body"><h3>'+tr("예상한 원리를 확인해 보세요","Check your reasoning")+'</h3><p>'+esc(tr(l.qko,l.qen))+'</p><div class="c191-quiz">'+answerLabels.map((answer,i)=>'<label><input name="c191-answer" type="radio" value="'+i+'" '+(s.choice===i?"checked":"")+'/> '+esc(answer)+'</label>').join("")+'</div><div class="c191-task">'+btn(tr("예측 확인","Check prediction"),"check")+'</div><div class="c191-result" role="status">'+(s.checked?(s.choice===l.correct?tr("정답입니다. 해당 코드의 실행 근거를 설명해 보세요.","Correct. Explain how the code produces this result."):tr("비트와 실행 조건을 다시 관찰하세요.","Revisit the bits and conditions.")):tr("답을 고른 뒤 확인하세요.","Choose your answer before checking."))+'</div></div></details>'+
 '<section class="c191-panel c191-reflect"><h3>'+tr("원리 설명과 응용","Explain and apply")+'</h3><p>'+esc(tr(l.insightKo,l.insightEn))+'</p><label for="c191-note">'+tr("내 생각 기록","My reasoning notes")+'</label><textarea id="c191-note" rows="4" style="width:100%;background:var(--els-surface-alt);color:var(--els-ink);border:1px solid var(--els-border);border-radius:8px;padding:9px">'+esc(s.note)+'</textarea><div class="c191-task">'+btn(done.includes(selected)?tr("학습 기록됨 ✓","Reviewed ✓"):tr("학습 확인 기록","Record review"),"complete")+'</div></section></div>'+
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
 lines.forEach((el,i)=>el.classList.toggle("current",s.step>0&&i===(Number.isInteger(s.focus)?s.focus:Math.min(lines.length-1,s.step-1))));
 if(D.lessons[selected].scene==="operators")byId("c191-visual").innerHTML=sceneHTML();
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
  else {if(s.step>=D.lessons[selected].code.split("\n").length&& !["preprocessor","modules","lifetime","cli"].includes(scene)){s.step=0;s.focus=null;s.byte=initialFor(selected).byte;s.changed=0;if(s.prediction)s.prediction.observed=false;}play();return;}
 }
 if(action!=="run")stop();
 if(action==="step"){advance();if(["operators","preprocessor","modules","lifetime","cli"].includes(scene)||s.prediction?.observed){render();return;}}
 if(action==="reset-operator"){s.experimentByte=5;s.experimentTrace="";}
 if(action==="reset-step"){const original=initialFor(selected);s.byte=original.byte;s.step=0;s.focus=null;s.build=0;s.calls=0;s.parsed=false;s.changed=0;s.prediction=null;s.trace=tr("초기 상태 복원","Initial state restored");}
 if(action==="mask"){const before=Number.isInteger(s.maskByte)?s.maskByte:s.byte;let n=before;if(s.op==="set")n|=mask;else if(s.op==="clear")n&=~mask;else if(s.op==="toggle")n^=mask;s.maskByte=n&255;s.maskTrace=maskExpression(s)+"; "+hex(before)+" → "+hex(s.maskByte);}
 if(action==="reset-mask"){s.maskByte=undefined;s.maskTrace="";}
 if(action==="operator"){const n=Number.isInteger(s.experimentByte)?s.experimentByte:5,op=s.operator;s.experimentByte=op==="and"?n&2:op==="or"?n|2:op==="xor"?n^2:op==="not"?(~n)&255:op==="left"?(n<<1)&255:n>>>1;s.experimentTrace=hex(n)+" "+({and:"& 0x02",or:"| 0x02",xor:"^ 0x02",not:"~ (8-bit)",left:"<< 1",right:">> 1"}[op])+" → "+hex(s.experimentByte);}
 if(action==="flag"){const before=s.byte,bit=Number(b.dataset.flag);s.byte=bit===-1?0:s.byte^(1<<bit);s.changed=before^s.byte;s.step=0;s.trace=tr("입력 변경","Input changed")+": "+hex(before)+" → "+hex(s.byte)+"; "+state(s.byte);markObserved(s);}
 if(action==="build")s.build=(s.build+1)%(scene==="modules"?5:3);
 if(action==="reset-build"){s.build=0;s.step=0;s.focus=null;}
 if(action==="call"){const remaining=4-(s.step%4);for(let j=0;j<remaining;j++)advance();}
 if(action==="reset-call"){s.calls=0;s.step=0;s.focus=null;}
 if(["reset-step","build","reset-build","call","reset-call","parse"].includes(action))s.changed=0;
 if(action==="parse"){s.step=0;s.focus=null;s.parsed=true;s.trace=tr("명령행 분기 추적 준비","Ready to trace command-line branches");}
 if(action==="check")s.checked=s.choice>=0;
 if(action==="complete"){if(!done.includes(selected))done.push(selected);save();render();return;}
 if(["mask","reset-mask","operator","reset-operator","flag","reset-step","parse","build","reset-build","call","reset-call"].includes(action))render();else refreshVisual();
});
stage.addEventListener("change",event=>{
 const e=event.target,s=S();
 if(e.name==="c191-answer"){s.choice=Number(e.value);s.checked=false;save();render();return;}
 if(e.dataset.setting){stop();s[e.dataset.setting]=e.dataset.setting==="target"?Number(e.value):e.dataset.setting==="fileAvailable"?e.checked:e.value;if(e.dataset.setting==="fileAvailable"){s.step=0;s.focus=null;}s.changed=0;render();}
});
stage.addEventListener("input",event=>{
 if(event.target.id==="c191-note")S().note=event.target.value;
 if(event.target.id==="c191-command"){S().argv=event.target.value;S().parsed=false;S().step=0;S().focus=null;}
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