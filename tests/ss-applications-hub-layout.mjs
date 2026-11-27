/* Regression: preserve the native Applications sidebar + content layout.
 * Checks against malformed HTML wrappers and extraneous learning banners.
 */
import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const out="qa/applications-hub-layout";
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[];
for(const [width,height] of [[1366,900],[1138,840],[768,900],[390,844]]){
 const page=await browser.newPage({viewport:{width,height}});
 const pageErrors=[];
 page.on("pageerror",err=>pageErrors.push(err.message));
 try{
  const response=await page.goto(base+"/signals-systems/applications.html",{waitUntil:"load",timeout:35000});
  assert.equal(response?.status(),200);
  await page.waitForFunction(()=>document.querySelector("#topics-a")?.children.length>0,{timeout:12000});
  const read=()=>page.evaluate(()=>{
   const $=s=>document.querySelector(s);
   const box=e=>{const r=e?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}:null};
   const layout=$(".ss-app-layout"),toc=$(".ss-app-toc"),main=$(".ss-app-main"),intro=$(".ss-app-intro");
   const sections=[...main?.querySelectorAll(":scope > .ss-app-part")||[]].map(e=>e.id);
   const cards=["a","b","c","d"].map(x=>({part:x,count:$("#topics-"+x)?.children.length||0}));
   const css=layout?getComputedStyle(layout):null;
   return {
    layoutParent:layout?.parentElement?.className,
    layoutTag:layout?.tagName,
    first:layout?.firstElementChild?.className,
    second:layout?.children[1]?.className,
    childCount:layout?.children.length,
    mainParent:main?.parentElement===layout,
    tocParent:toc?.parentElement===layout,
    introParent:intro?.parentElement?.className,
    sections,cards,
    layout:box(layout),toc:box(toc),main:box(main),intro:box(intro),
    gridColumns:css?.gridTemplateColumns,
    display:css?.display,
    docWidth:document.documentElement.scrollWidth,
    viewport:innerWidth,
    injectedCards:document.querySelectorAll(".ss-app-study-route,.ss-app-part-guide,.ss-focus-guide").length,
    headingText:$("#part-a-heading")?.textContent?.trim()
   };
  });
  let state=await read();
  assert.equal(state.layoutParent,"ss-app-container","invalid hub layout parent");
  assert(state.mainParent&&state.tocParent,"sidebar and content must be siblings in grid");
  assert.equal(state.childCount,2,"layout must have exactly two direct children");
  assert.deepEqual(state.sections,["part-a","part-b","part-c","part-d"],"all parts in content column");
  assert.equal(state.injectedCards,0,"unexpected injected educational panels");
  assert(state.cards.every(x=>x.count>0),"some Part content is blank");
  assert.equal(state.display,"grid","grid stylesheet not applied");
  assert(state.docWidth<=width+6,"horizontal overflow");
  assert(state.toc.width>200,"toc collapsed");
  if(width>1000){
   assert(state.toc.right<state.main.left,"sidebar must be LEFT of main on desktop");
   assert(state.main.width>550,"main column too narrow");
   assert(Math.abs(state.toc.top-state.main.top)<10,"sidebar and main not aligned");
  }else{
   assert(state.toc.bottom<state.main.top,"mobile/tablet toc must be above main");
   assert(state.main.width>width*.80,"mobile main column is too narrow");
  }
  const visibleParts=()=>page.evaluate(()=>({
    visible:[...document.querySelectorAll(".ss-app-main > .ss-app-part")].filter(x=>!x.hidden&&getComputedStyle(x).display!=="none").map(x=>x.id),
    totalHeight:document.documentElement.scrollHeight,
    active:document.querySelector(".ss-app-toc a[aria-current='location']")?.getAttribute("href")
  }));
  const firstPart=await visibleParts();
  assert.deepEqual(firstPart.visible,["part-a"],"Only Part A should be shown on initial visit");
  assert.equal(firstPart.active,"#part-a","Sidebar must highlight active Part");
  await page.locator(".ss-app-toc a[href='#part-b']").click();
  await page.waitForTimeout(120);
  const partB=await visibleParts();
  assert.deepEqual(partB.visible,["part-b"],"Part B must replace A, not stack below");
  assert.equal(partB.active,"#part-b","Part B sidebar not selected");
  await page.locator("#ss-app-next").click();
  await page.waitForTimeout(120);
  const partC=await visibleParts();
  assert.deepEqual(partC.visible,["part-c"],"Forward navigation must show just Part C");
  await page.locator(".ss-app-shortcuts a[href='#part-d']").click();
  await page.waitForTimeout(120);
  const partD=await visibleParts();
  assert.deepEqual(partD.visible,["part-d"],"Shortcuts must show just Part D");
  assert.equal(await page.locator("#ss-app-next").isDisabled(),true);
  await page.locator("#ss-app-prev").click();
  await page.waitForTimeout(120);
  assert.deepEqual((await visibleParts()).visible,["part-c"]);
  await page.locator(".ss-app-toc a[href='#part-a']").click();
  await page.waitForTimeout(120);
  const restored=await visibleParts();
  assert.deepEqual(restored.visible,["part-a"],"Return to Part A must restore one panel");
  assert(Math.abs(restored.totalHeight-firstPart.totalHeight)<35,"Page grows when switching Parts repeatedly: "+JSON.stringify({first:firstPart,restored}));
  for(let step=0;step<3;step++){
    await page.locator(".ss-app-toc a[href='#part-c']").click();
    await page.locator(".ss-app-toc a[href='#part-a']").click();
  }
  assert(Math.abs((await visibleParts()).totalHeight-firstPart.totalHeight)<35,
    "Repeated section navigation causes cumulative vertical growth");

  const select=page.locator("#ss-app-language");
  await select.selectOption("ko");
  await page.waitForTimeout(80);
  assert.match(await page.locator("#part-a-heading").innerText(),/신호/);
  await select.selectOption("en");
  await page.waitForTimeout(80);
  assert.match(await page.locator("#part-a-heading").innerText(),/Signal/);
  await select.selectOption("mixed");
  await page.waitForTimeout(80);
  state=await read();
  assert(state.mainParent&&state.tocParent,"language change broke layout");
  assert(state.docWidth<=width+6,"language change created horizontal overflow");
  assert.equal(pageErrors.length,0,"uncaught browser errors: "+pageErrors.join("; "));
  await page.screenshot({path:out+"/applications-"+width+"px.png",fullPage:true,animations:"disabled"});
  console.log("PASS",width+"px",JSON.stringify({toc:Math.round(state.toc.width),main:Math.round(state.main.width),parts:state.cards}));
 }catch(e){errors.push({width,error:String(e)});console.error("FAIL",width+"px",e)}
 finally{await page.close()}
}
await browser.close();
console.log("Applications grid layout",4-errors.length,"/4 viewports");
if(errors.length)process.exitCode=1;
