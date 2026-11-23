/* Shared pure DFT / radix-2 FFT computations for the concise educational lab. */
(function(root){
"use strict";
const TWO_PI=2*Math.PI;
function radix2(samples){
 const N=samples.length;
 if(N<2||(N&(N-1))!==0)throw Error("FFT requires a power-of-two length >= 2");
 const re=Float64Array.from(samples),im=new Float64Array(N);
 for(let i=1,j=0;i<N;i++){
  let bit=N>>1;
  for(;j&bit;bit>>=1)j^=bit;
  j^=bit;
  if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]];}
 }
 for(let len=2;len<=N;len*=2){
  const h=len/2;
  for(let start=0;start<N;start+=len){
   for(let k=0;k<h;k++){
    const theta=-TWO_PI*k/len,c=Math.cos(theta),d=Math.sin(theta),a=start+k,b=a+h;
    const tr=c*re[b]-d*im[b],ti=d*re[b]+c*im[b];
    re[b]=re[a]-tr;im[b]=im[a]-ti;re[a]+=tr;im[a]+=ti;
   }
  }
 }
 return{re,im};
}
function direct(samples){
 const N=samples.length,re=new Float64Array(N),im=new Float64Array(N);
 for(let k=0;k<N;k++){
  let a=0,b=0;
  for(let n=0;n<N;n++){
   const angle=-TWO_PI*k*n/N;
   a+=samples[n]*Math.cos(angle);b+=samples[n]*Math.sin(angle);
  }
  re[k]=a;im[k]=b;
 }
 return{re,im};
}
function signal(N,type){
 if(!Number.isInteger(N)||N<2)throw Error("Invalid N");
 if(type==="impulse")return Float64Array.from({length:N},(_,n)=>n===0?1:0);
 if(type==="two")return Float64Array.from({length:N},(_,n)=>Math.cos(TWO_PI*3*n/N)+0.48*Math.cos(TWO_PI*7*n/N));
 if(type==="offbin")return Float64Array.from({length:N},(_,n)=>Math.cos(TWO_PI*3.35*n/N));
 return Float64Array.from({length:N},(_,n)=>Math.cos(TWO_PI*3*n/N));
}
function error(a,b){
 if(a.re.length!==b.re.length)throw Error("Mismatched coefficient arrays");
 let max=0;
 for(let k=0;k<a.re.length;k++)max=Math.max(max,Math.hypot(a.re[k]-b.re[k],a.im[k]-b.im[k]));
 return max;
}
function oneSided(coeff){
 const N=coeff.re.length,amp=new Float64Array(N/2+1);
 for(let k=0;k<amp.length;k++)amp[k]=(k===0||k===N/2?1:2)*Math.hypot(coeff.re[k],coeff.im[k])/N;
 return amp;
}
function complex(z,k){return{re:z.re[k],im:z.im[k]};}
root.SSDFTFFTCore=Object.freeze({radix2,direct,signal,error,oneSided,complex});
})(window);
