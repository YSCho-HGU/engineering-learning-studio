/* Shared File I/O page-to-page learning route.
 * Read-only navigation: does not alter lesson stages, saved drafts, or progress.
 */
(() => {
  "use strict";
  const section = document.body?.dataset.fileioSection;
  if (!["concepts","labs","practice"].includes(section)) return;
  if (document.getElementById("fileio-learning-path")) return;
  const routes = {
    concepts: {concepts:"./",labs:"./core-labs/",practice:"./practice/"},
    labs:     {concepts:"../",labs:"./",practice:"../practice/"},
    practice: {concepts:"../",labs:"../core-labs/",practice:"./"}
  };
  const steps = ["concepts","labs","practice"];
  const copy = {
    ko: {
      caption:"File I/O 학습 경로",
      aria:"File I/O 학습 단계 이동",
      concepts:"개념 학습",
      labs:"필수 코딩 실습",
      practice:"직접 코딩 Practice",
      previous:"이전 학습",
      next:"다음 학습"
    },
    en: {
      caption:"File I/O learning path",
      aria:"File I/O learning navigation",
      concepts:"Concepts",
      labs:"Essential coding labs",
      practice:"Coding practice",
      previous:"Previous",
      next:"Next"
    }
  };
  const nav = document.createElement("nav");
  nav.className = "fileio-learning-path";
  nav.id = "fileio-learning-path";
  const before = section === "concepts" ? null : steps[steps.indexOf(section)-1];
  const after = section === "practice" ? null : steps[steps.indexOf(section)+1];
  const segments = steps.map((key,i) =>
    '<li class="fileio-learning-path__step'+(key===section?' is-current':'')+'">'+
      '<a href="'+routes[section][key]+'" data-fileio-path-label="'+key+'"'+
      (key===section?' aria-current="page"':'')+'>'+
      '<span class="fileio-learning-path__number">'+String(i+1).padStart(2,"0")+'</span> '+
      '<span class="fileio-learning-path__name"></span></a></li>'
  ).join("");
  nav.innerHTML =
    '<div class="fileio-learning-path__main">'+
      '<span class="fileio-learning-path__caption" id="fileio-learning-path-caption"></span>'+
      '<ol class="fileio-learning-path__steps">'+segments+'</ol>'+
    '</div>'+
    '<div class="fileio-learning-path__actions">'+
      (before?'<a class="fileio-learning-path__move" href="'+routes[section][before]+'" data-fileio-move="previous"></a>':'')+
      (after?'<a class="fileio-learning-path__move" href="'+routes[section][after]+'" data-fileio-move="next"></a>':'')+
    '</div>';
  const header = document.querySelector("body > header");
  if (header) header.insertAdjacentElement("afterend",nav);
  else document.body.prepend(nav);

  function render() {
    const mode=window.ELSLanguage?.get()==="en"?"en":"ko";
    const t=copy[mode];
    nav.setAttribute("aria-label",t.aria);
    nav.querySelector("#fileio-learning-path-caption").textContent=t.caption;
    nav.querySelectorAll("[data-fileio-path-label]").forEach(link=>{
      const key=link.getAttribute("data-fileio-path-label");
      link.querySelector(".fileio-learning-path__name").textContent=t[key];
      if(key===section) link.setAttribute("aria-label",t[key]+" ("+(mode==="en"?"current":"현재 화면")+")");
    });
    for(const [direction,key] of [["previous",before],["next",after]]) {
      const link=nav.querySelector('[data-fileio-move="'+direction+'"]');
      if(link) link.textContent=(direction==="previous"?"← ":"")+t[direction]+": "+t[key]+(direction==="next"?" →":"");
    }
  }
  render();
  window.ELSLanguage?.subscribe(render);
})();