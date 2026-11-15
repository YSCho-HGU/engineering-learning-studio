/* Step 07 extension: visually trace token reads and compare robust line parsing.
   Existing fscanf program and its simulation remain untouched. */
(() => {
 "use strict";
 const $=id=>document.getElementById(id);
 const basic=window.SensorModel,robust=window.RobustSensorModel;
 if(!basic||!robust||!$("sensor-step-next"))return;
 let result=null,step=-1,readText="",threshold=3;
 const buttons=["sensor-step-first","sensor-step-prev","sensor-step-next","sensor-step-last"];
 function reset(){
   result=null;step=-1;
   for(const id of buttons)$(id).disabled=true;
   $("sensor-step-counter").textContent="실행 전";
   $("sensor-step-attempt").textContent="—";$("sensor-step-return").textContent="—";
   $("sensor-step-fields").textContent="— / —";$("sensor-step-stats").textContent="0 / 0 / —";
   $("sensor-step-alert").textContent="경보 없음";$("sensor-step-detail").textContent="실행 후 다음 읽기를 눌러 보세요.";
   $("sensor-step-source").textContent="실험에 사용한 파일의 해당 부분이 표시됩니다.";
   $("sensor-compare-basic").textContent="다시 비교 실행하세요.";
   $("sensor-compare-robust").textContent="다시 비교 실행하세요.";
   $("sensor-compare-status").textContent="입력 조건이 바뀌었습니다. 비교 실행을 다시 누르세요.";
   $("sensor-compare-explain").textContent="동일한 텍스트 입력을 두 방법으로 분석합니다.";
 }
 function show(){
   if(!result)return;
   const items=result.trace;
   $("sensor-step-counter").textContent=step<0?"실험 시작 전":(step+1)+" / "+items.length+"번째 읽기";
   $("sensor-step-first").disabled=step<=0;
   $("sensor-step-prev").disabled=step<=0;
   $("sensor-step-next").disabled=step>=items.length-1;
   $("sensor-step-last").disabled=step>=items.length-1;
   if(step<0)return;
   const ev=items[step];
   $("sensor-step-attempt").textContent="Read #"+ev.attempt;
   $("sensor-step-return").textContent=ev.lastReturn;
   $("sensor-step-fields").textContent=(ev.time===undefined?"—":ev.time.toFixed(3))+" / "+(ev.value===undefined?"—":ev.value.toFixed(3));
   $("sensor-step-stats").textContent=ev.count+" / "+ev.sum.toFixed(3)+" / "+(ev.average===null?"—":ev.average.toFixed(3));
   $("sensor-step-alert").textContent=ev.alert?"이번 읽기에서 경보 발생":"이번 읽기에서 경보 없음";
   $("sensor-step-detail").textContent=ev.detail;
   // Use textContent only. Never interpret students' edited input as markup.
   const start=ev.startOffset??0,end=ev.endOffset??start;
   const selected=readText.slice(start,end);
   const before=readText.slice(0,start),after=readText.slice(end);
   $("sensor-step-source").textContent="이미 읽은 부분:\n"+JSON.stringify(before.slice(-100))+
     "\n이번 읽기 범위:\n"+JSON.stringify(selected||"(새 데이터 없음)")+
     "\n아직 읽지 않은 부분:\n"+JSON.stringify(after.slice(0,140));
 }
 function prepare(){
   readText=$("sensor-edit").value;threshold=Number($("sensor-threshold").value);
   try{result=basic.simulate(readText,threshold)}
   catch(err){result=null;$("sensor-step-source").textContent="실행 제한: "+err.message;return;}
   if(!result.supported){result=null;$("sensor-step-source").textContent="지원하지 않는 숫자 형식입니다. 정해진 범위에서 수정해 보세요.";return;}
   step=-1;show();
   $("sensor-step-next").disabled=false;$("sensor-step-last").disabled=false;
 }
 $("sensor-run").addEventListener("click",prepare);
 for(const id of ["sensor-edit","sensor-threshold","sensor-scenario","sensor-restore"]){
   $(id).addEventListener(id==="sensor-edit"?"input":id==="sensor-threshold"?"input":"change",reset);
 }
 $("sensor-restore").addEventListener("click",reset);
 $("sensor-step-first").onclick=()=>{step=0;show()};
 $("sensor-step-prev").onclick=()=>{step=Math.max(0,step-1);show()};
 $("sensor-step-next").onclick=()=>{if(result){step=Math.min(result.trace.length-1,step+1);show()}};
 $("sensor-step-last").onclick=()=>{if(result){step=result.trace.length-1;show()}};
 $("sensor-compare-run").onclick=()=>{
   const text=$("sensor-edit").value,thr=Number($("sensor-threshold").value);
   try{
     const b=basic.simulate(text,thr),r=robust.simulate(text,thr);
     if(!b.supported){
       $("sensor-compare-status").textContent="fscanf 모형이 지원하지 않는 숫자 표기입니다.";
       $("sensor-compare-basic").textContent=b.reason;
       $("sensor-compare-robust").textContent="한쪽 모형이 지원하지 않아 비교를 생략했습니다.";
       return;
     }
     const format=x=>"종료 코드: "+x.exitCode+"\n정상 레코드: "+x.count+
       "\n경보 횟수: "+x.alerts.length+"\n평균: "+(x.successful?(x.average===null?"N/A":x.average.toFixed(3)):"(오류로 최종 미출력)")+
       "\nstdout:\n"+(x.stdout||"(없음)")+"\nstderr:\n"+(x.stderr||"(없음)");
     $("sensor-compare-basic").textContent=format(b);
     $("sensor-compare-robust").textContent=format(r);
     const same=b.exitCode===r.exitCode&&b.count===r.count&&b.stdout===r.stdout;
     $("sensor-compare-status").dataset.state=same?"ok":"error";
     $("sensor-compare-status").textContent=same?"두 방식의 결과가 일치합니다. 읽기 과정은 서로 다릅니다.":"두 방식의 결과가 다릅니다. 입력 행의 경계를 확인하세요.";
     $("sensor-compare-explain").textContent=same?
       "정상적인 두 열 파일에서는 동일한 결과가 나옵니다. 하지만 robust 방식은 매번 한 줄에 정확히 두 필드가 있는지 확인합니다.":
       "fscanf는 줄바꿈도 공백으로 처리하므로 두 줄의 값을 하나의 쌍으로 읽을 수 있습니다. fgets 기반 검증은 한 줄씩 읽으며 형식 오류를 행 번호와 함께 보고합니다. 각 방식의 trace 및 stderr를 비교하세요.";
   }catch(err){
     $("sensor-compare-status").textContent="비교 시뮬레이션 제한: "+err.message;
     $("sensor-compare-status").dataset.state="error";
   }
 };
 reset();
})();
