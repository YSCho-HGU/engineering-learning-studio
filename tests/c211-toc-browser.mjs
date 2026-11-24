import {chromium} from "playwright";
import assert from "node:assert/strict";
const base=process.env.C211_BASE||"http://127.0.0.1:8765/c-programming/ai-coding/";
const browser=await chromium.launch({headless:true});
try{
 for(const width of [390,1280]){
  const ctx=await browser.newContext({viewport:{width,height:850}});
  await ctx.addInitScript(()=>{if(!localStorage.getItem("els-language"))localStorage.setItem("els-language","en")});
  const page=await ctx.newPage(),errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(base);await page.locator("#lesson-nav button[data-lesson]").first().waitFor();
  assert.equal(await page.locator("#lesson-nav.c-grouped-toc details.c-learning-group").count(),3);
  assert.equal(await page.locator("#lesson-nav button[data-lesson]").count(),6);
  assert.equal(await page.locator("#lesson-nav [aria-current=step] .n").innerText(),"01");
  assert.equal(await page.locator("#mobile-sections").count(),0);
  assert.equal(await page.locator(".c-sidebar-toggle").count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3),false);
  await page.locator('#lesson-nav details[data-group="labs"] summary').click();
  assert.equal(await page.locator('#lesson-nav details[data-group="labs"] a').count(),6);
  await page.locator('#lesson-nav button[data-lesson="2"]').click();
  assert.equal(await page.locator("#lesson-nav [aria-current=step] .n").innerText(),"03");
  assert.match(await page.locator("#studio-content").innerText(),/Technology Stack Selector/);
  assert.equal(await page.locator('#lesson-nav details[data-group="labs"]').evaluate(n=>n.open),true);
  await page.locator('.c-four-navigation button[data-direction="1"]').click();
  assert.equal(await page.locator("#lesson-nav [aria-current=step] .n").innerText(),"04");
  await page.locator(".c-sidebar-toggle").click();
  assert.equal(await page.locator("#lesson-nav").isVisible(),false);
  await page.locator(".c-sidebar-toggle").click();
  assert.equal(await page.locator("#lesson-nav").isVisible(),true);
  await page.locator("#c-language").selectOption("ko");
  assert.match(await page.locator('#lesson-nav details[data-group="core"] summary').innerText(),/핵심 학습/);
  await page.locator("#c-language").selectOption("en");
  await page.goto(base+"toolkit.html#11-5");
  await page.locator('#lesson-nav button[data-lesson="4"]').waitFor();
  assert.equal(await page.locator("#lesson-nav.c-grouped-toc details.c-learning-group").count(),3);
  assert.equal(await page.locator("#lesson-nav [aria-current=step] .n").innerText(),"05");
  assert.equal(await page.locator('#lesson-nav details[data-group="labs"] a').count(),6);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3),false);
  assert.deepEqual(errors,[]);
  await ctx.close();
 }
 console.log("PASS: 211 common grouped TOC, active state, links, arrows, collapse, language and responsive width.");
}finally{await browser.close()}
