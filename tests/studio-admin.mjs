/* Public GitHub Pages security regression.
 * A static /admin/ path cannot hide source files, but it must reveal no
 * administrator interface, QA dashboard or direct-PAT editor before the
 * verified GitHub Owner Worker session succeeds.
 */
import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1180,height:900}});
const errors=[],unauthCalls=[];
page.on("pageerror",error=>errors.push("JS "+error.message));
page.on("request",request=>{
 if(/api\.github\.com|raw\.githubusercontent\.com|\/api\/catalog/.test(request.url()))unauthCalls.push(request.url());
});
try{
 const res=await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
 if(res?.status()!==200)errors.push("Home not served");
 const header=page.locator("header.site-header");
 if(!await header.count())errors.push("Studio home shared header missing");
 if(await header.locator('a[href*="admin"]').count())errors.push("Admin link leaked on home header");
 if(await header.locator('a[href*="progress"]').count())errors.push("C-only progress link leaked on home header");
 if(!await header.locator("#lang").count()||!await header.locator("#theme").count())errors.push("Shared display controls missing");
 const admin=await page.goto("http://127.0.0.1:8765/admin/",{waitUntil:"domcontentloaded"});
 if(admin?.status()!==200)errors.push("/admin/ route missing");
 await page.waitForFunction(()=>!!document.getElementById("admin-config-note"));
 if(await page.locator("#admin-private").isVisible())errors.push("Unauthenticated manager UI exposed");
 if(!await page.locator("#admin-private").evaluate(el=>el.inert))errors.push("Admin section not inert");
 if(!await page.locator("#admin-config-note").isVisible())errors.push("Missing pending-configuration explanation");
 if(await page.locator("#github-login").isVisible())errors.push("Login enabled before secure Worker config");
 if(await page.locator("#token").count())errors.push("Legacy PAT input still present");
 if(await page.locator("#studio-quality-cards .qa-course-card").count())errors.push("QA records fetched before authorization");
 if(unauthCalls.length)errors.push("Unauthenticated API/QA calls: "+unauthCalls.join(", "));
 await page.screenshot({path:"qa-studio-admin.png",fullPage:true});
 const old=await page.goto("http://127.0.0.1:8765/c-programming/admin/",{waitUntil:"domcontentloaded"});
 await page.waitForURL(/\/admin\/$/,{timeout:5000});
 if(!page.url().endsWith("/admin/"))errors.push("Legacy C administrator page did not redirect");
 if(await page.locator("#token").count())errors.push("Legacy PAT screen accessible through C admin");
}finally{await browser.close()}
console.log(JSON.stringify({status:errors.length?"FAIL":"PASS",checks:"home header, no admin links, admin gate, no PAT, no unauthorized fetch, C redirect",errors},null,2));
if(errors.length)process.exitCode=1;
