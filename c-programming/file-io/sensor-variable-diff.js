/* Student-facing variable transitions from consecutive C-statement snapshots.
   Labels distinguish changes of stored values from assigning an equal value. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.SensorVariableDiff=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const base=Object.freeze({
  fields:"—", time:null,value:null,sum:0,count:0,runningMean:null,
  alert:false,exitCode:null,stdout:"",stderr:""
 });
 const keys=["fields","time","value","sum","count","runningMean","alert","exitCode"];
 const format=(key,v)=>{
  if(v===null || v===undefined)return "미정";
  if(key==="fields")return String(v);
  if(["time","value","sum","runningMean"].includes(key))return Number(v).toFixed(3);
  if(key==="alert")return v?"YES":"NO";
  return String(v);
 };
 function changedAtRead(snapshot,key){
  if(snapshot.key!=="read"||!snapshot.read)return false;
  if(key==="fields")return true;
  const fields=snapshot.read.fields;
  return (key==="time" && typeof fields==="number" && fields>=1)||
    (key==="value" && typeof fields==="number" && fields===2);
 }
 function diff(previous,snapshot){
  if(!snapshot||!snapshot.state)throw Error("A valid code snapshot is required.");
  const prev=previous||base,now=snapshot.state;
  return keys.map(key=>{
   const before=prev[key],after=now[key];
   const changed=!Object.is(before,after);
   const assigned=changedAtRead(snapshot,key);
   const derived=key==="runningMean"||key==="alert";
   let status=changed?"changed":assigned?"reassigned":"unchanged";
   if(derived && !changed)status="unchanged";
   let note=changed?"값 변경":assigned?"재대입 · 값 동일":"변화 없음";
   if(derived)note=changed?"참고 표시 변경":"참고 표시 유지";
   return {key,before:format(key,before),after:format(key,after),changed,assigned,derived,status,note};
  });
 }
 return {base,format,diff};
});
