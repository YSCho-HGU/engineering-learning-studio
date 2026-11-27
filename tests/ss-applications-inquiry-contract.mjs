/* Part A/B inquiry and numerical learning contract. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../signals-systems/'+p,import.meta.url),'utf8');
function literal(src,marker){
 const start=src.indexOf(marker);assert.ok(start>=0,'missing '+marker);
 const pos=start+marker.length,open=src[pos],close=open==='{'?'}':']';
 let depth=0,quote='',escaped=false;
 for(let k=pos;k<src.length;k++){
  const c=src[k];
  if(quote){if(escaped){escaped=false;continue}if(c==='\\'){escaped=true;continue}if(c===quote)quote='';continue}
  if(c==="'"||c==='"'||c===String.fromCharCode(96)){quote=c;continue}
  if(c===open)depth++;
  if(c===close){depth--;if(depth===0)return src.slice(pos,k+1)}
 }
 throw Error('unclosed data');
}
const A=new Function('return ('+literal(read('assets/ss-app-inquiry.js'),'const specs=')+')')();
const expected=['harmonics','chirp','helix','beats','amfm','sampling'];
assert.deepEqual(Object.keys(A).sort(),expected.slice().sort());
let cases=0;
for(const k of expected){
 const s=A[k];
 assert.ok(s.question?.length===2&&s.choices?.length===2&&s.transferChoices?.length===2&&s.reason?.length===2);
 assert.ok([0,1].includes(s.answer)&&[0,1].includes(s.transferAnswer));
 assert.equal(s.scenarios.length,2);
 const [a,b]=s.scenarios;
 assert.deepEqual(Object.keys(a.patch).sort(),Object.keys(b.patch).sort());
 assert.equal(Object.keys(a.patch).filter(v=>a.patch[v]!==b.patch[v]).length,1,k+' manipulated variable');
 for(const x of s.scenarios){
  const output=s.evidence(x.patch);
  assert.equal(output.length,2);
  assert.ok(output.every(t=>typeof t==='string'&&t.length>15));
  assert.doesNotMatch(output.join(' '),/NaN|Infinity|undefined/);
  cases++;
 }
}
assert.equal(A.chirp.scenarios[1].patch.f1,1800);
assert.ok(Math.exp(.4*2.1)>Math.exp(-.4*2.1));
assert.equal(A.amfm.scenarios[1].patch.mode,'fm');
const B=new Function('return ('+literal(read('assets/ss-app-system-inquiry.js'),'const spec=')+')')();
assert.deepEqual(Object.keys(B).sort(),['compare','moving-average','rc']);
for(const s of Object.values(B)){
 assert.equal(s.choices.length,2);assert.equal(s.applyChoices.length,2);
 assert.ok([0,1].includes(s.answer)&&[0,1].includes(s.applyAnswer));
 assert.ok(s.bridge[0]&&s.bridge[1]&&s.next);
}
const w={};new Function('window',read('assets/ss-system-lab-core.js'))(w);
const c=w.SSSystemCore;
const p={type:'low',shape:'sine',Rk:10,Cmicro:10,probe:330};
assert.ok(c.rcSimulate({...p,frequency:.4}).frequencyPoint.mag>c.rcSimulate({...p,frequency:8}).frequencyPoint.mag);
const m={shape:'step',noise:0,index:55};
const s=c.averageSimulate({...m,M:3}),l=c.averageSimulate({...m,M:21});
assert.ok(c.averageWindow(s.series,s.M,55).total>c.averageWindow(l.series,l.M,55).total);
assert.ok(s.delay<l.delay);
const v={};new Function('window',read('assets/ss-system-compare-core.js'))(v);
const run=v.SSSystemCompareCore.run({shape:'sensor',fs:50,noise:.55,M:9,match:true,tau:.09});
assert.ok(Math.abs(run.cutoffRC-run.cutoffMA)<1e-7);
assert.ok(Math.abs(run.groupDelayRC-run.groupDelayMA)>1e-5);
const native=read('assets/ss-app-system-labs.js');
assert.match(native,/shape:"step",M:3,noise:0,index:55/);
assert.match(native,/shape:"step",M:21,noise:0,index:55/);
for(const page of ['applications-system-lab.html','applications-system-compare.html']){
 const html=read(page);
 assert.ok(html.includes('ss-app-system-inquiry.js?v=20261127-partb-inquiry-v1'));
 assert.ok(html.includes('ss-app-system-inquiry.css?v=20261127-partb-inquiry-v1'));
}
assert.ok(read('applications-lab.html').includes('ss-app-inquiry.js?v=20261127-all-six-inquiry-v2'));
for(const js of ['assets/ss-app-inquiry.js','assets/ss-app-system-inquiry.js','assets/ss-app-system-labs.js'])new Function(read(js));
console.log('PASS: 6 Part A inquiries; '+cases+' A/B evidence calculations');
console.log('PASS: 3 Part B learning journeys; RC gain, FIR step, matched cutoff / delay');
