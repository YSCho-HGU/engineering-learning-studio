/* Shared font policy for Canvas signal plots in Chapters 1-6.
   Read CSS tokens at render time so desktop/projector/mobile can differ.
   Does not change Canvas coordinate transforms or waveform computations. */
(function(global){
 "use strict";
 const fallback={tick:13,axis:15,annotation:12,minor:11,legend:13};
 const allowed=new Set(Object.keys(fallback));
 function size(role){
  const name=allowed.has(role)?role:"tick";
  const root=getComputedStyle(document.documentElement);
  const value=parseFloat(root.getPropertyValue("--ss-canvas-"+name+"-size"));
  return Number.isFinite(value)&&value>=10&&value<=26?value:fallback[name];
 }
 function font(role,{bold=false}={}){
  const px=size(role);
  return (bold?"700 ":"")+px+"px system-ui, Arial, sans-serif";
 }
 global.SSCanvasTypography=Object.freeze({size,font});
})(window);
