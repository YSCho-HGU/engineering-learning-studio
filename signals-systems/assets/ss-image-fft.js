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
 "image-stage-3":["Kernel → FFT","커널 → FFT"],"image-stage-4":["Remove noise","잡음 제거"],
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
 "image-view-note-3":["Bright passes; dark attenuates. Kernel display shows normalized |H[u,v]|.","밝은 영역은 통과하고 어두운 영역은 감쇠합니다. 커널은 정규화된 |H[u,v]|을 보여줍니다."],
 "image-kernel-title":["Move a 3×3 kernel · Compare two calculations","3×3 커널 이동 · 두 가지 계산 비교"],
 "image-kernel-kicker":["ONE PIXEL AT A TIME → SAME IMAGE","한 픽셀씩 계산 → 동일한 이미지"],
 "image-kernel-choice-label":["Choose a kernel","커널 선택"],
 "image-kernel-intro":["Press Next pixel or Play scan. Watch the 3×3 neighborhood slide across a 5×5 region. Click the input image to choose another region.","다음 픽셀 또는 자동 이동을 누르세요. 3×3 이웃 영역이 5×5 구간을 이동합니다. 입력 이미지를 클릭하면 다른 영역을 선택합니다."],
 "image-kernel-patch-label":["3×3 neighboring pixels","주변 3×3 픽셀"],
 "image-kernel-weight-label":["3×3 kernel weights","3×3 커널 가중치"],
 "image-kernel-link":["Part B's moving average extends to 2D: with the SAME circular boundary rule, the weighted sum equals FFT2(I) × FFT2(h) followed by IFFT2. For a tiny 3×3 kernel, direct spatial filtering can be faster—FFT is not automatically faster.","Part B의 이동평균을 2차원으로 확장한 것입니다. 동일한 순환 경계 조건에서는 공간 가중합과 FFT2(I) × FFT2(h)를 IFFT2한 값이 일치합니다. 단, 작은 3×3 커널에서는 직접 공간 필터가 더 빠를 수 있습니다. FFT가 항상 빠른 것은 아닙니다."],
 "image-scan-play":["Play scan","자동 이동"],"image-scan-next":["Next pixel","다음 픽셀"],
 "image-scan-restart":["Restart 5×5","5×5 다시 시작"],
 "image-scan-speed-label":["Scan speed","이동 속도"],
 "image-spatial-heading":["A · Spatial convolution","A · 공간 컨벌루션"],
 "image-spatial-help":["The kernel slides over 3×3 input pixels and computes ONE output at a time.","커널이 3×3 입력 영역을 이동하면서 출력 픽셀을 한 개씩 계산합니다."],
 "image-fft-heading":["B · FFT2 × H → IFFT2","B · FFT2 × H → IFFT2"],
 "image-fft-help":["FFT2 uses all rows and columns, multiplies the complex kernel response, then reconstructs the ENTIRE image.","행과 열에 FFT2를 적용하고 복소 커널 응답을 곱한 뒤 전체 이미지에 IFFT2를 적용합니다."],
 "image-spatial-local-label":["5×5 pixels revealed in scan order","이동 순서대로 완성되는 5×5 출력"],
 "image-fft-local-label":["Same 5×5 pixels already computed by IFFT2","IFFT2에서 한꺼번에 계산된 같은 5×5 출력"],
 "image-prediction-kicker":["THINK FIRST · BEFORE CHANGING VARIABLES","먼저 예측 · 변수를 조절하기 전에"],
 "image-reason-title":["Explain · What does the evidence mean?","설명 · 관찰한 결과는 무엇을 의미할까요?"],
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
 3:{title:["How does a pixel kernel become a frequency filter?","픽셀 커널은 어떻게 주파수 필터가 될까요?"],
 hint:["Click a pixel in the input image. Compare its 3×3 neighborhood, Box/Gaussian/Sharpen weights, and the FFT-derived filter response. Change kernels.","입력 이미지의 픽셀을 클릭하세요. 주변 3×3 값과 평균·가우시안·선명화 가중치, FFT로 계산한 필터 응답을 비교하고 커널을 바꿔 보세요."],
 q:["Why can the spatial scan and the FFT method produce the same pixel values?","공간 커널 이동과 FFT 방법이 동일한 픽셀값을 만드는 이유는?"],
 a:[["Convolution theorem + matching circular boundaries","컨벌루션 정리와 동일한 순환 경계 조건"],["Because FFT discards phase and uses only magnitude","FFT가 위상을 버리고 크기만 사용하기 때문"]],
 explain:["The convolution theorem connects a pixel's weighted neighborhood to complex spectrum multiplication. The identical result depends on using the same circular boundary rule, including at image edges. Observe at least three successive pixels before concluding; FFT is not always faster for small kernels.","컨벌루션 정리는 국소 픽셀 가중합을 복소 스펙트럼 곱셈과 연결합니다. 영상 경계를 포함해 순환 경계 규칙이 같아야 결과가 일치합니다. 연속된 픽셀 세 개 이상을 확인하세요. 작은 커널에서 FFT가 반드시 더 빠른 것은 아닙니다."]},
 4:{title:["Can an FFT remove periodic image noise?","FFT로 주기적 이미지 잡음을 제거할 수 있을까요?"],
 hint:["Find bright peaks around (±12, ±7). Click either peak; the symmetric notch pair filters the image before IFFT.","(±12, ±7) 근처 밝은 피크 중 하나를 클릭하세요. 대칭 Notch 쌍이 적용되고 IFFT로 복원됩니다."],
 q:["Why reject both opposite peaks?","왜 서로 반대쪽 피크 두 개를 제거할까요?"],
 a:[["Conjugate symmetry is required for real-image reconstruction","실수 이미지 복원에 켤레대칭이 필요합니다"],["Two separate images are required to run 2D FFT","2D FFT에 서로 다른 이미지 두 개가 필요합니다"]],
 explain:["For real images, F(−u,−v)=F*(u,v). A paired symmetric notch retains that property. Targeted frequency removal can suppress image-wide interference.","실수 이미지의 F(−u,−v)=F*(u,v)이므로 대칭 Notch는 복소 켤레대칭을 유지합니다. 전체 이미지에 퍼진 주기 잡음을 특정 주파수만 제거해 줄일 수 있습니다."]}
};
const presets=[["stripes","Adjustable stripes","줄무늬 조절"],["checker","Checkerboard","체커보드"],["scene","Synthetic city scene","합성 도시 장면"],["noise","Scene + periodic noise","장면 + 주기적 잡음"]];
const kernelChoices=[["Box average","3×3 평균"],["Gaussian blur","가우시안 블러"],["Sharpen","선명화"]];
const filters=[["none","No filter","필터 없음"],["kernel","3×3 spatial kernel (FFT equivalent)","3×3 공간 커널 (FFT로 동일 계산)"],["low","Gaussian low-pass","가우시안 저역통과"],["high","Gaussian high-pass","가우시안 고역통과"],["notch","Symmetric notch reject","대칭 Notch 제거"]];
const defaults={stage:1,kind:"stripes",N:256,cycles:8,angle:0,filter:"none",radius:22,notchU:12,notchV:7,notchRadius:2.5,view:"magnitude",kernel:"box",probeX:82,probeY:106};
const state={...defaults};let bitmap=null,dirty=true,base=null,result=null,scheduled=0,interactions=0;
const scan={anchorX:state.probeX,anchorY:state.probeY,progress:0,timer:null};
let noiseHint=false;
function feedback(message="",status=""){const el=$("image-feedback");el.textContent=message;if(status)el.dataset.result=status;else delete el.dataset.result;}
function labels(){
 for(const [id,[en,ko]]of Object.entries(words))set(id,en,ko);
 for(const [i,o]of presets.entries())$("image-preset").options[i].textContent=tr(o[1],o[2],true);
 const uploadedOption=$("image-preset").querySelector('option[value="upload"]');
 if(uploadedOption)uploadedOption.textContent=tr("Uploaded picture","업로드 이미지",true);
 for(const [i,o]of filters.entries())$("image-filter").options[i].textContent=tr(o[1],o[2],true);
 for(const [i,word]of kernelChoices.entries())$("image-kernel-choice").options[i].textContent=tr(...word,true);
 $("image-spectrum-view").options[0].textContent=tr("Log magnitude","로그 크기",true);
 $("image-spectrum-view").options[1].textContent=tr("Phase (advanced)","위상 (심화)",true);
 document.title=tr("2D Image FFT Discovery","2D 이미지 FFT 발견 실습",true)+" | Engineering Learning Studio";
 document.documentElement.lang=mode()==="ko"?"ko":"en";
 const speedNames=[["Slow","느림"],["Normal","보통"],["Fast","빠름"]];
 [...$("image-scan-speed").options].forEach((o,i)=>o.textContent=tr(...speedNames[i],true));
 if(scan.timer!==null)$("image-scan-play").textContent=tr("Pause scan","일시정지");
 $("image-input-canvas").setAttribute("aria-label",tr("Input image. In Kernel stage use arrows to move the inspected pixel, Enter to inspect.","입력 이미지입니다. 커널 단계에서 방향키로 선택 위치를 이동하고 Enter로 픽셀을 관찰합니다."));
 $("image-scan-source").setAttribute("aria-label",tr("Click this preview to choose a new kernel scan region, or move using arrow keys.","이 미리보기를 클릭해 커널 이동 구간을 선택하거나 방향키로 이동하세요."));
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
 $("image-filter").value=state.filter;$("image-kernel-choice").value=state.kernel;$("image-spectrum-view").value=state.view;
 $("image-cycles-value").textContent=state.cycles;$("image-angle-value").textContent=state.angle+"°";
 $("image-radius-value").textContent=state.radius;$("image-notch-radius-value").textContent=Number(state.notchRadius).toFixed(1);
 $("image-cycles-field").hidden=!["stripes","checker"].includes(state.kind);
 $("image-angle-field").hidden=state.kind!=="stripes";
 $("image-kernel-panel").hidden=state.stage!==3;
 $("image-kernel-bridge").hidden=state.stage!==3||state.filter!=="kernel";
 $("image-noise-hint").hidden=state.stage!==4||state.kind!=="noise";
 $("image-noise-hint").textContent=noiseHint?tr("Hide noise-peak clue","잡음 피크 힌트 숨기기"):tr("Need a hint? Highlight the noise peaks","힌트: 잡음 피크 위치 표시");
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
 const output=state.filter==="kernel"?C.applyKernelFFT(spectrum,input.pixels,state.N,state.kernel):C.applyMask(spectrum,state.N,{type:state.filter,radius:state.radius,notch:{u:state.notchU,v:state.notchV,radius:state.notchRadius}});
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
function showMask(m){
 const N=m.N,data=new Float64Array(N*N),notch={u:state.notchU,v:state.notchV,radius:state.notchRadius};
 if(state.filter==="kernel"){
  const h=m.output.kernelSpectrum;let max=0;
  for(let sy=0;sy<N;sy++)for(let sx=0;sx<N;sx++){
   const k=C.shiftedToIndex(sx,sy,N),p=sy*N+sx;
   data[p]=Math.hypot(h.real[k],h.imag[k]);max=Math.max(max,data[p]);
  }
  for(let i=0;i<data.length;i++)data[i]/=max||1;
 }else for(let y=0;y<N;y++)for(let x=0;x<N;x++)data[y*N+x]=C.maskAt(x-N/2,y-N/2,state.filter,state.radius,notch);
 showRaster("image-mask-canvas",data,N);
}
function showMetrics(m){
 const values=[
 [["Dominant peak (u,v)","최대 피크 (u,v)"],"("+m.peak.u+", "+m.peak.v+")"],
 [["Spatial period","공간 주기"],state.kind==="stripes"?(m.N/state.cycles).toFixed(1)+" px":tr("Varies","다양함",true)],
 [["Output/input spectral energy","출력/입력 스펙트럼 에너지"],m.output.energyPercent.toFixed(1)+"%"],
 [m.output.maxDifference!==undefined?["Spatial vs FFT2 error","공간/FFT2 오차"]:["RMSE vs clean scene","원본 장면 대비 RMSE"],
  m.output.maxDifference!==undefined?m.output.maxDifference.toExponential(2):
   m.originalRMSE===null?tr("Not available","기준 없음",true):m.originalRMSE.toFixed(3)+" → "+m.filteredRMSE.toFixed(3)]
 ];
 const host=$("image-metrics");host.replaceChildren();
 for(const [[en,ko],v]of values){
  const box=document.createElement("div"),a=document.createElement("span"),b=document.createElement("strong");
  box.className="ss-image-metric";a.textContent=tr(en,ko,true);b.textContent=v;box.append(a,b);host.append(box);
 }
}

/* A reproducible 5x5 scan: spatial method reveals pixels while
 * FFT2 output is already complete. Never recompute FFT per animation tick.
 */
function stopScan(){
 if(scan.timer!==null){clearInterval(scan.timer);scan.timer=null;}
 const play=$("image-scan-play");
 if(play){play.setAttribute("aria-pressed","false");play.textContent=tr("Play scan","자동 이동");}
}
function resetScan(newAnchor){
 if(newAnchor){scan.anchorX=state.probeX;scan.anchorY=state.probeY;}
 scan.progress=0;state.probeX=scan.anchorX;state.probeY=scan.anchorY;
 if(result&&state.stage===3&&state.filter==="kernel"){renderScan(result);liveObservation(result);}
}
function scanPosition(i,N){
 const px=scan.anchorX-2+(i%5),py=scan.anchorY-2+Math.floor(i/5);
 return {x:(px%N+N)%N,y:(py%N+N)%N};
}
function nextScan(){
 if(state.stage!==3||state.filter!=="kernel"||!result?.output?.spatialPixels){stopScan();return;}
 if(scan.progress>=25){stopScan();return;}
 const point=scanPosition(scan.progress,result.N);
 state.probeX=point.x;state.probeY=point.y;
 scan.progress++;interactions++;renderScan(result);liveObservation(result);
 if(scan.progress===25)stopScan();
}
function playScan(){
 if(scan.timer!==null){stopScan();return;}
 if(scan.progress>=25)resetScan(false);
 nextScan();
 if(scan.progress>=25)return;
 const speed=clamp(Number($("image-scan-speed").value)||470,200,1200);
 scan.timer=setInterval(nextScan,speed);
 $("image-scan-play").setAttribute("aria-pressed","true");
 $("image-scan-play").textContent=tr("Pause scan","일시정지");
}
function renderScan(m){
 if(state.stage!==3||state.filter!=="kernel"||!m?.output?.spatialPixels)return;
 const N=m.N,space=$("image-spatial-progress"),freq=$("image-fft-progress");
 space.replaceChildren();freq.replaceChildren();
 const active=scan.progress>0?scan.progress-1:-1;
 const fragSpace=document.createDocumentFragment(),fragFFT=document.createDocumentFragment();
 for(let i=0;i<25;i++){
  const point=scanPosition(i,N),k=point.y*N+point.x;
  const spatial=m.output.spatialPixels[k],fromFFT=m.output.pixels[k];
  const a=document.createElement("span"),b=document.createElement("span");
  a.className="ss-image-bridge-cell"+(i===active?" ss-image-bridge-active":"")+(i<scan.progress?" ss-image-bridge-revealed":"");
  b.className="ss-image-bridge-cell ss-image-bridge-known"+(i===active?" ss-image-bridge-active":"");
  a.textContent=i<scan.progress?spatial.toFixed(2):"·";
  b.textContent=fromFFT.toFixed(2);
  a.title=tr("Spatial pixel ","공간 픽셀 ")+"("+point.x+","+point.y+"): "+spatial.toFixed(6);
  b.title=tr("FFT pixel ","FFT 픽셀 ")+"("+point.x+","+point.y+"): "+fromFFT.toFixed(6);
  fragSpace.append(a);fragFFT.append(b);
 }
 space.append(fragSpace);freq.append(fragFFT);
 $("image-scan-counter").textContent=scan.progress+" / 25";
 if(scan.progress>=3)$("image-kernel-evidence").dataset.scanned="true";else delete $("image-kernel-evidence").dataset.scanned;
 if(scan.timer===null)$("image-scan-play").textContent=tr("Play scan","자동 이동");
 showRaster("image-input-canvas",m.input.pixels,N);
 showKernelInspector(m);
 showRaster("image-output-canvas",m.output.pixels,N);
 showRaster("image-scan-source",m.input.pixels,N);
 showRaster("image-scan-fft",m.output.pixels,N);
 const preview=$("image-scan-source"),pc=preview.getContext("2d"),scale=preview.width/N;
 pc.save();pc.strokeStyle="#f4aa62";pc.lineWidth=2.5;
 pc.strokeRect((state.probeX-1.5)*scale,(state.probeY-1.5)*scale,3*scale,3*scale);
 pc.restore();
 const other=$("image-scan-fft"),oc=other.getContext("2d"),ss=other.width/N;
 oc.save();oc.strokeStyle="#7ad9be";oc.lineWidth=2.5;
 oc.strokeRect(state.probeX*ss,state.probeY*ss,Math.max(ss,2),Math.max(ss,2));oc.restore();
 const cv=$("image-output-canvas"),ctx=cv.getContext("2d"),size=cv.width/N;
 ctx.save();ctx.lineWidth=2.5;ctx.strokeStyle="#7ad9be";
 ctx.strokeRect(state.probeX*size,state.probeY*size,Math.max(size,2),Math.max(size,2));
 ctx.restore();
}
function showKernelInspector(m){
 if(state.stage!==3)return;
 const weights=C.kernelWeights(state.kernel),probe=C.kernelProbe(m.input.pixels,m.N,state.kernel,state.probeX,state.probeY);
 const cells=[["image-kernel-pixels",probe.items.map(v=>v.pixel)],["image-kernel-weights",weights]];
 for(const [id,values]of cells){
  const host=$(id);host.replaceChildren();
  for(const [i,v]of values.entries()){
   const cell=document.createElement("span");cell.className="ss-image-kernel-cell";
   if(i===4)cell.classList.add("ss-image-kernel-center");
   cell.textContent=Number(v).toFixed(id==="image-kernel-pixels"?2:3);
   host.append(cell);
  }
 }
 if(state.filter==="kernel"){
  const value=m.output.pixels[probe.y*m.N+probe.x];
  const compared=scan.progress>=3;
  set("image-kernel-evidence",
   scan.progress===0?"Press Next pixel to begin the weighted 3×3 calculation.":
    "Pixel ("+probe.x+", "+probe.y+"): spatial sum = "+probe.sum.toFixed(5)+
    "; FFT2 = "+value.toFixed(5)+(compared?". Full-image max difference = "+m.output.maxDifference.toExponential(2)+".":". Compare two more positions."),
   scan.progress===0?"다음 픽셀을 눌러 3×3 가중합 계산을 시작하세요.":
    "픽셀 ("+probe.x+", "+probe.y+"): 공간 가중합 = "+probe.sum.toFixed(5)+
    "; FFT2 = "+value.toFixed(5)+(compared?". 전체 영상 최대 오차 = "+m.output.maxDifference.toExponential(2)+".":". 다른 픽셀도 비교해 보세요."));
 }else set("image-kernel-evidence",
   "Select the 3×3 kernel filter mode to compare its spatial and FFT results.",
   "공간·FFT 결과를 비교하려면 필터 종류에서 3×3 커널을 선택하세요.");
 // Mark the inspected 3×3 neighborhood, without changing source pixel samples.
 const cv=$("image-input-canvas"),ctx=cv.getContext("2d"),scale=cv.width/m.N;
 const x=probe.x*scale,y=probe.y*scale;
 ctx.save();ctx.strokeStyle="#f4a464";ctx.lineWidth=2.5;
 ctx.strokeRect(x-1.5*scale,y-1.5*scale,3*scale,3*scale);
 ctx.beginPath();ctx.arc(x+.5*scale,y+.5*scale,Math.max(3,scale),0,2*Math.PI);ctx.stroke();ctx.restore();
}
function liveObservation(m){
 let en,ko;
 if(state.stage===1){
  const x=Math.abs(m.peak.u),y=Math.abs(m.peak.v);
  en="Measured peak |u|="+x+", |v|="+y+" bins. More cycles → peaks farther from DC.";
  ko="측정 피크 |u|="+x+", |v|="+y+" Bin. 반복 횟수가 늘면 DC에서 멀어집니다.";
 }else if(state.stage===2){
  en="Checkerboard edges repeat in both directions: compare its multiple harmonic peaks with a smooth cosine stripe.";
  ko="체커보드 경계는 두 방향으로 반복됩니다. 여러 고조파 피크를 정현파 줄무늬와 비교하세요.";
 }else if(state.stage===3){
  en=scan.progress<3?"Compute at least 3 spatial pixels. Do they match the precomputed FFT2 output?":"Across the whole image, max |spatial−FFT2| = "+(m.output.maxDifference??0).toExponential(2)+".";
  ko=scan.progress<3?"최소 3개 픽셀을 공간 영역에서 계산하세요. FFT2 결과와 같을까요?":"영상 전체 최대 |공간−FFT2| 오차 = "+(m.output.maxDifference??0).toExponential(2)+".";
 }else if(m.originalRMSE!==null){
  const reduction=m.originalRMSE>0?Math.max(0,100*(1-m.filteredRMSE/m.originalRMSE)):0;
  en="Periodic noise RMSE: "+m.originalRMSE.toFixed(3)+" → "+m.filteredRMSE.toFixed(3)+" ("+reduction.toFixed(1)+"% lower).";
  ko="주기적 잡음 RMSE: "+m.originalRMSE.toFixed(3)+" → "+m.filteredRMSE.toFixed(3)+" ("+reduction.toFixed(1)+"% 감소).";
 }else{
  en="Choose a bright symmetric peak. Reconstruction changes when both conjugate components are attenuated.";
  ko="대칭 밝은 피크를 선택하세요. 켤레 주파수 쌍을 감쇠시키면 복원 결과가 달라집니다.";
 }
 set("image-live-observation",en,ko);
}
function showNoiseHint(m){
 if(!noiseHint||state.stage!==4||state.kind!=="noise")return;
 const cv=$("image-spectrum-canvas"),ctx=cv.getContext("2d"),N=m.N;
 ctx.save();ctx.strokeStyle="#ffcb71";ctx.lineWidth=3;
 for(const sign of [1,-1]){
  const x=(.5+sign*12/N)*cv.width,y=(.5+sign*7/N)*cv.height;
  ctx.beginPath();ctx.arc(x,y,Math.max(8,cv.width*3/N),0,Math.PI*2);ctx.stroke();
 }
 ctx.restore();
}
function render(m){
 showRaster("image-input-canvas",m.input.pixels,m.N);
 showSpectrum(m);showNoiseHint(m);showMask(m);showKernelInspector(m);
 showRaster("image-output-canvas",m.output.pixels,m.N,state.filter==="high"?.5:0);
 if(state.stage===3&&state.filter==="kernel")renderScan(m);
 set("image-view-note-4",state.filter==="high"?
  "Signed high-pass: zero is displayed as middle gray.":
  "IFFT2 uses the entire complex filtered spectrum.",
  state.filter==="high"?
  "고역통과 결과에서 0은 중간 회색으로 표시합니다.":
  "IFFT2는 크기와 위상을 포함한 복소 스펙트럼 전체로 복원합니다.");
 showMetrics(m);liveObservation(m);
}
function chooseStage(stage){
 stopScan();noiseHint=false;state.stage=clamp(Number(stage),1,4);
 if(state.stage===1)Object.assign(state,{kind:"stripes",cycles:8,angle:0,filter:"none",view:"magnitude"});
 if(state.stage===2)Object.assign(state,{kind:"checker",cycles:8,filter:"none",view:"magnitude"});
 if(state.stage===3)Object.assign(state,{kind:"scene",filter:"kernel",kernel:"box",probeX:82,probeY:106,view:"magnitude"});
 if(state.stage===4)Object.assign(state,{kind:"noise",filter:"none",notchU:12,notchV:7,notchRadius:2.5,view:"magnitude"});
 $("image-prediction").value="";$("image-explanation").textContent="";feedback();
 interactions=0;dirty=true;scan.anchorX=state.probeX;scan.anchorY=state.probeY;resetScan(false);stageLabels();sync();schedule();
}
function check(){
 const answer=$("image-prediction").value,e=exercises[state.stage];
 if(!answer){feedback(tr("Choose an answer first.","먼저 답을 선택하세요."),"retry");return;}
 if(!interactions){feedback(tr("Explore at least one variable or FFT peak first.","변수나 FFT 피크를 먼저 조작하세요."),"retry");return;}
 if(state.stage===3&&(state.filter!=="kernel"||scan.progress<3)){
  feedback(tr("First calculate at least 3 neighboring pixels in the spatial scan, then compare the matching FFT values.","먼저 공간 커널을 최소 3개 픽셀에 이동하여 계산하고 해당 FFT 결과와 비교하세요."),"retry");return;
 }
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
 stopScan();noiseHint=false;Object.assign(state,defaults);if(bitmap?.close)bitmap.close();bitmap=null;dirty=true;
 $("image-upload").value="";$("image-preset").querySelector('[value="upload"]')?.remove();
 interactions=0;scan.anchorX=state.probeX;scan.anchorY=state.probeY;resetScan(false);feedback();$("image-prediction").value="";$("image-explanation").textContent="";$("image-status").textContent="";
 labels();schedule();
}
function bind(){
 document.querySelectorAll(".ss-image-stage").forEach(b=>b.addEventListener("click",()=>chooseStage(b.dataset.stage)));
 $("image-next").addEventListener("click",()=>{if(state.stage<4)chooseStage(state.stage+1);});
 for(const [id,field,event,convert]of [
  ["image-preset","kind","change",String],["image-size","N","change",Number],
  ["image-cycles","cycles","input",Number],["image-angle","angle","input",Number]
 ])$(id).addEventListener(event,e=>{state[field]=convert(e.target.value);stopScan();resetScan(false);invalid();});
 for(const [id,field,event,convert]of [
  ["image-filter","filter","change",String],["image-radius","radius","input",Number],
  ["image-notch-radius","notchRadius","input",Number]
 ])$(id).addEventListener(event,e=>{state[field]=convert(e.target.value);stopScan();resetScan(false);interactions++;sync();schedule();});
 $("image-scan-play").addEventListener("click",playScan);
 $("image-scan-next").addEventListener("click",()=>{stopScan();nextScan();});
 $("image-scan-restart").addEventListener("click",()=>{stopScan();resetScan(false);});
 $("image-scan-speed").addEventListener("change",()=>{if(scan.timer!==null){stopScan();playScan();}});
 document.addEventListener("visibilitychange",()=>{if(document.hidden)stopScan();});
 $("image-kernel-choice").addEventListener("change",e=>{
  stopScan();state.kernel=e.target.value;state.filter="kernel";resetScan(false);interactions++;sync();schedule();
 });
 $("image-spectrum-view").addEventListener("change",e=>{state.view=e.target.value;schedule();});
 $("image-upload").addEventListener("change",e=>{void loadImage(e.target.files[0]);});
 const input=$("image-input-canvas");
 function setProbeFromPointer(cx,cy,rect){
  if(state.stage!==3)return;
  state.probeX=clamp(Math.floor((cx-rect.left)/rect.width*state.N),0,state.N-1);
  state.probeY=clamp(Math.floor((cy-rect.top)/rect.height*state.N),0,state.N-1);
  stopScan();resetScan(true);interactions++;schedule();
 }
 for(const surface of [input,$("image-scan-source")]){
 surface.addEventListener("click",e=>setProbeFromPointer(e.clientX,e.clientY,surface.getBoundingClientRect()));
 surface.addEventListener("keydown",e=>{
  if(state.stage!==3)return;
  if(e.key==="Enter"||e.key===" "){e.preventDefault();stopScan();resetScan(true);interactions++;schedule();return;}
  if(e.key==="ArrowLeft")state.probeX--;else if(e.key==="ArrowRight")state.probeX++;
  else if(e.key==="ArrowUp")state.probeY--;else if(e.key==="ArrowDown")state.probeY++;else return;
  e.preventDefault();
  state.probeX=clamp(state.probeX,0,state.N-1);state.probeY=clamp(state.probeY,0,state.N-1);
  stopScan();resetScan(true);interactions++;schedule();
 });
 }
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
 $("image-noise-hint").addEventListener("click",()=>{noiseHint=!noiseHint;sync();schedule();});
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
  W.katex.render('g[x,y]=\\sum_{a=-1}^{1}\\sum_{b=-1}^{1}h[a,b]I[(x-a)\\bmod N,(y-b)\\bmod N]',$("image-formula-kernel"),{throwOnError:false});
 }catch(e){}
}
bind();labels();math();schedule();
W.SSImageFFTApp={state,chooseStage,compute,get result(){return result;},reset};
})(window);
