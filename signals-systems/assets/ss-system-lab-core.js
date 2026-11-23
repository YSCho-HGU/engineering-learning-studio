/* Deterministic first-order RC and causal moving-average models for Part B.
 * No framework dependency; exposed separately to support numerical regression checks.
 */
(function(root){
 "use strict";
 const TWO_PI=2*Math.PI;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function rcParameters(Rk,Cmicro){
  const tau=Rk*Cmicro*1e-3;
  return {tau:tau,cutoff:1/(TWO_PI*tau)};
 }
 function rcFrequency(tau,f,type){
  const q=TWO_PI*f*tau;
  if(type==="high")return {mag:q/Math.sqrt(1+q*q),phase:q===0?90:Math.atan2(1,q)*180/Math.PI};
  return {mag:1/Math.sqrt(1+q*q),phase:-Math.atan(q)*180/Math.PI};
 }
 function rcStep(tau,type,count){
  const n=count||180,series=[];
  for(let i=0;i<n;i++){
   const t=6*tau*i/(n-1);
   const exp=Math.exp(-t/tau);
   series.push({x:t/tau,y:type==="high"?exp:1-exp});
  }
  return series;
 }
 function rcSimulate(p){
  const type=p.type==="high"?"high":"low",shape=p.shape||"sine";
  const Rk=clamp(Number(p.Rk)||10,1,100),Cmicro=clamp(Number(p.Cmicro)||10,1,100);
  const frequency=clamp(Number(p.frequency)||3,.2,20),noise=clamp(Number(p.noise)||0,0,1);
  const {tau,cutoff}=rcParameters(Rk,Cmicro);
  // A piecewise-constant input has an exact RC state transition over each dt.
  const duration=shape==="sine"?Math.max(3/frequency,6*tau):Math.max(1.2,7*tau,3/frequency);
  const count=1201,dt=duration/(count-1),alpha=Math.exp(-dt/tau);
  const lpGain=rcFrequency(tau,frequency,"low");
  let lp=shape==="sine"?.9*lpGain.mag*Math.sin(lpGain.phase*Math.PI/180):0;
  const series=[];
  for(let i=0;i<count;i++){
   const t=i*dt,rad=TWO_PI*frequency*t;
   let x=0;
   if(shape==="sine")x=.9*Math.sin(rad);
   else if(shape==="step")x=t>=duration*.13?1:0;
   else if(shape==="square")x=Math.sin(rad)>=0?1:-1;
   else {
    // Deterministic high-frequency ripple on a slow sensor-like signal.
    x=.7*Math.sin(TWO_PI*frequency*t*.28)+
      noise*(.48*Math.sin(TWO_PI*frequency*5*t)+.28*Math.sin(TWO_PI*frequency*9.7*t));
   }
   if(i>0)lp=alpha*lp+(1-alpha)*x;
   const y=type==="high"?x-lp:lp;
   series.push({t,x,y});
  }
  return {series,tau,cutoff,duration,frequency,Rk,Cmicro,type,shape,
    frequencyPoint:rcFrequency(tau,frequency,type),
    step:rcStep(tau,type,181)};
 }
 function deterministicNoise(count){
  let seed=0x5A17,items=[];
  for(let i=0;i<count;i++){
   seed=(Math.imul(1664525,seed)+1013904223)>>>0;
   items.push(2*seed/4294967295-1);
  }
  return items;
 }
 function averageFrequency(M,omega){
  if(Math.abs(omega)<1e-9)return 1;
  const den=M*Math.sin(omega/2);
  return Math.abs(den)<1e-11?1:Math.abs(Math.sin(M*omega/2)/den);
 }
 function averageSimulate(p){
  const M=clamp(Math.round(Number(p.M)||5),1,31);
  const noise=clamp(Number(p.noise)||0,0,1.2);
  const shape=["constant","trend","step","periodic"].includes(p.shape)?p.shape:"trend";
  const count=128,random=deterministicNoise(count),series=[],history=[];
  for(let n=0;n<count;n++){
   let clean=1;
   if(shape==="trend")clean=.45+.65*n/(count-1)+.21*Math.sin(TWO_PI*n/75);
   if(shape==="step")clean=n<51?.35:1.25;
   if(shape==="periodic")clean=.8+.4*Math.sin(TWO_PI*n/36);
   const x=clean+noise*random[n];
   history.push(x);
   let sum=0;
   // y[n] = (1/M) * sum_{k=0}^{M-1} x[n-k]; x[n<0] = 0.
   for(let k=0;k<M;k++)sum+=n-k>=0?history[n-k]:0;
   series.push({n,clean,x,y:sum/M});
  }
  const impulse=Array.from({length:Math.max(M+5,35)},(_,k)=>({n:k,y:k<M?1/M:0}));
  const gain=Array.from({length:201},(_,i)=>({w:i/200,mag:averageFrequency(M,Math.PI*i/200)}));
  return {series,impulse,gain,shape,M,noise,delay:(M-1)/2,theoreticalReduction:Math.sqrt(M)};
 }
 function averageWindow(series,M,n){
  const index=clamp(Math.round(n),0,series.length-1);
  const terms=Array.from({length:M},(_,k)=>{
   const position=index-k, value=position>=0?series[position].x:0;
   return {n:position,x:value,contribution:value/M,padded:position<0};
  });
  return {index,terms,total:terms.reduce((s,t)=>s+t.contribution,0)};
 }
 root.SSSystemCore={rcParameters,rcFrequency,rcStep,rcSimulate,averageFrequency,averageSimulate,averageWindow,deterministicNoise};
})(typeof window!=="undefined"?window:globalThis);
