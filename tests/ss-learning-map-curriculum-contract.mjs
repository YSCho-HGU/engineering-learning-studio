/* Signals & Systems: Chapter 1–8 -> Applications learning map audit.
 * Run: node tests/ss-learning-map-curriculum-contract.mjs
 * Verifies actual local routes and that the advanced transform explorer is kept intact.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../signals-systems/'+p,import.meta.url),'utf8');
const exists=p=>existsSync(new URL('../signals-systems/'+p,import.meta.url));
const js=read('assets/ss-learning-journey.js');
const html=read('index.html'),css=read('assets/ss-learning-journey.css');
function literal(s,label){
 const i=s.indexOf(label);assert.ok(i>=0,'Missing authored '+label);
 const start=i+label.length,open=s[start],close=open==='{'?'}':']';
 assert.ok(open==='{'||open==='[','Expected data at '+label);
 let depth=0,quote='',esc=false;
 for(let p=start;p<s.length;p++){
  const c=s[p];
  if(quote){if(esc){esc=false;continue}if(c==='\\'){esc=true;continue}if(c===quote)quote='';continue}
  if(c==="'"||c==='"'||c===String.fromCharCode(96)){quote=c;continue}
  if(c===open)depth++;
  if(c===close&&!--depth)return s.slice(start,p+1);
 }
 throw Error('Unclosed '+label);
}
const parse=(s,key)=>new Function('return ('+literal(s,key)+')')();
const chapters=parse(js,'const chapters='),apps=parse(js,'const apps=');
const routes=parse(js,'const routes='),facts=parse(js,'const facts=');
assert.equal(chapters.length,8);
assert.deepEqual(chapters.map(x=>x.n),[1,2,3,4,5,6,7,8]);
assert.equal(routes.length,3);
assert.deepEqual(routes.map(x=>x.id),['signals','systems','fft']);
assert.equal(routes.every(x=>x.stages.length>=4&&x.stages.length<=8),true);
assert.equal(facts.length,3);
for(const ch of chapters){
 assert.ok(exists('chapter'+ch.n+'.html'),'Missing Chapter '+ch.n);
 assert.equal(ch.name.length,2);
 assert.match(ch.question[1],/[가-힣]/);
 assert.doesNotMatch(ch.question[0],/[가-힣]/);
 assert.ok(ch.apps.length>=1);
 for(const key of ch.apps)assert.ok(apps[key],'Missing application '+key);
}
const allApps=new Set(Object.keys(apps));
assert.equal(allApps.size,17,'16 interactive applications and one theory guide');
const buckets={a:0,b:0,c:0,theory:0};
for(const [name,a] of Object.entries(apps)){
 const p=a.href.replace(/^\.\//,'').split('?')[0].split('#')[0];
 assert.ok(exists(p),'Broken native Applications target: '+name+' -> '+p);
 assert.match(a.name[1],/[가-힣]/);
 if(p==='applications-fft-theory.html')buckets.theory++;
 else if(p==='applications-lab.html')buckets.a++;
 else if(p==='applications-system-lab.html'||p==='applications-system-compare.html')buckets.b++;
 else if(p.startsWith('applications-'))buckets.c++;
}
assert.deepEqual(buckets,{a:6,b:3,c:7,theory:1});
const covered=new Set();
for(const route of routes){
 assert.ok(route.title[0]&&route.title[1]&&route.desc[0]&&route.desc[1]);
 assert.ok(route.outcome[0]&&route.outcome[1]);
 for(const stage of route.stages){
  if(stage.k==='ch'){
   assert.ok(chapters.some(ch=>ch.n===stage.ch),'No Ch'+stage.ch);covered.add(stage.ch);
  }else if(stage.k==='chgroup'){
   assert.ok(stage.ids.length>=2);stage.ids.forEach(i=>{assert.ok(chapters.some(ch=>ch.n===i));covered.add(i)});
  }else if(stage.k==='app')assert.ok(allApps.has(stage.id));
  else if(stage.k==='labgroup'){assert.ok(stage.ids.length>=2);stage.ids.forEach(id=>assert.ok(allApps.has(id)))}
  else throw Error('Unexpected stage kind: '+stage.k);
 }
}
assert.deepEqual([...covered].sort((a,b)=>a-b),[1,2,3,4,5,6,7,8],
 'All chapters must appear in at least one application path');
assert.equal((html.match(/id="map-full"/g)||[]).length,1);
assert.equal((html.match(/id="ss-learning-journey"/g)||[]).length,1);
assert.match(html,/ss-learning-journey\.js\?v=20261127-map-v1/);
assert.match(html,/ss-learning-journey\.css\?v=20261127-map-v1/);
assert.match(html,/function transformMapFull\(/,'Keep the detailed transform explorer');
assert.match(html,/initTransformMap\(\)/,'Keep the transform graph interactions');
assert.doesNotMatch(html,/class="ss-curriculum-path"/,'Remove stale duplicated curriculum');
assert.doesNotMatch(html,/실습은 단계적으로 개발합니다/,'Remove old Applications planned notice');
assert.doesNotMatch(html,/id="ss-map-transform-heading">[^<]*applications.*planned/i);
assert.match(css,/@media\(max-width:640px\)/);
assert.match(js,/ELSLanguage\?\.subscribe\?\.\(fullRender\)/);
assert.match(js,/aria-pressed/);
assert.match(js,/scrollIntoView/);
for(const x of ['assets/ss-learning-journey.js','assets/ss-learning-journey.css'])assert.ok(exists(x));
new Function(js);
const inline=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(Boolean);
inline.forEach(x=>new Function(x));
console.log('PASS: all eight chapters, three selectable routes, 16 implemented labs plus FFT theory');
console.log('PASS: bilingual questions, native navigation, preserved transform explorer and map scripts');
