/* P1/P2 File I/O teaching state machine. This DOES NOT execute the student's C code. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),panel=$("core-io-explorer");if(!panel)return;
const cases={
 P1:[
  {id:"normal",name:"정상 · 정수 5개",items:["10","20","30","40","50"],fail:false},
  {id:"invalid",name:"입력 오류 · 세 번째 값 ABC",items:["10","20","ABC","40","50"],fail:false},
  {id:"open-fail",name:"파일 열기 실패",items:["10","20","30","40","50"],fail:true}
 ],
 P2:[
  {id:"normal",name:"정상 · 실수 3개",items:["1.5","2.5","4.0"],missing:false},
  {id:"empty",name:"빈 파일 · EOF",items:[],missing:false},
  {id:"invalid",name:"형식 오류 · ABC",items:["4.0","6.0","ABC"],missing:false},
  {id:"missing",name:"파일 없음",items:[],missing:true}
 ]
};
let current=null,scenarioId="normal",index=0,clock=null,frames=[];
function stop(){if(clock!==null){clearInterval(clock);clock=null}$("coreio-play").textContent="자동 재생";$("coreio-play").setAttribute("aria-pressed","false")}
function frame(label,code,explain,source,memory,dest,sourceState="준비",memoryState="준비",destState="준비",result=label){
 return {label,code,explain,source,memory,dest,sourceState,memoryState,destState,result};
}
function p1(c){
 const input=c.items.join(" ")||"∅";
 const f=[frame("시작 전","FILE *fp; int x, i;","표준 입력에서 정수 다섯 개를 받아 파일에 기록합니다. 변수 x는 아직 초기화되지 않았습니다.",input,"x = ?\ni = ?","파일 생성 전","stdin","미초기화","닫힘")];
 if(c.fail){
  f.push(frame("파일 열기 실패",'fp = fopen("numbers.txt", "w");','fopen이 NULL을 반환했습니다. fprintf 또는 fclose를 유효하지 않은 FILE*로 호출하지 않고 오류를 보고한 뒤 종료합니다.',input,"fp = NULL","파일 생성 실패","stdin","NULL","열기 실패","오류 처리"));
  return f;
 }
 f.push(frame("쓰기 파일 열기",'fp = fopen("numbers.txt", "w");','쓰기 모드 w로 numbers.txt를 엽니다. 기존 파일이 있다면 내용이 비워질 수 있습니다.',input,"fp != NULL\ni = 0","∅ 빈 파일","stdin","fp 열림","쓰기 모드"));
 let data="",error=false;
 for(let i=0;i<5;i++){
  const raw=c.items[i];
  if(!/^[+-]?\d+$/.test(raw)){
   f.push(frame("입력 변환 실패",'scanf("%d", &x) != 1','ABC는 %d 정수로 변환되지 않아 scanf가 0을 반환합니다. 이전 x 값을 재사용하지 않으며, 더 이상 기록하지 않고 파일을 닫습니다.',input,"i = "+i+"\nscanf 반환값 = 0\nx는 갱신되지 않음",data||"∅ 빈 파일","stdin","입력 오류","열림","형식 오류"));
   error=true;break;
  }
  f.push(frame((i+1)+"번째 정수 읽기",'scanf("%d", &x) == 1','scanf의 반환값 1은 정수 변환 한 번이 성공했음을 의미합니다. x가 새 값으로 갱신되었으며, 이제 기록할 수 있습니다.',input,"i = "+i+"\nx = "+raw+"\nscanf 반환값 = 1",data||"∅ 빈 파일","stdin","변환 성공","열림"));
  data+=raw+"\n";
  f.push(frame((i+1)+"번째 파일 쓰기",'fprintf(fp, "%d\\n", x)','fprintf로 정수와 개행 문자를 출력 스트림에 씁니다. 파일 내용은 이해를 위한 논리적 결과이며 실제 디스크 반영 시점은 버퍼링에 따라 달라질 수 있습니다.',input,"i = "+i+"\nx = "+raw,data,"stdin","값 유지","쓰기 진행"));
 }
 f.push(frame("쓰기 스트림 닫기","fclose(fp);",error?"오류 경로에서도 열려 있는 파일을 닫습니다. 이 예시에서는 기록된 정수만 남습니다. fclose 반환값도 확인해야 합니다.":"정수 5개를 모두 기록했습니다. fclose 반환값까지 확인하여 버퍼링된 데이터의 쓰기 실패 여부를 검사합니다.",input,error?"오류 보고 후 종료":"5개 입력 완료",data||"∅ 빈 파일","stdin","완료","닫힘",error?"입력 오류 후 정리":"정상 완료"));
 return f;
}
function p2(c){
 const input=c.missing?"파일 없음":c.items.join("\n")||"∅ 빈 파일";
 const f=[frame("시작 전","FILE *fp; double x, sum = 0; int count = 0;","파일에서 double 값을 반복해서 읽고 합계와 평균을 계산합니다. 빈 파일은 0으로 나누지 않습니다.",input,"x = ?\nsum = 0.0\ncount = 0","화면 출력 전","닫힘","초기 상태","stdout")];
 if(c.missing){
  f.push(frame("파일 열기 실패",'fp = fopen("values.txt", "r");','파일이 없으면 fopen이 NULL을 반환합니다. fscanf를 호출하지 않고 오류를 보고하고 종료합니다.',input,"fp = NULL\nsum = 0\ncount = 0","오류 메시지(stderr)","열기 실패","NULL","오류 출력","오류 처리"));
  return f;
 }
 f.push(frame("읽기 파일 열기",'fp = fopen("values.txt", "r");','읽기 모드 r로 파일을 엽니다. 파일 포인터가 NULL이 아닌지 확인합니다.',input,"sum = 0.0\ncount = 0","화면 출력 전","읽기 모드","초기 상태","stdout"));
 let sum=0,count=0,invalid=false;
 for(let i=0;i<c.items.length;i++){
  const raw=c.items[i],value=Number(raw);
  if(raw==="ABC"||!Number.isFinite(value)){
   invalid=true;
   f.push(frame("형식 오류 발견",'fscanf(fp, "%lf", &x) == 0','읽지 못한 토큰 ABC가 남아 있고 변환 성공 개수는 0입니다. 이는 정상 EOF가 아니므로 형식 오류로 처리합니다.',input,"x는 갱신되지 않음\nsum = "+sum.toFixed(1)+"\ncount = "+count,"형식 오류 보고","읽기 중","변환 실패(0)","오류 출력","형식 오류"));
   break;
  }
  f.push(frame((i+1)+"번째 값 읽기",'fscanf(fp, "%lf", &x) == 1','%lf 변환 성공 개수가 1이므로 합계와 개수를 갱신할 수 있습니다.',input,"x = "+value.toFixed(1)+"\nsum = "+sum.toFixed(1)+"\ncount = "+count,"화면 출력 전","읽기 중","변환 성공(1)","stdout"));
  sum+=value;count++;
  f.push(frame("누적 합계 갱신","sum += x; count++;","성공적으로 읽은 값만 sum에 더하고 count를 하나 증가시킵니다.",input,"x = "+value.toFixed(1)+"\nsum = "+sum.toFixed(1)+"\ncount = "+count,"화면 출력 전","읽기 중","갱신 완료","stdout"));
 }
 if(!invalid)f.push(frame("파일 끝 · EOF",'fscanf(fp, "%lf", &x) == EOF','더 읽을 값이 없으므로 변환을 시작하기 전에 파일 끝을 만났습니다. 이 사례는 형식 오류(0)와 다릅니다.',input,"sum = "+sum.toFixed(1)+"\ncount = "+count,"출력 대기","EOF","누적 완료","stdout","정상 EOF"));
 if(!invalid){
  const output=count?"Count = "+count+"\nAverage = "+(sum/count).toFixed(3):"Count = 0\nNo values";
  f.push(frame("평균 출력","if (count > 0) printf(...);","count > 0일 때만 sum/count를 계산합니다. 빈 파일에서는 0으로 나누지 않고 데이터 없음으로 처리합니다.",input,"sum = "+sum.toFixed(1)+"\ncount = "+count+(count?"\navg = "+(sum/count).toFixed(3):""),output,"EOF","평균 계산","stdout",count?"정상 완료":"빈 파일 처리"));
 }
 f.push(frame("읽기 스트림 닫기","fclose(fp);",invalid?"형식 오류를 보고했더라도 열려 있는 파일을 닫아야 합니다. count와 sum에는 성공적으로 읽은 데이터만 반영됩니다.":"사용한 FILE*를 닫고 fclose 반환값을 확인합니다.",input,"sum = "+sum.toFixed(1)+"\ncount = "+count,invalid?"오류: 입력 형식 불일치":count?"Count = "+count+"\nAverage = "+(sum/count).toFixed(3):"Count = 0\nNo values","닫힘","최종 값","stdout",invalid?"오류 후 정리":"종료"));
 return f;
}
function render(){
 const item=frames[index];if(!item)return;
 const p1mode=current==="P1";
 $("coreio-title").textContent=p1mode?"P1 · scanf → fprintf → fclose":"P2 · fscanf → sum/count → Average";
 $("coreio-intro").textContent=p1mode?"정수 5개를 읽어 파일에 한 줄씩 기록합니다. 한 번의 scanf와 fprintf가 어떻게 연결되는지 확인하세요.":"실수를 파일에서 읽어 누적하고 EOF와 변환 실패를 구분합니다.";
 $("coreio-source-title").textContent=p1mode?"표준 입력 stdin":"values.txt";
 $("coreio-source-sub").textContent=p1mode?"scanf INPUT":"fscanf SOURCE FILE";
 $("coreio-memory-title").textContent=p1mode?"int x, i":"double x, sum; int count";
 $("coreio-memory-sub").textContent="VARIABLES · MEMORY";
 $("coreio-dest-title").textContent=p1mode?"numbers.txt":"표준 출력 stdout";
 $("coreio-dest-sub").textContent=p1mode?"fprintf OUTPUT FILE":"printf SUMMARY";
 for(const [id,v] of [["source",item.source],["memory",item.memory],["dest",item.dest]])$("coreio-"+id).textContent=v;
 for(const [id,v] of [["source-state",item.sourceState],["memory-state",item.memoryState],["dest-state",item.destState]])$("coreio-"+id).textContent=v;
 $("coreio-step").textContent="단계 "+index+" / "+(frames.length-1)+" · "+item.label;
 $("coreio-result").textContent=item.result;$("coreio-code").textContent=item.code;$("coreio-explain").textContent=item.explain;
 $("coreio-foot").textContent=p1mode?"P1 핵심: scanf 반환값이 1인지 확인한 경우에만 x를 기록합니다. fprintf뿐 아니라 fclose의 실패도 점검해야 합니다.":'P2 핵심: fscanf의 반환값 1(성공), 0(형식 불일치), EOF(파일 끝 또는 입력 오류)를 구분합니다. 입력 오류는 ferror로 확인합니다. 평균은 count > 0일 때만 계산합니다.';
 $("coreio-prev").disabled=index===0;$("coreio-next").disabled=index===frames.length-1;
 $("coreio-play").disabled=index===frames.length-1;
}
function stepTo(n){index=Math.max(0,Math.min(frames.length-1,n));render();if(index===frames.length-1)stop()}
function selectCase(id){const config=cases[current].find(x=>x.id===id)||cases[current][0];scenarioId=config.id;frames=current==="P1"?p1(config):p2(config);stepTo(0)}
function stop(){if(clock!==null){clearInterval(clock);clock=null}$("coreio-play").textContent="자동 재생";$("coreio-play").setAttribute("aria-pressed","false")}
function enterTask(id){
 stop();current=id==="P1"||id==="P2"?id:null;panel.hidden=!current;
 if(!current)return;
 const picker=$("coreio-scenario");picker.replaceChildren();
 for(const c of cases[current]){const option=document.createElement("option");option.value=c.id;option.textContent=c.name;picker.append(option)}
 selectCase("normal");
}
$("coreio-scenario").addEventListener("change",e=>{stop();selectCase(e.target.value)});
$("coreio-prev").addEventListener("click",()=>{stop();stepTo(index-1)});
$("coreio-next").addEventListener("click",()=>{stop();stepTo(index+1)});
$("coreio-reset").addEventListener("click",()=>{stop();stepTo(0)});
$("coreio-play").addEventListener("click",()=>{
 if(clock!==null){stop();return}
 if(index===frames.length-1)stepTo(0);
 $("coreio-play").textContent="일시정지";$("coreio-play").setAttribute("aria-pressed","true");
 clock=setInterval(()=>{stepTo(index+1)},950);
});
window.addEventListener("c-fileio-task-change",e=>enterTask(e.detail?.id));
const first=document.querySelector("#task-id")?.textContent||"";
enterTask(first.includes("PRACTICE P1")?"P1":first.includes("PRACTICE P2")?"P2":null);
})();
