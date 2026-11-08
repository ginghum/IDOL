import assert from 'node:assert/strict';
import {handle,PROTOCOL} from '../room-server/rooms.mjs';
class Bucket{constructor(){this.map=new Map();this.serial=0;}async get(k){const x=this.map.get(k);return x?{etag:x.etag,json:async()=>JSON.parse(x.value)}:null;}async put(k,value,options={}){const old=this.map.get(k),cond=options.onlyIf;if(cond instanceof Headers){if(cond.get('if-none-match')==='*'&&old)return null;}else if(cond?.etagMatches&&cond.etagMatches!==old?.etag)return null;const etag=String(++this.serial);this.map.set(k,{value,etag});return {etag};}}
const env={BUCKET:new Bucket()},tickets=['a'.repeat(48),'b'.repeat(48)],config={team:['ayame','nina','hakka'],leader:'ayame',events:['ayame','mc','switch'],first:'0'};
async function req(path='',body,seat=0){const r=await handle(new Request('https://test/api/rooms'+path,{method:body?'POST':'GET',headers:{'content-type':'application/json',authorization:'Bearer '+tickets[seat]},...(body?{body:JSON.stringify(body)}:{})}),env);return {status:r.status,...await r.json()};}
const made=await req('',{ticket:tickets[0],config,protocol:PROTOCOL,flow:'selection'}),code=made.code;
assert.equal(made.phase,'waiting');assert.equal(made.state,null);await req('/'+code+'/join',{ticket:tickets[1],config,protocol:PROTOCOL,flow:'selection'},1);await req('/'+code+'/prepare',{round:1,config});await req('/'+code+'/prepare',{round:1,config},1);await req('/'+code+'/ready',{});let live=await req('/'+code+'/ready',{},1);assert.equal(live.phase,'playing');
let serial=0;
async function action(a,seat=0){const d=await req('/'+code,undefined,seat);return req('/'+code+'/action',{rev:d.rev,requestId:'ayame-action-'+String(++serial).padStart(6,'0'),action:a},seat);}
let v=await req('/'+code);assert.deepEqual(v.state.lottery,{count:15});assert.equal(v.state.players[0].hand.length,5);assert(v.state.players[1].hand.every(c=>!c.owner));
// Earn one end-of-turn ticket without forging state; use it on next own turn.
await action({type:'service',actor:0});await action({type:'end',ticket:true});await action({type:'end'},1);v=await req('/'+code);const id=v.state.players[0].items.find(c=>c.item==='ticket').uid,deadline=v.deadline;
const bad=await action({type:'ticket',id},1);assert.equal(bad.status,400);
const drawn=await action({type:'ticket',id});assert.equal(drawn.status,200);assert.equal(drawn.deadline,deadline);assert.equal(drawn.state.players[0].items.filter(c=>c.item==='ticket').length,0);assert.match(drawn.move.art,/^lottery-(grand|medium|small|miss|bomb)$/);assert.equal(drawn.move.title,'くじ：'+({grand:'大あたり',medium:'中あたり',small:'小あたり',miss:'ハズレ',bomb:'爆弾'}[drawn.state.lotteryLast.result]));
const other=await req('/'+code,undefined,1);assert.equal(other.state.lotteryLast.result,drawn.state.lotteryLast.result);assert.equal(other.state.lotteryLast.p,1);assert.deepEqual(other.state.lottery,{count:15});assert.equal(other.move.art,drawn.move.art);
const again=await action({type:'ticket',id});assert.equal(again.status,400);assert.equal((await req('/'+code)).rev,drawn.rev);
// Retry of the original accepted request is idempotent, no second draw.
const retry=await req('/'+code+'/action',{rev:drawn.rev-1,requestId:'ayame-action-000005',action:{type:'ticket',id}});assert.equal(retry.status,200);assert.equal(retry.state.lotteryLast.uid,drawn.state.lotteryLast.uid);
await req('/'+code+'/leave',{});await req('/'+code+'/leave',{},1);
console.log('Ayame room API: selection, end-ticket exchange, both-seat hidden lottery/order and public results, turn authority, unchanged clock, consumed-ticket rejection and idempotence passed');
