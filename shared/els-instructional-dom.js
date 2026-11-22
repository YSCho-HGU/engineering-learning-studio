/* Shared presentational localization for authored bilingual instructional DOM.
 * No source-code, plot or input rewriting. State is preserved on language changes.
 */
(function(window,document){
"use strict";
if(window.ELSInstructionalDOM)return;
const language=window.ELSLanguage;
if(!language)return;
const exact={
 "생각해 보기":"Think about it",
 "정답 및 설명 보기":"Show answer and explanation",
 "학습 주제":"Learning experiments",
 "단계별 이해":"Guided explanation",
 "스스로 확인":"Check yourself",
 "학습 확인":"Mark lab reviewed",
 "해설 보기":"Show answer",
 "핵심 관계식":"Key relation",
 "학습 배경":"Learning background",
 "먼저 예측해 보세요":"Predict first"
};
const originals=new WeakMap();
const korean=/[가-힣]/;
let active=false,observer=null;
function format(text,mode){
 const trimmed=text.trim(),leading=text.slice(0,text.indexOf(trimmed));
 if(!korean.test(trimmed))return text;
 if(Object.prototype.hasOwnProperty.call(exact,trimmed)){
  const en=exact[trimmed];return leading+(mode==="en"?en:mode==="ko"?trimmed:en+" / "+trimmed)+text.slice(text.indexOf(trimmed)+trimmed.length);
 }
 // This rule applies only to explicitly authored English + Korean pairs.
 const pair=trimmed.match(/^([\s\S]*[A-Za-z][\s\S]*)\s+(?:\/|·)\s+([가-힣][\s\S]*)$/);
 if(!pair)return text;
 const en=pair[1].trim(),ko=pair[2].trim();
 const result=mode==="en"?en:mode==="ko"?ko:en+"\n"+ko;
 return leading+result+text.slice(text.indexOf(trimmed)+trimmed.length);
}
function update(){
 if(active||!document.body)return;
 active=true;if(observer)observer.disconnect();
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 let node;
 while((node=walker.nextNode())){
  const parent=node.parentElement;
  if(!parent||parent.closest('script,style,pre,code,textarea,svg,canvas,math,.katex,[contenteditable]'))continue;
  const present=node.nodeValue;
  let record=originals.get(node);
  if(!record){record={source:present,rendered:present};originals.set(node,record)}
  else if(present!==record.source&&present!==record.rendered){
    record.source=present;
  }
  const translated=format(record.source,language.get());
  record.rendered=translated;
  if(present!==translated)node.nodeValue=translated;
 }
 if(observer)observer.observe(document.body,{subtree:true,childList:true,characterData:true});
 active=false;
}
function init(){
 observer=new MutationObserver(()=>queueMicrotask(update));
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
 language.subscribe(update,true);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
window.ELSInstructionalDOM=Object.freeze({version:"1.0.0",refresh:update});
})(window,document);
