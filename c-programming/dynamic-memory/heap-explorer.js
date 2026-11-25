/* Chapter 181: conceptual heap, NOT a C compiler. Addresses are illustrative. */
(()=>{
"use strict";
window.renderDynamicHeap=function(stage){
 const host=document.createElement("section");host.className="dm-heap";host.setAttribute("aria-label","Heap memory lifecycle visualization");
 host.innerHTML='<div class="dm-heap-top"><div><span class="dm-label">INTERACTIVE HEAP MEMORY</span><h3>malloc() → Use → free()</h3><p>포인터와 가상의 Heap 메모리의 관계를 관찰합니다.</p></div><span class="dm-simulation">Conceptual addresses · Not real C memory</span></div><div class="dm-switch" role="group" aria-label="Memory lifecycle"><button data-phase="allocated" type="button">1 · malloc()</button><button data-phase="used" type="button">2 · Use</button><button data-phase="released" type="button">3 · free()</button><button id="dm-play" type="button">▶ 자동 재생</button></div><div class="dm-heap-diagram"><div class="dm-pointer"><strong>int *p</strong><output id="dm-pointer-value"></output><small>Pointer</small></div><div class="dm-arrow" id="dm-arrow" aria-hidden="true">→</div><div class="dm-block"><strong>HEAP · int[5]</strong><div class="dm-cells" id="dm-cells"></div><span id="dm-lifetime"></span></div></div><p id="dm-detail" class="dm-detail" aria-live="polite"></p><p id="dm-heap-explanation" class="dm-heap-explanation" role="status"></p><details class="dm-leak"><summary>선택 실험 · Memory Leak</summary><p>free 없이 포인터 값을 덮어쓰면 이전 블록에 접근할 방법을 잃을 수 있습니다.</p><div class="dm-switch" role="group" aria-label="Memory leak demonstration"><button data-leak="start" type="button">1 · malloc A</button><button data-leak="lost" type="button">2 · p = malloc B</button><button data-leak="clean" type="button">3 · 올바른 해제</button></div><div class="dm-leak-board" id="dm-leak-board"></div><p class="dm-leak-note" id="dm-leak-note" aria-live="polite"></p></details>';
 const old=stage.querySelector(".activity.trace-lab");if(old)old.before(host);else stage.append(host);
 const $=q=>host.querySelector(q),buttons=[...host.querySelectorAll("[data-phase]")],play=$("#dm-play"),cells=$("#dm-cells"),values=[10,20,30,40,50];
 let timer=null,selected=0,scheduledPhase=null,scheduledAt=0;
 const addr=i=>"0x"+(4096+i*4).toString(16).toUpperCase();
 function stop(){if(timer!==null){clearTimeout(timer);timer=null}scheduledPhase=null;scheduledAt=0;play.textContent="▶ 자동 재생";play.setAttribute("aria-pressed","false")}
 function render(phase,index=selected){
  selected=index;host.dataset.phase=phase;
  buttons.forEach(b=>{const active=b.dataset.phase===phase;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active))});
  $("#dm-pointer-value").textContent=phase==="released"?"NULL (별도 대입)":"0x1000 (가상)";
  $("#dm-arrow").textContent=phase==="released"?"×":"→";
  cells.replaceChildren();
  values.forEach((value,i)=>{
   const b=document.createElement("button");b.type="button";b.className="dm-cell";b.disabled=phase==="released";b.classList.toggle("selected",i===selected&&phase!=="released");b.setAttribute("aria-pressed",String(i===selected&&phase!=="released"));
   const name=document.createElement("small"),v=document.createElement("strong"),address=document.createElement("em");
   name.textContent="p["+i+"]";v.textContent=phase==="allocated"?"?":phase==="used"?String(value):"×";address.textContent=addr(i);
   b.append(name,v,address);b.addEventListener("click",()=>{stop();render(phase,i)});cells.append(b);
  });
  $("#dm-lifetime").textContent=phase==="allocated"?"Allocated · 초기화 전":phase==="used"?"Allocated · 초기화 후":"Released · 객체 수명 종료";
  $("#dm-detail").textContent=phase==="released"?"메모리를 해제했습니다. 이전 주소를 역참조하지 마세요.":"p["+selected+"] = *(p+"+selected+") → "+addr(selected)+" (가상 주소) · "+(phase==="used"?"값 "+values[selected]:"읽기 금지");
  $("#dm-heap-explanation").textContent=phase==="allocated"?"malloc(5 * sizeof *p)가 성공했다고 가정합니다. 각 원소는 아직 초기화되지 않았으므로 읽으면 안 됩니다.":phase==="used"?"원소를 초기화하였습니다. p[i]와 *(p+i)는 같은 요소에 접근합니다. 인덱스 범위는 0~4입니다.":"free(p) 후 메모리 수명은 끝납니다. free 자체가 p를 NULL로 바꾸지는 않으므로 p = NULL을 별도로 수행한 상태를 보여 줍니다.";
 }
 buttons.forEach(b=>b.addEventListener("click",()=>{stop();render(b.dataset.phase)}));
 const phases=["allocated","used","released"];
 function advance(i){
  if(!host.isConnected||i>=phases.length){stop();return}
  render(phases[i],i===1?2:0);
  scheduledPhase=i+1;scheduledAt=Date.now()+1400;
  timer=setTimeout(()=>advance(i+1),1400);
 }
 play.addEventListener("click",()=>{if(timer!==null){stop();return}play.textContent="■ 중지";play.setAttribute("aria-pressed","true");advance(0)});
 const leakButtons=[...host.querySelectorAll("[data-leak]")],board=$("#dm-leak-board"),note=$("#dm-leak-note");
 function leak(phase){
  leakButtons.forEach(b=>{const active=b.dataset.leak===phase;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active))});
  board.replaceChildren();
  for(const [name,address,state] of [["Block A","0x1000",phase==="lost"?"lost":phase==="clean"?"freed":"allocated"],["Block B","0x2000",phase==="lost"?"allocated":phase==="clean"?"freed":"pending"]]){
   const card=document.createElement("div");card.className="dm-leak-block "+state;
   const head=document.createElement("strong"),desc=document.createElement("span");head.textContent=name+" · "+address;
   desc.textContent=state==="lost"?"⚠ 해제 경로 상실":state==="freed"?"해제 완료":state==="allocated"?"할당됨":"미할당";card.append(head,desc);board.append(card);
  }
  note.textContent=phase==="start"?"p는 첫 번째 할당 블록 A를 가리킵니다.":phase==="lost"?"free(p)를 실행하지 않고 p에 블록 B의 주소를 저장하면 A를 잃습니다. B를 해제해도 A 누수는 해결되지 않습니다.":"안전한 순서: malloc A → 사용 → free A → malloc B → 사용 → free B. 각 할당을 정확히 한 번 해제합니다.";
 }
 leakButtons.forEach(b=>b.addEventListener("click",()=>leak(b.dataset.leak)));leak("start");render("allocated");
 host.getLanguageSnapshot=()=>({
  phase:host.dataset.phase,selected,
  leak:leakButtons.find(b=>b.classList.contains("active"))?.dataset.leak||"start",
  playing:timer!==null,scheduledPhase,
  remaining:Math.max(0,scheduledAt-Date.now())
 });
 host.restoreLanguageSnapshot=saved=>{
  if(!saved||typeof saved!=="object")return;
  stop();
  const phase=phases.includes(saved.phase)?saved.phase:"allocated";
  const index=Number.isInteger(saved.selected)?Math.max(0,Math.min(4,saved.selected)):0;
  render(phase,index);
  leak(["start","lost","clean"].includes(saved.leak)?saved.leak:"start");
  if(saved.playing&&Number.isInteger(saved.scheduledPhase)){
   play.textContent="■ 중지";play.setAttribute("aria-pressed","true");
   scheduledPhase=saved.scheduledPhase;
   scheduledAt=Date.now()+Math.max(0,Number(saved.remaining)||0);
   timer=setTimeout(()=>advance(saved.scheduledPhase),Math.max(0,Number(saved.remaining)||0));
  }
 };
 const observer=new MutationObserver(()=>{if(!host.isConnected){stop();observer.disconnect()}});
 observer.observe(stage,{childList:true});
};
})();