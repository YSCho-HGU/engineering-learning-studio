/* Build pedagogical C statement-level snapshots from the verified
   fscanf sensor model. This does not run student C source code. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.SensorCodeTrace=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const matchers={
  read:'while ((fields = fscanf(fp,',
  sum:'sum += value;',
  count:'count++;',
  condition:'if (value > threshold) {',
  alert:'printf("ALERT %.1f:',
  ferror:'if (ferror(fp)) {',
  invalidCondition:'} else if (fields != EOF) {',
  invalidMessage:'fprintf(stderr, "Invalid sensor record:',
  invalidResult:'result = EXIT_FAILURE;',
  close:'if (fclose(fp) == EOF) {',
  exitCondition:'if (result != EXIT_SUCCESS) {',
  failureReturn:'return result;',
  countCondition:'if (count > 0) {',
  finalCount:'printf("Count = %d',
  finalAverage:'printf("Average = %.3f',
  noRecords:'puts("No sensor records");',
  successReturn:'return EXIT_SUCCESS;'
 };
 function codeLineIndex(source,key){
   const lines=source.split(/\r?\n/);
   const needle=matchers[key];if(!needle)return -1;
   if(key==="invalidResult"){
     const error=lines.findIndex(x=>x.includes(matchers.invalidMessage));
     return error<0?-1:lines.findIndex((s,i)=>i>error&&s.includes(needle));
   }
   return lines.findIndex(line=>line.includes(needle));
 }
 function build(result,threshold=3){
   if(!result||!result.supported||!Array.isArray(result.trace))return [];
   const snapshots=[];
   let st={fields:"—",time:null,value:null,count:0,sum:0,
     runningMean:null,stdout:"",stderr:"",exitCode:null,alert:false};
   function add(key,explain,src){
     snapshots.push({key,explain,read:src||null,
       state:{...st},lineMarker:key});
   }
   for(const event of result.trace){
     // fscanf assigns only the input conversions which have succeeded.
     // A failed conversion leaves that specific C variable unchanged.
     st.fields=event.lastReturn;
     if(event.fields===2){
       st.time=event.time;st.value=event.value;st.alert=false;
       add("read","fscanf가 time_s와 value 두 값을 변환했습니다. while 조건이 참입니다.",event);
       st.sum+=event.value;
       add("sum","sum += value; 수행: sum은 증가하고 count는 아직 그대로입니다.",event);
       st.count++;
       st.runningMean=st.sum/st.count; // derived UI metric, NOT a C variable
       add("count","count++; 수행: count 증가. 현재 평균은 sum/count로 계산한 참고값입니다.",event);
       st.alert=event.value>threshold;
       add("condition","value > threshold 검사 결과: "+(st.alert?"참":"거짓"),event);
       if(st.alert){
         st.stdout+="ALERT "+event.time.toFixed(1)+": "+event.value.toFixed(2)+"\n";
         add("alert","조건이 참이므로 printf()가 경보를 출력합니다.",event);
       }
     }else{
       if(event.fields===1 && event.time!==undefined)st.time=event.time;
       st.alert=false;
       add("read",event.lastReturn==="EOF"?
         "읽기 전에 입력이 끝났습니다. fscanf가 EOF를 반환하며 while 본문은 실행되지 않습니다.":
         event.fields===1?
         "첫 번째 필드만 변환했습니다. time_s가 바뀌고 value는 이전 값 그대로입니다. while 본문은 실행되지 않습니다.":
         "변환에 성공한 값이 없습니다. time_s, value는 이전 값 그대로이며 while 본문은 실행되지 않습니다.",event);
     }
   }
   if(!result.trace.length)return snapshots;
   const finalRead=result.trace[result.trace.length-1];
   add("ferror","교육용 정상 파일 스트림: ferror(fp)는 거짓입니다. (실제 OS 오류는 이 모형에서 재현하지 않습니다.)",finalRead);
   add("invalidCondition","fields != EOF 판단: "+(finalRead.lastReturn!=="EOF"?"참 (입력 형식 불일치)":"거짓 (정상 EOF)"),finalRead);
   if(finalRead.lastReturn!=="EOF"){
     st.stderr="Invalid sensor record: "+finalRead.lastReturn+" field(s) read\n";
     add("invalidMessage","잘못된 입력을 stderr에 출력합니다.",finalRead);
     add("invalidResult","실패 종료 코드를 설정합니다.",finalRead);
   }
   add("close","열린 스트림을 fclose()로 닫습니다. 이 모형은 닫기 성공을 가정합니다.",finalRead);
   add("exitCondition","result != EXIT_SUCCESS 판단: "+(result.exitCode?"참":"거짓"),finalRead);
   if(result.exitCode){
     st.exitCode=1;
     add("failureReturn","오류가 있으므로 평균을 출력하지 않고 실패를 반환합니다.",finalRead);
   }else{
     add("countCondition","count > 0 판단: "+(st.count?"참":"거짓"),finalRead);
     if(st.count){
       st.stdout+="Count = "+st.count+"\n";
       add("finalCount","정상 종료: Count를 출력합니다.",finalRead);
       st.stdout+="Average = "+(st.sum/st.count).toFixed(3)+"\n";
       add("finalAverage","정상 종료: sum/count를 계산해 평균을 출력합니다.",finalRead);
     }else{
       st.stdout+="No sensor records\n";
       add("noRecords","빈 파일: 출력할 측정값이 없습니다.",finalRead);
     }
     st.exitCode=0;
     add("successReturn","프로그램이 정상 종료합니다.",finalRead);
   }
   return snapshots;
 }
 return {build,codeLineIndex,matchers};
});