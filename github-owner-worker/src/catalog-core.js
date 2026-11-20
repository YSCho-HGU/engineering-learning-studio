// JSON catalog values only; deterministic object comparison without Node APIs.
function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==="object"){
  const out={};
  for(const key of Object.keys(value).sort())out[key]=canonical(value[key]);
  return out;
 }
 return value;
}
function isDeepStrictEqual(a,b){return JSON.stringify(canonical(a))===JSON.stringify(canonical(b));}

export const COURSES=Object.freeze({
 c:Object.freeze({repo:"YSCho-HGU/engineering-learning-studio",path:"c-programming/course-catalog.json"}),
 ss:Object.freeze({repo:"YSCho-HGU/signals-systems-visual-lab",path:"course-catalog.json"})
});
export const ADMIN_EMAIL="yscho@handong.edu";
export const ADMIN_ORIGIN="https://yscho-hgu.github.io";
const EDITABLE=new Set(["published","title","description","book","sub"]);
const BOOK_RE=/^https:\/\/(?:drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view(?:\?[^#\s]*)?|docs\.google\.com\/(?:document|presentation|spreadsheets)\/d\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9/?=&_.-]*)$/;
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
export class HttpError extends Error{
 constructor(status,message){super(message);this.status=status}
}
export function ownerIdentity(profile,emails,configuredId){
 const id=String(configuredId||"").trim();
 if(!/^\d+$/.test(id)||!Number.isSafeInteger(Number(id)))return false;
 if(!profile||String(profile.id)!==id||!Array.isArray(emails))return false;
 return emails.some(entry=>entry && typeof entry.email==="string" &&
   entry.email.toLowerCase()===ADMIN_EMAIL && entry.verified===true);
}
export function courseConfig(key){
 if(typeof key!=="string"||!own(COURSES,key))throw new HttpError(400,"알 수 없는 과목입니다.");
 return COURSES[key];
}
export function validateCatalog(base,next,course){
 if(!base||!next||typeof next!=="object"||Array.isArray(next))throw new HttpError(400,"카탈로그 형식이 올바르지 않습니다.");
 if(base.schemaVersion!==1||next.schemaVersion!==1||!Array.isArray(base.chapters)||!Array.isArray(next.chapters))throw new HttpError(400,"카탈로그 버전/목록이 올바르지 않습니다.");
 if(base.chapters.length!==next.chapters.length)throw new HttpError(400,"단원 수는 변경할 수 없습니다.");
 const beforeKeys=Object.keys(base).sort(),afterKeys=Object.keys(next).sort();
 if(!isDeepStrictEqual(beforeKeys,afterKeys))throw new HttpError(400,"카탈로그의 상위 구조는 변경할 수 없습니다.");
 for(const key of beforeKeys.filter(k=>k!=="chapters")){
  if(!isDeepStrictEqual(next[key],base[key]))throw new HttpError(400,"관리자에서 허용되지 않은 카탈로그 필드가 변경되었습니다: "+key);
 }
 const modified=[];
 for(let i=0;i<base.chapters.length;i++){
  const prev=base.chapters[i],cur=next.chapters[i];
  if(!prev||!cur||String(prev.id)!==String(cur.id))throw new HttpError(400,"단원 ID와 순서는 변경할 수 없습니다.");
  if(!isDeepStrictEqual(Object.keys(prev).filter(k=>!EDITABLE.has(k)).sort(),Object.keys(cur).filter(k=>!EDITABLE.has(k)).sort()))throw new HttpError(400,"단원 메타데이터 구조 변경은 허용되지 않습니다.");
  for(const key of new Set([...Object.keys(prev),...Object.keys(cur)])){
   if(!EDITABLE.has(key) && !isDeepStrictEqual(prev[key],cur[key]))throw new HttpError(400,"수정 권한 없는 필드: "+key);
  }
  if(typeof cur.published!=="boolean")throw new HttpError(400,"공개 설정 값이 올바르지 않습니다.");
  if(typeof cur.title!=="string"||!cur.title.trim()||cur.title.length>120)throw new HttpError(400,"제목은 1~120자여야 합니다.");
  if(typeof cur.description!=="string"||cur.description.length>600)throw new HttpError(400,"설명은 600자 이하여야 합니다.");
  if(course==="ss"&&(typeof cur.sub!=="string"||cur.sub.length>400))throw new HttpError(400,"부제는 400자 이하여야 합니다.");
  if(own(cur,"sub")&&typeof cur.sub!=="string")throw new HttpError(400,"잘못된 부제입니다.");
  if(own(cur,"book")&&(typeof cur.book!=="string"||cur.book.length>400||(cur.book&&!BOOK_RE.test(cur.book))))throw new HttpError(400,"교재 링크는 허용된 Google Drive/Docs 링크여야 합니다.");
  if(!isDeepStrictEqual(prev,cur))modified.push({before:prev,after:cur,id:String(cur.id)});
 }
 if(modified.length>30)throw new HttpError(400,"한 번에 변경할 수 있는 단원 수를 초과했습니다.");
 return modified;
}
export function publishedPagePath(course,chapter){
 if(course==="ss"){
  if(!/^[1-8]$/.test(String(chapter.id)))throw new HttpError(400,"잘못된 Signals Chapter입니다.");
  return "index.html";
 }
 if(!/^\.\/[a-z0-9-]+\/$/.test(chapter.url||""))throw new HttpError(400,"학습 페이지 경로가 올바르지 않습니다.");
 return "c-programming/"+chapter.url.slice(2)+"index.html";
}
