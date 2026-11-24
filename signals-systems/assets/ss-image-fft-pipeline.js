/* Part C 07 — exact 2D FFT teaching pipeline.
 * Uses the current REAL image, kernel, and complex FFT result from the main lab.
 * Every displayed intermediate is calculated by the FFT engine, not illustration.
 */
(function(W){
"use strict";
const $=id=>document.getElementById(id),C=W.SSImageFFTCore;
if(!C||!W.SSImageFFTApp||!$("image-fft-pipeline"))return;
const labels=[
 {name:["1 · Row FFT","1 · 행 FFT"],q:["What changes when only the horizontal x coordinate is transformed?","가로 좌표 x만 FFT하면 무엇이 변할까요?"],
  left:["Image I[y,x]","입력 영상 I[y,x]"],right:["Row spectra R[y,u]","행 스펙트럼 R[y,u]"],
  leftNote:["Spatial coordinates (x,y). Highlighted line is row y.","공간 좌표 (x,y)입니다. 강조된 선은 y번째 행입니다."],
  rightNote:["Horizontal u is frequency; vertical y is still pixel position.","가로 u는 주파수, 세로 y는 여전히 픽셀 위치입니다."],
  note:["A 1D FFT is applied to each row. R[y,u] is COMPLEX; this image only displays its log magnitude.","각 행에 1D FFT를 적용합니다. R[y,u]는 복소수이며 그림에는 로그 크기만 표시합니다."]},
 {name:["2 · Column FFT","2 · 열 FFT"],q:["If u is already a frequency index, what happens when we transform the vertical direction?","u가 이미 주파수 인덱스라면 세로 방향을 FFT할 때 무엇이 달라질까요?"],
  left:["Row spectra R[y,u]","행 스펙트럼 R[y,u]"],right:["2D spectrum F[v,u]","2D 스펙트럼 F[v,u]"],
  leftNote:["Choose one frequency column u. Its vertical samples still vary with y.","주파수 열 u를 선택하세요. 세로 축은 아직 공간 인덱스 y입니다."],
  rightNote:["After the column FFT, both axes u and v are spatial-frequency indices.","열 FFT 후에는 두 축 u와 v가 모두 공간주파수 인덱스입니다."],
  note:["FFT down each frequency column turns y into v. Shifting the display centers DC; it does not change complex coefficients.","주파수 열마다 FFT하면 y가 v로 변합니다. 표시상 DC를 중앙 이동해도 복소 계수 자체는 변하지 않습니다."]},
 {name:["3 · Complex multiply","3 · 복소 곱셈"],q:["Where does the 3×3 spatial kernel appear in the frequency domain?","3×3 공간 커널은 주파수 영역에서 어떻게 적용될까요?"],
  left:["F[v,u] · original","원래 스펙트럼 F[v,u]"],right:["F[v,u] × H[v,u]","필터링 스펙트럼 F[v,u]×H[v,u]"],
  leftNote:["The original centered 2D FFT spectrum.","필터 전 중심 이동 2D FFT 스펙트럼입니다."],
  rightNote:["Complex multiplication preserves both magnitude and phase information.","복소 곱셈에는 크기와 위상 정보가 모두 포함됩니다."],
  note:["H is the FFT of the zero-padded, circularly aligned 3×3 kernel. Filter the FULL complex spectrum, not the displayed log-magnitude image.","H는 3×3 커널을 순환 정렬하고 영으로 채운 뒤 계산한 FFT입니다. 표시된 로그 크기 영상이 아닌 복소 스펙트럼 전체에 곱합니다."]},
 {name:["4 · Inverse FFT2","4 · 역 FFT2"],q:["Can frequency multiplication reproduce the same pixels as the spatial 3×3 scan?","주파수 영역의 곱셈으로 공간 3×3 커널 이동과 같은 픽셀을 복원할 수 있을까요?"],
  left:["F × H (complex spectrum)","F×H (복소 스펙트럼)"],right:["IFFT2 result g[y,x]","IFFT2 복원 결과 g[y,x]"],
  leftNote:["Still in spatial-frequency coordinates (u,v).","여전히 공간주파수 좌표 (u,v)입니다."],
  rightNote:["The inverse 2D FFT gives the same image as circular spatial convolution.","2D IFFT 결과는 순환 공간 컨벌루션과 같은 영상입니다."],
  note:["Both paths match when the boundary convention agrees. A 3×3 spatial kernel may cost less than FFT processing; equivalence does not imply equal speed.","경계 처리 방식이 같을 때 두 결과는 일치합니다. 작은 3×3 커널은 직접 공간 계산이 더 빠를 수도 있습니다. 수학적 동등성이 속도까지 같다는 뜻은 아닙니다."]}
];
const t=(en,ko)=>{const m=W.ELSLanguage?.get?.()||"mixed";return m==="en"?en:m==="ko"?ko:en+" · "+ko;};
const text=(id,a)=>{$(id).textContent=t(...a);};
const state={step:0,row:96,column:8,visited:new Set([0]),active:false,source:null,stages:null,model:null,fullError:0};
const drawCache={};
function maxComplexError(a,b){
 let max=0;
 for(let i=0;i<a.real.length;i++)
  max=Math.max(max,Math.hypot(a.real[i]-b.real[i],a.imag[i]-b.imag[i]));
 return max;
}
function initStages(model){
 if(model.input!==state.source){
  state.source=model.input;
  state.stages=C.separableStages(model.input.pixels,model.N);
  state.fullError=maxComplexError(state.stages.full,model.spectrum);
  state.row=Math.min(state.row,model.N-1);
  state.column=Math.max(-model.N/2,Math.min(model.N/2-1,state.column));
 }
 state.model=model;
 const N=model.N;
 $("image-fft-row").max=String(N-1);
 $("image-fft-column").min=String(-N/2);
 $("image-fft-column").max=String(N/2-1);
 state.row=Math.max(0,Math.min(N-1,state.row));
 $("image-fft-row").value=String(state.row);
 $("image-fft-column").value=String(state.column);
}
function reset(){
 state.step=0;state.visited=new Set([0]);state.active=false;
}
function magnitudes(spectrum,N,rowOnly=false){
 const values=new Float64Array(N*N);
 let maximum=0;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const sx=(x+N/2)%N,sy=rowOnly?y:(y+N/2)%N;
  const k=sy*N+sx;
  const value=Math.log1p(Math.hypot(spectrum.real[k],spectrum.imag[k]));
  values[y*N+x]=value;
  maximum=Math.max(maximum,value);
 }
 return {values,maximum};
}
function paint(canvas,values,N,{mag=false,maximum=null,highlight=null}={}){
 const ctx=canvas.getContext("2d"),small=document.createElement("canvas");
 small.width=small.height=N;
 const temp=small.getContext("2d"),im=temp.createImageData(N,N);
 const peak=mag?(maximum||Math.max(...values)||1):1;
 for(let i=0;i<values.length;i++){
  const normalized=mag?Math.pow(Math.min(1,values[i]/peak),.72):Math.max(0,Math.min(1,values[i]));
  const g=Math.round(normalized*255),o=4*i;
  im.data[o]=im.data[o+1]=im.data[o+2]=g;im.data[o+3]=255;
 }
 temp.putImageData(im,0,0);
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.drawImage(small,0,0,canvas.width,canvas.height);
 if(highlight){
  ctx.save();ctx.strokeStyle="#ffbb69";ctx.lineWidth=3;
  if(highlight.direction==="row"){
   const y=(highlight.index+.5)/N*canvas.height;
   ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke();
  }else{
   const x=(highlight.index+N/2+.5)/N*canvas.width;
   ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke();
  }
  ctx.restore();
 }
}
function evidence(model){
 const st=state.step;
 const N=model.N,row=state.row,u=state.column,bin=(u+N)%N;
 if(st===0){
  const k=row*N+bin,m=Math.hypot(state.stages.rows.real[k],state.stages.rows.imag[k]);
  return ["Row y="+row+" · |R[y,u="+u+"]| = "+m.toFixed(4)+". "+N+" independent row FFTs are computed.",
          "행 y="+row+" · |R[y,u="+u+"]| = "+m.toFixed(4)+". 행 방향 FFT를 "+N+"번 수행합니다."];
 }
 if(st===1){
  const k=bin,m=Math.hypot(state.stages.full.real[k],state.stages.full.imag[k]);
  return ["Column u="+u+" · |F[v=0,u]| = "+m.toFixed(4)+". Max |two 1D passes − FFT2| = "+state.fullError.toExponential(2)+".",
          "주파수 열 u="+u+" · |F[v=0,u]| = "+m.toFixed(4)+". 최대 |행·열 1D FFT − FFT2| = "+state.fullError.toExponential(2)+"."];
 }
 if(st===2){
  const k=bin,H=model.output.kernelSpectrum;
  const h=Math.hypot(H.real[k],H.imag[k]);
  return ["At (u="+u+",v=0): |H|="+h.toFixed(4)+". Each complex F coefficient is multiplied by its complex H coefficient.",
          "(u="+u+",v=0)에서 |H|="+h.toFixed(4)+". 모든 복소 F 계수에 대응하는 복소 H 계수를 곱합니다."];
 }
 const p=W.SSImageFFTApp.state;
 const index=p.probeY*N+p.probeX;
 const spatial=model.output.spatialPixels[index],frequency=model.output.pixels[index];
 return ["Pixel ("+p.probeX+","+p.probeY+"): spatial="+spatial.toFixed(6)+", FFT="+frequency.toFixed(6)+". Whole-image max error="+model.output.maxDifference.toExponential(2)+".",
         "픽셀 ("+p.probeX+","+p.probeY+"): 공간="+spatial.toFixed(6)+", FFT="+frequency.toFixed(6)+". 전체 영상 최대 오차="+model.output.maxDifference.toExponential(2)+"."];
}
function draw(model){
 const N=model.N,d=labels[state.step];
 for(const [k,s] of [
 ["image-fft-left-title",d.left],["image-fft-right-title",d.right],
 ["image-fft-left-caption",d.leftNote],["image-fft-right-caption",d.rightNote],
 ["image-fft-pipeline-question",d.q],["image-fft-pipeline-note",d.note]])text(k,s);
 text("image-fft-pipeline-evidence",evidence(model));
 $("image-fft-pipeline-counter").textContent=(state.step+1)+" / 4";
 $("image-fft-row-value").textContent=String(state.row);
 $("image-fft-column-value").textContent=String(state.column);
 const rowOn=state.step===0,colOn=state.step===1;
 for(const id of ["image-fft-row","image-fft-row-label","image-fft-row-value"])$(id).hidden=!rowOn;
 for(const id of ["image-fft-column","image-fft-column-label","image-fft-column-value"])$(id).hidden=!colOn;
 $("image-fft-prev").disabled=state.step===0;
 $("image-fft-next").disabled=state.step===3;
 document.querySelectorAll("[data-fft-step]").forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.fftStep)===state.step)));
 const left=$("image-fft-left"),right=$("image-fft-right");
 const rows=magnitudes(state.stages.rows,N,true),full=magnitudes(state.stages.full,N);
 const filtered=magnitudes({real:model.output.real,imag:model.output.imag},N);
 if(state.step===0){
  paint(left,model.input.pixels,N,{highlight:{direction:"row",index:state.row}});
  paint(right,rows.values,N,{mag:true,maximum:rows.maximum,highlight:{direction:"row",index:state.row}});
 }else if(state.step===1){
  paint(left,rows.values,N,{mag:true,maximum:rows.maximum,highlight:{direction:"column",index:state.column}});
  paint(right,full.values,N,{mag:true,maximum:full.maximum,highlight:{direction:"column",index:state.column}});
 }else if(state.step===2){
  const common=Math.max(full.maximum,filtered.maximum);
  paint(left,full.values,N,{mag:true,maximum:common});
  paint(right,filtered.values,N,{mag:true,maximum:common});
 }else{
  paint(left,filtered.values,N,{mag:true,maximum:filtered.maximum});
  paint(right,model.output.pixels,N,{});
 }
}
function localize(){
 const items={
  "image-fft-pipeline-kicker":["INSIDE FFT2 · ACTUAL IMAGE DATA","FFT2 내부 · 실제 영상 데이터"],
  "image-fft-pipeline-title":["Build 2D FFT from 1D FFTs","1D FFT로 2D FFT 만들기"],
  "image-fft-row-label":["Inspect row y","행 y 선택"],
  "image-fft-column-label":["Inspect frequency column u","주파수 열 u 선택"],
  "image-fft-prev":["Previous operation","이전 연산"],
  "image-fft-next":["Next operation","다음 연산"]
 };
 for(const [id,pair]of Object.entries(items))text(id,pair);
 labels.forEach((d,i)=>text("image-fft-stage-"+i,d.name));
 if(state.model&&state.active)draw(state.model);
}
function refresh(model){
 if(!model)return;
 const active=W.SSImageFFTApp.state.stage===3 && W.SSImageFFTApp.state.filter==="kernel";
 if(!active){state.active=false;return;}
 if(!state.active){reset();state.active=true;}
 initStages(model);draw(model);
}
function go(step){
 state.step=Math.max(0,Math.min(3,Number(step)));
 state.visited.add(state.step);
 if(state.model&&state.active)draw(state.model);
}
document.querySelectorAll("[data-fft-step]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.fftStep)));
$("image-fft-prev").addEventListener("click",()=>go(state.step-1));
$("image-fft-next").addEventListener("click",()=>go(state.step+1));
$("image-fft-row").addEventListener("input",e=>{state.row=Number(e.target.value);if(state.model&&state.active)draw(state.model);});
$("image-fft-column").addEventListener("input",e=>{state.column=Number(e.target.value);if(state.model&&state.active)draw(state.model);});
W.addEventListener("ss:image-fft-render",e=>refresh(e.detail?.model));
W.ELSLanguage?.subscribe?.(localize);
W.SSImageFFTPipeline={refresh,reset,get step(){return state.step;},get completed(){return state.active&&state.visited.size===4;},get details(){return {row:state.row,column:state.column,fullError:state.fullError,visited:[...state.visited]};}};
localize();refresh(W.SSImageFFTApp.result);
})(window);
