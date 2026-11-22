/* Monorepo deduplication contract: one authoritative shared asset per type.
 * Only course adapters stay inside signals-systems/assets/.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=process.cwd();
const read=p=>fs.readFileSync(p,'utf8');
const canonical=['assets/design-system.css','assets/design-system.version.json','assets/els-theme-v2.css','assets/els-theme-v2.js','assets/els-language.js'];
const retired=['signals-systems/assets/design-system.css','signals-systems/assets/design-system.version.json','signals-systems/assets/els-theme-v2.css','signals-systems/assets/els-theme-v2.js','signals-systems/assets/els-language.js'];
for(const p of canonical)assert.ok(fs.existsSync(p),'canonical asset missing '+p);
for(const p of retired)assert.ok(!fs.existsSync(p),'unused mirror remains '+p);
const theme=read('assets/els-theme-v2.js');
const header=read('assets/els-header-controls.js');
assert.ok(theme.includes('choices:CHOICES.map'),'theme controller must expose canonical palette');
assert.ok(header.includes('win.ELSTheme.choices'),'header must use palette controller');
assert.ok(!header.includes('const themes=[['),'no second hard-coded palette list');
for(const script of ['assets/els-theme-v2.js','assets/els-header-controls.js','assets/els-language.js','signals-systems/assets/ss-common-header.js']){
 new vm.Script(read(script),{filename:script});
}
for(const page of ['index.html','c-programming/index.html','signals-systems/index.html',...Array.from({length:8},(_,i)=>'signals-systems/chapter'+(i+1)+'.html')]){
 const content=read(page);
 assert.ok(content.includes('els-header-controls.js'),page+' shared header missing');
 if(page.startsWith('signals-systems/')){
  for(const asset of ['els-theme-v2.js','els-language.js','els-theme-v2.css','design-system.css']){
   const re=new RegExp('(?:src|href)=[\\x22\\x27]\\.\\.\\/assets\\/'+asset.replace(/\\./g,'\\.') );
   assert.ok(re.test(content),page+' should load canonical '+asset);
  }
 }
}
const manifest=JSON.parse(read('assets/design-system.version.json'));
assert.ok(manifest.mirror_policy.includes('No course-local copies'));
assert.deepEqual(manifest.themes,['white-clean','warm-neutral','warm-dark','navy-dark','neutral-dark']);
console.log('PASS: all 5 duplicated assets removed, shared palette single-source and 11 page references preserved.');
