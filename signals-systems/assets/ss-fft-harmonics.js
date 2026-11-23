/* Harmonic candidate inspection for one stationary FFT segment.
 * A harmonic pattern suggests an f0; it does not certify musical pitch or voiced speech.
 * No external audio/model dependency. */
(function(global){
"use strict";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function analyzeHarmonics(fft,{manualF0=null,maxOrder=8}={}){
 const {spectrum,N,fs}=fft;
 if(!spectrum||!N)return {status:"insufficient",matches:[],candidates:[]};
 const unit=fs===null?"cycles/sample":"Hz",step=fs===null?1/N:fs/N;
 const frequencies=k=>k*step;
 let maximum=0;
 for(let k=1;k<spectrum.length;k++)if(spectrum[k]>maximum)maximum=spectrum[k];
 if(maximum<1e-7)return {status:"silent",matches:[],candidates:[],unit,step};
 const peaks=[];
 for(let k=2;k<spectrum.length-1;k++){
  if(spectrum[k]>=spectrum[k-1]&&spectrum[k]>spectrum[k+1]&&spectrum[k]>=maximum*.035)
   peaks.push({bin:k,amplitude:spectrum[k],frequency:frequencies(k)});
 }
 peaks.sort((a,b)=>b.amplitude-a.amplitude);
 const strong=peaks.slice(0,48);
 const order=Math.min(12,Math.max(3,Math.round(maxOrder)));
 const binTolerance=1.6;
 function match(baseBin){
  const matched=[],used=new Set();
  for(let h=1;h<=order;h++){
   const predicted=h*baseBin;
   if(predicted>=spectrum.length-1)break;
   const tolerance=Math.max(binTolerance,Math.min(3, predicted*.012));
   let best=null,metric=Infinity;
   for(const p of strong){
    const diff=Math.abs(p.bin-predicted);
    if(diff<=tolerance&&!used.has(p.bin)){
     const val=diff/tolerance+(1-p.amplitude/maximum)*.07;
     if(val<metric){metric=val;best=p}
    }
   }
   if(best){used.add(best.bin);matched.push({order:h,expected:frequencies(predicted),observed:best.frequency,bin:best.bin,
      amplitude:best.amplitude,relativeAmplitude:best.amplitude/maximum,
      deviationBins:best.bin-predicted});}
  }
  const count=matched.length;
  const minOrder=count?matched[0].order:0,maxMatchedOrder=count?matched.at(-1).order:0;
  const continuity=count?count/(maxMatchedOrder-minOrder+1):0;
  const lowOrderWeight=matched.reduce((sum,m)=>sum+Math.sqrt(m.relativeAmplitude)/Math.sqrt(m.order),0);
  const totalStrength=matched.reduce((sum,m)=>sum+m.relativeAmplitude,0);
  const score=count>=2?(count*2+lowOrderWeight*1.7+continuity*1.5+
    Math.min(1,totalStrength)*.8-(minOrder-1)*.28):0;
  return{baseBin,frequency:frequencies(baseBin),matches:matched,count,continuity,score,
   hasFundamental:matched.some(m=>m.order===1),minOrder};
 }
 const candidates=[];
 for(const peak of strong.slice(0,22)){
  for(let h=1;h<=order;h++){
   const bin=peak.bin/h;
   if(bin<3||bin>=spectrum.length/2)continue;
   if(candidates.some(c=>Math.abs(c.baseBin-bin)<.65))continue;
   candidates.push(match(bin));
  }
 }
 candidates.sort((a,b)=>b.score-a.score);
 const plausible=candidates.filter(c=>c.count>=2).slice(0,8);
 const candidate=plausible.find(c=>c.count>=3) || plausible[0] || null;
 const independent=strong.filter(p=>p.amplitude>=maximum*.15);
 const sumEvidence=candidate?.matches.reduce((s,m)=>s+m.relativeAmplitude,0)||0;
 let status="insufficient";
 if(candidate){
  if(candidate.count>=3&&candidate.continuity>=.6&&sumEvidence>=.7)status="pattern";
  else status="tentative";
 }
 // A harmonic fit can be misleading on percussion/polyphonic material or noise.
 // Never describe a candidate as a measured or ground-truth pitch.
 const manual=manualF0!==null&&Number.isFinite(Number(manualF0))&&Number(manualF0)>0?
   match(Number(manualF0)/step):null;
 return{status,unit,step,candidate,manual,peaks:strong,independentPeakCount:independent.length,
   candidates:plausible,dominantPeak:strong[0]||null,
   strongestFrequency:strong[0]?.frequency??null};
}
global.SSFFTHarmonics=Object.freeze({analyzeHarmonics});
})(window);
