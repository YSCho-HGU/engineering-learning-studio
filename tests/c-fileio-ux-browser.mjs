import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
const failures=[];
for(const width of [390,768,1280]){
 const ctx=await browser.newContext({viewport:{width,height:850}});
 const page=await ctx.newPage();
 page.on("pageerror",e=>failures.push(width+" runtime JS "+e.message));
 await page.goto("http://127.0.0.1:8765/c-programming/file-io/",{waitUntil:"networkidle"});
 const conceptNav=page.locator('#lesson-nav');
 if(!(await conceptNav.locator('details[data-group="core"]').evaluate(el=>el.open)))failures.push(width+" Core Concepts group is not expanded");
 if(await conceptNav.locator('details[data-group="advanced"]').evaluate(el=>el.open))failures.push(width+" Advanced group unexpectedly expanded");
 await conceptNav.locator('button[data-nav="0"]').click();
 if(!await page.locator("#step-label").innerText().then(x=>x.includes("01")))failures.push(width+" failed to jump to core concepts");
 await conceptNav.locator('details[data-group="advanced"] summary').click();
 if(!(await conceptNav.locator('details[data-group="advanced"]').evaluate(el=>el.open)))failures.push(width+" advanced sidebar group cannot expand");
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3))failures.push(width+" course horizontal overflow");
 await page.goto("http://127.0.0.1:8765/c-programming/file-io/practice/#p1",{waitUntil:"networkidle"});
 if(!await page.locator("#core-io-explorer").isVisible())failures.push(width+" P1 explorer hidden");
 if(await page.locator("#mini-overview").isVisible())failures.push(width+" M1 introduction should be collapsed on P1");
 if(await page.locator('#task-nav details[data-group="advanced"]').evaluate(el=>el.open))failures.push(width+" optional challenges unexpectedly expanded");
 await page.locator("#editor").fill("/* regression P1 draft */");
 await page.locator("#task-nav button[data-task='1']").click();
 if(!await page.locator("#coreio-title").innerText().then(x=>x.includes("P2")))failures.push(width+" P2 explorer absent");
 await page.locator("#task-nav button[data-task='0']").click();
 if(await page.locator("#editor").inputValue()!=="/* regression P1 draft */")failures.push(width+" P1 draft not restored");
 await page.locator("#task-nav button[data-task='6']").click();
 if(!await page.locator("#m1-buffer-explorer").isVisible())failures.push(width+" M1 explorer absent");
 if(!await page.locator("#mini-overview").isVisible())failures.push(width+" M1 introduction hidden");
 await page.locator('#task-nav details[data-group="advanced"] summary').click();
 if(await page.locator("#task-nav button").count()!==7)failures.push(width+" P1–P6 + M1 not all available");
 await page.locator("#task-nav button[data-task='2']").click();
 if(await page.locator("#core-io-explorer").isVisible()||await page.locator("#m1-buffer-explorer").isVisible())failures.push(width+" optional P3 should have no core explorer");
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3))failures.push(width+" practice horizontal overflow");
 await page.screenshot({path:"qa-fileio-ux-"+width+".png",fullPage:false});
 await ctx.close();
}
await browser.close();
if(failures.length){console.error(failures.join("\n"));process.exit(1)}
console.log("PASS: grouped 171 navigation, core/advanced sidebar, saved drafts, seven tasks and responsive UI");
