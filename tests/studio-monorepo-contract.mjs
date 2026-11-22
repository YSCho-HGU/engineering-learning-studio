import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sandbox={window:{}};
vm.runInNewContext(read('shared/els-content-model.js'),sandbox);
const model=sandbox.window.ELSContentModel;
const base={id:'lesson-1',code:'printf("hello");',correct:1,goal:'배열을 설명합니다.',quiz:{q:'정답은?',options:['하나','둘'],correct:1}};
const en={goal:'Explain arrays.',quiz:{q:'Which answer?',options:['One','Two']}};
const before=JSON.stringify(base);
const english=model.project(base,en,'en');
const korean=model.project(base,en,'ko');
const mixed=model.project(base,en,'mixed');
assert.equal(english.goal,'Explain arrays.');
assert.equal(korean.goal,'배열을 설명합니다.');
assert.equal(mixed.goal,'Explain arrays.\n배열을 설명합니다.');
assert.equal(english.quiz.options[1],'Two');
assert.equal(english.quiz.correct,1);
assert.equal(mixed.code,base.code);
assert.equal(JSON.stringify(base),before,'canonical content must remain immutable');
assert.deepEqual(Array.from(model.validate(base,en)),[],'all Korean instructional text translated');
assert.deepEqual(Array.from(model.validate(base,{})),['goal','quiz.q','quiz.options[0]','quiz.options[1]']);
for(let i=1;i<=8;i++){
 const html=read('signals-systems/chapter'+i+'.html');
 assert.match(html,/\.\.\/assets\/els-language\.js/);
 assert.match(html,/\.\.\/assets\/els-theme-v2\.css/);
 assert.match(html,/\.\.\/assets\/els-theme-v2\.js/);
 assert.match(html,/<script defer src="\.\.\/shared\/els-instructional-dom\.js\?v=/,'translator must be deferred until language module');

 for(const m of html.matchAll(/(?:src|href)=(["'])([^"']+)\1/g)){
  const link=m[2].split('?')[0].split('#')[0];
  if(!link||/^(?:https?:|mailto:|tel:|data:|javascript:|#|\/)/.test(link))continue;
  assert.ok(fs.existsSync(path.resolve(root,'signals-systems',link)),'Missing chapter '+i+' dependency: '+link);
 }
}
for(const unit of ['arrays','functions','pointer','structure','strings','standard-library','dynamic-memory','file-io']){
 const html=read('c-programming/'+unit+'/index.html');
 assert.match(html,/shared\/els-content-model\.js/,'shared model missing: '+unit);
}
const sidebarCss=read('signals-systems/assets/ss-sidebar-layout.css');
const verticalCss=read('signals-systems/assets/ss-vertical-nav.css');
assert.match(sidebarCss,/--ss-sidebar-closed:52px/);
assert.ok(!/58px/.test(verticalCss),'no legacy 58px vertical rail');
assert.match(read('index.html'),/\.\/signals-systems\//);
console.log('Studio monorepo static contract passed: 8 SS chapters, 8 C chapters, immutable language model.');
