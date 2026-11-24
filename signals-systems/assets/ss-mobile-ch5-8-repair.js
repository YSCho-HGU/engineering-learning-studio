/* Runtime geometry only. Keep teaching state, language/theme selection,
 * mathematical data, graph drawing, and lesson navigation unchanged. */
(function(){
 "use strict";
 const root=document.documentElement;
 if(!root.matches(".ss5-native,.ss6-compact-workspace,.ss7-native,.ss8-native"))return;
 let pending=0,last=0;
 const header=()=>document.querySelector(".ss-common-header");
 function sync(){
  pending=0;
  const h=header()?.getBoundingClientRect().height||58;
  const px=Math.max(46,Math.round(h));
  if(px===last)return;
  last=px;
  root.style.setProperty("--ss-layout-header",px+"px");
 }
 function schedule(){
  if(!pending)pending=requestAnimationFrame(sync);
 }
 function init(){
  sync();
  const h=header();
  if(h&&typeof ResizeObserver!=="undefined"){
   const observer=new ResizeObserver(schedule);observer.observe(h);
  }
  window.addEventListener("resize",schedule,{passive:true});
  window.addEventListener("pageshow",schedule);
  schedule();
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
