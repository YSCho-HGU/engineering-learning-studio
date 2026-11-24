/* Part C · 07: local-only, interactive 2D Image FFT Discovery. */
(function(W){
"use strict";
const C=W.SSImageFFTCore,$=id=>document.getElementById(id),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
if(!C)return;
const mode=()=>W.ELSLanguage?.get?.()||"mixed";
const tr=(en,ko,compact=false)=>mode()==="en"?en:mode()==="ko"?ko:compact?en+" · "+ko:en+"\n"+ko;
const set=(id,en,ko,compact=false)=>{$(id).textContent=tr(en,ko,compact)};
const words={
 "image-title":["2D Image FFT Discovery","2D 이미지 FFT 발견 실습"],
 "image-intro":["Discover hidden spatial frequencies, remove periodic interference, and reconstruct an image.","이미지의 숨겨진 공간주파수를 발견하고 주기적 잡음을 제거·복원합니다."],
 "image-stage-1":["Patterns","패턴 발견"],"image-stage-2":["Spectrum","스펙트럼"],
 "image-stage-3":["Filtering","주파수 필터"],"image-stage-4":["Remove noise","잡음 제거"],
 "image-controls-title":["Change · Observe","조절 · 관찰"],
 "image-controls-help":["One input updates every result; begin with the prepared four-step sequence.","하나의 입력이 모든 결과에 반영됩니다. 네 단계 실습부터 시작하세요."],
 "image-preset-label":["Input pattern","입력 패턴"],"image-cycles-label":["Cycles across image","이미지 내 반복 횟수"],
 "image-angle-label":["Stripe direction","줄무늬 방향"],
 "image-size-label":["Image resolution","이미지 해상도"],
 "image-upload-label":["Use your own image","내 이미지 사용"],
 "image-upload-help":["PNG/JPEG/WebP ≤ 8 MB. Cropped to square and converted to grayscale locally. No server upload.","8MB 이하 PNG/JPEG/WebP를 로컬에서 정사각형으로 잘라 흑백 변환합니다. 서버에 전송하지 않습니다."],
 "image-filter-title":["Frequency mask","주파수 마스크"],"image-filter-label":["Filter mode","필터 모드"],
 "image-radius-label":["Cutoff radius (bins)","차단 반경 (Bin)"],"image-notch-radius-label":["Notch radius (bins)","Notch 반경 (Bin)"],
 "image-reset":["Reset experiment","실험 초기화"],"image-export":["Save result PNG","결과 PNG 저장"],
 "image-view-title-1":["01 · Input","01 · 입력 이미지"],"image-view-title-2":["02 · 2D FFT spectrum","02 · 2D FFT 스펙트럼"],
 "image-view-title-3":["03 · Frequency mask","03 · 주파수 마스크"],"image-view-title-4":["04 · IFFT result","04 · IFFT 복원 결과"],
 "image-view-note-1":["Grayscale intensity at pixel coordinates (x,y).","픽셀 좌표 (x,y)의 흑백 밝기 값입니다."],
 "image-view-note-2":["Centered log magnitude; click a peak to remove its conjugate pair.","중심 이동 로그 크기 스펙트럼입니다. 피크를 클릭하면 켤레 주파수 쌍이 제거됩니다."],
 "image-view-note-3":["Bright regions pass, dark regions are attenuated.","밝은 영역은 통과하고 어두운 영역은 감쇠합니다."],
 "image-reason-title":["Predict → Observe → Explain","예측 → 관찰 → 설명"],
 "image-check":["Verify with evidence","근거로 확인"],"image-next":["Next discovery","다음 발견"],
 "image-advanced-title":["How 2D FFT works · Advanced","2D FFT 계산 원리 · 심화"],
 "image-advanced-note":["Apply a 1D FFT to each row, then each column. Multiply the COMPLEX 2D spectrum by H[u,v], and perform the inverse FFT. Non-bin-aligned patterns can produce spectral leakage.","각 행에 1D FFT를 수행한 뒤 열 방향에 다시 적용합니다. 크기와 위상을 가진 복소 스펙트럼에 H[u,v]를 곱하고 IFFT로 복원합니다. Bin에 정렬되지 않은 패턴에서는 스펙트럼 누설이 생길 수 있습니다."],
 "image-spectrum-view-label":["Spectrum display","스펙트럼 표시"],
 "image-advanced-axes":["u and v are cycles/image (FFT bins); divide by N to obtain cycles/pixel. To convert to cycles/mm, physical pixel spacing must be known.","u와 v는 이미지당 반복 횟수(FFT Bin)입니다. N으로 나누면 cycles/pixel이고, cycles/mm로 변환하려면 실제 픽셀 간격을 알아야 합니다."]
};
const exercises={
 1:{title:["Where will stripe frequencies appear?","줄무늬의 주파수는 어디에 나타날까요?"],
 hint:["Change stripe count from 4 to 20 and rotate direction. Observe the symmetric FFT peaks.","줄무늬 수를 4에서 20으로 늘리고 방향을 회전하세요. 대칭 FFT 피크를 관찰합니다."],
 q:["When stripe spacing decreases, the peaks move…","줄무늬 간격이 줄어들면 피크는…"],
 a:[["Farther from the center","중심에서 멀어집니다"],["Closer to the center","중심에 가까워집니다"]],
 explain:["More stripes mean higher spatial frequency. The peaks lie perpendicular to stripe direction.","줄무늬가 많아지면 공간주파수가 높아집니다. 피크 방향은 줄무늬 방향과 수직입니다."]},
 2:{title:["Why does a checkerboard have multiple peaks?","체커보드는 왜 여러 피크를 가질까요?"],
 hint:["Its two-dimensional sharp edges create multiple harmonics. Compare its spectrum with smooth stripes.","두 방향의 날카로운 경계는 여러 고조파를 만듭니다. 부드러운 줄무늬와 비교하세요."],
 q:["Multiple peaks arise because…","여러 피크가 나타나는 이유는…"],
 a:[["Sharp repeating edges contribute harmonics","반복되는 날카로운 경계가 고조파를 만듭니다"],["FFT is nonlinear for images","이미지에서 FFT가 비선형이 되기 때문입니다"]],
 explain:["Unlike a sinusoidal grating, a checkerboard contains multiple harmonics on both spatial axes.","정현파 줄무늬와 달리 체커보드는 두 공간 축에 여러 고조파 성분이 존재합니다."]},
 3:{title:["Which frequencies hold fine image details?","미세한 이미지 정보는 어떤 주파수에 있을까요?"],
 hint:["Compare low-pass and high-pass on the same synthetic city scene. Change the cutoff radius.","같은 합성 도시 장면에 저역·고역통과를 적용하고 반경을 조절하세요."],
 q:["Which filter blurs small details?","미세한 구조를 흐리게 하는 필터는?"],
 a:[["Low-pass; it attenuates fast spatial changes","빠른 공간 변화를 줄이는 저역통과"],["High-pass; it keeps only smooth changes","완만한 변화만 유지하는 고역통과"]],
 explain:["Low-pass suppresses edges and texture; high-pass emphasizes transitions. Signed high-pass values are displayed around middle gray.","저역통과는 경계와 질감을 줄이고 고역통과는 변화를 강조합니다. 부호 있는 고역통과 결과의 0은 중간 회색으로 표시합니다."]},
 4:{title:["Can an FFT remove periodic image noise?","FFT로 주기적 이미지 잡음을 제거할 수 있을까요?"],
 hint:["Find bright peaks around (±12, ±7). Click either peak; the symmetric notch pair filters the image before IFFT.","(±12, ±7) 근처 밝은 피크 중 하나를 클릭하세요. 대칭 Notch 쌍이 적용되고 IFFT로 복원됩니다."],
 q:["Why reject both opposite peaks?","왜 서로 반대쪽 피크 두 개를 제거할까요?"],
 a:[["Conjugate symmetry is required for real-image reconstruction","실수 이미지 복원에 켤레대칭이 필요합니다"],["Two separate images are required to run 2D FFT","2D FFT에 서로 다른 이미지 두 개가 필요합니다"]],
 explain:["For real images, F(−u,−v)=F*(u,v). A paired symmetric notch retains that property. Targeted frequency removal can suppress image-wide interference.","실수 이미지의 F(−u,−v)=F*(u,v)이므로 대칭 Notch는 복소 켤레대칭을 유지합니다. 전체 이미지에 퍼진 주기 잡음을 특정 주파수만 제거해 줄일 수 있습니다."]}
};
const presets=[["stripes","Adjustable stripes","줄무늬 조절"],["checker","Checkerboard","체커보드"],["scene","Synthetic city scene","합성 도시 장면"],["noise","Scene + periodic noise","장면 + 주기적 잡음"]];
const filters=[["none","No filter","필터 없음"],["low","Gaussian low-pass","가우시안 저역통과"],["high","Gaussian high-pass","가우시안 고역통과"],["notch","Symmetric notch reject","대칭 Notch 제거"]];
const defaults={stage:1,kind:"stripes",N:256,cycles:8,angle:0,filter:"none",radius:22,notchU:12,notchV:7,notchRadius:2.5,view:"magnitude"};
const state={...defaults};let bitmap=null,dirty=true,base=null,result=null,scheduled=0,interactions=0;
function feedback(message="",status=""){const el=$("image-feedback");el.textContent=message;if(status)el.dataset.result=status;else delete el.dataset.result;}
function labels(){
 for(const [id,[en,ko]]of Object.entries(words))set(id,en,ko);
 for(const [i,o]of presets.entries())$("image-preset").options[i].textContent=tr(o[1],o[2],true);
 const uploadedOption=$("image-preset").querySelector('option[value="upload"]');
 if(uploadedOption)uploadedOption.textContent=tr("Uploaded picture","업로드 이미지",true);
 for(const [i,o]of filters.entries())$("image-filter").options[i].textContent=tr(o[1],o[2],true);
 $("image-spectrum-view").options[0].textContent=tr("Log magnitude","로그 크기",true);
 $("image-spectrum-view").options[1].textContent=tr("Phase (advanced)","위상 (심화)",true);
 document.title=tr("2D Image FFT Discovery","2D 이미지 FFT 발견 실습",true)+" | Engineering Learning Studio";
 document.documentElement.lang=mode()==="ko"?"ko":"en";
 stageLabels();sync();if(result)render(result);
}
function stageLabels(){
 const e=exercises[state.stage];set("image-question",...e.title);set("image-instruction",...e.hint);set("image-prediction-question",...e.q);
 set("image-step-tag","0"+state.stage+" · Discover","0"+state.stage+" · 발견",true);
 set("image-counter","Step "+state.stage+" / 4",state.stage+" / 4 단계",true);
 const sel=$("image-prediction"),answer=sel.value;
 sel.options[0].textContent=tr("Choose a prediction","예측 선택",true);
 e.a.forEach(([en,ko],i)=>sel.options[i+1].textContent=tr(en,ko,true));
 sel.value=answer;
 document.querySelectorAll(".ss-image-stage").forEach(x=>{
  if(Number(x.dataset.stage)===state.stage)x.setAttribute("aria-current","step");else x.removeAttribute("aria-current");
 });
 $("image-next").disabled=state.stage===4;
}
function sync(){
 $("image-preset").value=state.kind;$("image-size").value=String(state.N);
 for(const [id,value]of [["cycles",state.cycles],["angle",state.angle],["radius",state.radius],["notch-radius",state.notchRadius]])$("image-"+id).value=String(value);
 $("image-filter").value=state.filter;$("image-spectrum-view").value=state.view;
 $("image-cycles-value").textContent=state.cycles;$("image-angle-value").textContent=state.angle+"°";
 $("image-radius-value").textContent=state.radius;$("image-notch-radius-value").textContent=Number(state.notchRadius).toFixed(1);
 $("image-cycles-field").hidden=!["stripes","checker"].includes(state.kind);
 $("image-angle-field").hidden=state.kind!=="stripes";
 $("image-radius-field").hidden=!["low","high"].includes(state.filter);
 $("image-notch-radius-field").hidden=state.filter!=="notch";
 set("image-notch-hint",state.filter==="notch"?
  "Paired notch: ("+state.notchU+", "+state.notchV+") and ("+(-state.notchU)+", "+(-state.notchV)+").":
  "Click an isolated bright spectrum peak to create two symmetric notches.",
  state.filter==="notch"?
  "대칭 Notch 위치: ("+state.notchU+", "+state.notchV+") 및 ("+(-state.notchU)+", "+(-state.notchV)+").":
  "스펙트럼의 독립적인 밝은 피크를 클릭하면 대칭 Notch 두 개가 생성됩니다.");
}
function invalid(){dirty=true;interactions++;sync();schedule();}
function schedule(){if(scheduled)cancelAnimationFrame(scheduled);scheduled=requestAnimationFrame(()=>{scheduled=0;try{result=compute();render(result);}catch(e){$("image-status").textContent=tr("Image error: ","이미지 오류: ")+e.message;}});}
function source(){
 if(state.kind!=="upload")return C.synth(state.kind,state.N,{cycles:state.cycles,angle:state.angle});
 if(!bitmap)throw Error("Upload not ready");
 const N=state.N,canvas=document.createElement("canvas");canvas.width=canvas.height=N;
 const ctx=canvas.getContext("2d",{willReadFrequently:true});
 ctx.fillStyle="#fff";ctx.fillRect(0,0,N,N);
 const side=Math.min(bitmap.width,bitmap.height);
 ctx.drawImage(bitmap,(bitmap.width-side)/2,(bitmap.height-side)/2,side,side,0,0,N,N);
 const data=ctx.getImageData(0,0,N,N).data,pixels=new Float64Array(N*N);
 for(let i=0;i<pixels.length;i++)pixels[i]=(.2126*data[4*i]+.7152*data[4*i+1]+.0722*data[4*i+2])/255;
 return {pixels,clean:null,kind:"upload",N};
}
function compute(){
 if(dirty||!base){
  const input=source(),spectrum=C.forward(input.pixels,state.N);
  base={input,spectrum};dirty=false;
 }
 const {input,spectrum}=base;
 const output=C.applyMask(spectrum,state.N,{type:state.filter,radius:state.radius,notch:{u:state.notchU,v:state.notchV,radius:state.notchRadius}});
 return {N:state.N,input,spectrum,output,peak:C.dominant(spectrum,state.N),
  originalRMSE:input.clean?C.rmse(input.pixels,input.clean):null,
  filteredRMSE:input.clean?C.rmse(output.pixels,input.clean):null};
}
function showRaster(id,data,N,offset=0){
 const cv=$(id),ctx=cv.getContext("2d"),temp=document.createElement("canvas");temp.width=temp.height=N;
 const c=temp.getContext("2d"),im=c.createImageData(N,N);
 for(let i=0;i<data.length;i++){
  const g=Math.round(clamp(data[i]+offset,0,1)*255),k=i*4;
  im.data[k]=im.data[k+1]=im.data[k+2]=g;im.data[k+3]=255;
 }
 c.putImageData(im,0,0);ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(temp,0,0,cv.width,cv.height);
}
function showSpectrum(m){
 const N=m.N,cv=$("image-spectrum-canvas"),ctx=cv.getContext("2d"),off=document.createElement("canvas");off.width=off.height=N;
 const c=off.getContext("2d"),im=c.createImageData(N,N),amps=new Float64Array(N*N);let max=0;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const i=y*N+x,k=C.shiftedToIndex(x,y,N),amp=Math.log1p(Math.hypot(m.spectrum.real[k],m.spectrum.imag[k]));
  amps[i]=amp;max=Math.max(max,amp);
 }
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const i=y*N+x,k=C.shiftedToIndex(x,y,N),o=4*i;
  if(state.view==="phase"){
   const r=m.spectrum.real[k],imV=m.spectrum.imag[k],q=Math.atan2(imV,r);
   const v=Math.hypot(r,imV)<1e-7?0:(q+Math.PI)/(2*Math.PI);
   im.data[o]=Math.round(35+200*v);im.data[o+1]=Math.round(110+100*Math.sin(Math.PI*v));im.data[o+2]=Math.round(230-160*v);
  }else{
   const g=Math.round(255*Math.pow(max?amps[i]/max:0,.72));
   im.data[o]=im.data[o+1]=im.data[o+2]=g;
  }
  im.data[o+3]=255;
 }
 c.putImageData(im,0,0);ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(off,0,0,cv.width,cv.height);
 const w=cv.width,h=cv.height;
 ctx.strokeStyle="rgba(54,220,218,.64)";ctx.lineWidth=1.3;ctx.beginPath();
 ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);ctx.stroke();
 ctx.fillStyle="#edfff8";ctx.font="bold 16px Arial";ctx.fillText("u →",w-46,h/2-8);ctx.fillText("v",w/2+9,21);
 if(state.filter==="notch"){
  ctx.strokeStyle="#ffc17e";ctx.lineWidth=3;
  for(const sign of [1,-1]){
   ctx.beginPath();ctx.arc(w/2+sign*state.notchU*w/N,h/2+sign*state.notchV*h/N,
    Math.max(5,state.notchRadius*w/N),0,2*Math.PI);ctx.stroke();
  }
 }
}
function showMask(N){
 const data=new Float64Array(N*N),notch={u:state.notchU,v:state.notchV,radius:state.notchRadius};
 for(let y=0;y<N;y++)for(let x=0;x<N;x++)data[y*N+x]=C.maskAt(x-N/2,y-N/2,state.filter,state.radius,notch);
 showRaster("image-mask-canvas",data,N);
}
function showMetrics(m){
 const values=[
 [["Dominant peak (u,v)","최대 피크 (u,v)"],"("+m.peak.u+", "+m.peak.v+")"],
 [["Spatial period","공간 주기"],state.kind==="stripes"?(m.N/state.cycles).toFixed(1)+" px":tr("Varies","다양함",true)],
 [["Retained energy","남은 에너지"],m.output.energyPercent.toFixed(1)+"%"],
 [["RMSE vs clean scene","원본 장면 대비 RMSE"],m.originalRMSE===null?tr("Not available","기준 없음",true):m.originalRMSE.toFixed(3)+" → "+m.filteredRMSE.toFixed(3)]
 ];
 const host=$("image-metrics");host.replaceChildren();
 for(const [[en,ko],v]of values){
  const box=document.createElement("div"),a=document.createElement("span"),b=document.createElement("strong");
  box.className="ss-image-metric";a.textContent=tr(en,ko,true);b.textContent=v;box.append(a,b);host.append(box);
 }
}
function render(m){
 showRaster("image-input-canvas",m.input.pixels,m.N);
 showSpectrum(m);showMask(m.N);
 showRaster("image-output-canvas",m.output.pixels,m.N,state.filter==="high"?.5:0);
 set("image-view-note-4",state.filter==="high"?
  "Signed high-pass: zero is displayed as middle gray.":
  "IFFT2 uses the entire complex filtered spectrum.",
  state.filter==="high"?
  "고역통과 결과에서 0은 중간 회색으로 표시합니다.":
  "IFFT2는 크기와 위상을 포함한 복소 스펙트럼 전체로 복원합니다.");
 showMetrics(m);
}
function chooseStage(stage){
 state.stage=clamp(Number(stage),1,4);
 if(state.stage===1)Object.assign(state,{kind:"stripes",cycles:8,angle:0,filter:"none",view:"magnitude"});
 if(state.stage===2)Object.assign(state,{kind:"checker",cycles:8,filter:"none",view:"magnitude"});
 if(state.stage===3)Object.assign(state,{kind:"scene",filter:"low",radius:20,view:"magnitude"});
 if(state.stage===4)Object.assign(state,{kind:"noise",filter:"none",notchU:12,notchV:7,notchRadius:2.5,view:"magnitude"});
 $("image-prediction").value="";$("image-explanation").textContent="";feedback();
 interactions=0;dirty=true;stageLabels();sync();schedule();
}
function check(){
 const answer=$("image-prediction").value,e=exercises[state.stage];
 if(!answer){feedback(tr("Choose an answer first.","먼저 답을 선택하세요."),"retry");return;}
 if(!interactions){feedback(tr("Explore at least one variable or FFT peak first.","변수나 FFT 피크를 먼저 조작하세요."),"retry");return;}
 if(state.stage===4&&state.filter!=="notch"){feedback(tr("Select a bright FFT peak and apply its mirrored notch.","밝은 피크를 선택해 대칭 Notch를 적용하세요."),"retry");return;}
 const correct=answer==="a";
 feedback(correct?tr("Your observation supports this conclusion.","관찰 결과가 이 결론을 뒷받침합니다."):tr("Change the conditions and reconsider the result.","조건을 바꿔 결과를 다시 해석하세요."),correct?"correct":"retry");
 $("image-explanation").textContent=correct?tr(...e.explain):"";
}
function selectPeak(u,v){
 const N=state.N;
 if(Math.hypot(u,v)<3){$("image-status").textContent=tr("Select an isolated peak, not the DC center.","DC 중심이 아닌 밝은 피크를 선택하세요.");return;}
 state.notchU=clamp(u,-N/2,N/2-1);state.notchV=clamp(v,-N/2,N/2-1);state.filter="notch";interactions++;
 $("image-status").textContent=tr("Notches placed at both conjugate frequencies.","켤레 주파수 두 곳에 Notch를 적용했습니다.");
 sync();schedule();
}
async function loadImage(file){
 if(!file)return;
 if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>8*1024*1024){
  $("image-status").textContent=tr("Use PNG/JPEG/WebP no larger than 8 MB.","8MB 이하 PNG/JPEG/WebP를 사용하세요.");return;
 }
 try{
  const img=await createImageBitmap(file);
  if(bitmap?.close)bitmap.close();bitmap=img;
  if(!$("image-preset").querySelector('[value="upload"]')){
   const item=document.createElement("option");item.value="upload";$("image-preset").append(item);
  }
  state.kind="upload";dirty=true;interactions++;labels();
  $("image-status").textContent=tr("Local image loaded: ","로컬 이미지 로드: ")+file.name+" ("+img.width+"×"+img.height+")";
  schedule();
 }catch(e){$("image-status").textContent=tr("Could not read image.","이미지를 읽을 수 없습니다.");}
}
function reset(){
 Object.assign(state,defaults);if(bitmap?.close)bitmap.close();bitmap=null;dirty=true;
 $("image-upload").value="";$("image-preset").querySelector('[value="upload"]')?.remove();
 interactions=0;feedback();$("image-prediction").value="";$("image-explanation").textContent="";$("image-status").textContent="";
 labels();schedule();
}
function bind(){
 document.querySelectorAll(".ss-image-stage").forEach(b=>b.addEventListener("click",()=>chooseStage(b.dataset.stage)));
 $("image-next").addEventListener("click",()=>{if(state.stage<4)chooseStage(state.stage+1);});
 for(const [id,field,event,convert]of [
  ["image-preset","kind","change",String],["image-size","N","change",Number],
  ["image-cycles","cycles","input",Number],["image-angle","angle","input",Number]
 ])$(id).addEventListener(event,e=>{state[field]=convert(e.target.value);invalid();});
 for(const [id,field,event,convert]of [
  ["image-filter","filter","change",String],["image-radius","radius","input",Number],
  ["image-notch-radius","notchRadius","input",Number]
 ])$(id).addEventListener(event,e=>{state[field]=convert(e.target.value);interactions++;sync();schedule();});
 $("image-spectrum-view").addEventListener("change",e=>{state.view=e.target.value;schedule();});
 $("image-upload").addEventListener("change",e=>{void loadImage(e.target.files[0]);});
 const spectrum=$("image-spectrum-canvas");
 spectrum.addEventListener("click",e=>{
  const r=spectrum.getBoundingClientRect(),u=Math.floor((e.clientX-r.left)/r.width*state.N)-state.N/2;
  const v=Math.floor((e.clientY-r.top)/r.height*state.N)-state.N/2;selectPeak(u,v);
 });
 spectrum.addEventListener("keydown",e=>{
  if(e.key==="Enter"||e.key===" "){e.preventDefault();selectPeak(state.notchU,state.notchV);return;}
  let u=state.notchU,v=state.notchV;
  if(e.key==="ArrowLeft")u--;else if(e.key==="ArrowRight")u++;
  else if(e.key==="ArrowUp")v--;else if(e.key==="ArrowDown")v++;else return;
  e.preventDefault();selectPeak(u,v);
 });
 $("image-check").addEventListener("click",check);
 $("image-reset").addEventListener("click",reset);
 $("image-export").addEventListener("click",()=>{
  const a=document.createElement("a");a.download="2D-FFT-reconstruction.png";
  a.href=$("image-output-canvas").toDataURL("image/png");a.click();
 });
 W.ELSLanguage?.subscribe?.(labels);
 W.addEventListener("els:themechange",()=>{if(result)render(result);});
}
function math(){
 if(!W.katex)return;
 try{
  W.katex.render('F[u,v]=\\sum_{y=0}^{N-1}\\sum_{x=0}^{N-1} I[x,y]e^{-j2\\pi(ux+vy)/N}',$("image-formula-1"),{throwOnError:false});
  W.katex.render('g[x,y]=\\mathcal{F}_{2D}^{-1}\\{H[u,v]F[u,v]\\}',$("image-formula-2"),{throwOnError:false});
 }catch(e){}
}
bind();labels();math();schedule();
W.SSImageFFTApp={state,chooseStage,compute,get result(){return result;},reset};
})(window);
