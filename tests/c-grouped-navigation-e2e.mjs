#!/usr/bin/env node
/* Chromium acceptance for the shared four-group C learning map.
 * Eight published chapters; two viewports, two palettes, group interaction,
 * header arrows, language/theme controls, challenge routes, and local storage.
 */
import {chromium} from "playwright";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {spawn} from "node:child_process";
const catalog=JSON.parse(readFileSync("c-programming/course-catalog.json","utf8"));
const entries=catalog.chapters.filter(x=>x.published);
const root=process.env.C_NAV_BASE||"http://127.0.0.1:8791/";
const out="qa-output/c-navigation";
mkdirSync(out,{recursive:true});
let server;
if(!process.env.C_NAV_BASE){
 server=spawn("python3",["-m","http.server","8791","--bind","127.0.0.1"],{stdio:"ignore"});
 await new Promise(r=>setTimeout(r,1100));
}
const errors=[],records=[];
const assert=(value,description)=>{if(!value)throw Error(description)};
const browser=await chromium.launch({headless:true});
try{
 for(const item of entries){
  const slug=item.url.match(/^\.\/([^/]+)\/$/)?.[1],isFile=slug==="file-io";
  assert(slug,"published chapter missing route");
  const data=isFile?null:JSON.parse(readFileSync("c-programming/"+slug+"/data.js","utf8").replace(/^\s*window\.C_JOURNEY\s*=\s*/,"").replace(/;\s*$/,""));
  const total=isFile?8:data.lessons.length;
  const optional=isFile||data.coreCount>0&&data.coreCount<total;
  const expectedGroups=optional?["core","advanced","challenges"]:["core","challenges"];
  if(isFile)expectedGroups.splice(1,0,"labs");
  for(const width of [390,1280])for(const palette of ["neutral-dark","warm-neutral"]){
   const ctx=await browser.newContext({viewport:{width,height:850}});
   await ctx.addInitScript(theme=>{
    if(localStorage.getItem("els-theme-v2")===null)localStorage.setItem("els-theme-v2",theme);
    if(localStorage.getItem("els-language")===null)localStorage.setItem("els-language","mixed");
    if(localStorage.getItem("qa-preserve-unknown")===null)localStorage.setItem("qa-preserve-unknown","kept");
   },palette);
   const page=await ctx.newPage();
   page.setDefaultTimeout(5000);
   const pageErrors=[];
   page.on("pageerror",e=>pageErrors.push("JS "+e.message));
   page.on("response",r=>{if(r.url().startsWith(root)&&r.status()>=400)pageErrors.push("HTTP "+r.status()+" "+r.url())});
   const label=slug+"/"+width+"/"+palette;
   try{
    const res=await page.goto(root+"c-programming/"+slug+"/",{waitUntil:"load",timeout:45000});
    assert(res?.status()===200,"HTTP "+res?.status());
    const nav=page.locator("#lesson-nav");
    await nav.locator("details.c-learning-group").first().waitFor();
    const groups=await nav.locator(":scope > details.c-learning-group").evaluateAll(els=>els.map(x=>x.dataset.group));
    assert(JSON.stringify(groups)===JSON.stringify(expectedGroups),"wrong group order: "+groups);
    const lessonButtons=nav.locator(isFile?"button[data-nav]":"button[data-lesson]");
    assert(await lessonButtons.count()===total,"lesson count "+await lessonButtons.count()+" expected "+total);
    const core=nav.locator('details[data-group="core"]');
    assert(await core.evaluate(el=>el.open),"first group should start open");
    await core.locator("summary").click();
    assert(!(await core.evaluate(el=>el.open)),"core group does not collapse");
    await core.locator("summary").click();
    assert(await core.evaluate(el=>el.open),"core group does not expand");
    assert(await nav.locator('details[data-group="challenges"] a').count()>0,"challenge links missing");
    const last=lessonButtons.last();
    await last.evaluate(b=>{const group=b.closest("details");if(group)group.open=true});
    await last.click();
    assert(await last.getAttribute("aria-current")==="step","last lesson not activated");
    const headerArrows=page.locator(".c-four-navigation > *");
    assert(await headerArrows.count()===4,"four chapter/section arrows missing");
    const prev=page.locator('.c-four-navigation button[aria-label="Previous section"]');
    const next=page.locator('.c-four-navigation button[aria-label="Next section"]');
    assert(await next.isDisabled(),"next arrow not disabled at last lesson");
    await prev.click();
    assert(!(await prev.isDisabled())||total<=2,"previous arrow did not move lesson");
    await lessonButtons.first().evaluate(b=>{const group=b.closest("details");if(group)group.open=true});
    await lessonButtons.first().click();
    assert(await prev.isDisabled(),"previous arrow not disabled at first lesson");
    const activeBefore=await lessonButtons.first().getAttribute("aria-current");
    assert(activeBefore==="step","first lesson not selected");
    await next.click();
    assert(await lessonButtons.nth(1).getAttribute("aria-current")==="step","next arrow failed to move to step 2");
    assert(await page.locator("#c-language").count()===1,"language selector missing");
    await page.locator("#c-language").selectOption("en");
    await page.waitForTimeout(100);
    assert(await page.locator("#c-language").inputValue()==="en","English selection failed");
    await page.locator("#c-language").selectOption("mixed");
    await page.waitForTimeout(100);
    assert(await page.locator("#c-language").inputValue()==="mixed","mixed language selection failed");
    const theme=page.locator('[data-els-theme-picker]').last();
    assert(await theme.count()===1,"theme selector missing");
    assert(await theme.locator("option").count()===5,"five theme options missing");
    const saved=await page.evaluate(()=>localStorage.getItem("qa-preserve-unknown"));
    assert(saved==="kept","unrelated local storage changed");
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+8);
    assert(!overflow,"horizontal page overflow");
    assert(!pageErrors.length,"browser errors: "+pageErrors.join("; "));
    if(width===390)await page.screenshot({path:out+"/"+slug+"-"+palette+"-"+width+".png",fullPage:false});
    records.push({slug,width,palette,groups,status:"PASS"});
   }catch(e){
    errors.push({slug,width,palette,error:String(e),pageErrors});
    records.push({slug,width,palette,status:"FAIL"});
   }finally{await ctx.close()}
  }
 }
 // Verify the three actual guided labs and the File I/O coding editor routing.
 const ctx=await browser.newContext({viewport:{width:390,height:850}});
 const page=await ctx.newPage();
 page.setDefaultTimeout(5000);
 try{
  await page.goto(root+"c-programming/file-io/core-labs/",{waitUntil:"load"});
  const nav=page.locator(".side-nav");
  assert(await nav.locator('details[data-group="labs"] a[data-lab-link]').count()===3,"three guided labs missing from sidebar");
  const labels=await nav.locator("details.c-learning-group").evaluateAll(els=>els.map(x=>x.dataset.group));
  assert(JSON.stringify(labels)===JSON.stringify(["core","labs","advanced","challenges"]),"guided lab group order: "+labels);
  await nav.locator('a[data-lab-link="student"]').click();
  assert(new URL(page.url()).hash==="#student","student lab route not selected");
  records.push({slug:"file-io/core-labs",status:"PASS"});
 }catch(e){errors.push({slug:"file-io/core-labs",error:String(e)})}
 try{
  await page.goto(root+"c-programming/file-io/practice/#m1",{waitUntil:"load"});
  assert(await page.locator('#task-nav button[data-task]').count()===7,"File I/O seven tasks missing");
  assert((await page.locator('#task-id').innerText()).includes("M1"),"M1 deep link not restored");
  const firstTitle=await page.locator("#task-title").innerText();
  await page.locator('#task-nav button[data-task]').first().click();
  assert((await page.locator("#task-title").innerText())!==firstTitle,"task navigation did not change");
  assert(await page.locator(".c-sidebar-topline").count()===1,"sidebar collapse button lost on task switch");
  records.push({slug:"file-io/practice",status:"PASS"});
 }catch(e){errors.push({slug:"file-io/practice",error:String(e)})}
 await ctx.close();
}finally{await browser.close();if(server)server.kill()}
const summary={status:errors.length?"FAIL":"PASS",views:records.length,passed:records.filter(r=>r.status==="PASS").length,errors,records};
writeFileSync(out+"/latest.json",JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify({status:summary.status,views:summary.views,passed:summary.passed,errors:errors.slice(0,16)},null,2));
if(errors.length)process.exitCode=1;
