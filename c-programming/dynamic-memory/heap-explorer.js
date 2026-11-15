/* Chapter 181 conceptual heap explorer (not a C runtime). */
(()=>{
"use strict";
window.renderDynamicHeap=function(stage,lesson){
 const host=document.createElement("section");host.className="dm-heap";host.setAttribute("aria-label","Interactive allocation lifecycle");
 host.innerHTML='<div class="dm-heap-top"><div><span class="dm-label">INTERACTIVE HEAP MEMORY</span><h3>malloc() → use → free()</h3><p>포인터와 메모리 객체의 수명을 단계별로 확인합니다.</p></div><span class="dm-simulation">Concept model · Not real C execution</span></div><div class="dm-switch" role="group" aria-label="Memory lifecycle"><button type="button" data-phase="allocated">1 · malloc()</button><button type="button" data-phase="used">2 · Use</button><button type="button" data-phase="released">3 · free()</button></div><div class="dm-heap-diagram"><div class="dm-pointer"><strong>int *p</strong><output id="dm-pointer-value">p → block</output></div><div class="dm-arrow" aria-hidden="true">→</div><div class="dm-block"><strong>HEAP · int[5]</strong><div class="dm-cells" id="dm-cells"></div><span id="dm-lifetime"></span></div></div><p class="dm-heap-explanation" id="dm-heap-explanation" role="status" aria-live="polite"></p>';
 const before=stage.querySelector(".activity.trace-lab");
 if(before)before.before(host);else stage.append(host);
 const buttons=[...host.querySelectorAll("[data-phase]")],cells=host.querySelector("#dm-cells"),ptr=host.querySelector("#dm-pointer-value"),life=host.querySelector("#dm-lifetime"),explain=host.querySelector("#dm-heap-explanation");
 const values=[10,20,30,40,50];
 function render(phase){
  host.dataset.phase=phase;
  buttons.forEach(b=>{const active=b.dataset.phase===phase;b.setAttribute("aria-pressed",String(active));b.classList.toggle("active",active)});
  cells.replaceChildren();
  values.forEach((v,i)=>{const el=document.createElement("div");el.className="dm-cell";const label=document.createElement("small");label.textContent="p["+i+"]";const val=document.createElement("strong");val.textContent=phase==="allocated"?"?":phase==="used"?String(v):"×";el.append(label,val);cells.append(el)});
  if(phase==="allocated"){
   ptr.textContent="p → allocated block";life.textContent="Allocated · uninitialized";explain.textContent="malloc(5 * sizeof *p)가 성공했다고 가정합니다. 다섯 개의 int 값을 읽기 전에 반드시 초기화해야 합니다.";
  }else if(phase==="used"){
   ptr.textContent="p → valid int[5]";life.textContent="Lifetime active";explain.textContent="p[i]와 *(p+i)는 같은 원소입니다. 배열 경계 안에서 값을 초기화하고 읽을 수 있습니다.";
  }else{
   ptr.textContent="p = NULL (explicitly set)";life.textContent="Released · object no longer exists";explain.textContent="free(p)로 할당을 해제했습니다. free만으로 p가 NULL이 되지는 않으며, 이후 p = NULL을 별도로 실행한 개념 모델입니다. 해제 후에는 어떤 별칭으로도 접근하면 안 됩니다.";
  }
 }
 buttons.forEach(b=>b.addEventListener("click",()=>render(b.dataset.phase)));
 render("allocated");
};
})();