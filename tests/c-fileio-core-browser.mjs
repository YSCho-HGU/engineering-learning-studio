import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
const errors=[];
async function finish(page){
 const next=page.locator("#coreio-next");
 for(let i=0;i<24&&await next.isEnabled();i++)await next.click();
 if(await next.isEnabled())errors.push("simulation did not terminate");
}
for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:900}});
 const page=await context.newPage();
 page.on("pageerror",e=>errors.push(width+" JS "+e.message));
 await page.goto("http://127.0.0.1:8765/c-programming/file-io/practice/",{waitUntil:"networkidle"});
 const panel=page.locator("#core-io-explorer");
 if(!await panel.isVisible())errors.push(width+" P1 explorer not initially visible");
 if(!await page.locator("#coreio-title").innerText().then(x=>x.includes("P1")))errors.push(width+" P1 title");
 await finish(page);
 const p1=await page.locator("#coreio-dest").innerText();
 if(p1.trim()!=="10\n20\n30\n40\n50")errors.push(width+" P1 output "+JSON.stringify(p1));
 if(!await page.locator("#coreio-result").innerText().then(x=>x.includes("완료")))errors.push(width+" P1 not completed");
 await page.locator("#coreio-scenario").selectOption("invalid");
 await finish(page);
 if(!await page.locator("#coreio-result").innerText().then(x=>x.includes("오류")))errors.push(width+" P1 invalid missing error");
 if((await page.locator("#coreio-dest").innerText()).trim()!=="10\n20")errors.push(width+" P1 invalid should stop after 2 numbers");
 await page.locator("#coreio-scenario").selectOption("open-fail");
 await finish(page);
 if(!await page.locator("#coreio-result").innerText().then(x=>x.includes("오류")))errors.push(width+" P1 open fail missing");
 await page.locator("[data-go-task="1"]").click();
 if(!await panel.isVisible())errors.push(width+" P2 explorer missing");
 await finish(page);
 const p2=await page.locator("#coreio-dest").innerText();
 if(!p2.includes("Count = 3")||!p2.includes("Average = 2.667"))errors.push(width+" P2 average mismatch: "+p2);
 await page.locator("#coreio-scenario").selectOption("empty");await finish(page);
 if(!await page.locator("#coreio-dest").innerText().then(x=>x.includes("No values")))errors.push(width+" P2 empty file");
 await page.locator("#coreio-scenario").selectOption("invalid");await finish(page);
 if(!await page.locator("#coreio-result").innerText().then(x=>x.includes("오류")))errors.push(width+" P2 invalid token");
 await page.locator("#coreio-scenario").selectOption("missing");await finish(page);
 if(!await page.locator("#coreio-result").innerText().then(x=>x.includes("오류")))errors.push(width+" P2 missing source");
 await page.locator("#coreio-scenario").selectOption("normal");
 await page.locator("#coreio-play").click();
 if(await page.locator("#coreio-play").getAttribute("aria-pressed")!=="true")errors.push(width+" autoplay start");
 await page.locator("#coreio-reset").click();
 if(await page.locator("#coreio-play").getAttribute("aria-pressed")!=="false")errors.push(width+" autoplay reset");
 await page.locator("[data-go-task="6"]").click();
 if(await panel.isVisible())errors.push(width+" P1/P2 explorer visible on M1");
 if(!await page.locator("#m1-buffer-explorer").isVisible())errors.push(width+" M1 explorer hidden");
 await page.locator("[data-go-task="0"]").click();
 if(!await panel.isVisible())errors.push(width+" P1 explorer not restored");
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3))errors.push(width+" horizontal overflow");
 await page.screenshot({path:"qa-fileio-core-"+width+".png",fullPage:false});
 await context.close();
}
await browser.close();
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log("PASS: P1/P2 interactive I/O models, normal and failures, task switching, 390/1280 layouts.");
