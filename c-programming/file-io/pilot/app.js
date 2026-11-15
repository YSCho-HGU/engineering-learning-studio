(() => {
"use strict";
const E=window.FileIOPilot;if(!E){document.body.insertAdjacentHTML("afterbegin","<p>Learning engine failed to load.</p>");return;}
const $=id=>document.getElementById(id);
let m3=E.createM3(),m4=E.createM4(),m3Unlocked=false,m4Unlocked=false,m3Evidence=null,m4Evidence=null;
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
 const code=fileCode(mode,m3.cwd);
 renderCode("m3-code",code.parts,code.map[m3.active]||[]);
 const file=E.m3File(m3);
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
 const instructions={open:"다음 행동: fopen()으로 파일을 여세요. 다른 모드/디렉터리를 선택하려면 새 예측부터 시작하세요.",
 read:"다음 행동: fgets() 호출. 성공하면 while 본문 fputs()가 자동으로 실행됩니다. 마지막 값 이후에도 추가 읽기가 필요합니다.",
 write:"다음 행동: fprintf()로 한 줄 저장하세요.",
 close:"다음 행동: fclose()로 Stream을 닫으세요."};
 $("m3-guide").textContent=next?instructions[next]:(m3Unlocked&&m3.phase==="failed"?"fopen이 실패했습니다. NULL 검사 뒤 종료했습니다. Restart 또는 Reset 후 다른 조건을 실험하세요.":m3Unlocked&&m3.phase==="closed"?"모든 작업이 끝났습니다. Restart 후 다시 열거나 Reset으로 샘플을 복원할 수 있습니다.":"먼저 예측을 제출하면 fopen 버튼이 활성화됩니다.");
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
 const instructions={open:"다음 행동: fopen()으로 numbers.txt를 여세요.",read:"다음 행동: fscanf()로 정수 1개를 읽으세요. 반환값 1이면 printf가 자동 실행됩니다.",close:"반복문이 종료되었습니다. 반환값·feof·ferror를 살펴본 다음 진단 및 fclose를 누르세요."};
 $("m4-guide").textContent=next?instructions[next]:m4Unlocked&&m4.phase==="closed"?"진단 완료. 다른 입력 시나리오를 선택해 예측부터 다시 시작하세요.":"먼저 결과를 예측하고 제출하세요.";
}
function resetPrediction(mission) {
 const isM3=mission==="m3";
 if(isM3){m3Unlocked=false;m3=E.createM3();m3Evidence=null;$("m3-mode").disabled=false;$("m3-cwd").disabled=false;}
 else{m4Unlocked=false;m4=E.createM4($("m4-scenario").value);m4Evidence=null;$("m4-scenario").disabled=false;}
 document.querySelectorAll('input[name="'+mission+'-pred"]').forEach(x=>x.checked=false);
 $(mission+"-reason").value="";
 $(mission+"-pred-feedback").textContent="";
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
 m3Evidence={mode,cwd,choice:selected.value,correct:correct===selected.value,reason:$("m3-reason").value.trim(),at:new Date().toISOString()};
 $("m3-pred-feedback").textContent=(m3Evidence.correct?"예측이 맞았습니다. ":"예측과 C 동작을 비교해 보세요. ")+"이제 직접 파일을 열어 결과를 관찰하세요. 정답은 실행 결과와 힌트에서 확인합니다.";
 updateM3();
};
$("m4-confirm").onclick=()=>{
 const selected=document.querySelector('input[name="m4-pred"]:checked');
 if(!selected){$("m4-pred-feedback").textContent="먼저 결과를 선택하세요.";return;}
 const scenario=$("m4-scenario").value;
 m4Unlocked=true;m4=E.createM4(scenario);
 m4Evidence={scenario,choice:selected.value,correct:correctM4[scenario]===selected.value,reason:$("m4-reason").value.trim(),at:new Date().toISOString()};
 $("m4-pred-feedback").textContent=(m4Evidence.correct?"예측이 맞았습니다. ":"예측과 실제 반환값을 비교해 보세요. ")+"이제 fscanf의 반환값과 feof/ferror를 차례대로 확인하세요.";
 updateM4();
};
$("m3-repredict").onclick=()=>resetPrediction("m3");
$("m4-repredict").onclick=()=>resetPrediction("m4");
$("m3-open").onclick=()=>{E.m3Open(m3,m3.mode,m3.cwd);updateM3()};
$("m3-read").onclick=()=>{E.m3Read(m3);updateM3()};
$("m3-write").onclick=()=>{E.m3Write(m3);updateM3()};
$("m3-close").onclick=()=>{E.m3Close(m3);updateM3()};
$("m3-restart").onclick=()=>{E.m3Restart(m3);updateM3()};
$("m3-reset").onclick=()=>{E.m3Reset(m3);m3Unlocked=false;m3Evidence=null;$("m3-mode").value="r";$("m3-cwd").value="lab";resetPrediction("m3")};
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
