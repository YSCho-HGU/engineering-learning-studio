/** Independent 8-point FFT butterfly trace invariants.
 * node tests/fft-butterfly-invariants.mjs
 */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import vm from "node:vm";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const source=await readFile(path.join(root,"signals-systems/assets/ss-app-fft-butterfly-core.js"),"utf8");
const window={};vm.runInNewContext(source,{window},{timeout:2000});
const core=window.SSButterfly8;
assert.deepEqual(Array.from(core.bitReversed),[0,4,2,6,1,5,3,7]);
assert.equal(core.parseSamples("0, 1 2;3 4 5 6 7").length,8);
for(const invalid of ["1,2,3","0 1 2 3 4 5 6 NaN","0 1 2 3 4 5 6 Infinity"])assert.throws(()=>core.parseSamples(invalid));
let checked=0,maxError=0;
for(const mode of ["ramp","impulse","tone"]){
 const trace=core.trace(core.presets[mode]);
 assert.deepEqual(trace.operations.map(x=>x.length),[0,4,4,4]);
 for(let stage=1;stage<=3;stage++){
  assert.equal(trace.operations[stage].length,4);
  for(const op of trace.operations[stage]){
   const prev=trace.stages[stage-1],next=trace.stages[stage];
   for(const field of ["re","im"]){
    assert.ok(Math.abs(prev[op.a][field]-op.u[field])<1e-12);
    assert.ok(Math.abs(prev[op.b][field]-op.v[field])<1e-12);
    assert.ok(Math.abs(next[op.a][field]-op.plus[field])<1e-12);
    assert.ok(Math.abs(next[op.b][field]-op.minus[field])<1e-12);
   }
   checked++;
  }
 }
 maxError=Math.max(maxError,trace.maxError);
 assert.ok(trace.maxError<1e-10,mode+" FFT must match direct DFT");
}
const ramp=core.trace(core.presets.ramp);
assert.equal(ramp.fft[0].re,28);
assert.ok(Math.abs(ramp.fft[1].re+4)<1e-10);
assert.ok(Math.abs(ramp.fft[1].im-9.65685424949238)<1e-10);
const W4=ramp.operations[2].find(op=>op.r===1);
assert.ok(Math.abs(W4.W.re)<1e-12&&Math.abs(W4.W.im+1)<1e-12);
const W8=ramp.operations[3].find(op=>op.r===1);
assert.ok(Math.abs(W8.W.re-Math.SQRT1_2)<1e-12&&Math.abs(W8.W.im+Math.SQRT1_2)<1e-12);
const impulse=core.trace(core.presets.impulse);
for(const p of impulse.fft){assert.ok(Math.abs(p.re-1)<1e-12);assert.ok(Math.abs(p.im)<1e-12)}
const tone=core.trace(core.presets.tone);
for(let k=0;k<8;k++){const want=k===1||k===7?4:0;assert.ok(Math.abs(tone.fft[k].re-want)<1e-10);assert.ok(Math.abs(tone.fft[k].im)<1e-10)}
const samples=Array.from({length:8},(_,i)=>i*0.75-2.5);
for(let round=0;round<40;round++){
 const x=samples.map((value,i)=>Math.sin(value*(round+1)/13)+Math.cos((round+i)*.31));
 const tr=core.trace(x);assert.ok(tr.maxError<1e-9,"Complex error for varying real input");maxError=Math.max(maxError,tr.maxError);
}
assert.equal(core.format({re:3,im:-1}),"3.000 − 1.000j");
console.log("PASS FFT 8-point butterfly: 3 stages, "+checked+" verified operations, 43 inputs, max complex error "+maxError.toExponential(3));
