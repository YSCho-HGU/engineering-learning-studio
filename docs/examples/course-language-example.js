/* Minimal new-course localization example.
   Copy into Python or Logic Design only after the course exists. */
(function(){
  "use strict";
  const language=window.ELSLanguage;
  if(!language)throw new Error("Load assets/els-language.js before the course script");
  const source={
    heading:{en:"Explore the lesson",ko:"단원 탐색",mixed:"Explore the lesson · 단원 탐색"},
    instructions:{en:"Change the input and observe the result.",ko:"입력을 바꾸고 결과를 관찰하세요.",mixed:"Change the input and observe the result. · 입력을 바꾸고 결과를 관찰하세요."}
  };
  language.bindSelect("#course-language");
  language.subscribe((mode)=>{
    for(const key of Object.keys(source)){
      const node=document.querySelector('[data-i18n="'+key+'"]');
      if(node)node.textContent=source[key][mode];
    }
  },true);
})();
