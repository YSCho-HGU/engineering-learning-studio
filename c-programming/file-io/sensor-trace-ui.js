/* Step 07: C statement-level trace synchronized with the displayed C program.
   Uses deterministic simulation, NOT real GCC execution. */
(() => {
 "use strict";
 const $=id=>document.getElementById(id);
 const basic=window.SensorModel, robust=window.RobustSensorModel, walkthrough=window.SensorCodeTrace, variableDiff=window.SensorVariableDiff;
 if(!basic||!robust||!walkthrough||!variableDiff||!$("sensor-step-next"))return;
 let steps=[],allSteps=[],step=-1,readText="";
 const sourceElement=$("sensor-c-source");
 const codeContainer=$("sensor-step-code");
 const buttons=["sensor-step-first","sensor-step-prev","sensor-step-next","sensor-step-last"];
 const valueIds=["sensor-code-fields","sensor-code-time","sensor-code-value","sensor-code-sum","sensor-code-count","sensor-code-mean","sensor-code-alert","sensor-code-exit"];
 const codeHtmlEscape=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

 const vars=[
   ["fields","fields"],["time","time_s"],["value","value"],
   ["sum","sum"],["count","count"],["runningMean","sum / count · 계산값"],
   ["alert","경보 조건 · 표시값"],["exitCode","종료 코드"]
 ];
 const guidanceKeys=new Set(["read","sum","count","condition","alert","finalCount","finalAverage","noRecords","failureReturn","successReturn"]);
 function chooseSteps(){
   const mode=$("sensor-step-view").value;
   if(mode==="all")return allSteps;
   const core=allSteps.filter(x=>guidanceKeys.has(x.key));
   if(mode==="core")return core;
   // The first successful fscanf iteration only; avoid showing a partial
   // data set as if it were a complete program run.
   const first=core.findIndex(x=>x.key==="read");
   if(first<0)return [];
   const bound=core.findIndex((x,i)=>i>first&&x.key==="condition");
   const stop=bound<0?first:bound;
   let output=core.slice(first,stop+1);
   if(core[stop+1]?.key==="alert")output=core.slice(first,stop+2);
   return output;
 }
 function renderVariableDiff(before,snapshot){
   const root=$("sensor-variable-diff-list");
   const summary=$("sensor-diff-highlight");
   root.replaceChildren();
   const diffs=variableDiff.diff(before,snapshot);
   const changed=diffs.filter(x=>x.changed || x.assigned);
   const shown=$("sensor-show-unchanged").checked?diffs:changed;
   const labelFor=key=>vars.find(([k])=>key===k)?.[1]||key;
   const important=changed.filter(x=>!x.derived);
   const text=important.length?
       important.map(x=>labelFor(x.key)+": "+x.before+" → "+x.after+" ("+x.note+")").join(" · "):
       changed.length?changed.map(x=>labelFor(x.key)+": "+x.before+" → "+x.after+" ("+x.note+")").join(" · "):
       "이번 문장은 표시 중인 변수 값을 변경하지 않았습니다.";
   summary.textContent=text;
   if(!shown.length){const p=document.createElement("p");p.className="sensor-diff-empty";p.textContent="변경 없음 · 모든 변수의 상태를 보려면 아래 체크박스를 선택하세요.";root.append(p);return}
   for(const row of shown){
     const item=document.createElement("div");
     item.className="sensor-variable-change "+row.status;
     item.dataset.change=row.status;
     const label=document.createElement("strong");label.textContent=labelFor(row.key);
     const values=document.createElement("span");values.className="sensor-variable-change-values";values.textContent=row.before+" → "+row.after;
     const status=document.createElement("small");status.textContent=row.note;
     item.append(label,values,status);
     root.append(item);
   }
 }
 function switchDepth(){
   if(!allSteps.length){steps=[];reset();return}
   steps=chooseSteps();step=-1;
   $("sensor-step-counter").textContent="선택한 학습 범위 "+steps.length+"개 문장 · 다음 C 문장으로 시작";
   $("sensor-step-next").disabled=!steps.length;
   $("sensor-step-last").disabled=!steps.length;
   $("sensor-step-first").disabled=true;
   $("sensor-step-prev").disabled=true;
   paintCode();
   $("sensor-variable-diff-list").textContent="이전 값 → 새로운 값은 실행 후 표시됩니다.";
   $("sensor-diff-highlight").textContent="보기 방식을 변경했습니다. 다음 문장을 선택하세요.";
   $("sensor-code-explanation").textContent="학습 깊이를 바꿨습니다. 첫 C 문장부터 다시 확인하세요. 기초 모드는 전체 실행이 아닌 첫 레코드 처리만 보여줍니다.";
 }

 function paintCode(line=-1){
   const source=sourceElement.textContent;
   const rows=source.split(/\r?\n/);
   const html=rows.map((txt,i)=>'<div class="sensor-live-line'+(i===line?' active':'')+'" data-line="'+(i+1)+'">'+
    '<span class="sensor-live-number">'+(i+1)+'</span><code>'+codeHtmlEscape(txt||" ")+'</code></div>').join("");
   codeContainer.innerHTML=html;
   if(line>=0){
     const active=codeContainer.querySelector(".sensor-live-line.active");
     if(active)active.scrollIntoView({block:"nearest",inline:"nearest",behavior:"instant"});
   }
 }
 function displayState(state){
   $("sensor-code-fields").textContent=state.fields;
   $("sensor-code-time").textContent=state.time===null?"미정":state.time.toFixed(3);
   $("sensor-code-value").textContent=state.value===null?"미정":state.value.toFixed(3);
   $("sensor-code-sum").textContent=state.sum.toFixed(3);
   $("sensor-code-count").textContent=String(state.count);
   $("sensor-code-mean").textContent=state.runningMean===null?"—":state.runningMean.toFixed(3);
   $("sensor-code-alert").textContent=state.alert?"YES":"NO";
   $("sensor-code-exit").textContent=state.exitCode===null?"—":String(state.exitCode);
   $("sensor-code-stdout").textContent=state.stdout||"(출력 없음)";
   $("sensor-code-stderr").textContent=state.stderr||"(오류 없음)";
 }
 function reset(){
   steps=[];allSteps=[];step=-1;
   for(const id of buttons)$(id).disabled=true;
   $("sensor-step-counter").textContent="실행 전";
   $("sensor-step-attempt").textContent="—";
   $("sensor-step-return").textContent="—";
   $("sensor-step-fields").textContent="— / —";
   $("sensor-step-stats").textContent="0 / 0 / —";
   $("sensor-step-alert").textContent="경보 없음";
   $("sensor-step-detail").textContent="Simulate Run 후 다음 C 문장을 누르세요.";
   $("sensor-step-source").textContent="실험에 사용한 파일의 해당 부분이 표시됩니다.";
   $("sensor-code-explanation").textContent="현재 실행한 문장의 의미를 여기에 설명합니다.";
   displayState({fields:"—",time:null,value:null,sum:0,count:0,runningMean:null,alert:false,exitCode:null,stdout:"",stderr:""});
   paintCode();
   $("sensor-variable-diff-list").textContent="실행 전 · 각 변수의 이전 값과 새로운 값이 여기에 표시됩니다.";
   $("sensor-diff-highlight").textContent="Simulate Run 후 다음 C 문장을 선택하세요.";
   $("sensor-compare-basic").textContent="다시 비교 실행하세요.";
   $("sensor-compare-robust").textContent="다시 비교 실행하세요.";
   $("sensor-compare-status").textContent="입력 조건이 바뀌었습니다. 비교 실행을 다시 누르세요.";
   $("sensor-compare-explain").textContent="동일한 텍스트 입력을 두 방법으로 분석합니다.";
 }
 function show(){
   if(!steps.length)return;
   const snapshot=steps[step];
   $("sensor-step-counter").textContent=(step+1)+" / "+steps.length+"개 C 문장";
   $("sensor-step-first").disabled=step<=0;
   $("sensor-step-prev").disabled=step<=0;
   $("sensor-step-next").disabled=step>=steps.length-1;
   $("sensor-step-last").disabled=step>=steps.length-1;
   const ev=snapshot.read;
   $("sensor-step-attempt").textContent=ev?"Read #"+ev.attempt:"결과 처리";
   $("sensor-step-return").textContent=snapshot.state.fields;
   $("sensor-step-fields").textContent=
      (snapshot.state.time===null?"—":snapshot.state.time.toFixed(3))+" / "+
      (snapshot.state.value===null?"—":snapshot.state.value.toFixed(3));
   $("sensor-step-stats").textContent=
      snapshot.state.count+" / "+snapshot.state.sum.toFixed(3)+" / "+
      (snapshot.state.runningMean===null?"—":snapshot.state.runningMean.toFixed(3));
   $("sensor-step-alert").textContent=snapshot.state.alert?"현재 측정값: 임계값 초과":"현재 경보 없음";
   $("sensor-step-detail").textContent=snapshot.explain;
   $("sensor-code-explanation").textContent=snapshot.explain;
   displayState(snapshot.state);
   const prior=step>0?steps[step-1].state:variableDiff.base;
   renderVariableDiff(prior,snapshot);
   const line=walkthrough.codeLineIndex(sourceElement.textContent,snapshot.lineMarker);
   paintCode(line);
   if(ev){
     const start=ev.startOffset??0,end=ev.endOffset??start;
     const before=readText.slice(0,start),selected=readText.slice(start,end),after=readText.slice(end);
     $("sensor-step-source").textContent="이미 읽은 부분:\n"+JSON.stringify(before.slice(-100))+
      "\n이번 읽기 범위:\n"+JSON.stringify(selected||"(새 데이터 없음)")+
      "\n아직 읽지 않은 부분:\n"+JSON.stringify(after.slice(0,140));
   }
 }
 function prepare(){
   readText=$("sensor-edit").value;
   const threshold=Number($("sensor-threshold").value);
   try{
     const result=basic.simulate(readText,threshold);
     if(!result.supported){reset();$("sensor-step-source").textContent=result.reason;return}
     allSteps=walkthrough.build(result,threshold);
     steps=chooseSteps();
   }catch(err){reset();$("sensor-step-source").textContent="시뮬레이션 제한: "+err.message;return;}
   step=-1;
   paintCode();
   $("sensor-step-counter").textContent="준비 완료 · "+steps.length+"개 문장 · 다음 C 문장을 누르세요";
   $("sensor-step-next").disabled=!steps.length;
   $("sensor-step-last").disabled=!steps.length;
 }
 $("sensor-step-view").addEventListener("change",switchDepth);
 $("sensor-show-unchanged").addEventListener("change",()=>{
   if(step>=0 && steps[step]){
     renderVariableDiff(step>0?steps[step-1].state:variableDiff.base,steps[step]);
   }
 });
 $("sensor-run").addEventListener("click",prepare);
 for(const id of ["sensor-edit","sensor-threshold","sensor-scenario"]){
   $(id).addEventListener(id==="sensor-edit"||id==="sensor-threshold"?"input":"change",reset);
 }
 $("sensor-restore").addEventListener("click",reset);
 $("sensor-step-first").onclick=()=>{step=0;show()};
 $("sensor-step-prev").onclick=()=>{step=Math.max(0,step-1);show()};
 $("sensor-step-next").onclick=()=>{if(steps.length){step=Math.min(steps.length-1,step+1);show()}};
 $("sensor-step-last").onclick=()=>{if(steps.length){step=steps.length-1;show()}};
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
