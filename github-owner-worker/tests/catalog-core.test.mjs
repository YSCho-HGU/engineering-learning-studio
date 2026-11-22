import test from "node:test";
import assert from "node:assert/strict";
import {ownerIdentity,courseConfig,validateCatalog,publishedPagePath,HttpError} from "../src/catalog-core.js";

const identity={id:1234567,login:"studio-owner"};
const emails=[{email:"yscho@handong.edu",verified:true,primary:true},{email:"alternate@example.com",verified:false}];
const base={schemaVersion:1,course:"signals-systems",chapters:[
 {id:"1",title:"Signals",description:"Basics",published:true,sub:"CT",book:""},
 {id:"2",title:"Systems",description:"LTI",published:false,sub:"DT",book:""}
]};
const clone=value=>structuredClone(value);
test("fixed GitHub numeric user ID and verified school email both required",()=>{
 assert.equal(ownerIdentity(identity,emails,"1234567"),true);
 assert.equal(ownerIdentity({...identity,id:1234568},emails,"1234567"),false);
 assert.equal(ownerIdentity(identity,[{email:"yscho@handong.edu",verified:false}],"1234567"),false);
 assert.equal(ownerIdentity(identity,[{email:"other@handong.edu",verified:true}],"1234567"),false);
 assert.equal(ownerIdentity(identity,emails,"studio-owner"),false);
 assert.equal(ownerIdentity(identity,emails,""),false);
});
test("only predefined repositories and paths can be requested",()=>{
 assert.equal(courseConfig("ss").path,"signals-systems/course-catalog.json");
 assert.equal(courseConfig("c").path,"c-programming/course-catalog.json");
 for(const key of ["../",null,"toString","__proto__",{},["c"]])assert.throws(()=>courseConfig(key),HttpError);
});
test("preserve immutable catalog metadata and chapter order",()=>{
 const change=clone(base);change.chapters[1].published=true;change.chapters[1].title="New";
 assert.equal(validateCatalog(base,change,"ss").length,1);
 assert.deepEqual(base.chapters[1],{id:"2",title:"Systems",description:"LTI",published:false,sub:"DT",book:""});
 for(const operation of [
  x=>x.chapters.reverse(),x=>x.chapters.push({id:"3"}),x=>x.chapters[0].id="9",
  x=>x.newAdmin=true,x=>x.course="evil",x=>x.chapters[0].url="../../",
  x=>x.chapters[0].title="",x=>x.chapters[0].published="yes",
  x=>x.chapters[0].book="javascript:alert(1)",x=>x.chapters[1].description="x".repeat(700)
 ]){
  const altered=clone(base);operation(altered);
  assert.throws(()=>validateCatalog(base,altered,"ss"),HttpError);
 }
});
test("verify published lesson page paths remain confined to course",()=>{
 assert.equal(publishedPagePath("ss",{id:"6"}),"signals-systems/chapter6.html");
 assert.equal(publishedPagePath("c",{url:"./arrays/"}),"c-programming/arrays/index.html");
 for(const unsafe of ["../files/","./../admin/","http://evil.example","/secret/"]){
  assert.throws(()=>publishedPagePath("c",{url:unsafe}),HttpError);
 }
});
