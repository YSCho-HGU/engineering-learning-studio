import {chromium} from "playwright";
import assert from "node:assert/strict";
const browser=await chromium.launch({headless:true}), base=process.env.C211_BASE||"http://127.0.0.1:8765/c-programming/ai-coding/projects/versions/";
const names=["01-reaction-time","02-gpa-calculator","03-sorting-visualizer","04-signal-generator","05-study-planner","06-sensor-dashboard"];
try{
for(const width of [390,1280]){
 const ctx=await browser.newContext({viewport:{width,height:850},acceptDownloads:true});await ctx.addInitScript(()=>{if(!localStorage.getItem("els-language"))localStorage.setItem("els-language","en")});
 const page=await ctx.newPage(),errors=[];page.on("pageerror",e=>errors.push(e.message));await page.goto(base);assert.equal(await page.locator("main .panel a").count(),30);
 for(const name of names)for(let v=1;v<=5;v++){
  await page.goto(base+name+"/v"+v+".html");assert.equal(await page.locator(".nav [aria-current=page]").innerText(),"V"+v);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+4),false,name+" V"+v+" overflow");
  if(name.startsWith("01")){await page.locator("#pad").click();if(v>=2){await page.locator("#pad").click();assert.match(await page.locator("#pad").innerText(),/False Start/)}else{await page.waitForFunction(()=>document.querySelector("#pad").classList.contains("ready"));await page.locator("#pad").click();assert.match(await page.locator("#stats").innerText(),/ms/)}}
  if(name.startsWith("02")){assert.match(await page.locator("#stats").innerText(),/4\.10/);if(v===1){await page.locator("#c1").fill("2");await page.locator("#calc").click();assert.match(await page.locator("#stats").innerText(),/4\.00/)}else{await page.locator("#add").click();assert.equal(await page.locator("#list .item").count(),3)}}
  if(name.startsWith("03")){await page.locator("#step").click();assert.equal(await page.locator("#values").innerText(),"[2, 5, 4]");if(v>=2){await page.locator("#array").fill("-3,0,-5");await page.locator("#load").click();for(let i=0;i<3;i++)await page.locator("#step").click();assert.equal(await page.locator("#values").innerText(),"[-5, -3, 0]")}}
  if(name.startsWith("04")){await page.locator("#freq").fill("3");assert.match(await page.locator("#stats").innerText(),/3\.0 Hz/);if(v>=3){const dl=page.waitForEvent("download");await page.locator("#export").click();await (await dl).saveAs("/tmp/els211-v-"+width+".csv")}}
  if(name.startsWith("05")){await page.locator("#task").fill("QA task");await page.locator("#add").click();assert.match(await page.locator("#list").innerText(),/QA task/);if(v>=3){await page.reload();assert.match(await page.locator("#list").innerText(),/QA task/)}if(v>=4){await page.locator("#demo").click();assert.doesNotMatch(await page.locator("#list").innerText(),/QA task/);await page.locator("#demo").click();assert.match(await page.locator("#list").innerText(),/QA task/)}}
  if(name.startsWith("06")){assert.match(await page.locator("#stats").innerText(),/25/);if(v>=2){await page.locator("#threshold").fill("40");assert.equal(await page.locator("#stats strong").last().innerText(),"0");await page.locator("#file").setInputFiles("/tmp/els211-v-"+width+".csv");await page.waitForFunction(()=>document.querySelector("#stats strong")?.textContent==="401")}await page.locator("#csv").fill("time,value\n0,NaN");assert.equal(await page.locator("#stats strong").count(),0)}
  if(await page.locator("#run-tests").count()){await page.locator("#run-tests").click();assert.ok(await page.locator("#tests .pass").count()>0);assert.equal(await page.locator("#tests .fail").count(),0)}
  await page.locator("#language").selectOption("ko");await page.locator("#language").selectOption("en");assert.equal(await page.locator("#language").inputValue(),"en");
  await page.locator("[data-els-theme-picker]").selectOption("white-clean");assert.equal(await page.evaluate(()=>document.documentElement.dataset.elsTheme),"white-clean");
 }
 assert.deepEqual(errors,[]);await ctx.close();
}
console.log("PASS: 30 stages at 390/1280 px, feature checks, CSV exchange, language and theme.");
}finally{await browser.close()}
