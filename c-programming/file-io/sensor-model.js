/* Sensor Log teaching model (JavaScript), v1.0.
   Simulates the exact fscanf("%lf %lf") loop for finite decimal tokens.
   Does NOT execute C or emulate every libc numeric grammar/rounding edge case. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports) module.exports=api;
  root.SensorModel=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const sample="0.0 2.51\n0.1 2.55\n0.2 2.48\n0.3 3.82\n";
 const cases={
  original:sample,
  moreAlerts:"0.0 2.51\n0.1 3.40\n0.2 3.80\n0.3 4.20\n",
  malformed:"0.0 2.51\n0.1 2.55\n0.2 ERROR\n0.3 3.82\n",
  partial:"0.0 2.51\n0.1 2.55\n0.2\n",
  empty:"",
  crossLine:"0.0\n2.51\n0.1 2.55\n"
 };
 // C whitespace: space, \t, \n, \v, \f, \r.
 const blank=/[\t\n\v\f\r ]/;
 const decimal=/^[+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/;
 function scan(text,offset){
   let i=offset;
   while(i<text.length&&blank.test(text[i]))i++;
   if(i>=text.length)return {kind:"eof",end:i};
   // C accepts hex floats, NaN and infinities. The bounded model explicitly
   // refuses these rather than falsely declaring a C matching failure.
   if(/^[+-]?(?:nan|inf|0[xX])/i.test(text.slice(i)))return {kind:"unsupported",end:i};
   const m=text.slice(i).match(decimal);
   if(!m)return {kind:"mismatch",end:i,token:text.slice(i).split(/[\t\n\v\f\r ]/)[0]};
   const v=Number(m[0]);
   if(!Number.isFinite(v))return {kind:"unsupported",end:i};
   return {kind:"ok",end:i+m[0].length,value:v,token:m[0]};
 }
 function simulate(text,threshold=3){
   if(typeof text!=="string"||text.length>20000)throw Error("Text file must have 0–20,000 characters.");
   if(!Number.isFinite(threshold))throw Error("Threshold must be finite.");
   let pos=0,count=0,sum=0,lastReturn="—";
   let stdout="",stderr="",alerts=[],records=[],trace=[],finished=false;
   for(let attempt=1;attempt<10002;attempt++){
     const readStart=pos;
     const first=scan(text,pos);
     if(first.kind==="unsupported")return {supported:false,reason:"10진수 및 지수 표기 이외의 숫자(예: NaN, Inf, 0x)는 현재 시뮬레이터의 지원 범위 밖입니다. C 소스를 GCC로 직접 실행해 확인하세요.",trace,records};
     if(first.kind!=="ok"){
       const fields=first.kind==="eof"?"EOF":0;
       lastReturn=String(fields);
       trace.push({attempt,fields,lastReturn,startOffset:readStart,endOffset:first.end,count,sum,average:count?sum/count:null,detail:first.kind==="eof"?"새 입력 전에 파일 끝에 도달: clean EOF":"첫 번째 double 변환 실패: matching failure"});
       if(fields!== "EOF")stderr="Invalid sensor record: 0 field(s) read\n";
       finished=true;break;
     }
     const second=scan(text,first.end);
     if(second.kind==="unsupported")return {supported:false,reason:"유한한 10진수 형식만 시뮬레이션합니다. 이 입력은 GCC에서 직접 검증하세요.",trace,records};
     if(second.kind!=="ok"){
       pos=second.end;
       lastReturn="1";
       stderr="Invalid sensor record: 1 field(s) read\n";
       trace.push({attempt,fields:1,lastReturn,startOffset:readStart,endOffset:first.end,time:first.value,count,sum,average:count?sum/count:null,detail:second.kind==="eof"?"첫 번째 값만 읽은 후 EOF: 부분 변환 (1)":"두 번째 double 변환 실패: 부분 변환 (1)"});
       finished=true;break;
     }
     pos=second.end;lastReturn="2";count++;sum+=second.value;
     const isAlert=second.value>threshold;
     if(isAlert){stdout+="ALERT "+first.value.toFixed(1)+": "+second.value.toFixed(2)+"\n";alerts.push({time:first.value,value:second.value});}
     records.push({time:first.value,value:second.value,alert:isAlert});
     trace.push({attempt,fields:2,lastReturn:"2",startOffset:readStart,endOffset:second.end,time:first.value,value:second.value,count,sum,average:sum/count,alert:isAlert,detail:"2개 변환 성공 → time="+first.value+", value="+second.value+(isAlert?" → ALERT":"")});
   }
   if(!finished)throw Error("Simulation exceeded safety limit.");
   const successful=stderr==="";
   if(successful){
     if(count>0)stdout+="Count = "+count+"\nAverage = "+(sum/count).toFixed(3)+"\n";
     else stdout+="No sensor records\n";
   }
   return {supported:true,successful,exitCode:successful?0:1,stdout,stderr,count,sum,average:count?sum/count:null,
      alerts,records,lastReturn,trace,reason:successful?"정상 EOF 이후 종료":"입력 형식 불일치 또는 레코드 일부만 읽음",
      // Warning: unlike fgets, fscanf treats all whitespace as separators, including newlines.
      caveat:"fscanf의 %lf는 줄바꿈도 공백으로 처리합니다. 한 줄 단위 형식을 강제하지 않습니다."};
 }
 return {sample,cases,simulate};
});
