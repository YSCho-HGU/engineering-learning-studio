/* node tests/partb-system-labs.mjs — Part B transfer and rendering contracts */
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {fileURLToPath} from "node:url";
import path from "node:path";
const dir=path.dirname(fileURLToPath(import.meta.url)),base=path.resolve(dir,"..");
const read=name=>fs.readFileSync(path.join(base,name),"utf8");
const context=vm.createContext({Math,Number,Array,globalThis:{}});
vm.runInContext(read("assets/ss-system-lab-core.js"),context);
const c=context.globalThis.SSSystemCore;
assert.ok(c,"numerical module loads");
const {tau,cutoff}=c.rcParameters(10,10);
assert.ok(Math.abs(tau-.1)<1e-12);
assert.ok(Math.abs(cutoff-1/(.2*Math.PI))<1e-12);
for(const type of ["low","high"]){
 const atCutoff=c.rcFrequency(tau,cutoff,type);
 assert.ok(Math.abs(atCutoff.mag-1/Math.sqrt(2))<1e-12, "3 dB cutoff");
 assert.ok(Math.abs(atCutoff.phase-(type==="low"?-45:45))<1e-8,"phase cutoff");
 const d=c.rcSimulate({Rk:10,Cmicro:10,frequency:3,type,shape:"step"});
 assert.equal(d.series.length,1201);
 assert.ok(d.series.every(x=>Number.isFinite(x.y)));
 const step=c.rcStep(tau,type,181);
 assert.ok(Math.abs(step[0].y-(type==="low"?0:1))<1e-12);
 assert.ok(Math.abs(step.at(-1).y-(type==="low"?1-Math.exp(-6):Math.exp(-6)))<1e-12);
}
for(const M of [1,3,7,21,31]){
 const d=c.averageSimulate({M,noise:.3,shape:"trend"});
 assert.equal(d.series.length,128);
 assert.ok(d.series.every(x=>Number.isFinite(x.y)));
 assert.ok(Math.abs(d.impulse.slice(0,M).reduce((s,x)=>s+x.y,0)-1)<1e-12,"unit DC gain");
 assert.ok(Math.abs(c.averageFrequency(M,0)-1)<1e-12,"DC gain");
 const n=66,window=c.averageWindow(d.series,M,n);
 const expected=d.series.slice(n-M+1,n+1).reduce((s,x)=>s+x.x,0)/M;
 assert.ok(Math.abs(expected-window.total)<1e-12,"causal convolution");
 assert.equal(window.terms.length,M);
}
const hub=read("assets/ss-applications-hub.js"),page=read("applications-system-lab.html"),ui=read("assets/ss-app-system-labs.js");
assert.match(hub,/renderSystemsModules/);
assert.match(hub,/applications-system-lab\.html\?lab=/);
assert.match(page,/ss-common-header/);assert.match(page,/data-els-theme-picker/);
assert.match(page,/ss-app-system-labs\.js/);assert.match(page,/ss-system-lab-core\.js/);
assert.match(ui,/ss-sys-canvas-1/);assert.match(ui,/ss-sys-canvas-3/);
assert.match(ui,/lang\?\.subscribe/);assert.match(ui,/els:themechange/);
console.log("Part B system labs: RC cutoff/phase/step, moving-average FIR/convolution and UI contracts PASS");
