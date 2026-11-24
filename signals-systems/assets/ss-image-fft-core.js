/* 2D Image FFT Discovery — numeric engine, independent of DOM/UI.
 * Rows then columns, complex DFT, frequency-domain masking, inverse 2D FFT.
 * Grayscale samples are in [0,1]. Forward DFT is unnormalized;
 * inverse DFT divides by N on each axis (overall N²).
 */
(function(root){
"use strict";
const TAU=2*Math.PI,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function sizeCheck(N){if(!Number.isInteger(N)||N<16||N>512||(N&(N-1)))throw Error("2D FFT size must be a power of two, 16–512");}
function fft1d(re,im,inverse=false){
 const n=re.length;
 if(n!==im.length||n<2||(n&(n-1)))throw Error("Invalid complex FFT length");
 for(let i=1,j=0;i<n;i++){
  let bit=n>>1;
  for(;j&bit;bit>>=1)j^=bit;
  j^=bit;
  if(i<j){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t;}
 }
 for(let len=2;len<=n;len*=2){
  const half=len/2,sign=inverse?1:-1;
  for(let offset=0;offset<n;offset+=len){
   for(let k=0;k<half;k++){
    const a=offset+k,b=a+half,angle=sign*TAU*k/len,c=Math.cos(angle),s=Math.sin(angle);
    const vr=c*re[b]-s*im[b],vi=s*re[b]+c*im[b];
    re[b]=re[a]-vr;im[b]=im[a]-vi;
    re[a]+=vr;im[a]+=vi;
   }
  }
 }
 if(inverse){for(let i=0;i<n;i++){re[i]/=n;im[i]/=n;}}
}
function transform2D(real,imag,N,inverse=false){
 sizeCheck(N);
 if(real.length!==N*N||imag.length!==N*N)throw Error("Invalid image array size");
 for(let y=0;y<N;y++)fft1d(real.subarray(y*N,(y+1)*N),imag.subarray(y*N,(y+1)*N),inverse);
 const colRe=new Float64Array(N),colIm=new Float64Array(N);
 for(let x=0;x<N;x++){
  for(let y=0;y<N;y++){const i=y*N+x;colRe[y]=real[i];colIm[y]=imag[i];}
  fft1d(colRe,colIm,inverse);
  for(let y=0;y<N;y++){const i=y*N+x;real[i]=colRe[y];imag[i]=colIm[y];}
 }
 return {real,imag};
}
function forward(samples,N){
 sizeCheck(N);
 if(!samples||samples.length!==N*N)throw Error("Invalid grayscale image length");
 const re=Float64Array.from(samples),im=new Float64Array(N*N);
 for(const v of re)if(!Number.isFinite(v))throw Error("Non-finite pixel");
 return transform2D(re,im,N);
}
function inverse(spectrum,N){
 const re=Float64Array.from(spectrum.real),im=Float64Array.from(spectrum.imag);
 transform2D(re,im,N,true);
 let imagMax=0;
 for(const a of im)imagMax=Math.max(imagMax,Math.abs(a));
 return {pixels:re,imagMax};
}
function scene(N){
 const pixels=new Float64Array(N*N);
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const nx=x/N,ny=y/N;
  let v=ny<.55?.71-.16*ny:.37+.08*(1-ny);
  // Distinct roofs, windows and tree silhouettes form a fully synthetic local image.
  if(nx>.07&&nx<.32&&ny>.35&&ny<.88)v=.42;
  if(nx>.33&&nx<.54&&ny>.2&&ny<.88)v=.28;
  if(nx>.55&&nx<.81&&ny>.43&&ny<.89)v=.52;
  if(nx>.07&&nx<.32&&ny>.31+Math.abs(nx-.195)*.46&&ny<.38)v=.21;
  if(nx>.55&&nx<.81&&ny>.39+Math.abs(nx-.68)*.32&&ny<.46)v=.29;
  if((nx>.07&&nx<.32&&ny>.35&&ny<.88)||(nx>.33&&nx<.54&&ny>.2&&ny<.88)||(nx>.55&&nx<.81&&ny>.43&&ny<.89)){
   const block=Math.floor(nx*34)%5===0 && Math.floor(ny*27)%5===0;
   if(block)v=.83;
  }
  const dx=nx-.89,dy=ny-.69;
  if(dx*dx+dy*dy<.075*.075)v=.2+.10*Math.cos((x+y)*.4);
  if(ny>.91)v=.20+.07*Math.sin(x*.08);
  const sun=(nx-.86)**2+(ny-.18)**2;
  if(sun<.055**2)v=.94;
  // Fine, deterministic texture. Not random: reruns produce the same FFT.
  if(ny>.55)v+=.012*Math.sin(x*.51+y*.27);
  pixels[y*N+x]=clamp(v,0,1);
 }
 return pixels;
}
function synth(kind="horizontal",N=256,{cycles=8,angle=0,amplitude=.24}={}){
 sizeCheck(N);
 cycles=clamp(Number(cycles)||8,1,N/2-2);
 const clean=scene(N),pixels=new Float64Array(N*N);
 const theta=Number(angle)*Math.PI/180;
 const dx=-Math.sin(theta),dy=Math.cos(theta);
 let ref=null;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const i=y*N+x;
  let value;
  if(kind==="horizontal"||kind==="vertical"||kind==="diagonal"){
   const a=kind==="horizontal"?0:kind==="vertical"?90:45;
   const t=a*Math.PI/180;
   value=.5+.42*Math.cos(TAU*cycles*(-Math.sin(t)*x+Math.cos(t)*y)/N);
  }else if(kind==="stripes"){
   value=.5+.42*Math.cos(TAU*cycles*(dx*x+dy*y)/N);
  }else if(kind==="checker"){
   value=.5+.35*Math.sign(Math.cos(TAU*cycles*x/N))*Math.sign(Math.cos(TAU*cycles*y/N));
  }else if(kind==="scene"){
   value=clean[i];
  }else if(kind==="noise"){
   // Two exact bin pairs at (±12, ±7). Ground truth remains clean.
   value=clamp(clean[i]+clamp(Number(amplitude),0,.45)*Math.cos(TAU*(12*x+7*y)/N),0,1);
  }else throw Error("Unsupported image preset: "+kind);
  pixels[i]=clamp(value,0,1);
 }
 ref=(kind==="scene"||kind==="noise")?clean:null;
 return {pixels,clean:ref,kind,N,cycles,angle,noiseBins:kind==="noise"?{u:12,v:7}:null};
}
function frequencyAt(pixelIndex,N){
 return {u:pixelIndex%N-N/2,v:Math.floor(pixelIndex/N)-N/2};
}
function spatialIndex(u,v,N){
 const x=((Math.round(u)%N+N)%N),y=((Math.round(v)%N+N)%N);
 return y*N+x;
}
function shiftedToIndex(sx,sy,N){
 const x=(sx+N/2)%N,y=(sy+N/2)%N;
 return y*N+x;
}
function maskAt(u,v,type,radius,notch){
 const d2=u*u+v*v,cut=Math.max(1,Number(radius)||18);
 if(type==="low")return Math.exp(-d2/(2*cut*cut));
 if(type==="high")return 1-Math.exp(-d2/(2*cut*cut));
 if(type==="notch"){
  const nu=notch?.u??12,nv=notch?.v??7,r=Math.max(.75,Number(notch?.radius)||2.5);
  const d1=(u-nu)**2+(v-nv)**2,d2=(u+nu)**2+(v+nv)**2;
  return (1-Math.exp(-d1/(2*r*r)))*(1-Math.exp(-d2/(2*r*r)));
 }
 return 1;
}
function applyMask(spectrum,N,{type="none",radius=25,notch={u:12,v:7,radius:2.5}}={}){
 const re=Float64Array.from(spectrum.real),im=Float64Array.from(spectrum.imag);
 let before=0,after=0;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const i=y*N+x,u=x<=N/2?x:x-N,v=y<=N/2?y:y-N;
  const h=maskAt(u,v,type,radius,notch);
  const p=re[i]*re[i]+im[i]*im[i];
  before+=p;after+=p*h*h;
  re[i]*=h;im[i]*=h;
 }
 const inverseData=inverse({real:re,imag:im},N);
 return {...inverseData,real:re,imag:im,energyPercent:before?100*after/before:0};
}
function dominant(spectrum,N,exclusion=3){
 let max=-1,point={u:0,v:0,magnitude:0};
 for(let sy=0;sy<N;sy++)for(let sx=0;sx<N;sx++){
  const u=sx-N/2,v=sy-N/2;
  if(Math.hypot(u,v)<=exclusion)continue;
  const k=shiftedToIndex(sx,sy,N),m=Math.hypot(spectrum.real[k],spectrum.imag[k]);
  if(m>max){max=m;point={u,v,magnitude:m};}
 }
 return point;
}
function rmse(actual,expected){
 if(!expected||actual.length!==expected.length)return null;
 let s=0;
 for(let i=0;i<actual.length;i++)s+=(actual[i]-expected[i])**2;
 return Math.sqrt(s/actual.length);
}

