/* Optional robust Sensor Log learning model. Browser simulation only, not GCC.
   Supports finite decimal/exponent tokens, strict record-by-line validation. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.RobustSensorModel=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const numberPattern=/^[+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)$/;
 function simulate(text,threshold=3.0){
   if(typeof text!=="string"||text.length>20000)throw Error("Maximum input length is 20,000 characters.");
   if(!Number.isFinite(threshold))throw Error("Finite threshold required.");
   const lines=text.split("\n");
   if(text.endsWith("\n"))lines.pop();
   let count=0,sum=0,stdout="",stderr="",records=[],trace=[];
   let exitCode=0;
   for(let i=0;i<lines.length;i++){
     const raw=lines[i].replace(/\r$/,"");
     const line=i+1;
     // Match the C example's conservative 255-character fgets buffer boundary.
     if(raw.length>=255){
       stderr="Line "+line+" too long\n";exitCode=1;
       trace.push({line,kind:"long",detail:"fgets buffer limit: line exceeds 254 chars",count,sum});break;
     }
     const pieces=raw.trim().split(/[\t\v\f\r ]+/);
     if(pieces.length!==2||!pieces.every(p=>numberPattern.test(p)&&Number.isFinite(Number(p)))){
       stderr="Invalid record at line "+line+"\n";exitCode=1;
       trace.push({line,kind:"invalid",detail:"한 행에 유한한 숫자 두 개가 필요합니다",count,sum});break;
     }
     const time=Number(pieces[0]),value=Number(pieces[1]);
     if(!Number.isFinite(sum+value)){
       stderr="Sum overflow at line "+line+"\n";exitCode=1;
       trace.push({line,kind:"overflow",detail:"누적 합계가 유한한 double 범위를 벗어났습니다",count,sum});break;
     }
     sum+=value;count++;
     const alert=value>threshold;
     if(alert)stdout+="ALERT "+time.toFixed(1)+": "+value.toFixed(2)+"\n";
     records.push({time,value,alert});
     trace.push({line,kind:"ok",detail:"line "+line+": time="+time+", value="+value,numberFields:2,count,sum,average:sum/count,alert});
   }
   if(exitCode===0){
     if(count)stdout+="Count = "+count+"\nAverage = "+(sum/count).toFixed(3)+"\n";
     else stdout+="No sensor records\n";
     trace.push({line:lines.length+1,kind:"eof",detail:"fgets returned NULL; ferror=0, clean EOF",count,sum,average:count?sum/count:null});
   }
   return {supported:true,successful:exitCode===0,exitCode,stdout,stderr,count,sum,average:count?sum/count:null,records,
    alerts:records.filter(x=>x.alert),trace,reason:exitCode?"한 줄의 형식 또는 길이를 검증하지 못했습니다":"정상 EOF"};
 }
 return {simulate};
});
