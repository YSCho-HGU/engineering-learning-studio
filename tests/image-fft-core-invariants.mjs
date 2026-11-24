/* 2D FFT mathematical invariants; node tests/image-fft-core-invariants.mjs */
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const script=fs.readFileSync(path.join(dir,"signals-systems/assets/ss-image-fft-core.js"),"utf8");
const ctx=vm.createContext({Float64Array,Math,Number,Array,Error,globalThis:{}});
vm.runInContext(script,ctx);
const c=ctx.globalThis.SSImageFFTCore;
assert.ok(c);
let checks=0;
function near(a,b,tol=1e-8,label="numerical difference"){
 assert.ok(Math.abs(a-b)<tol,label+": "+a+" vs "+b);checks++;
}
for(const N of [16,32,64,128,256]){
 const horizontal=c.synth("horizontal",N,{cycles:Math.min(8,N/4)});
 const sf=c.forward(horizontal.pixels,N);
 const original=c.inverse(sf,N);
 assert.equal(original.pixels.length,N*N);checks++;
 near(original.imagMax,0,1e-9,"inverse imaginary leakage");
 const maxError=horizontal.pixels.reduce((m,x,i)=>Math.max(m,Math.abs(x-original.pixels[i])),0);
 near(maxError,0,1e-9,"FFT/IFFT roundtrip");
 const p=c.dominant(sf,N,2);
 assert.equal(p.u,0,"horizontal stripes → vertical frequency axis");checks++;
 assert.equal(Math.abs(p.v),Math.min(8,N/4),"peak cycles/image");checks++;
 const vertical=c.synth("vertical",N,{cycles:Math.min(8,N/4)});
 const v=c.dominant(c.forward(vertical.pixels,N),N,2);
 assert.equal(v.v,0,"vertical stripes → horizontal frequency axis");checks++;
 assert.equal(Math.abs(v.u),Math.min(8,N/4));checks++;
 const clean=c.applyMask(sf,N,{type:"none"});
 near(c.rmse(clean.pixels,horizontal.pixels),0,1e-9,"identity filter");
 near(clean.energyPercent,100,1e-9,"Parseval with no filter");
}
for(const N of [64,128,256]){
 const sample=c.synth("noise",N,{amplitude:.28});
 const original=c.forward(sample.pixels,N);
 const out=c.applyMask(original,N,{type:"notch",notch:{u:12,v:7,radius:2.5}});
 const before=c.rmse(sample.pixels,sample.clean),after=c.rmse(out.pixels,sample.clean);
 assert.ok(after<before*.2,"Notch should recover synthetic clean scene: "+after+" vs "+before);checks++;
 near(out.imagMax,0,1e-8,"paired notch yields real IFFT");
 const h1=c.maskAt(12,7,"notch",22,{u:12,v:7,radius:2.5});
 const h2=c.maskAt(-12,-7,"notch",22,{u:12,v:7,radius:2.5});
 near(h1,h2,1e-14,"conjugate symmetry of mask");
 const low=c.applyMask(original,N,{type:"low",radius:12});
 const high=c.applyMask(original,N,{type:"high",radius:12});
 assert.ok(low.energyPercent<100&&high.energyPercent<100,"low/high filters remove some energy");checks++;
 near(low.imagMax,0,1e-8,"lowpass preserves reality");
 near(high.imagMax,0,1e-8,"highpass preserves reality");
}
// Row-transform stage must still have spatial y; column-transform stage
// must match the complex 2D FFT used by the image filter.
for(const N of [16,32,64,128,256]){
 const sample=c.synth("scene",N),stages=c.separableStages(sample.pixels,N);
 const expected=c.forward(sample.pixels,N);
 let maxDiff=0;
 for(let k=0;k<N*N;k++){
  maxDiff=Math.max(maxDiff,Math.hypot(stages.full.real[k]-expected.real[k],stages.full.imag[k]-expected.imag[k]));
 }
 near(maxDiff,0,1e-9,"Rows→columns equals direct FFT2");
 for(const y of [0,Math.floor(N/3),N-1]){
  let sum=0;
  for(let x=0;x<N;x++)sum+=sample.pixels[y*N+x];
  near(stages.rows.real[y*N],sum,1e-8,"Row FFT DC equals row pixel sum");
  near(stages.rows.imag[y*N],0,1e-9,"Row FFT DC has no imaginary part");
 }
 const grat=c.synth("horizontal",N,{cycles:Math.min(4,N/4)});
 const r=c.separableStages(grat.pixels,N).rows;
 for(const y of [0,Math.floor(N/2),N-1])
  near(Math.hypot(r.real[y*N+1],r.imag[y*N+1]),0,1e-8,
    "Horizontal stripes remain DC along each transformed row");
}
for(const N of [16,32,64,128,256]){
 const input=c.synth("scene",N),spectrum=c.forward(input.pixels,N);
 for(const kernel of ["box","gaussian","sharpen"]){
  const output=c.applyKernelFFT(spectrum,input.pixels,N,kernel);
  near(output.maxDifference,0,1e-9,"spatial circular convolution must equal FFT2 multiplier");
  near(output.imagMax,0,1e-9,"real symmetric 3x3 kernel must keep IFFT real");
  for(const [x,y] of [[0,0],[2,3],[N-1,N-1],[Math.floor(N/2),Math.floor(N/3)]]){
   const probe=c.kernelProbe(input.pixels,N,kernel,x,y);
   near(probe.sum,output.pixels[y*N+x],1e-9,"single-pixel kernel weighted sum equals FFT result");
   near(probe.items.reduce((sum,v)=>sum+v.contribution,0),probe.sum,1e-12,"shown contribution sum");
  }
  assert.equal(c.kernelWeights(kernel).length,9);checks++;
 }
}
const unit=new Float64Array(64*64);unit.fill(1);
const d=c.forward(unit,64);
near(d.real[0],4096,1e-8,"DC of unit image");
const residual=Math.max(...d.real.slice(1).map(Math.abs),...d.imag.map(Math.abs));
near(residual,0,1e-8,"non-DC of constant image");
console.log("PASS "+checks+" 2D FFT/IFFT numerical invariants: orientation, conjugacy, filters, reconstruction and denoising");
