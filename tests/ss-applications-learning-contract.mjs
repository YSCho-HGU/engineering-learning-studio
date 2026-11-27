/* Applications content inventory, link integrity and FFT grid semantics.
 * Run: node tests/ss-applications-learning-contract.mjs
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const root=new URL('../signals-systems/',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const hub=read('assets/ss-applications-hub.js');
function objectLiteral(source,offset){
 const first=source[offset],last=first==='{'?'}':']';
 let depth=0,quote='',escaped=false;
 for(let i=offset;i<source.length;i++){
  const c=source[i];
  if(quote){
   if(escaped){escaped=false;continue}
   if(c==='\\'){escaped=true;continue}
   if(c===quote)quote='';
   continue;
  }
  if(c==="'"||c==='"'){quote=c;continue}
  if(c===first)depth++;
  if(c===last&&!--depth)return source.slice(offset,i+1);
 }
 throw Error('Incomplete topics model');
}
const at=hub.indexOf('const topics=');
assert.ok(at>=0);
const topics=new Function('return ('+objectLiteral(hub,at+'const topics='.length)+')')();
const readyA=topics.a.filter(x=>x.lab),readyB=topics.b.filter(x=>x.lab);
const coreC=topics.c.filter(x=>x.phase==='foundation'||x.phase==='discovery');
const extraC=topics.c.filter(x=>x.phase==='extension');
const plannedC=topics.c.filter(x=>x.phase==='planned');
assert.deepEqual([readyA.length,readyB.length,coreC.length,extraC.length,plannedC.length],[6,3,7,1,3]);
const readyD=topics.d.filter(x=>x.lab);
assert.equal(readyD.length,2,'Part D must contain exactly two complete integrated labs');
assert.deepEqual(readyD.map(x=>x.lab),['audio-filter','chirp-echo']);
for(const t of readyD){
 assert.ok(t.href&&existsSync(new URL(t.href.replace(/^\.\//,''),root)),'Missing Part D lab '+t.href);
 assert.ok(t.en&&t.ko&&t.concept&&t.ch?.length,'Incomplete Part D bilingual learning metadata');
}
assert.ok(existsSync(new URL('assets/ss-app-partd.js',root)));
assert.ok(existsSync(new URL('assets/ss-app-partd.css',root)));
for(const t of [...readyA,...readyB]){
 const local=t.href?.replace(/^\.\//,'')||(readyA.includes(t)?'applications-lab.html':'applications-system-lab.html');
 assert.ok(existsSync(new URL(local,root)),'Missing application lab '+local);
 assert.ok(t.questionEn&&t.questionKo);
}
for(const t of [...coreC,...extraC]){
 assert.ok(existsSync(new URL(t.href.replace(/^\.\//,''),root)),t.href);
 assert.ok(t.en&&t.ko&&t.descEn&&t.descKo);
}
for(const t of [...readyA,...readyB,...readyD]){
 assert.ok(t.learningEn&&t.learningKo,'Missing bilingual student-facing observation goal: '+t.lab);
 assert.ok(t.learningEn.length<140&&t.learningKo.length<140,'Learning goal is too long: '+t.lab);
}
const landing=read('applications.html');
assert.match(landing,/seven core FFT labs plus one optional STFT extension/);
assert.match(landing,/FFT 핵심 실습 7개와 선택 STFT 확장 1개/);
assert.match(landing,/three further Part C topics are planned/);
assert.match(landing,/Part D includes two integrated interactive labs/);
for(const part of ['a','b','c','d']){
 assert.match(landing,new RegExp('ss-app-part-guide'),part+' guide styles should be present');
 assert.match(landing,new RegExp('id="topics-'+part+'"'),part+' modules should remain linked');
}
assert.equal((landing.match(/class="ss-app-study-detail ss-app-part-guide"/g)||[]).length,4);
assert.match(landing,/ss-app-study-route/);
assert.match(landing,/Chirp\/STFT is optional/);
assert.match(landing,/one Part C discovery task/);
const chirp=readyA.find(t=>t.lab==='chirp');
assert.match(chirp.observeEn,/Linear chirp sweep/);
assert.doesNotMatch(chirp.observeEn,/exponential/i);
const stft=read('applications-chirp-stft.html');
assert.ok(stft.includes('\\Delta f_{\\rm grid}'));
assert.ok(stft.includes('\\frac{f_s}{M}'));
assert.ok(stft.includes('20\\log_{10}'));
const engine=read('assets/ss-app-chirp-stft.js');
assert.match(engine,/binSpacing:fs\/L/);
assert.match(engine,/displaySpacing:fs\/M/);
assert.match(engine,/20\*Math\.log10/);
const inquiry=read('assets/ss-app-inquiry.js');
const supported=readyA.map(t=>t.lab).filter(key=>
 new RegExp('(?:^|\\n)\\s*'+key+':\\{').test(inquiry));
console.log('PASS: 6 signal labs, 3 system labs, 7 FFT core + 1 optional, 3 planned FFT topics, Part D: 2 interactive integrated labs');
console.log('PASS: implemented links exist and STFT formula agrees with measured display grid');
console.log('Pedagogical observation: structured inquiry '+supported.length+'/6 Part A labs ('+supported.join(', ')+')');
