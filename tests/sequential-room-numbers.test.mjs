import assert from 'node:assert/strict';
import {handle,PROTOCOL} from '../room-server/rooms.mjs';
class Bucket{
 constructor(){this.map=new Map();this.serial=0;}
 async get(k){const x=this.map.get(k);return x?{etag:x.etag,json:async()=>JSON.parse(x.value)}:null;}
 async put(k,value,options={}){const old=this.map.get(k),cond=options.onlyIf;if(cond instanceof Headers){if(cond.get('if-none-match')==='*'&&old)return null;}else if(cond?.etagMatches&&cond.etagMatches!==old?.etag)return null;const etag=String(++this.serial);this.map.set(k,{value,etag});return {etag};}
}
const env={BUCKET:new Bucket()},config={team:['kayo','haru','homura'],leader:'homura',events:['kayo','haru','homura'],first:'0'},host='h'.repeat(48),guest='g'.repeat(48);
async function req(path='',data,token=host){const response=await handle(new Request('https://test/api/rooms'+path,{method:data?'POST':'GET',headers:{'content-type':'application/json',authorization:'Bearer '+token},...(data?{body:JSON.stringify(data)}:{})}),env);return {status:response.status,data:await response.json()};}
const make=()=>req('',{ticket:host,config,protocol:PROTOCOL,flow:'selection'});
assert.equal((await make()).data.code,'0');assert.equal((await make()).data.code,'1');
// Concurrent creators claim unique consecutive IDs despite racing on the same first free slot.
const concurrent=await Promise.all(Array.from({length:10},()=>make()));assert(concurrent.every(r=>r.status===200));assert.deepEqual(concurrent.map(r=>Number(r.data.code)).sort((a,b)=>a-b),[2,3,4,5,6,7,8,9,10,11]);
assert.equal((await req('/0/join',{ticket:guest,config,protocol:PROTOCOL},guest)).status,200);
await req('/1/leave',{});assert.equal((await make()).data.code,'1','Closed waiting rooms release the smallest number');
const expired=env.BUCKET.map.get('rooms/0.json'),record=JSON.parse(expired.value);record.expires=Date.now()-1;expired.value=JSON.stringify(record);
assert.equal((await make()).data.code,'0','Expired rooms can be reused even when storage still contains them');
assert.equal((await req('/0',undefined,guest)).status,403,'Old seat credentials cannot access a replacement room');
for(const invalid of ['-1','abc','1.5','10000'])assert.equal((await req('/'+invalid)).status,400);
// Old, padded room keys remain readable while their existing sessions are active.
const legacy=JSON.parse(env.BUCKET.map.get('rooms/1.json').value);legacy.code='0123';await env.BUCKET.put('rooms/0123.json',JSON.stringify(legacy));assert.equal((await req('/0123')).status,200);
console.log('Room numbering: zero, next free ID, concurrent claims, 10+, closed/expired reuse, old-session isolation and legacy padded sessions passed');
