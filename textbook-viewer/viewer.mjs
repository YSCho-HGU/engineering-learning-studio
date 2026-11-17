/* Engineering Learning Studio shared textbook reader.
   PDF.js renders same-origin PDFs and user-chosen files.
   Google Drive documents use the provider preview with an explicitly
   labeled visual filter, because cross-origin PDF bytes are inaccessible. */
const PDFJS="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";
const PDFWORKER="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
const allowedCourses=new Set(["c","ss","studio"]);
const course=allowedCourses.has(params.get("course"))?params.get("course"):"studio";
const externalBack=course==="ss"?"https://yscho-hgu.github.io/signals-systems-visual-lab/":course==="c"?"../c-programming/":"../";
$("back-link").href=externalBack;
const translation={
back:["← 강의 학습 화면","← Course learning page"],language:["Language","Language"],
eyebrow:["공통 PDF 교재 뷰어","Shared PDF textbook viewer"],
title:["Textbook Viewer","Textbook Viewer"],
intro:["사이트 테마에 맞춰 PDF를 편하게 읽고, 원본 색상도 언제든 확인할 수 있습니다.","Read PDF textbooks in light or dark mode, and switch back to original colors at any time."],
openOriginal:["원본 문서 열기 ↗","Open original document ↗"],
chooseFile:["내 PDF 파일 열기","Open a local PDF"],
colorMode:["PDF 표시 색상","Page colors"],
auto:["사이트 테마 자동","Follow site theme"],original:["원본 색상","Original colors"],dark:["다크 표시","Dark rendering"],
previous:["이전 페이지","Previous page"],next:["다음 페이지","Next page"],
page:["페이지","Page"],zoom:["확대","Zoom"],fit:["너비 맞춤","Fit width"],
loading:["교재를 여는 중입니다.","Opening textbook…"],
emptyTitle:["PDF 파일을 선택하세요","Choose a PDF document"],
emptyDescription:["교재 링크를 직접 붙여넣거나, 위쪽의 '내 PDF 파일 열기'로 컴퓨터에 있는 PDF를 선택하세요. 로컬 파일은 서버에 업로드되지 않습니다.","Paste a Google Drive PDF link or choose a local PDF. Local files remain on this computer; nothing is uploaded."],
info:["원본 PDF는 수정되지 않습니다. Google Drive 미리보기의 다크 표시는 화면 색상 효과로, 컬러 그래프가 달라 보일 수 있습니다.","The original PDF is unchanged. Dark Drive previews use a visual color filter, which may change how diagrams and photos appear."],
pasteLabel:["Google Drive 교재 링크","Google Drive PDF link"],pastePlaceholder:["https://drive.google.com/file/d/.../view","https://drive.google.com/file/d/.../view"],
pasteAction:["링크로 열기","Open Drive link"],
driveNote:["Google Drive는 외부 PDF.js 읽기를 제한합니다. 여기서는 Google 뷰어에 시각적인 다크 효과를 적용하며, 그래프·사진 색상이 달라질 수 있습니다. 정확한 색상은 '원본 색상'으로 확인하세요.","Google Drive does not provide PDF bytes to this reader. This view darkens the Google preview with a visual filter; diagrams and photos may change color. Select Original colors to check accuracy."],
driveStatus:["Google Drive 미리보기입니다. 직접 PDF.js로 렌더링하지 않습니다.","Google Drive preview is shown (not rendered by PDF.js)."],
fileStatus:["PDF를 준비했습니다.","PDF is ready."],
badLink:["지원하는 Google Drive PDF 링크를 입력하세요.","Enter a supported Google Drive PDF link."],
loadingPdf:["PDF.js로 문서를 읽는 중입니다.","Loading document with PDF.js…"],
pageStatus:["페이지","Page"],
renderError:["PDF 렌더링에 실패했습니다. 파일을 다시 선택하거나 원본 링크를 이용하세요.","PDF rendering failed. Choose a file again or open the original link."],
cdnError:["PDF.js를 불러오지 못했습니다. 인터넷 연결을 확인하거나 원본 문서를 사용하세요.","PDF.js could not load. Check connectivity or open the original document."],
localSource:["로컬 PDF (업로드하지 않음)","Local PDF (not uploaded)"],
noDrive:["Google Drive 미리보기 링크를 열지 못했습니다.","Cannot open this Google Drive preview."],
colorsUnavailable:["컬러 PDF 그림은 다크 모드에서 원본과 다르게 보일 수 있습니다.","Color illustrations may look different in dark mode."]
};
const english=()=>window.ELSLanguage?.get()==="en";
const t=key=>(translation[key]||[key,key])[english()?1:0];
const i18n=()=>{document.documentElement.lang=english()?"en":"ko";document.querySelectorAll("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(k==="title"&&el.id==="document-title"&&documentTitle)return;el.textContent=t(k)});$("language").value=window.ELSLanguage?.get()||"mixed";document.querySelector("#paste-drive")?.setAttribute("placeholder",t("pastePlaceholder"));updateDriveNote()};
$("language").addEventListener("change",event=>window.ELSLanguage?.set(event.target.value));
window.ELSLanguage?.subscribe(i18n);
let documentTitle="",driveId=null,pdf=null,loadedPdfjs=null,sourceUrl=null,localBytes=null,renderTask=null;
let page=1,pageCount=1,manualTheme=$("color-mode").value,renderCounter=0,renderTimer=0,objectUrl=null;
const limit=(v,min,max)=>Math.min(max,Math.max(min,v));
const showStatus=(k,extra="")=>{$("status").textContent=t(k)+(extra?" "+extra:"")};
const isDark=()=>document.documentElement.dataset.elsTheme!=="warm-neutral"&&document.documentElement.dataset.theme!=="light";
const colors=()=>{const css=getComputedStyle(document.documentElement);return{background:css.getPropertyValue("--page").trim()||"#252a2c",foreground:css.getPropertyValue("--page-text").trim()||"#ecf0ee"}};
const darkSelected=()=>manualTheme==="dark"||(manualTheme==="auto"&&isDark());
const updateDriveNote=()=>{if(driveId)$("drive-note").textContent=t("driveNote")};
function setTitle(value) {documentTitle=(value||"").trim().slice(0,120);$("document-title").textContent=documentTitle||t("title");document.title=(documentTitle||"Textbook Viewer")+" · Engineering Learning Studio";}
function markMode(){const dark=darkSelected();$("drive-wrap").classList.toggle("dark-preview",dark);$("pdfjs-wrap").style.backgroundColor=dark?colors().background:"";updateDriveNote();}
function escapeDrive(v){if(!v)return null;const raw=String(v).trim();if(/^[a-zA-Z0-9_-]{15,120}$/.test(raw))return raw;try{const u=new URL(raw);if(u.protocol!=="https:")return null;if(u.hostname==="drive.google.com"){let m=u.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]{15,120})(?:\/|$)/);if(m)return m[1];if(u.pathname==="/open"||u.pathname==="/uc")return /^[a-zA-Z0-9_-]{15,120}$/.test(u.searchParams.get("id")||"")?u.searchParams.get("id"):null}}catch(e){}return null}
function drive(file){const id=escapeDrive(file);if(!id){showStatus("badLink");return}cleanupPdf();driveId=id;sourceUrl=null;localBytes=null;
const original="https://drive.google.com/file/d/"+id+"/view";$("open-original").href=original;$("open-original").hidden=false;
$("drive-wrap").hidden=false;$("pdfjs-wrap").hidden=true;$("empty").hidden=true;$("page-tools").hidden=true;
$("drive-preview").src="https://drive.google.com/file/d/"+encodeURIComponent(id)+"/preview";
markMode();showStatus("driveStatus");
}
async function ensurePdfjs(){if(!loadedPdfjs){loadedPdfjs=import(PDFJS).then(m=>{m.GlobalWorkerOptions.workerSrc=PDFWORKER;return m}).catch(error=>{loadedPdfjs=null;throw error})}return loadedPdfjs}
function cleanupPdf(){renderCounter++;if(renderTask){try{renderTask.cancel()}catch(e){}renderTask=null}if(pdf){pdf.destroy().catch(()=>{});pdf=null}if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}}
async function openPdf(input, label,link){cleanupPdf();driveId=null;page=1;pageCount=1;
$("drive-preview").removeAttribute("src");$("drive-wrap").hidden=true;$("pdfjs-wrap").hidden=false;$("empty").hidden=true;$("page-tools").hidden=true;
$("open-original").hidden=!link;if(link)$("open-original").href=link;
setTitle(label);showStatus("loadingPdf");
try{const library=await ensurePdfjs();let options;if(input instanceof Uint8Array){options={data:input}}else{options={url:input,withCredentials:false}};const loading=library.getDocument(options);pdf=await loading.promise;pageCount=pdf.numPages;$("page-total").textContent="/ "+pageCount;$("page-input").max=String(pageCount);$("page-tools").hidden=false;await renderPage();}catch(error){console.warn("PDF viewer:",error);showStatus(error instanceof TypeError?"cdnError":"renderError");$("pdfjs-wrap").hidden=true;$("empty").hidden=false}}
async function renderPage(){if(!pdf)return;const ticket=++renderCounter;clearTimeout(renderTimer);if(renderTask){try{renderTask.cancel()}catch(e){}renderTask=null}
const selected=limit(page,1,pageCount);page=selected;const p=await pdf.getPage(selected);if(ticket!==renderCounter)return;
const fit=$("zoom").value==="fit";const canvas=$("pdf-canvas");const host=$("canvas-scroller");const viewport0=p.getViewport({scale:1});
const scale=fit?limit((Math.max(240,host.clientWidth-35))/viewport0.width,.3,3):Number($("zoom").value)||1;
const dpr=Math.min(window.devicePixelRatio||1,2);const viewport=p.getViewport({scale});canvas.width=Math.ceil(viewport.width*dpr);canvas.height=Math.ceil(viewport.height*dpr);canvas.style.width=viewport.width+"px";canvas.style.height=viewport.height+"px";
const ctx=canvas.getContext("2d",{alpha:false});const effective=darkSelected()?colors():null;ctx.fillStyle=effective?.background||"#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height);
const opts={canvasContext:ctx,viewport,transform:dpr===1?undefined:[dpr,0,0,dpr,0,0],background:effective?.background||"#ffffff"};
if(effective)opts.pageColors=effective;
const task=p.render(opts);renderTask=task;
try{await task.promise;if(ticket!==renderCounter)return;$("page-input").value=String(selected);$("previous").disabled=selected<=1;$("next").disabled=selected>=pageCount;showStatus("pageStatus",selected+" / "+pageCount)}catch(error){if(error?.name!=="RenderingCancelledException")showStatus("renderError")}finally{if(renderTask===task)renderTask=null}
}
const rerender=()=>{markMode();if(pdf)renderPage()};
$("color-mode").addEventListener("change",()=>{manualTheme=$("color-mode").value;rerender()});
$("previous").addEventListener("click",()=>{if(page>1){page--;renderPage()}});
$("next").addEventListener("click",()=>{if(page<pageCount){page++;renderPage()}});
$("page-input").addEventListener("change",()=>{page=limit(Number($("page-input").value)||1,1,pageCount);renderPage()});
$("zoom").addEventListener("change",renderPage);
window.addEventListener("resize",()=>{if($("zoom").value==="fit"&&pdf){clearTimeout(renderTimer);renderTimer=setTimeout(renderPage,140)}});
$("local-pdf").addEventListener("change",async event=>{const file=event.target.files?.[0];if(!file)return;if(!(file.name.toLowerCase().endsWith(".pdf")||file.type==="application/pdf")){showStatus("renderError");return}try{const data=new Uint8Array(await file.arrayBuffer());await openPdf(data,file.name,null)}catch(e){showStatus("renderError")}});
$("open-drive-link")?.addEventListener("click",()=>{const v=$("paste-drive").value;const id=escapeDrive(v);if(!id){showStatus("badLink");return}setTitle("Google Drive Textbook");drive(id)});
$("paste-drive")?.addEventListener("keydown",e=>{if(e.key==="Enter")$("open-drive-link").click()});
function themeUpdated(){markMode();if(pdf){clearTimeout(renderTimer);renderTimer=setTimeout(renderPage,80)}}
window.addEventListener("els:themechange",themeUpdated);new MutationObserver(themeUpdated).observe(document.documentElement,{attributes:true,attributeFilter:["data-els-theme","data-theme"]});
$("color-mode").value="auto";
const titleParam=params.get("title")||"";
if(titleParam)setTitle(titleParam);
const driveParam=params.get("drive");
const urlParam=params.get("pdf");
if(driveParam){if(escapeDrive(driveParam))drive(driveParam);else{$("empty").hidden=false;showStatus("badLink")}}
else if(urlParam){
 try{const u=new URL(urlParam,location.href);if(u.origin!==location.origin||!u.pathname.toLowerCase().endsWith(".pdf"))throw Error("Only same-origin PDF paths are supported.");sourceUrl=u.href;openPdf(sourceUrl,titleParam||u.pathname.split("/").pop(),sourceUrl)}catch(e){$("empty").hidden=false;showStatus("renderError")}
}else{$("empty").hidden=false;showStatus("fileStatus")}
i18n();
