(() => {
"use strict";
const E=window.FileIOPilot;if(!E){document.body.insertAdjacentHTML("afterbegin","<p>Learning engine failed to load.</p>");return;}
const $=id=>document.getElementById(id);
let m3=E.createM3(),m4=E.createM4(),m3Unlocked=false,m4Unlocked=false,m3Evidence=null,m4Evidence=null;
let m3PredictionBefore=null,m3PredictionAfter=null;
const initialM3Preds={
  "r|lab":"unchanged","w|lab":"empty","a|lab":"append",
  "r|other":"fail","w|other":"new","a|other":"new"
};
const correctM4={normal:"eof",malformed:"mismatch",empty:"eof",ioError:"ioError"};
const esc=s=>String(s).replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
const fileCode=(mode,cwd)=>{
 const name='"readings.txt"';
 const parts=['#include <stdio.h>',"","int main(void) {",'    FILE *fp = fopen('+name+', "'+mode+'");','    if (fp == NULL) return 1;'];
 if(mode==="r")parts.push('    char line[80];','    while (fgets(line, sizeof line, fp) != NULL) {','        fputs(line, stdout);','    }');
 else parts.push('    fprintf(fp, "%.1f\\n", 27.2);');
 parts.push('    if (fclose(fp) == EOF) return 1;','    return 0;','}');
 const map=mode==="r"?{open:[3,4],read:[6,7],openFail:[3,4],close:[9]}:{open:[3,4],openFail:[3,4],write:[5],close:[6]};
 return {parts,map};
};
const eofCode=[
'#include <stdio.h>',
'',
'int main(void) {',
'    FILE *fp = fopen("numbers.txt", "r");',
'    int x, rc;',
'    if (fp == NULL) return 1;',
'    while ((rc = fscanf(fp, "%d", &x)) == 1) {',
'        printf("%d\\n", x);',
'    }',
'    if (ferror(fp)) {',
'        fprintf(stderr, "I/O error\\n");',
'        fclose(fp);',
'        return 1;',
'    }',
'    if (!feof(fp)) {',
'        fprintf(stderr, "Invalid integer input\\n");',
'        fclose(fp);',
'        return 1;',
'    }',
'    if (fclose(fp) == EOF) return 1;',
'    return 0;',
'}'
];
function renderCode(id,lines,actives){
 $(id).innerHTML=lines.map((line,i)=>'<div class="code-row'+(actives.includes(i)?" active":"")+'"><span>'+(i+1)+'</span><span>'+esc(line||" ")+'</span></div>').join("");
}
function renderEvents(id,events) {
 const list=$(id);
 list.innerHTML=events.length?events.map(evt=>'<div><strong>STEP '+evt.id+'</strong> · '+esc(evt.detail)+'</div>').join(""):'<div>아직 실행한 명령이 없습니다.</div>';
 list.scrollTop=list.scrollHeight;
}
function updateM3(){
 const mode=m3Unlocked?m3.mode:$("m3-mode").value;
 const code=fileCode(mode,m3Unlocked?m3.cwd:$("m3-cwd").value);
 renderCode("m3-code",code.parts,code.map[m3.active]||[]);
 const preview=Object.assign({},m3,{cwd:m3Unlocked?m3.cwd:$("m3-cwd").value});
 const file=E.m3File(preview);
 $("m3-status").textContent=m3.status;
 $("m3-return").textContent=m3.returnValue;
 $("m3-pos").textContent=String(m3.pos);
 $("m3-eof").textContent=String(Number(m3.eof));
 $("m3-path").textContent=file.path + (file.exists?"":" · not found");
 $("m3-file").textContent=file.exists?(file.content===""?"(empty file)":file.content):"(file does not exist)";
 $("m3-stdout").textContent=m3.stdout||"(no output)";
 renderEvents("m3-events",m3.events);
 const next=m3Unlocked?E.m3Next(m3):null;
 $("m3-open").disabled=next!=="open";
 $("m3-read").disabled=next!=="read";
 $("m3-write").disabled=next!=="write";
 $("m3-close").disabled=next!=="close";
 $("m3-read").hidden=mode!=="r";$("m3-write").hidden=mode==="r";
 $("m3-mode").disabled=m3Unlocked;$("m3-cwd").disabled=m3Unlocked;
 document.querySelectorAll("#m3-predict input[type=radio]").forEach(x=>x.disabled=m3Unlocked);
 $("m3-confirm").disabled=m3Unlocked;
 setFlow("m3",m3Unlocked?(m3.phase==="closed"||m3.phase==="failed"?3:2):1);
 setNextButton("m3",next);
 const instructions={open:"다음 행동: fopen()으로 파일을 여세요. 다른 모드/디렉터리를 선택하려면 새 예측부터 시작하세요.",
 read:"다음 행동: fgets() 호출. 성공하면 while 본문 fputs()가 자동으로 실행됩니다. 마지막 값 이후에도 추가 읽기가 필요합니다.",
 write:"다음 행동: fprintf()로 한 줄 저장하세요.",
 close:"다음 행동: fclose()로 Stream을 닫으세요."};
 $("m3-guide").textContent=next?instructions[next]:(m3Unlocked&&m3.phase==="failed"?"fopen이 실패했습니다. NULL 검사 후 종료됩니다. 새 실행 준비를 누르면 기존 파일 상태를 유지하면서 다른 조건을 선택할 수 있습니다.":m3Unlocked&&m3.phase==="closed"?"실행 완료. 새 실행 준비 버튼으로 파일을 유지한 채 다른 모드를 실험하세요.":"먼저 예측을 제출하면 fopen 버튼이 활성화됩니다.");
 if(m3Unlocked&&(m3.phase==="closed"||m3.phase==="failed"))showComparison("m3");
}
function updateM4(){
 const scenario=$("m4-scenario").value;
 $("m4-file").textContent=E.sampleData[scenario].content||"(empty file)";
 $("m4-return").textContent=m4.returnValue;
 $("m4-value").textContent=m4.lastValue;
 $("m4-eof").textContent=String(m4.feof);
 $("m4-error").textContent=String(m4.ferror);
 $("m4-stdout").textContent=m4.stdout||"(no output)";
 renderEvents("m4-events",m4.events);
 const active=m4.active==="open"?[3,5]:m4.active==="read"?(m4.returnValue==="1"?[6,7]:[6]):m4.active==="diagnose"?(m4.ferror?[9,10]:m4.feof?[19]:[14,15]):[];
 renderCode("m4-code",eofCode,active);
 const next=m4Unlocked?E.m4Next(m4):null;
 $("m4-open").disabled=next!=="open";$("m4-read").disabled=next!=="read";$("m4-close").disabled=next!=="close";
 $("m4-scenario").disabled=m4Unlocked;
 document.querySelectorAll("#m4-predict input[type=radio]").forEach(x=>x.disabled=m4Unlocked);
 $("m4-confirm").disabled=m4Unlocked;
 setFlow("m4",m4Unlocked?(m4.phase==="closed"?3:2):1);
 setNextButton("m4",next);
 const instructions={open:"다음 행동: fopen()으로 numbers.txt를 여세요.",read:"다음 행동: fscanf()로 정수 1개를 읽으세요. 반환값 1이면 printf가 자동 실행됩니다.",close:"반복문이 종료되었습니다. 반환값·feof·ferror를 살펴본 다음 진단 및 fclose를 누르세요."};
 $("m4-guide").textContent=next?instructions[next]:m4Unlocked&&m4.phase==="closed"?"진단 완료. 내 예측과 실제 반환값을 비교하고 설명을 작성하세요.":"먼저 결과를 예측하고 제출하세요.";
 if(m4Unlocked&&m4.phase==="closed")showComparison("m4");
}
function setFlow(m,step){const titles={m3:["예측","실험","비교","설명"],m4:["예측","실험","비교","설명"]};
 const elems=[...$(m+"-map").children];elems.forEach((node,i)=>{node.classList.toggle("completed",i<step-1);node.classList.toggle("current",i===step-1)});
 const headline=["예측을 제출해 주세요.","코드와 파일 상태를 한 단계씩 관찰하세요.","예측과 결과를 비교하세요.","이유를 설명하고 새 조건에 적용하세요."][Math.min(step-1,3)];
 $(m+"-flow-title").textContent="STEP "+step+" · "+headline;
 $(m+"-flow-detail").textContent=step===1?"실험 전에 생각해보는 단계입니다.":step===2?"현재 활성화된 버튼과 코드 행을 확인하세요.":step===3?"정답은 실행 결과를 관찰한 뒤 공개됩니다.":"관찰 내용을 자신의 말로 정리해 보세요.";
}
function setNextButton(m,next){for(const name of m==="m3"?["open","read","write","close"]:["open","read","close"]){const b=$(m+"-"+name);b.classList.toggle("next-action",name===next)}}
function showComparison(m){const evidence=m==="m3"?m3Evidence:m4Evidence;if(!evidence)return;
 const correct=!!evidence.correct;
 $(m+"-compare").hidden=false;
 $(m+"-compare-result").textContent=correct?"예측 일치 · 예상한 동작과 실제 결과가 같습니다.":"예측 불일치 · 예상과 다른 부분을 확인해 보세요.";
 let detail="";
 if(m==="m3"){
 const file=E.m3File(m3);const answerLabel={unchanged:"기존 내용 유지 · 읽기 준비",empty:"기존 내용 삭제",append:"기존 내용 유지 · 뒤에 기록 준비",fail:"fopen()이 NULL 반환",new:"빈 파일 생성"};
 detail="예측: "+(answerLabel[evidence.choice]||evidence.choice)+"\n정확한 fopen 동작: "+answerLabel[initialM3Preds[evidence.mode+"|"+evidence.cwd]]+"\n실험 이후 파일: "+(file.exists?JSON.stringify(file.content):"(존재하지 않음)")+"\n파일은 다음 프로그램 실행에서도 유지됩니다.";
 }else{
 const labels={eof:"정상 EOF",mismatch:"형식 불일치 (0)",ioError:"I/O 오류 (ferror=1)"};
 detail="예측: "+labels[evidence.choice]+"\n실제 종료 원인: "+labels[correctM4[evidence.scenario]]+"\n마지막 fscanf 반환값: "+m4.returnValue+" / feof="+m4.feof+" / ferror="+m4.ferror+"\n"+(m4.ferror?"이 사례는 실제 OS 오류가 아닌 교육용 인위적 오류입니다.":"fscanf(..., \"%d\", &x) == 1은 정수 1개의 성공적인 변환을 검사합니다.");
 }
 $(m+"-compare-detail").textContent=detail;
 setFlow(m,3);
}
function resetPrediction(mission, preserveFile=false) {
 const isM3=mission==="m3";
 if(isM3){m3Unlocked=false;if(preserveFile){E.m3Restart(m3)}else{m3=E.createM3()}m3Evidence=null;$("m3-mode").disabled=false;$("m3-cwd").disabled=false;$( "m3-compare").hidden=true;}
 else{m4Unlocked=false;m4=E.createM4($("m4-scenario").value);m4Evidence=null;$("m4-scenario").disabled=false;$("m4-compare").hidden=true;}
 document.querySelectorAll('input[name="'+mission+'-pred"]').forEach(x=>x.checked=false);
 $(mission+"-reason").value="";
 $(mission+"-pred-feedback").textContent="";
 $(mission+"-confirm").disabled=false;
 document.querySelectorAll("#"+mission+"-predict input[type=radio]").forEach(x=>x.disabled=false);
 $(mission+"-predict").classList.add("locked");$(mission+"-predict").classList.remove("answered");
 if(isM3)updateM3();else updateM4();
}
$("m3-mode").onchange=updateM3;
$("m3-cwd").onchange=()=>{m3.cwd=$("m3-cwd").value;updateM3()};
$("m4-scenario").onchange=()=>{m4=E.createM4($("m4-scenario").value);updateM4()};
$("m3-confirm").onclick=()=>{
 const selected=document.querySelector('input[name="m3-pred"]:checked');
 if(!selected){$("m3-pred-feedback").textContent="먼저 예상 결과를 선택하세요.";return;}
 const mode=$("m3-mode").value,cwd=$("m3-cwd").value,correct=initialM3Preds[mode+"|"+cwd];
 m3Unlocked=true;m3.mode=mode;m3.cwd=cwd;
 $("m3-predict").classList.remove("locked");$("m3-predict").classList.add("answered");
 m3Evidence={mode,cwd,choice:selected.value,correct:correct===selected.value,reason:$("m3-reason").value.trim(),at:new Date().toISOString()};
 $("m3-pred-feedback").textContent="예측을 기록했습니다. 정답은 프로그램 실행이 끝난 뒤 비교 단계에서 확인합니다. 먼저 fopen()을 눌러 보세요.";
 updateM3();
};
$("m4-confirm").onclick=()=>{
 const selected=document.querySelector('input[name="m4-pred"]:checked');
 if(!selected){$("m4-pred-feedback").textContent="먼저 결과를 선택하세요.";return;}
 const scenario=$("m4-scenario").value;
 m4Unlocked=true;m4=E.createM4(scenario);
 $("m4-predict").classList.remove("locked");$("m4-predict").classList.add("answered");
 m4Evidence={scenario,choice:selected.value,correct:correctM4[scenario]===selected.value,reason:$("m4-reason").value.trim(),at:new Date().toISOString()};
 $("m4-pred-feedback").textContent="예측을 기록했습니다. 정답은 실행을 마친 뒤 확인합니다. fopen()부터 시작해 보세요.";
 updateM4();
};
$("m3-repredict").onclick=()=>resetPrediction("m3",true);
$("m4-repredict").onclick=()=>resetPrediction("m4");
$("m3-open").onclick=()=>{E.m3Open(m3,m3.mode,m3.cwd);updateM3()};
$("m3-read").onclick=()=>{E.m3Read(m3);updateM3()};
$("m3-write").onclick=()=>{E.m3Write(m3);updateM3()};
$("m3-close").onclick=()=>{E.m3Close(m3);updateM3()};
$("m3-restart").onclick=()=>{resetPrediction("m3",true)};
$("m3-reset").onclick=()=>{E.m3Reset(m3);$("m3-mode").value="r";$("m3-cwd").value="lab";resetPrediction("m3",false)};
$("m4-open").onclick=()=>{E.m4Open(m4);updateM4()};
$("m4-read").onclick=()=>{E.m4Read(m4);updateM4()};
$("m4-close").onclick=()=>{E.m4Close(m4);updateM4()};
const noteKey=m=>"els-fileio-pilot-"+m+"-notes";
for(const m of ["m3","m4"]){
 try{$(m+"-reflection").value=localStorage.getItem(noteKey(m))||""}catch(e){}
 $(m+"-save").onclick=()=>{try{localStorage.setItem(noteKey(m),$(m+"-reflection").value);$(m+"-pred-feedback").textContent="학습 설명을 현재 브라우저에 저장했습니다."}catch(e){$(m+"-pred-feedback").textContent="로컬 저장이 차단되어 있습니다. 다운로드 버튼을 이용하세요."}};
 $(m+"-download").onclick=()=>{const evidence=m==="m3"?m3Evidence:m4Evidence;
 const report="File I/O Pilot · "+m.toUpperCase()+"\n"+JSON.stringify(evidence,null,2)+"\n\n실험 설명:\n"+$(m+"-reflection").value+"\n";
 const url=URL.createObjectURL(new Blob([report],{type:"text/plain;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="file-io-"+m+"-reflection.txt";a.click();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
 };
}
function selectTab(active) {
 for(const m of ["m3","m4"]){$(m).hidden=m!==active;$(m+"-tab").classList.toggle("active",m===active);$(m+"-tab").setAttribute("aria-selected",String(m===active));}
}
$("m3-tab").onclick=()=>selectTab("m3");
$("m4-tab").onclick=()=>selectTab("m4");
updateM3();updateM4();
})();
