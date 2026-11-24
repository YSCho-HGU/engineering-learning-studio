/* Signals & Systems Chapter 4 responsive geometry; one controller for Ch 1-8.
 * Read-only measurement of header. Do not touch lesson state or event handlers.
 */
(function(){
"use strict";
const root=document.documentElement;
if(!root.matches(".ss-foundations-standard,.ss5-native,.ss6-compact-workspace,.ss7-native,.ss8-native"))return;
let pending=false,last=-1;
function sync(){
 pending=false;
 const header=document.querySelector(".ss-common-header");
 if(!header)return;
 const height=Math.max(46,Math.round(header.getBoundingClientRect().height));
 if(height===last)return;
 last=height;
 root.style.setProperty("--ss-layout-header",height+"px");
}
function schedule(){
 if(pending)return;
 pending=true;requestAnimationFrame(sync);
}
function init(){
 sync();
 const header=document.querySelector(".ss-common-header");
 if(header&&typeof ResizeObserver!=="undefined"){
  new ResizeObserver(schedule).observe(header);
 }
 window.addEventListener("resize",schedule,{passive:true});
 window.addEventListener("pageshow",schedule);
 schedule();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
