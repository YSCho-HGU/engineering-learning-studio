/* M1 interactive file and char-buffer teaching model. NOT a C runtime. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const panel=$("m1-buffer-explorer");if(!panel)return;
const scenarios={
 normal:{text:"Sensor online\nsecond line ignored\n",label:"정상 파일"},
 empty:{text:"",label:"빈 파일"},
 "no-newline":{text:"Sensor online",label:"개행 없음"},
 long:{text:"A".repeat(90)+"\nsecond line ignored\n",label:"80바이트보다 긴 첫 줄"},
 missing:{text:null,label:"입력 파일 없음"}
};
let scenario="normal",step=0,timer=null;
const maxStep=6,capacity=80;
function stop(){if(timer!==null){clearInterval(timer);timer=null}$("buffer-play").textContent="자동 재생";$("buffer-play").setAttribute("aria-pressed","false")}
function tokenText(c){return c==="\n"?"\\n":c==="\r"?"\\r":c==="\t"?"\\t":c}
function addCell(container,label,value,kind=""){
 const el=document.createElement("div");el.className="buffer-cell "+kind;
 const top=document.createElement("span");top.textContent=value;
 const sub=document.createElement("small");sub.textContent=label;
 el.append(top,sub);container.append(el);
}
function update(){
 const data=scenarios[scenario],hasSource=data.text!==null;
 const srcOpened=hasSource&&step>=1, dstOpened=srcOpened&&step>=2;
 const readDone=dstOpened&&step>=3, firstLine=readDone?data.text.slice(0,capacity-1):"", bytes=firstLine.includes("\n")?firstLine.slice(0,firstLine.indexOf("\n")+1):firstLine;
 const readSuccess=readDone&&bytes.length>0, writing=readSuccess&&step>=4;
 const sourceClosed=step>=6&&srcOpened,dstClosed=step>=5&&dstOpened;
 const destValue=writing?bytes:"";
 const memory=$("buffer-cells");memory.replaceChildren();
 const source=$("buffer-source"),destination=$("buffer-dest");
 source.textContent=hasSource?(data.text||"∅ 빈 파일"):"파일을 찾을 수 없습니다";
 destination.textContent=dstOpened?(destValue||"∅ 빈 파일"):"생성 전";
 $("buffer-source-state").textContent=!hasSource&&step>=1?"열기 실패":srcOpened?(sourceClosed?"닫힘":"읽기 모드 열림"):"닫힘";
 $("buffer-dest-state").textContent=dstOpened?(dstClosed?"닫힘":"쓰기 모드 열림"):"닫힘";
 $("buffer-memory-state").textContent=readSuccess?"널 종료된 문자열":readDone?"읽은 문자열 없음":"미초기화";
 if(readSuccess){
  const count=bytes.length;
  const shown=count<=9?Array.from({length:count},(_,i)=>i):[0,1,2,3,4,5,6,7];
  for(const index of shown)addCell(memory,String(index),tokenText(bytes[index]));
  if(count>9)addCell(memory,"…","…","ellipsis");
  addCell(memory,String(count),"\\0","null");
  $("buffer-used").textContent="읽은 바이트 "+count+"개 + 종료 문자 1개 · char[80]의 나머지는 이 모델에서 표시하지 않음";
 }else{
  for(let i=0;i<4;i++)addCell(memory,String(i),"?", "unset");
  $("buffer-used").textContent=readDone?"fgets가 NULL을 반환했습니다. 유효한 문자열을 읽지 못했습니다.":"읽기 전: 버퍼의 내용을 가정하지 않습니다.";
 }
 const noSrc=!hasSource;
 const phase=[
  ["시작 전","FILE *src; FILE *dst; char line[80];","파일을 아직 열지 않았습니다. char line[80]은 초기화되지 않은 배열입니다."],
  ["읽기 파일 열기",'src = fopen("message.txt", "r");',"src를 읽기 모드로 엽니다. NULL이면 이후의 파일 입출력을 진행하지 않고 실패 처리합니다."],
  ["쓰기 파일 열기",'dst = fopen("preview.txt", "w");',"쓰기 파일을 열고 NULL을 확인합니다. 실패하면 이미 연 src를 닫아야 합니다."],
  ["버퍼로 한 번 읽기",'fgets(line, sizeof line, src)',"최대 79바이트를 읽고 종료 문자 \\0을 붙입니다. 개행이 먼저 나오면 개행도 버퍼에 남습니다."],
  ["버퍼 내용을 쓰기",'fputs(line, dst)',"널 종료 전까지의 문자를 출력 스트림에 기록합니다. \\0은 기록하지 않으며 개행을 자동으로 추가하지 않습니다."],
  ["출력 파일 닫기",'fclose(dst)',"출력 스트림이 닫히며 버퍼링된 데이터가 파일에 전달됩니다. fclose 반환값으로 실패도 확인합니다."],
  ["입력 파일 닫기",'fclose(src)',"입력 스트림도 닫았습니다. 두 파일 스트림에 대한 자원 정리가 끝났습니다."]
 ];
 let [label,statement,explanation]=phase[step],result=label;
 if(noSrc&&step>=1){statement=step===1?statement:"(실패 경로) 이후 연산을 건너뛰고 종료";explanation=step===1?"fopen이 NULL을 반환합니다. src는 사용할 수 없고, preview.txt도 만들지 않습니다.":"파일 열기에 실패했으므로 fgets/fputs/fclose를 유효하지 않은 FILE*에 호출하면 안 됩니다.";result="입력 파일 열기 실패"}
 else if(readDone&&!readSuccess){if(step===3){explanation="fgets가 EOF에서 NULL을 반환하여 버퍼에 저장된 유효한 문자열이 없습니다. 이 경로에서는 fputs를 호출하지 않습니다.";result="EOF · fgets → NULL"}else if(step===4){statement="fputs는 호출하지 않음";explanation="빈 입력 파일이므로 복사할 문자열이 없습니다. preview.txt는 빈 파일로 유지됩니다.";result="쓰기 생략"}}
 if(scenario==="long"&&step>=3&&hasSource){explanation+=" 이 시나리오의 첫 줄은 80바이트보다 길어, 79바이트만 읽고 나머지는 파일에 남습니다. 마지막 개행은 이 첫 번째 호출에서 읽히지 않습니다.";}
 if(scenario==="no-newline"&&step>=3&&hasSource){explanation+=" 입력 끝에 \\n이 없으므로 fputs도 개행을 추가하지 않습니다.";}
 $("buffer-step").textContent="단계 "+step+" / "+maxStep+" · "+label;
 $("buffer-result").textContent=result;
 $("buffer-code").textContent=statement;
 $("buffer-explain").textContent=explanation;
 $("buffer-prev").disabled=step===0;
 $("buffer-next").disabled=step===maxStep;
 $("buffer-play").disabled=step===maxStep;
}
function gotoStep(n){step=Math.min(maxStep,Math.max(0,n));update();if(step===maxStep)stop()}
$("buffer-next").addEventListener("click",()=>{stop();gotoStep(step+1)});
$("buffer-prev").addEventListener("click",()=>{stop();gotoStep(step-1)});
$("buffer-reset").addEventListener("click",()=>{stop();gotoStep(0)});
$("buffer-play").addEventListener("click",()=>{
 if(timer!==null){stop();return}
 if(step===maxStep)gotoStep(0);
 $("buffer-play").textContent="일시정지";$("buffer-play").setAttribute("aria-pressed","true");
 timer=setInterval(()=>{gotoStep(step+1)},1000);
});
$("buffer-scenario").addEventListener("change",e=>{scenario=e.target.value in scenarios?e.target.value:"normal";stop();gotoStep(0)});
window.addEventListener("c-fileio-task-change",event=>{
 const onM1=event.detail?.id==="M1";
 panel.hidden=!onM1;
 stop();if(onM1){step=0;update()}
});
const currentTask=Number(document.querySelector("#task-nav button.active[data-task]")?.dataset.task);
panel.hidden=currentTask!==6;
update();
})();