import {chromium} from "playwright";
import {mkdirSync} from "node:fs";
import {pathToFileURL} from "node:url";
import assert from "node:assert/strict";
const base=process.env.C211_STUDIO_BASE||"http://127.0.0.1:8765/c-programming/ai-coding/";
const browser=await chromium.launch({headless:true});
mkdirSync("qa-c211-release",{recursive:true});
const projects=["01-reaction-time","02-gpa-calculator","03-sorting-visualizer","04-signal-generator","05-study-planner","06-sensor-dashboard"];
try{
 for(const width of [320,390,1280]){
  const ctx=await browser.newContext({viewport:{width,height:850},acceptDownloads:true,permissions:["clipboard-read","clipboard-write"]});
  const p=await ctx.newPage(),errors=[];p.on("pageerror",e=>errors.push(e.message));
  await p.goto(base);await p.locator(".tile").first().waitFor();
  await p.locator("#c-language").selectOption("mixed");
  assert.equal(await p.locator(".tile").count(),6);
  for(let i=0;i<6;i++)assert.equal(await p.locator(".tile").nth(i).getAttribute("href"),"./projects/versions/"+projects[i]+"/v1.html");
  for(const theme of ["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"]){
   await p.locator("#theme").selectOption(theme);
   assert.equal(await p.evaluate(()=>document.documentElement.dataset.elsTheme),theme);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3),false,"gallery "+theme+" "+width);
  }
  await p.screenshot({path:"qa-c211-release/gallery-"+width+".png",fullPage:true});
  await p.locator(".tile").first().click();await p.locator("#pad").waitFor();
  assert.equal(await p.locator(".nav [aria-current=page]").innerText(),"V1");
  assert.equal(await p.locator("#language").inputValue(),"mixed");
  await p.locator("#copy-prompt").click();
  await p.waitForFunction(()=>document.querySelector("#copy-state")?.textContent.includes("Copied"));
  assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),await p.locator("#prompt").getAttribute("data-ko"));
  await p.locator("#pad").click();await p.waitForFunction(()=>document.querySelector("#pad")?.classList.contains("ready"));await p.locator("#pad").click();
  assert.match(await p.locator("#stats").innerText(),/ms/);
  await p.screenshot({path:"qa-c211-release/first-success-"+width+".png",fullPage:true});
  await p.locator(".next-action a").click();assert.equal(await p.locator(".nav [aria-current=page]").innerText(),"V2");
  await p.locator(".version-help summary").click();assert.match(await p.locator(".version-help").innerText(),/previous HTML/);
  const dl=p.waitForEvent("download");await p.locator(".save-example").click();
  const file="/tmp/c211-offline-"+width+".html";await (await dl).saveAs(file);
  await p.goto(pathToFileURL(file).href);await p.locator("#pad").waitFor();
  assert.equal(await p.locator(".nav").isVisible(),false);
  assert.equal(await p.locator(".offline-note").isVisible(),true);
  await p.locator("#pad").click();await p.locator("#pad").click();
  assert.match(await p.locator("#pad").innerText(),/False Start|조기 클릭/);
  assert.deepEqual(errors,[]);await ctx.close();
 }
 console.log("PASS: 211 novice journey, 5 palettes, mixed-language clipboard, offline run and 320/390/1280 px.");
}finally{await browser.close()}
