/* Run from repository root: node signals-systems/tests/partb-compare-core.mjs */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const src=fs.readFileSync(path.join(root,"assets/ss-system-compare-core.js"),"utf8");
const ctx=vm.createContext({Math,Number,Array,globalThis:{}});
vm.runInContext(src,ctx);
const c=ctx.globalThis.SSSystemCompareCore;
assert.ok(c,"core exported");
const near=(a,b,tol=1e-9)=>Math.abs(a-b)<tol;
let checks=0;
for(const fs of [25,50,100]){
 for(const M of [2,3,5,9,17,31]){
  const d=c.run({fs,M,tau:.09,match:true,shape:"sensor",noise:.3});
  assert.ok(near(d.cutoffRC,d.cutoffMA,1e-8),"cutoffs match "+fs+" "+M);checks++;
  assert.equal(d.items.length,4*fs+1);checks++;
  assert.ok(d.items.every(p=>[p.x,p.rc,p.ma,p.t,p.clean].every(Number.isFinite)),"finite plots");checks++;
  assert.ok(near(d.items[0].rc,(1-d.alpha)*d.items[0].x),"first RC sample");checks++;
  assert.ok(near(d.items[0].ma,d.items[0].x/M),"first MA sample");checks++;
  const n=M+13,expected=d.items.slice(n-M+1,n+1).reduce((sum,p)=>sum+p.x,0)/M;
  assert.ok(near(d.items[n].ma,expected),"FIR convolution");checks++;
  assert.ok(d.sigmaMA>0&&d.sigmaMA<=1&&d.sigmaRC>0&&d.sigmaRC<1);checks++;
  assert.ok(near(d.groupDelayMA,(M-1)/(2*fs)));checks++;
  const dc=d.magnitude[0],end=d.magnitude.at(-1);
  assert.ok(near(dc.rc,1)&&near(dc.ma,1)&&end.f===fs/2);checks++;
 }
}
for(const shape of ["sensor","step","pulse","sine"]){
 const d=c.run({fs:50,M:9,noise:.4,match:true,shape});
 assert.equal(d.items.length,201);
 assert.ok(d.items.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.rc)&&Number.isFinite(p.ma)));checks++;
 assert.ok(d.stepHalfMA!==null&&d.stepHalfRC!==null);checks++;
}
const identity=c.run({fs:50,M:1,match:true,shape:"sensor",noise:.2});
assert.equal(identity.cutoffMA,null);assert.equal(identity.match,false);
assert.ok(identity.items.every(p=>near(p.x,p.ma)));checks+=2;
const noNoise=c.run({fs:50,M:9,match:true,shape:"sensor",noise:0});
assert.ok(noNoise.items.every(p=>near(p.x,p.clean)),"zero-noise shared input");checks++;
const defaults=c.run();
assert.ok(defaults.items.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.ma)&&Number.isFinite(p.rc)));checks++;
const page=fs.readFileSync(path.join(root,"applications-system-compare.html"),"utf8");
for(const token of ["cmp-time","cmp-frequency","cmp-step","cmp-match","cmp-tau","ss-common-header","data-els-theme-picker"]){assert.ok(page.includes('id="'+token+'"')||page.includes(token));checks++;}
console.log("RC vs MA numerical/model contract: "+checks+" checks PASS");
