function parseCSV(text){
 if(typeof text!=="string"||text.length>100000)throw Error("size");
 const lines=text.replace(/^\uFEFF/,"").trim().split(/\r?\n/);
 if(lines.shift()?.trim()!=="time,value")throw Error("header");
 if(!lines.length||lines.length>2000)throw Error("rows");
 const num=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
 return lines.map((line,i)=>{const cells=line.split(",").map(x=>x.trim());if(cells.length!==2||cells.some(x=>!num.test(x)))throw Error("row "+(i+2));const [time,value]=cells.map(Number);if(!Number.isFinite(time)||!Number.isFinite(value)||Math.abs(time)>1e9||Math.abs(value)>1e9)throw Error("row "+(i+2));return {time,value}});
}
function stats(rows,threshold){if(!rows.length||!Number.isFinite(threshold))throw Error("input");const values=rows.map(r=>r.value);return {min:Math.min(...values),mean:values.reduce((a,b)=>a+b,0)/values.length,max:Math.max(...values),alerts:values.filter(v=>v>threshold).length}}
function sortTrace(input){const a=input.slice(),frames=[{a:a.slice(),pair:[],swap:false,done:false}];for(let i=0;i<a.length-1;i++){for(let j=0;j<a.length-1-i;j++){const swap=a[j]>a[j+1];if(swap)[a[j],a[j+1]]=[a[j+1],a[j]];frames.push({a:a.slice(),pair:[j,j+1],swap,done:false})}}frames.push({a:a.slice(),pair:[],swap:false,done:true});return frames}
function thresholdTests(inclusive){return [29,30,31].map(v=>({value:v,expected:v>30,actual:inclusive?v>=30:v>30}))}
window.AICodingCore={parseCSV,stats,sortTrace,thresholdTests};
