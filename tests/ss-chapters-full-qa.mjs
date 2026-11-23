import {chromium} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";

const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const issues=[],results=[];
const navSelector={
  1:"#nav [data-exp]",2:"[data-nav]",3:"[data-nav]",4:"[data-nav]",
  5:"#tabs [data-lab]",6:"[data-nav]",7:"#ss7-lesson-nav button",8:"#nav [data-exp]"
};
const themes=["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"];
const languages=["en","ko","mixed"];
await mkdir("qa",{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
for(let chapter=1;chapter<=8;chapter++){
 const page=await browser.newPage({viewport:{width:1366,height:850}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 const record=(section,language,theme,kind,data)=>results.push({chapter,section,language,theme,kind,...data});
 try{
  const response=await page.goto(base+"/signals-systems/chapter"+chapter+".html",{waitUntil:"domcontentloaded",timeout:30000});
  if(!response?.ok())throw Error("HTTP "+response?.status());
  await page.waitForFunction(()=>!!window.SSChaptersMathAudit,{timeout:18000});
  await page.locator(navSelector[chapter]).first().waitFor({timeout:12000});
  await page.waitForTimeout(450);
  const count=await page.locator(navSelector[chapter]).count();
  if(!count||count>35)throw Error("Invalid section count "+count);
  for(let i=0;i<count;i++){
   // Use DOM click: sidebar movement should not influence the visible graph geometry.
   await page.locator(navSelector[chapter]).nth(i).evaluate(el=>el.click());
   await page.waitForTimeout(90);
   const navState=await page.locator(navSelector[chapter]).nth(i).evaluate(el=>({
     current:el.getAttribute("aria-current"),
     classes:el.className,
     active:el.classList.contains("active")||el.classList.contains("on")||
      ["page","true"].includes(el.getAttribute("aria-current"))
   }));
   if(!navState.active)issues.push({chapter,section:i+1,reason:"navigation-not-active",navState});
   for(const language of languages){
    const select=page.locator("select[aria-label='Language'],#ss7-language-picker").first();
    if(await select.count()){await select.selectOption(language);await page.waitForTimeout(80)}
    const snapshot=await page.evaluate(()=>{
     window.SSMathCore?.renderNow?.();
     const audit=window.SSChaptersMathAudit.audit();
     const main=document.querySelector("main");
     const plotElements=[...main.querySelectorAll("canvas,svg")].filter(el=>{
       const b=el.getBoundingClientRect();
       return b.width>35&&b.height>30&&el.getClientRects().length>0;
     });
     const invalid=plotElements.filter(el=>{
       const b=el.getBoundingClientRect();
       return b.width<90||b.height<60||!Number.isFinite(b.width)||!Number.isFinite(b.height);
     });
     const overflow=Math.max(0,document.documentElement.scrollWidth-innerWidth);
     const head=main.querySelector("h2,#title,#section")?.textContent?.trim().slice(0,100)||"";
     const bodyText=main.innerText.trim();
     return {passed:audit.passed,mathFailures:audit.failures.slice(0,10),equations:audit.equations,
      plots:plotElements.length,invalidPlots:invalid.length,overflow,head,
      mainLength:bodyText.length};
    });
    record(i+1,language,null,"section",snapshot);
    if(!snapshot.passed)issues.push({chapter,section:i+1,language,reason:"math",details:snapshot.mathFailures});
    if(snapshot.invalidPlots)issues.push({chapter,section:i+1,language,reason:"plot-size"});
    if(snapshot.mainLength<100)issues.push({chapter,section:i+1,language,reason:"empty-content",length:snapshot.mainLength});
    if(snapshot.overflow>8)issues.push({chapter,section:i+1,language,reason:"horizontal-overflow",px:snapshot.overflow});
   }
   const themeSelect=page.locator("[data-els-theme-picker],select[aria-label='Theme']").first();
   for(const theme of themes){
    if(await themeSelect.count()){await themeSelect.selectOption(theme);await page.waitForTimeout(40)}
    const state=await page.evaluate(()=>({
      applied:document.documentElement.dataset.elsTheme,
      overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
      math:window.SSChaptersMathAudit.audit().passed
    }));
    record(i+1,"mixed",theme,"theme",state);
    if(state.applied!==theme||!state.math||state.overflow>8)
      issues.push({chapter,section:i+1,theme,reason:"theme",state});
   }
  }
  // Mobile: verify first and last section with usable plot area and no horizontal scrolling.
  await page.setViewportSize({width:390,height:844});
  for(const index of [...new Set([0,count-1])]){
    await page.locator(navSelector[chapter]).nth(index).evaluate(el=>el.click());
    await page.waitForTimeout(100);
    const mobile=await page.evaluate(()=>({
      overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
      audit:window.SSChaptersMathAudit.audit().passed,
      offenders:[...document.querySelectorAll("body *")].filter(el=>{const b=el.getBoundingClientRect();return b.width>0&&(b.right>innerWidth+7||b.left< -7)}).slice(0,16).map(el=>({tag:el.tagName,id:el.id,cls:typeof el.className==="string"?el.className:"",right:Math.round(el.getBoundingClientRect().right),width:Math.round(el.getBoundingClientRect().width)}))
    }));
    record(index+1,"mixed",null,"mobile",mobile);
    if(mobile.overflow>8||!mobile.audit)issues.push({chapter,section:index+1,reason:"mobile",mobile});
  }
  if(errors.length)issues.push({chapter,reason:"pageerror",errors:errors.slice(0,12)});
  console.log("CHAPTER",chapter,"sections",count,"pageErrors",errors.length);
 }catch(e){issues.push({chapter,reason:"exception",error:String(e.message||e)})}
 finally{await page.close()}
}
await browser.close();
await writeFile("qa/chapters-full-qa.json",JSON.stringify({createdAt:new Date().toISOString(),results,issues},null,2));
console.log("Full chapter QA: states",results.length,"issues",issues.length);
for(const issue of issues.slice(0,100))console.error("ISSUE",JSON.stringify(issue));
if(issues.length)process.exitCode=1;
