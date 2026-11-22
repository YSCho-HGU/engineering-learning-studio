/* Perspective helix renderer and orbit camera. Self-contained: no external 3D engine.
   World axes: t (X), Re x(t) (Y), Im x(t) (Z). The camera rotates in 3D
   and projects through a perspective lens, with depth-sorted signal segments.
   Drag / touch to orbit, wheel / pinch to zoom, arrow / +/- keys to adjust.
*/
(function(){
"use strict";
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const TAU=2*Math.PI;
function create(canvas,onViewChanged){
 const camera={yaw:-.54,pitch:.26,distance:9.2};
 const pointers=new Map();
 let previousPinch=0,dragging=false;
 function reset(){camera.yaw=-.54;camera.pitch=.26;camera.distance=9.2;onViewChanged();}
 function rotate(dx,dy){
  camera.yaw+=dx*.009;
  camera.pitch=clamp(camera.pitch+dy*.009,-1.48,1.48);
  onViewChanged();
 }
 function zoom(amount){
  camera.distance=clamp(camera.distance*Math.exp(amount),5.3,21);
  onViewChanged();
 }
 function cameraProject(p,w,h){
  const cy=Math.cos(camera.yaw),sy=Math.sin(camera.yaw);
  const cp=Math.cos(camera.pitch),sp=Math.sin(camera.pitch);
  const x=cy*p[0]+sy*p[2],z1=-sy*p[0]+cy*p[2];
  const y=cp*p[1]-sp*z1,z=sp*p[1]+cp*z1;
  const d=camera.distance-z;
  const focal=Math.min(w*.90,h*1.10)/Math.tan(42*Math.PI/360);
  const scale=focal/d;
  return {x:w/2+x*scale,y:h*.53-y*scale,depth:d,scale};
 }
 function strokeSegment(ctx,a,b,color,width,alpha=1){
  if(!a||!b||a.depth<=.1||b.depth<=.1)return;
  ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.globalAlpha=1;
 }
 function draw({ctx,w,h,pal,f,sigma,tSelected}){
  if(!ctx||w<10||h<10)return;
  const total=3,peak=Math.exp(Math.max(0,sigma)*total),world=(t)=>{const radius=Math.exp(sigma*t)/peak,phi=TAU*f*t;return[-2.5+5*t/total,radius*Math.cos(phi),radius*Math.sin(phi)]};
  const proj=p=>cameraProject(p,w,h);
  const center=proj([0,0,0]);
  const o=proj([-2.5,0,0]),tEnd=proj([2.5,0,0]),reEnd=proj([-2.5,1.35,0]),imEnd=proj([-2.5,0,1.35]);
  const gridColor=pal.border||"#666";
  // 3D reference axes, tick marks, and the real/imaginary reference circles.
  strokeSegment(ctx,o,tEnd,pal.muted,1.6,.85);
  strokeSegment(ctx,proj([-2.5,-1.35,0]),reEnd,gridColor,1,.68);
  strokeSegment(ctx,proj([-2.5,0,-1.35]),imEnd,gridColor,1,.68);
  for(let i=0;i<=6;i++){
   const t=i/6,axisX=-2.5+5*t;
   strokeSegment(ctx,proj([axisX,-.06,0]),proj([axisX,.06,0]),gridColor,1,.45);
  }
  const planeSegments=36;
  for(let k=0;k<planeSegments;k++){
   const a=k/planeSegments*TAU,b=(k+1)/planeSegments*TAU;
   strokeSegment(ctx,proj([-2.5,Math.cos(a),Math.sin(a)]),proj([-2.5,Math.cos(b),Math.sin(b)]),gridColor,1,.3);
  }
  // Perspective and depth ordering make the near/far portions of the helix
  // react realistically when the user orbits the 3D camera.
  const count=850,segments=[];
  let prev=proj(world(0));
  for(let i=1;i<=count;i++){
   const now=proj(world(total*i/count));
   segments.push({a:prev,b:now,depth:(prev.depth+now.depth)/2});
   prev=now;
  }
  segments.sort((a,b)=>b.depth-a.depth);
  ctx.lineCap="round";ctx.lineJoin="round";
  for(const seg of segments){
   const relative=clamp(camera.distance/seg.depth,.65,1.55);
   strokeSegment(ctx,seg.a,seg.b,pal.link,clamp(1.6*relative,1.5,3.7),clamp(.62+.23*relative,.52,1));
  }
  const selected=proj(world(tSelected)),base=proj([-2.5+5*tSelected/total,0,0]);
  strokeSegment(ctx,base,selected,pal.second||"#f0b68d",1.8,.9);
  if(selected&&selected.depth>.1){
   ctx.beginPath();ctx.arc(selected.x,selected.y,clamp(5.1*camera.distance/selected.depth,4,8),0,TAU);
   ctx.fillStyle=pal.second||"#f0b68d";ctx.fill();
   ctx.strokeStyle=pal.ink;ctx.lineWidth=1.2;ctx.stroke();
  }
  // Project axis labels after the signal; labels stay readable under orbit.
  ctx.fillStyle=pal.ink;ctx.font="13px Arial, sans-serif";
  for(const [p,label,dx,dy] of [[tEnd,"t",7,-2],[reEnd,"Re",5,-6],[imEnd,"Im",5,-7]]){
   ctx.fillText(label,clamp(p.x+dx,7,w-26),clamp(p.y+dy,15,h-9));
  }
  ctx.fillStyle=pal.muted;ctx.font="11px Arial, sans-serif";
  ctx.fillText("3D · "+Math.round(camera.distance*10)/10+"×",12,20);
 }
 canvas.tabIndex=0;
 canvas.style.touchAction="none";
 canvas.style.cursor="grab";
 canvas.setAttribute("aria-label","Perspective 3D helix. Drag to orbit, wheel to zoom, keyboard arrows to rotate and plus or minus to zoom.");
 canvas.addEventListener("pointerdown",event=>{
  if(event.button!==undefined&&event.pointerType==="mouse"&&event.button!==0)return;
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if(canvas.setPointerCapture)canvas.setPointerCapture(event.pointerId);
  dragging=true;canvas.style.cursor="grabbing";previousPinch=0;
 });
 canvas.addEventListener("pointermove",event=>{
  if(!pointers.has(event.pointerId))return;
  const prior=pointers.get(event.pointerId);
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if(pointers.size===1)rotate(event.clientX-prior.x,event.clientY-prior.y);
  else if(pointers.size===2){
   const [a,b]=[...pointers.values()],dist=Math.hypot(a.x-b.x,a.y-b.y);
   if(previousPinch>0&&dist>0)zoom(-Math.log(dist/previousPinch));
   previousPinch=dist;
  }
 });
 const finish=event=>{
  pointers.delete(event.pointerId);
  dragging=pointers.size>0;
  if(!dragging)canvas.style.cursor="grab";
  previousPinch=0;
  try{if(canvas.hasPointerCapture?.(event.pointerId))canvas.releasePointerCapture(event.pointerId)}catch(e){}
 };
 canvas.addEventListener("pointerup",finish);
 canvas.addEventListener("pointercancel",finish);
 canvas.addEventListener("lostpointercapture",finish);
 canvas.addEventListener("wheel",event=>{event.preventDefault();zoom(clamp(event.deltaY,-250,250)*.0012)},{passive:false});
 canvas.addEventListener("dblclick",event=>{event.preventDefault();reset()});
 canvas.addEventListener("keydown",event=>{
  const action={
   ArrowLeft:()=>rotate(-24,0),ArrowRight:()=>rotate(24,0),
   ArrowUp:()=>rotate(0,-24),ArrowDown:()=>rotate(0,24),
   "+":()=>zoom(-.13),"=":()=>zoom(-.13),"-":()=>zoom(.13),"0":reset
  }[event.key];
  if(action){event.preventDefault();action()}
 });
 return {camera,draw,reset,rotate,zoom};
}
window.SSPerspectiveHelix=Object.freeze({create});
})();
