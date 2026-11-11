import assert from 'node:assert/strict';
import {handle,PROTOCOL} from '../room-server/rooms.mjs';
class Bucket{constructor(){this.map=new Map();this.serial=0;}async get(k){const x=this.map.get(k);return x?{etag:x.etag,json:async()=>JSON.parse(x.value)}:null;}async put(k,value,options={}){const old=this.map.get(k),cond=options.onlyIf;if(cond instanceof Headers){if(cond.get('if-none-match')==='*'&&old)return null;}else if(cond?.etagMatches&&cond.etagMatches!==old?.etag)return null;const etag=String(++this.serial);this.map.set(k,{value,etag});return {etag};}}
const env={BUCKET:new Bucket()},tickets=['a'.repeat(48),'b'.repeat(48)],config={team:['mimizuku','fukurou','hakka'],leader:'mimizuku',events:['mimizuku','mc','switch'],first:'0'};
async function req(path='',body,seat=0){const r=await handle(new Request('https://test/api/rooms'+path,{method:body?'POST':'GET',headers:{'content-type':'application/json',authorization:'Bearer '+tickets[seat]},...(body?{body:JSON.stringify(body)}:{})}),env);return {status:r.status,...await r.json()};}
const made=await req('',{ticket:tickets[0],config,protocol:PROTOCOL,flow:'selection'}),code=made.code;
assert.equal(made.phase,'waiting');assert.equal(made.state,null);await req('/'+code+'/join',{ticket:tickets[1],config,protocol:PROTOCOL,flow:'selection'},1);await req('/'+code+'/prepare',{round:1,config});await req('/'+code+'/prepare',{round:1,config},1);await req('/'+code+'/ready',{});let live=await req('/'+code+'/ready',{},1);assert.equal(live.phase,'playing');

assert.equal(live.state.players[0].vol,20);assert.equal(live.state.players[0].hand.length,5);
let serial=0;
async function action(a,seat=0){const d=await req('/'+code,undefined,seat);return req('/'+code+'/action',{rev:d.rev,requestId:'mimi-action-'+String(++serial).padStart(6,'0'),action:a},seat);}
for(const seat of [0,1]){
 for(const actor of [0,1])assert.equal((await action({type:'service',actor},seat)).status,200);
 const d=await action({type:'support',effect:'discard'},seat);assert.equal(d.status,200);assert.equal(d.state.players[0].chips,0);assert.equal(d.state.pending.p,1);assert.deepEqual(d.state.pending.options,[]);assert.equal(d.clockMode,'choice');assert(d.state.players[1].hand.every(c=>!c.owner));
 const opponent=await req('/'+code,undefined,1-seat),target=opponent.state.players[0].hand[0].uid;assert.equal(opponent.state.pending.p,0);assert(opponent.state.pending.options.includes(target));assert.equal(opponent.turnRemaining,d.turnRemaining);
 const before=d.rev;assert.equal((await action({type:'choose',value:target},seat)).status,400);assert.equal((await req('/'+code)).rev,before);
 const chosen=await action({type:'choose',value:target},1-seat);assert.equal(chosen.status,200);assert.equal(chosen.state.pending,null);assert.equal(chosen.clockMode,'turn');assert(chosen.state.players[0].discard.some(c=>c.uid===target));assert.equal(chosen.state.active,1);assert.deepEqual(chosen.state.players[0].ready,opponent.state.players[0].ready,'Opponent choice consumes no idol action');
 const end=await action({type:'end'},seat);assert.equal(end.status,200);
}
await req('/'+code+'/leave',{});await req('/'+code+'/leave',{},1);
console.log('Mimizuku room API: both-seat opponent discard choices, hidden options, no-action choice, paused/resumed turn clock, authority/revision and cleanup passed');
