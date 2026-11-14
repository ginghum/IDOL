import assert from 'node:assert/strict';
import {handle,PROTOCOL} from '../room-server/rooms.mjs';
class Bucket{constructor(){this.map=new Map();this.serial=0;}async get(k){const x=this.map.get(k);return x?{etag:x.etag,json:async()=>JSON.parse(x.value)}:null;}async put(k,value,options={}){const old=this.map.get(k),cond=options.onlyIf;if(cond instanceof Headers){if(cond.get('if-none-match')==='*'&&old)return null;}else if(cond?.etagMatches&&cond.etagMatches!==old?.etag)return null;const etag=String(++this.serial);this.map.set(k,{value,etag});return {etag};}}
const env={BUCKET:new Bucket()},tickets=['a'.repeat(48),'b'.repeat(48)],config={team:['mimizuku','fukurou','hakka'],leader:'mimizuku',events:['mimizuku','mc','switch'],first:'0'};
async function req(path='',body,seat=0){const r=await handle(new Request('https://test/api/rooms'+path,{method:body?'POST':'GET',headers:{'content-type':'application/json',authorization:'Bearer '+tickets[seat]},...(body?{body:JSON.stringify(body)}:{})}),env);return {status:r.status,...await r.json()};}
assert.equal((await req('',{ticket:tickets[0],config:{...config,timeLimit:'off'},protocol:PROTOCOL})).status,400);
const legacy=await req('',{ticket:tickets[0],config,protocol:PROTOCOL});assert.equal(legacy.timeLimit,true);
const legacyKey='rooms/'+legacy.code+'.json',old=JSON.parse(env.BUCKET.map.get(legacyKey).value);delete old.timeLimit;await env.BUCKET.put(legacyKey,JSON.stringify(old));assert.equal((await req('/'+legacy.code)).timeLimit,true);
const made=await req('',{ticket:tickets[0],config:{...config,timeLimit:false},protocol:PROTOCOL,flow:'selection'}),code=made.code;
assert.equal(made.timeLimit,false);assert.equal(made.isHost,true);assert.equal(made.settingsLocked,false);
let d=await req('/'+code+'/join',{ticket:tickets[1],config,protocol:PROTOCOL},1);assert.equal(d.timeLimit,false);assert.equal(d.configLocal.timeLimit,false);assert.equal(d.isHost,false);
assert.equal((await req('/'+code+'/settings',{timeLimit:true},1)).status,403);
assert.equal((await req('/'+code+'/settings',{timeLimit:0})).status,400);
assert.equal((await req('/'+code+'/settings',{timeLimit:true})).timeLimit,true);
assert.equal((await req('/'+code,undefined,1)).timeLimit,true);
assert.equal((await req('/'+code+'/settings',{timeLimit:false})).timeLimit,false);
d=await req('/'+code+'/prepare',{round:1,config});assert.equal(d.settingsLocked,true);assert.equal(d.timeLimit,false);
assert.equal((await req('/'+code+'/settings',{timeLimit:true})).status,409);
d=await req('/'+code+'/prepare',{round:1,config},1);assert.equal(d.phase,'opening');assert.equal(d.timeLimit,false);
assert.equal((await req('/'+code+'/settings',{timeLimit:true})).status,409);
await req('/'+code+'/ready',{});d=await req('/'+code+'/ready',{},1);assert.equal(d.phase,'playing');assert.equal(d.deadline,0);assert.equal(d.clockMode,'disabled');assert.equal(d.turnRemaining,0);
assert.equal((await req('/'+code+'/settings',{timeLimit:true})).status,409);
const realNow=Date.now;let clock=realNow();Date.now=()=>clock;
let serial=0;
async function action(a,seat=0){const v=await req('/'+code,undefined,seat);const x=await req('/'+code+'/action',{rev:v.rev,requestId:'time-limit-'+String(++serial).padStart(8,'0'),action:a},seat);assert.equal(x.status,200,x.error);assert.equal(x.deadline,0);return x;}
try{
 const before=await req('/'+code);clock+=300000;d=await req('/'+code);assert.equal(d.rev,before.rev);assert.equal(d.state.turn,before.state.turn);
 await action({type:'service',actor:0});await action({type:'service',actor:1});await action({type:'end'});d=await action({type:'choose',value:'use'});assert.equal(d.clockMode,'disabled');
 const opponent=await req('/'+code,undefined,1),target=opponent.state.pending.options[0];assert(target);assert.equal(opponent.state.pending.p,0);
 clock+=300000;d=await req('/'+code,undefined,1);assert.equal(d.rev,opponent.rev);assert.equal(d.state.pending.kind,opponent.state.pending.kind);assert.equal(d.deadline,0);
 d=await action({type:'choose',value:target},1);assert.equal(d.state.pending,null);assert.equal(d.clockMode,'disabled');
 await action({type:'end'},1);assert.equal((await req('/'+code)).state.active,0);
 // A finished room can change its next-round setting before confirmation.
 const key='rooms/'+code+'.json',r=JSON.parse(env.BUCKET.map.get(key).value);r.state.winner=0;r.phase='ended';r.clockMode='ended';await env.BUCKET.put(key,JSON.stringify(r));
 d=await req('/'+code+'/settings',{timeLimit:true});assert.equal(d.timeLimit,true);assert.equal(d.settingsLocked,false);
 await req('/'+code+'/rematch',{round:1,config});await req('/'+code+'/rematch',{round:1,config},1);await req('/'+code+'/ready',{});d=await req('/'+code+'/ready',{},1);assert.equal(d.clockMode,'turn');assert.equal(d.deadline-d.now,99000);
 // Existing ON countdown still expires exactly once and advances the turn.
 const turn=d.state.turn;clock=d.deadline+1;d=await req('/'+code);assert.equal(d.state.turn,turn+1);assert.equal(d.deadline-d.now,99000);
}finally{Date.now=realNow;}
console.log('Optional time limit: default/legacy ON, authority, synchronized/locked settings, OFF long turn and opponent choice, manual play and rematch ON expiry passed');
