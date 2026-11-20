import test from "node:test";
import assert from "node:assert/strict";
import {authorizedIdentity,courseConfig,validateCatalog,publishedPagePath,HttpError} from "../catalog-core.mjs";
const actor={uid:"test-uid-1",email:"yscho@handong.edu",email_verified:true,
 firebase:{sign_in_provider:"google.com",identities:{"google.com":["google-subject"]}}};
const base={schemaVersion:1,course:"signals-systems",
 chapters:[{id:"1",title:"Basics",sub:"CT",description:"Signals",published:true,book:""},
 {id:"2",title:"LTI",sub:"Convolution",description:"Impulse",published:false,book:""}]};
function clone(x){return structuredClone(x)}
test("Only verified owner with exactly matching Firebase UID and Google provider can edit",()=>{
 assert.equal(authorizedIdentity(actor,"test-uid-1"),true);
 for(const mutate of [
  {uid:"other"},{email:"someone@handong.edu"},{email:"yscho@other.edu"},{email_verified:false},
  {firebase:{sign_in_provider:"password",identities:{"google.com":["google-subject"]}}},
  {firebase:{sign_in_provider:"google.com",identities:{}}}
 ])assert.equal(authorizedIdentity({...actor,...mutate},"test-uid-1"),false);
 assert.equal(authorizedIdentity(actor,""),false);
 assert.equal(authorizedIdentity(actor,"other-uid"),false);
});
test("Fixed repository and file allowlist rejects unknown course",()=>{
 assert.equal(courseConfig("c").path,"c-programming/course-catalog.json");
 assert.equal(courseConfig("ss").path,"course-catalog.json");
 for(const bad of ["../etc","constructor","__proto__",null,{},["c"]])assert.throws(()=>courseConfig(bad),HttpError);
});
test("Permits only intended metadata edits, preserves IDs and other catalog fields",()=>{
 const next=clone(base);
 next.chapters[1].published=true;
 next.chapters[1].title="New title";
 next.chapters[1].book="https://drive.google.com/file/d/example1/view";
 const diff=validateCatalog(base,next,"ss");
 assert.equal(diff.length,1);assert.equal(diff[0].id,"2");
 assert.deepEqual(base.chapters[1],{id:"2",title:"LTI",sub:"Convolution",description:"Impulse",published:false,book:""});
});
test("Rejects deletions, reordering, hidden edits and malformed catalog",()=>{
 const invalid=[
 x=>x.chapters.pop(),
 x=>x.chapters.reverse(),
 x=>x.chapters[0].id="8",
 x=>x.course="malicious",
 x=>x.chapters[0].evil="injected",
 x=>x.chapters[1].published="yes",
 x=>x.chapters[1].title="",
 x=>x.chapters[1].description="x".repeat(601),
 x=>x.chapters[1].sub=4,
 x=>x.chapters[1].book="javascript:alert(1)",
 x=>x.chapters[1].book="https://evil.example"
 ];
 for(const modify of invalid){const change=clone(base);modify(change);assert.throws(()=>validateCatalog(base,change,"ss"),HttpError)}
});
test("Publishing checks only allow repository-relative catalogued HTML",()=>{
 assert.equal(publishedPagePath("c",{id:"171",url:"./file-io/"}),"c-programming/file-io/index.html");
 assert.equal(publishedPagePath("ss",{id:"6"}),"index.html");
 for(const url of ["../secret/","./../secret/","/admin/","https://evil.example/","./foo/bar/"]){
  assert.throws(()=>publishedPagePath("c",{id:"171",url}),HttpError);
 }
 assert.throws(()=>publishedPagePath("ss",{id:"9"}),HttpError);
});
