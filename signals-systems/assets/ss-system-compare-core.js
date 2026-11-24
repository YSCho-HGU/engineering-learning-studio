/* Shared-input comparison of an analog RC low-pass and a causal M-tap FIR moving average.
 * Samples x[n] are held for each preceding interval of length 1/fs.
 * RC samples are end-of-interval voltages with zero initial capacitor voltage:
 * y_rc[n] = alpha*y_rc[n-1] + (1-alpha)*x[n], alpha=e^(-1/(fs*tau)).
 * All filters share the exact same deterministic sampled input x[n].
 */
(function(root){
"use strict";
const PI=Math.PI,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function movingGain(M,omega){
 if(M===1)return 1;
 if(Math.abs(omega)<1e-12)return 1;
 return Math.abs(Math.sin(M*omega/2)/(M*Math.sin(omega/2)));
}
function rcGain(alpha,omega){
 return (1-alpha)/Math.sqrt(1+alpha*alpha-2*alpha*Math.cos(omega));
}
/* Exact frequency-domain response and analytic group delay for sampled filters.
 * MA phase is wrapped to [-180,180] degrees, and undefined at spectral zeros.
 * Group delay here is defined as -d(arg H)/d(omega), converted to seconds.
 */
function responsePoint(alpha,M,fs,f){
 const omega=2*PI*f/fs,den=1+alpha*alpha-2*alpha*Math.cos(omega);
 const rcMag=rcGain(alpha,omega),maMag=movingGain(M,omega);
 const rcPhase=-Math.atan2(alpha*Math.sin(omega),1-alpha*Math.cos(omega))*180/PI;
 const rcDelay=(alpha*Math.cos(omega)-alpha*alpha)/den/fs;
 const isNull=M>1 && Math.abs(Math.sin(M*omega/2))<1e-9 && Math.abs(Math.sin(omega/2))>1e-8;
 let maPhase=0,maDelay=0;
 if(isNull){maPhase=null;maDelay=null;}
 else if(M>1){
  const ratio=Math.abs(omega)<1e-9?1:Math.sin(M*omega/2)/Math.sin(omega/2);
  const phase=-(M-1)*omega/2+(ratio<0?PI:0);
  maPhase=Math.atan2(Math.sin(phase),Math.cos(phase))*180/PI;
  maDelay=(M-1)/(2*fs);
 }
 return {f,omega,rcMag,maMag,rcPhase,maPhase,rcDelay,maDelay,maNull:isNull};
}
function maCutoff(M,fs){
 if(M<=1)return null;
 let lo=0,hi=2*PI/M;
 for(let i=0;i<65;i++){
  const mid=(lo+hi)/2;
  if(movingGain(M,mid)>1/Math.sqrt(2))lo=mid;else hi=mid;
 }
 return (lo+hi)*fs/(4*PI);
}
function rcCutoff(alpha,fs){
 const atNyquist=(1-alpha)/(1+alpha);
 if(atNyquist>1/Math.sqrt(2))return null;
 const cosOmega=clamp((4*alpha-1-alpha*alpha)/(2*alpha),-1,1);
 return Math.acos(cosOmega)*fs/(2*PI);
}
function matchedTau(M,fs){
 const fc=maCutoff(M,fs);
 if(fc===null)return null;
 const omega=2*PI*fc/fs,B=4-2*Math.cos(omega);
 const alpha=(B-Math.sqrt(B*B-4))/2;
 return -1/(fs*Math.log(alpha));
}
function noiseStream(length){
 let seed=0xA7129137;
 const values=[];
 for(let i=0;i<length;i++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  values.push(2*seed/4294967295-1);
 }
 return values;
}
function run(options={}){
 const fs=clamp(Number(options.fs)||50,25,100);
 const M=clamp(Math.round(Number(options.M)||9),1,31);
 const shape=["sensor","step","sine","pulse"].includes(options.shape)?options.shape:"sensor";
 const noise=clamp(Number.isFinite(Number(options.noise))?Number(options.noise):.3,0,.8);
 const match=!!options.match && M>1;
 const specifiedTau=clamp(Number(options.tau)||.09,.008,1);
 const tau=match?matchedTau(M,fs):specifiedTau;
 const dt=1/fs,N=Math.round(4*fs)+1,alpha=Math.exp(-dt/tau);
 const rnd=noiseStream(N),items=[],inputs=[];
 let previous=0,sum=0;
 for(let n=0;n<N;n++){
  const t=n/fs;
  const clean=shape==="step"?(t>=1?1:0):
    shape==="sine"?.52*Math.sin(2*PI*2*t):
    shape==="pulse"?(t>=.75&&t<1.25?1:0):
    .52+.17*Math.sin(2*PI*.45*t)+(t>=1.8?.31:0);
  const x=clean+noise*rnd[n];
  inputs.push(x);
  sum+=x-(n>=M?inputs[n-M]:0);
  previous=alpha*previous+(1-alpha)*x;
  items.push({n,t,clean,x,rc:previous,ma:sum/M});
 }
 const xStep=Array.from({length:N},(_,n)=>(n/fs>=1?1:0));
 let stepRC=0,stepSum=0;const step=[];
 for(let n=0;n<N;n++){
  stepRC=alpha*stepRC+(1-alpha)*xStep[n];
  stepSum+=xStep[n]-(n>=M?xStep[n-M]:0);
  step.push({t:n/fs,x:xStep[n],rc:stepRC,ma:stepSum/M});
 }
 const spectrum=Array.from({length:501},(_,i)=>responsePoint(alpha,M,fs,(fs/2)*i/500));
 const magnitude=spectrum.map(point=>({f:point.f,rc:point.rcMag,ma:point.maMag}));
 const cutoffRC=rcCutoff(alpha,fs),cutoffMA=maCutoff(M,fs);
 const groupDelayRC=alpha/(1-alpha)/fs;
 const groupDelayMA=(M-1)/(2*fs);
 const sigmaRC=Math.sqrt((1-alpha)/(1+alpha));
 const sigmaMA=1/Math.sqrt(M);
 const stepStart=Math.ceil(fs);
 const cross=(key)=>{
  const entry=step.find((v,i)=>i>=stepStart && v[key]>=.5);
  return entry?entry.t-1:null;
 };
 return {
  fs,M,shape,noise,match,tau,dt,alpha,items,step,magnitude,spectrum,
  cutoffRC,cutoffMA,groupDelayRC,groupDelayMA,sigmaRC,sigmaMA,
  stepHalfRC:cross("rc"),stepHalfMA:cross("ma"),duration:4
 };
}
root.SSSystemCompareCore={run,maCutoff,rcCutoff,matchedTau,movingGain,rcGain,responsePoint,noiseStream};
})(typeof window!=="undefined"?window:globalThis);
