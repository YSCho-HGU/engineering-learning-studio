/** FFT curriculum numerical and content invariants (no browser required).
 * Run: node tests/fft-content-invariants.mjs
 */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import vm from "node:vm";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
async function source(filename){return readFile(path.join(root,"signals-systems",filename),"utf8")}
async function browserModule(filename,exportName){
 const code=await source("assets/"+filename);
 const w={location:{search:""},ELSLanguage:{get:()=>"en"}},document={readyState:"loading",addEventListener(){}};
 vm.runInNewContext(code,{window:w,document},{filename,timeout:2500});
 assert.ok(w[exportName],exportName+" not exposed");
 return w[exportName];
}
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol,`Expected ${a} ~ ${b}`);
const sample=Array.from({length:1024},(_,n)=>Math.sin(2*Math.PI*64*n/1024));

const foundation=await browserModule("ss-app-fft-foundations.js","SSFFTFoundations");
const x=foundation.sampleArray("one"),unknown=foundation.analyze(x),known=foundation.analyze(x,8000);
assert.equal(unknown.method,"FFT");
assert.equal(unknown.best.k,3);
assert.equal(unknown.best.hz,null);
assert.equal(known.best.hz,1500);
assert.equal(foundation.analyze(Array.from({length:15},(_,n)=>Math.sin(2*Math.PI*3*n/15))).method,"DFT");
console.log("PASS 1: FFT on samples, conditional Hz axis and non-power-of-two fallback");

const resolution=await browserModule("ss-app-fft-resolution.js","SSFFTResolution");
const base=resolution.analyze({fs:256,N:64,experiment:"padding",padding:1});
const padded=resolution.analyze({fs:256,N:64,experiment:"padding",padding:4});
close(base.duration,padded.duration);close(base.df,padded.df);close(base.grid,4);close(padded.grid,1);
const N=64,M=256,samples=Array.from({length:N},(_,n)=>Math.sin(2*Math.PI*6.37*n/N));
const fftSpectrum=resolution.dftMagnitude(samples,M);
for(const k of [0,1,4,11,20,50,101,128]){
 let re=0,im=0;for(let n=0;n<N;n++){const angle=-2*Math.PI*k*n/M;re+=samples[n]*Math.cos(angle);im+=samples[n]*Math.sin(angle)}
 const amp=(k===0||k===M/2?1:2)*Math.hypot(re,im)/N;
 close(fftSpectrum[k],amp,1e-10);
}
console.log("PASS 2: FFT magnitude matches direct DFT and zero-padding does not change observation");

const html=await source("applications-dft-fft.html");
const fftCoreSource=await source("assets/ss-app-dft-fft-core.js");
const moduleContext={window:{}};vm.runInNewContext(fftCoreSource,moduleContext,{timeout:2500});
const {radix2,direct}=moduleContext.window.SSDFTFFTCore;
assert.ok(html.includes('id="panel-same"')&&html.includes('id="panel-butterfly"')&&html.includes('id="panel-speed"'));
for(const N of [32,64,128,512]){
 const x=Float64Array.from({length:N},(_,n)=>Math.sin(2*Math.PI*3*n/N)+.3*Math.sin(2*Math.PI*7*n/N));
 const a=radix2(x),b=direct(x);
 for(let k=0;k<N;k++)close(Math.hypot(a.re[k]-b.re[k],a.im[k]-b.im[k]),0,1e-7);
 const p=new Float64Array(N*2);p.set(x);const z=radix2(p);
 for(let k=0;k<N;k++)close(Math.hypot(a.re[k]-z.re[2*k],a.im[k]-z.im[2*k]),0,1e-8);
}
assert.ok(html.includes('id="butterfly-proof-rows"'));
assert.ok(html.includes('id="speed-run"'));
console.log("PASS 3: direct DFT, FFT and zero-padding coefficient invariants");

const dtmf=await browserModule("ss-dtmf-decoder.js","SSDTMF");
for(const key of "123456789*0#")assert.equal(dtmf.analyze(dtmf.synth(key)).decoded,key);
console.log("PASS 4: all 12 modeled DTMF keys are correctly recovered");

const fingerprint=await browserModule("ss-sound-fingerprint.js","SSSoundFingerprint");
for(const type of ["piano","guitar","voice"]){
 const a=fingerprint.analyze(fingerprint.synth(type,{f0:220}),{f0:220});
 assert.equal(a.dominant.h,type==="voice"?5:1);
 close(a.partials.reduce((t,p)=>t+p.share,0),100,1e-7);
}
console.log("PASS 5: modeled timbre uses measured harmonic shares and distinguishable source profiles");

const real=await browserModule("ss-fft-upload.js","SSRealFFT");
const signal=Float64Array.from(sample);
const a=real.analyze(signal,{fs:1024,N:1024}),b=real.analyze(signal,{fs:null,N:1024});
close(a.peakFreq,64);close(b.peakFreq,64/1024);assert.equal(b.freqUnit,"cycles/sample");
const csv=real.parseCSV("time_s,value\\n0,0\\n0.001,1\\n0.002,0\\n0.003,-1\\n".replaceAll("\\n","\n"));
close(csv.fs,1000);
console.log("PASS 6: unknown sampling rate and conservative timestamp-based sensor rate");

const stft=await browserModule("ss-app-chirp-stft.js","SSChirpSTFT");
const rising=stft.analyze({fs:512,duration:2,f0:20,f1:180,L:128,overlap:75});
const falling=stft.analyze({fs:512,duration:2,f0:20,f1:180,L:128,overlap:75,shape:"falling"});
assert.ok(rising.peaks.at(-1)>rising.peaks[0]);
assert.ok(falling.peaks.at(-1)<falling.peaks[0]);
close(rising.binSpacing,512/128);
console.log("PASS 7: moving-frame FFT preserves time-varying frequency direction");
console.log("ALL SEVEN FFT CONTENT INVARIANTS PASSED");