/* Finite-support 3×3 kernels. All boundaries use wrap-around samples.
 * The shifted impulse kernel is at offsets -1..+1 modulo N so that
 * frequency multiplication equals spatial CIRCULAR convolution exactly.
 */
const KERNELS=Object.freeze({
 box:Object.freeze([1,1,1,1,1,1,1,1,1].map(v=>v/9)),
 gaussian:Object.freeze([1,2,1,2,4,2,1,2,1].map(v=>v/16)),
 sharpen:Object.freeze([0,-1,0,-1,5,-1,0,-1,0])
});
function kernelWeights(name){
 const weights=KERNELS[name];
 if(!weights)throw Error("Unknown spatial kernel");
 return weights;
}
function spatialConvolution(pixels,N,name){
 sizeCheck(N);
 if(pixels.length!==N*N)throw Error("Invalid image dimensions");
 const weights=kernelWeights(name),output=new Float64Array(N*N);
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  let sum=0;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
   const ix=(x-dx+N)%N,iy=(y-dy+N)%N;
   sum+=weights[(dy+1)*3+(dx+1)]*pixels[iy*N+ix];
  }
  output[y*N+x]=sum;
 }
 return output;
}
function kernelProbe(pixels,N,name,x,y){
 const weights=kernelWeights(name),items=[],px=((Math.round(x)%N)+N)%N,py=((Math.round(y)%N)+N)%N;
 let sum=0;
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
  const ix=(px-dx+N)%N,iy=(py-dy+N)%N;
  const pixel=pixels[iy*N+ix],weight=weights[(dy+1)*3+(dx+1)],contribution=pixel*weight;
  items.push({x:ix,y:iy,pixel,weight,contribution});
  sum+=contribution;
 }
 return {x:px,y:py,items,sum};
}
function applyKernelFFT(spectrum,pixels,N,kernel="box"){
 const weights=kernelWeights(kernel),impulse=new Float64Array(N*N);
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
  const x=(dx+N)%N,y=(dy+N)%N;
  impulse[y*N+x]=weights[(dy+1)*3+(dx+1)];
 }
 const response=forward(impulse,N);
 const real=new Float64Array(N*N),imag=new Float64Array(N*N);
 let before=0,after=0;
 for(let i=0;i<real.length;i++){
  const ar=spectrum.real[i],ai=spectrum.imag[i],br=response.real[i],bi=response.imag[i];
  real[i]=ar*br-ai*bi;imag[i]=ar*bi+ai*br;
  before+=ar*ar+ai*ai;after+=real[i]*real[i]+imag[i]*imag[i];
 }
 const restored=inverse({real,imag},N),spatial=spatialConvolution(pixels,N,kernel);
 let maxDifference=0;
 for(let i=0;i<spatial.length;i++)maxDifference=Math.max(maxDifference,Math.abs(spatial[i]-restored.pixels[i]));
 return {...restored,real,imag,kernelSpectrum:response,spatialPixels:spatial,
  maxDifference,energyPercent:before?after/before*100:0};
}
root.SSImageFFTCore=Object.freeze({
 forward,inverse,transform2D,fft1d,synth,scene,maskAt,applyMask,dominant,
 frequencyAt,spatialIndex,shiftedToIndex,rmse,spatialConvolution,kernelWeights,kernelProbe,applyKernelFFT
});
})(typeof window!=="undefined"?window:globalThis);
