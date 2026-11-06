import assert from 'node:assert/strict';
import {handle,PROTOCOL} from './rooms.mjs';
class Bucket{
 constructor(){this.map=new Map();this.serial=0;}
 async get(k){const x=this.map.get(k);return x?{etag:x.etag,json:async()=>JSON.parse(x.value)}:null;}
 async put(k,value,options={}){const old=this.map.get(k),cond=options.onlyIf;if(cond instanceof Headers){if(cond.get('if-none-match')==='*'&&old)return null;}else if(cond?.etagMatches&&cond.etagMatches!==old?.etag)return null;const etag=String(++this.serial);this.map.set(k,{value,etag});return {etag};}
}
const bucket=new Bucket(),env={BUCKET:bucket},host='h'.repeat(48),guest='g'.repeat(48),other='o'.repeat(48);
const config={team:['kayo','haru','homura'],leader:'homura',events:['kayo','haru','homura'],first:'0'};
async function req(path='',data,token=host){const response=await handle(new Request('https://test/api/rooms'+path,{method:data?'POST':'GET',headers:{'content-type':'application/json',authorization:'Bearer '+token},...(data?{body:JSON.stringify(data)}:{})}),env);return {status:response.status,data:await response.json(),headers:response.headers};}
const a=await req('',{ticket:host,config,protocol:PROTOCOL});assert.equal(a.status,200);assert.match(a.data.code,/^\d{4}$/);assert.equal(a.data.phase,'waiting');assert(!JSON.stringify(a.data).includes(host));const code=a.data.code;
assert.equal((await req('/'+code,undefined,other)).status,403);assert.equal((await req('/0000',undefined,other)).status,404);
const b=await req('/'+code+'/join',{ticket:guest,config,protocol:PROTOCOL},guest);assert.equal(b.status,200);assert.equal(b.data.phase,'opening');assert(b.data.state.players[1].hand.every(c=>!c.owner));assert(b.data.state.players.every(p=>p.deck.every(c=>!c.owner)));assert(!JSON.stringify(b.data).includes(host));
assert.equal((await req('/'+code+'/join',{ticket:other,config,protocol:PROTOCOL},other)).status,409);
assert.equal((await req('/'+code+'/join',{ticket:guest,config,protocol:PROTOCOL},guest)).status,200,'Retry join restores same seat');
await req('/'+code+'/ready',{});let live=await req('/'+code+'/ready',{},guest);assert.equal(live.data.phase,'playing');assert(live.data.deadline>Date.now());const deadline=live.data.deadline;
let v=await req('/'+code);assert.equal(v.data.state.active,0);const rev=v.data.rev;
const wrong=await req('/'+code+'/action',{rev,requestId:'guest-wrong-turn',action:{type:'service',actor:0}},guest);assert.equal(wrong.status,400);
const action={rev,requestId:'host-service-once',action:{type:'service',actor:0}};
const played=await req('/'+code+'/action',action);assert.equal(played.status,200);assert.equal(played.data.state.players[0].service,1);assert.equal(played.data.deadline,deadline,'Actions do not extend clock');
const retry=await req('/'+code+'/action',action);assert.equal(retry.status,200);assert.equal(retry.data.rev,played.data.rev);assert.equal(retry.data.state.players[0].service,1,'Lost response retries do not duplicate action');
const stale=await req('/'+code+'/action',{...action,requestId:'stale-service-once'});assert.equal(stale.status,409);assert(stale.data.state,'Conflict carries fresh board');
const nextRev=played.data.rev;
const race=await Promise.all([req('/'+code+'/action',{rev:nextRev,requestId:'concurrent-action-a',action:{type:'service',actor:1}}),req('/'+code+'/action',{rev:nextRev,requestId:'concurrent-action-b',action:{type:'service',actor:2}})]);assert.deepEqual(race.map(x=>x.status).sort(),[200,409]);
v=await req('/'+code);assert.equal(v.data.state.players[0].service,2);
// The guest's board remaps self to zero, and resumes with the same secret ticket.
const resumed=await req('/'+code,undefined,guest);assert.equal(resumed.status,200);assert.equal(resumed.data.state.active,1);assert.equal(resumed.data.state.players[1].service,2);
const real=Date.now;try{Date.now=()=>deadline+1;const timed=await req('/'+code,undefined,guest);assert.equal(timed.data.state.active,0);assert.equal(timed.data.state.turn,2);assert(timed.data.deadline>deadline);const again=await req('/'+code,undefined,guest);assert.equal(again.data.rev,timed.data.rev,'Repeated resume does not double-timeout');}finally{Date.now=real;}
const leave=await req('/'+code+'/leave',{},guest);assert.equal(leave.data.phase,'ended');assert.equal(leave.data.state.winner,1);assert.equal((await req('/'+code)).data.state.winner,0);
assert.equal((await handle(new Request('https://test/api/rooms',{method:'OPTIONS'}),env)).headers.get('access-control-allow-origin'),'*');
console.log('Room API: four digits, seat privacy, join race, readiness, turn authority, CAS, idempotence, stale requests, timeout and resume passed');
