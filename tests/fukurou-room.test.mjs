import assert from 'node:assert/strict';
import {IDOL as G} from '../room-server/idol-engine.mjs';
import {handle,PROTOCOL} from '../room-server/rooms.mjs';
class Bucket{constructor(){this.map=new Map();this.serial=0;}async get(k){const x=this.map.get(k);return x?{etag:x.etag,json:async()=>JSON.parse(x.value)}:null;}async put(k,value,options={}){const old=this.map.get(k),cond=options.onlyIf;if(cond instanceof Headers){if(cond.get('if-none-match')==='*'&&old)return null;}else if(cond?.etagMatches&&cond.etagMatches!==old?.etag)return null;const etag=String(++this.serial);this.map.set(k,{value,etag});return {etag};}}
const env={BUCKET:new Bucket()},tickets=['a'.repeat(48),'b'.repeat(48)],config={team:['fukurou','nina','hakka'],leader:'fukurou',events:['fukurou','nina','hakka'],first:'0'};
async function req(path='',body,seat=0){const r=await handle(new Request('https://test/api/rooms'+path,{method:body?'POST':'GET',headers:{'content-type':'application/json',authorization:'Bearer '+tickets[seat]},...(body?{body:JSON.stringify(body)}:{})}),env);return {status:r.status,...await r.json()};}
const made=await req('',{ticket:tickets[0],config,protocol:PROTOCOL,flow:'selection'}),code=made.code;
assert.equal(made.phase,'waiting');assert.equal(made.state,null);await req('/'+code+'/join',{ticket:tickets[1],config,protocol:PROTOCOL,flow:'selection'},1);await req('/'+code+'/prepare',{round:1,config});await req('/'+code+'/prepare',{round:1,config},1);await req('/'+code+'/ready',{});let live=await req('/'+code+'/ready',{},1);assert.equal(live.phase,'playing');

assert.equal(live.state.players[0].vol,20);assert.equal(live.state.players[0].hand.length,5);
let serial=0,seals=0,destroys=0;
for(let step=0;step<1000;step++){
 const raw=await req('/'+code),seat=(raw.state.pending?.p??raw.state.active),view=await req('/'+code,undefined,seat);if(view.state.winner!==null)break;
 const s=view.state,a=G.ai(s);
 if(G.supportSealed(s,0)){
  seals++;assert(!['support','service'].includes(a.type));const before=view.rev;
  const rejected=await req('/'+code+'/action',{rev:before,requestId:'blocked-'+String(++serial).padStart(6,'0'),action:{type:'support',effect:'draw'}},seat);assert.equal(rejected.status,400);assert.equal((await req('/'+code,undefined,seat)).rev,before);
 }
 const result=await req('/'+code+'/action',{rev:view.rev,requestId:'fukurou-'+String(++serial).padStart(6,'0'),action:a},seat);assert.equal(result.status,200,JSON.stringify(result));assert(!('seed'in result.state));assert(result.state.players[1].hand.every(c=>!c.owner));if(result.state.log.some(x=>x.includes('相手の')&&x.includes('1枚を破壊')))destroys++;
 if(result.state.winner!==null)break;
}
const result=await req('/'+code);assert.notEqual(result.state.winner,null);assert(seals>0);assert(destroys>0);
await req('/'+code+'/leave',{});await req('/'+code+'/leave',{},1);
console.log('Fukurou room API: accepted Extra/initial values, full match from public commands, both-seat privacy, seal rejection without revision change and cleanup passed');
