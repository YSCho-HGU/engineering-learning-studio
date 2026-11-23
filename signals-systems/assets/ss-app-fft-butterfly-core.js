/* Pedagogical 8-point radix-2 decimation-in-time FFT trace.
   Pure computation: every butterfly returns the same complex values used in a real FFT. */
(function(root){
"use strict";
const N=8;
const bitReversed=[0,4,2,6,1,5,3,7];
const clean=z=>({re:z.re,im:z.im});
const presets={
 ramp:[0,1,2,3,4,5,6,7],
 impulse:[1,0,0,0,0,0,0,0],
 tone:Array.from({length:N},(_,n)=>Math.cos(2*Math.PI*n/N))
};
function parseSamples(text){
 const parts=String(text).trim().split(/[\s,;]+/).filter(Boolean);
 if(parts.length!==N)throw Error("Exactly eight real-valued samples are required.");
 const samples=parts.map(Number);
 if(samples.some(v=>!Number.isFinite(v)||Math.abs(v)>1e6))throw Error("Use finite real samples with absolute value at most 1,000,000.");
 return samples;
}
function trace(values){
 const samples=Array.from(values);
 if(samples.length!==N||samples.some(x=>!Number.isFinite(x)||Math.abs(x)>1e6))throw Error("Exactly eight finite real samples are required.");
 let work=bitReversed.map(i=>({re:samples[i],im:0}));
 const stages=[work.map(clean)],operations=[[]];
 for(let length=2;length<=N;length*=2){
  const half=length/2,previous=work.map(clean),next=previous.map(clean),ops=[];
  for(let start=0;start<N;start+=length){
   for(let r=0;r<half;r++){
    const a=start+r,b=a+half;
    const phase=-2*Math.PI*r/length,W={re:Math.cos(phase),im:Math.sin(phase)};
    const u=clean(previous[a]),v=clean(previous[b]);
    const t={re:W.re*v.re-W.im*v.im,im:W.re*v.im+W.im*v.re};
    const plus={re:u.re+t.re,im:u.im+t.im},minus={re:u.re-t.re,im:u.im-t.im};
    next[a]=plus;next[b]=minus;
    ops.push({length,r,a,b,W,u,v,t,plus,minus});
   }
  }
  work=next;
  stages.push(work.map(clean));operations.push(ops);
 }
 const direct=Array.from({length:N},(_,k)=>{
  let re=0,im=0;
  for(let n=0;n<N;n++){const angle=-2*Math.PI*k*n/N;re+=samples[n]*Math.cos(angle);im+=samples[n]*Math.sin(angle)}
  return{re,im};
 });
 const fft=stages[3],errors=fft.map((z,k)=>Math.hypot(z.re-direct[k].re,z.im-direct[k].im));
 return{samples:samples.slice(),order:bitReversed.slice(),stages,operations,fft,direct,errors,maxError:Math.max(...errors)};
}
function format(z,digits=3){
 const eps=0.5*Math.pow(10,-digits),a=Math.abs(z.re)<eps?0:z.re,b=Math.abs(z.im)<eps?0:z.im;
 const f=x=>x.toFixed(digits);
 if(b===0)return f(a);
 if(a===0)return f(b)+"j";
 return f(a)+(b<0?" − ":" + ")+f(Math.abs(b))+"j";
}
root.SSButterfly8=Object.freeze({trace,parseSamples,format,presets,bitReversed});
})(window);
