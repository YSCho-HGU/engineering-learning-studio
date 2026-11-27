/* Engineering Learning Studio · Part C (7 core FFT labs) content and math audit.
 * Node-only; no browser dependencies. The native FFT plots are unchanged.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=name=>readFileSync(new URL('../signals-systems/'+name,import.meta.url),'utf8');
const ids=[
 ['samples','applications-fft-lab.html','fft-graphs'],
 ['resolution','applications-fft-resolution.html','fft-r-stats'],
 ['algorithm','applications-dft-fft.html','same-error'],
 ['dtmf','applications-fft-dtmf.html','dtmf-peaks'],
 ['fingerprint','applications-fft-sound-fingerprint.html','finger-data'],
 ['upload','applications-fft-upload.html','fft-upload-stats'],
 ['image','applications-fft-image.html','image-live-observation']
];
const bridge=file('assets/ss-fft-study-path.js'),guide=file('assets/ss-fft-theory-guide.js');
function balanced(s,at){
 const op=s[at],cl=op==='{'?'}':']';
 assert.ok(op==='{'||op==='[','Must begin with object or array');
 let depth=0,quote='',escape=false;
 for(let i=at;i<s.length;i++){
  const c=s[i];
  if(quote){if(escape){escape=false;continue}if(c==='\\'){escape=true;continue}if(c===quote)quote='';continue}
  if(c==="'"||c==='"'||c===String.fromCharCode(96)){quote=c;continue}
  if(c===op)depth++;
  if(c===cl){depth--;if(depth===0)return s.slice(at,i+1)}
 }
 throw Error('Unclosed authored model');
}
const pick=(s,key)=>{
 const i=s.indexOf(key);assert.ok(i>=0,'Missing '+key);
 return new Function('return ('+balanced(s,i+key.length)+')')();
};
const entries=pick(bridge,'const specs=');
const tutorials=pick(guide,'const topics=');
assert.deepEqual(Object.keys(entries).sort(),ids.map(x=>x[0]).sort());
assert.deepEqual(tutorials.map(x=>x.id),['samples','resolution','dftfft','dtmf','harmonics','realdata','image']);
for(const tutorial of tutorials){
 assert.equal(tutorial.keys.length,3,tutorial.id+' must teach three manageable ideas');
 assert.equal(tutorial.math.length,2,'two reference relations');
 assert.ok(tutorial.intro[0].length>70&&tutorial.intro[1].length>45);
 assert.match(tutorial.worked[1],/[가-힣]/);
 assert.ok(tutorial.caution[0]&&tutorial.caution[1]);
 const html=file(tutorial.back);
 assert.match(html,/data-fft-path-lesson=/,'tutorial back-link must be a core FFT lab');
}
let contentChecks=0;
for(const [id,page,observedId] of ids){
 const body=file(page),c=entries[id];
 assert.ok(body.includes('data-fft-path-lesson="'+id+'"'),page+' chapter binding');
 assert.ok(body.includes('ss-fft-study-path.js?v=20261127-study-v1'),page+' missing JS');
 assert.ok(body.includes('ss-fft-study-path.css?v=20261127-study-v1'),page+' missing CSS');
 assert.ok(body.includes('id="'+observedId+'"'),page+' native evidence missing');
 assert.ok(c.predict.length===2&&c.change.length===2&&c.goal.length===2);
 assert.equal(c.options.length,2);assert.equal(c.applied.length,2);
 assert.ok(c.answer===0||c.answer===1);assert.ok(c.right===0||c.right===1);
 assert.match(c.goal[1],/[가-힣]/);
 assert.doesNotMatch(c.goal[0],/[가-힣]/);
 assert.ok(tutorials.some(x=>x.id===c.theory),'unlinked theory '+id);
 contentChecks++;
}
const shell=file('applications-fft-theory.html');
assert.ok(shell.includes('ss-fft-theory-guide.js?v=20261127-theory-v1'));
assert.ok(shell.includes('id="guide-n"')&&shell.includes('id="guide-k"')&&shell.includes('id="guide-known"'));
assert.ok(file('applications.html').includes('applications-fft-theory.html#samples'));
const chartInputs={
 'fft-samples':{value:Array.from({length:16},(_,n)=>Math.sin(2*Math.PI*3*n/16).toFixed(5)).join(', ')},
 'fft-known':{checked:false},'fft-fs':{value:'8000'},
 'fft-r-fs':{value:'256'},'fft-r-n':{value:'64'},'fft-r-padding':{value:'4'},
 'same-n':{value:'64'},'same-fs':{value:'1024'},
 'dtmf-fft-n':{value:'2048'},'finger-note':{value:'220'},'finger-fft-length':{value:'4096'},
 'fft-upload-n':{value:'1024'},'fft-upload-fs':{value:''},
 'fft-upload-meta':{textContent:'recording.wav · fs = 16000 Hz'},
 'image-size':{value:'256'},'image-cycles':{value:'8'},'image-preset':{value:'stripes'}
};
const find=id=>chartInputs[id]||null;
const t=(en,ko)=>en;
const fmt=(n,d=3)=>Number.isFinite(n)?String(Number(n.toFixed(d))):'—';
const numeric=id=>{const x=find(id)?.value;return x===undefined||x===null||x===''?null:Number(x)};
const models=new Function('$','t','fmt','numeric','visibleText','choose',
  'return ('+balanced(bridge,bridge.indexOf('const specs=')+'const specs='.length)+')')(
   find,t,fmt,numeric,()=>'',id=>find(id)?.value||''
  );
const math={};
for(const [key,model] of Object.entries(models)){
 const m=model.formula();
 assert.ok(m&&m.tex&&m.result,key+' formula absent');
 assert.doesNotMatch(m.tex+m.result,/NaN|Infinity|undefined|null/,'nonfinite formula '+key);
 math[key]=m;
}
assert.match(math.samples.result,/0\.0625 cycles\/sample/);
assert.match(math.resolution.result,/fs\/N=4 Hz/);
assert.match(math.resolution.result,/fs\/\(N·4\)=1 Hz/);
assert.match(math.algorithm.result,/bin spacing=16 Hz/);
assert.match(math.dtmf.result,/3\.906 Hz/);
assert.match(math.fingerprint.result,/f0=220 Hz/);
assert.match(math.upload.result,/15\.625 Hz/); // verified sample-rate metadata
assert.match(math.image.result,/period ≈32 pixels/);
chartInputs['fft-known'].checked=true;
assert.match(models.samples.formula().result,/500 Hz/);
chartInputs['fft-upload-fs'].value='0';
assert.doesNotMatch(models.upload.formula().tex,/\\mathrm\{Hz\}/);
chartInputs['fft-upload-fs'].value='';
assert.match(models.upload.formula().tex,/16000/);
chartInputs['image-preset'].value='checker';
assert.match(models.image.formula().result,/stripe example/);
for(const code of ['assets/ss-fft-study-path.js','assets/ss-fft-theory-guide.js'])new Function(file(code));
for(const [id,page] of ids){
 const html=file(page);
 for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(match[1])new Function(match[1]);
}
console.log('PASS: '+contentChecks+' core FFT labs, '+tutorials.length+' illustrated theory topics');
console.log('PASS: 7 live formula pairs, 4 changed-state branches and native data/calculation references');
