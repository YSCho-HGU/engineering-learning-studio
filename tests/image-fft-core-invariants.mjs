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
const unit=new Float64Array(64*64);unit.fill(1);
const d=c.forward(unit,64);
near(d.real[0],4096,1e-8,"DC of unit image");
const residual=Math.max(...d.real.slice(1).map(Math.abs),...d.imag.map(Math.abs));
near(residual,0,1e-8,"non-DC of constant image");
console.log("PASS "+checks+" 2D FFT/IFFT numerical invariants: orientation, conjugacy, filters, reconstruction and denoising");
