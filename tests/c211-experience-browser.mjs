import {chromium} from "playwright";
import assert from "node:assert/strict";
const base=process.env.C211_BASE||"http://127.0.0.1:8765/c-programming/ai-coding/";
const browser=await chromium.launch({headless:true});
try{
for(const width of [390,1280]){
 const ctx=await browser.newContext({viewport:{width,height:900},acceptDownloads:true});
 await ctx.addInitScript(()=>{if(!localStorage.getItem("els-language"))localStorage.setItem("els-language","en");if(!localStorage.getItem("els-theme-v2"))localStorage.setItem("els-theme-v2","neutral-dark")});
 const page=await ctx.newPage(),errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(base,{waitUntil:"networkidle"});await page.locator(".tile").first().waitFor();
 assert.equal(await page.locator(".tile").count(),6);
 assert.equal(await page.locator("#lesson-nav button[data-lesson]").count(),6);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3),false);
 await page.goto(base+"#technology");await page.locator("#stack-choice").selectOption("2");assert.match(await page.locator("#studio-content").innerText(),/Streamlit/);
 await page.locator("#c-language").selectOption("ko");assert.equal(await page.locator("#stack-choice").inputValue(),"2");await page.locator("#c-language").selectOption("en");
 await page.goto(base+"#agents");await page.locator("#build-choice").selectOption("1");assert.match(await page.locator("#studio-content").innerText(),/calculateGpa/);
 await page.goto(base+"#toolkit");assert.ok(await page.locator('a[href="./toolkit.html#11-5"]').count());
 const paths=["01-reaction-time","02-gpa-calculator","03-sorting-visualizer","04-signal-generator","05-study-planner","06-sensor-dashboard"];
 for(const name of paths){
  await page.goto(base+"projects/"+name+".html",{waitUntil:"networkidle"});
  assert.equal(await page.locator("[data-copy]").count(),5);
  assert.equal(await page.locator("#project-lang").inputValue(),"en");
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3),false,name+" overflow");
  assert.equal(await page.locator("#theme").inputValue(),"neutral-dark");
  assert.ok(!/[가-힣]/.test(await page.locator("main").innerText()),name+" English instructional text");
  if(name.startsWith("01")){await page.locator("#pad").click();await page.locator("#pad").click();assert.match(await page.locator("#reaction-status").innerText(),/before green/);await page.locator("#reset").click()}
  if(name.startsWith("02")){assert.match(await page.locator("#stats").innerText(),/4\.10/);await page.locator("#project-lang").selectOption("ko");await page.locator("#project-lang").selectOption("en");assert.match(await page.locator("#stats").innerText(),/4\.10/)}
  if(name.startsWith("03")){await page.locator("#array").fill("5,2,4");await page.locator("#load").click();await page.locator("#step").click();assert.equal(await page.locator("#values").innerText(),"[2, 5, 4]")}
  if(name.startsWith("04")){await page.locator("#freq").fill("3");await page.locator("#freq").dispatchEvent("input");assert.match(await page.locator("#stats").innerText(),/3.0 Hz/);const dl=page.waitForEvent("download");await page.locator("#export").click();await (await dl).saveAs("/tmp/els211-"+width+".csv")}
  if(name.startsWith("05")){assert.match(await page.locator("#stats").innerText(),/33%/);await page.locator("#task").fill("New task");await page.locator("#task-form button").click();assert.match(await page.locator("#list").innerText(),/New task/);await page.reload();assert.match(await page.locator("#list").innerText(),/New task/)}
  if(name.startsWith("06")){assert.match(await page.locator("#stats").innerText(),/25/);await page.locator("#threshold").fill("40");assert.equal(await page.locator("#stats .stat strong").last().innerText(),"0");await page.locator("#file").setInputFiles("/tmp/els211-"+width+".csv");await page.waitForFunction(()=>document.querySelector("#stats strong")?.textContent==="401");await page.locator("#csv").fill("time,value\n0,NaN");assert.equal(await page.locator("#stats .stat").count(),0);await page.locator("#theme").selectOption("white-clean");assert.equal(await page.evaluate(()=>document.documentElement.dataset.elsTheme),"white-clean")}
 }
 assert.deepEqual(errors,[]);await ctx.close();
}
console.log("PASS: 211 Experience First gallery, selection state, 6 projects, 30 prompts, responsive layout, theme and CSV transfer.");
}finally{await browser.close()}
