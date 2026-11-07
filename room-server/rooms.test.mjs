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
assert.equal((await req('/'+code,undefined,other)).status,403);assert.equal((await req('/'+(code==='0000'?'0001':'0000'),undefined,other)).status,404);
const b=await req('/'+code+'/join',{ticket:guest,config,protocol:PROTOCOL},guest);assert.equal(b.status,200);assert.equal(b.data.phase,'opening');assert(b.data.state.players[1].hand.every(c=>!c.owner));assert(b.data.state.players.every(p=>p.deck.every(c=>!c.owner)));assert(!JSON.stringify(b.data).includes(host));
assert.equal((await req('/'+code+'/join',{ticket:other,config,protocol:PROTOCOL},other)).status,409);
assert.equal((await req('/'+code+'/join',{ticket:guest,config,protocol:PROTOCOL},guest)).status,200,'Retry join restores same seat');
await req('/'+code+'/ready',{});let live=await req('/'+code+'/ready',{},guest);assert.equal(live.data.phase,'playing');assert(live.data.deadline>Date.now());const deadline=live.data.deadline;assert.equal(deadline-live.data.now,99000);
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

// Opponent decisions pause the active turn and have their own 30-second deadline.
const cc={team:['machi','kayo','hana'],leader:'kayo',events:['machi','kayo','hana'],first:'0'};
const made=await req('',{ticket:host,config:cc,protocol:PROTOCOL}),room=made.data.code;
await req('/'+room+'/join',{ticket:guest,config:cc,protocol:PROTOCOL},guest);
await req('/'+room+'/ready',{});await req('/'+room+'/ready',{},guest);
const key='rooms/'+room+'.json',originalNow=Date.now;let clock=originalNow();Date.now=()=>clock;
try{
 const record=JSON.parse(bucket.map.get(key).value),s=record.state,p=s.players[0],q=s.players[1];
 let song=p.hand.find(c=>c.owner==='machi'&&c.n===1);if(!song){const at=p.deck.findIndex(c=>c.owner==='machi'&&c.n===1);song=p.deck.splice(at,1)[0];p.hand.push(song);}p.vol=60;s.row[0].type='light';q.fans.push(...s.audience.splice(0,2));
 record.deadline=clock+79000;record.clockMode='turn';record.turnRemaining=99000;
 const fixture=JSON.stringify(record);bucket.map.get(key).value=fixture;
 const use=()=>req('/'+room+'/action',{rev:record.rev,requestId:'machi-opponent-choice',action:{type:'play',card:song.uid,actors:[0],mode:'fan'}});
 let paused=await use();assert.equal(paused.status,200);assert.equal(paused.data.clockMode,'choice');assert.equal(paused.data.turnRemaining,79000);assert.equal(paused.data.deadline-clock,30000);assert.equal(paused.data.clockOwner,1);
 const guestChoice=await req('/'+room,undefined,guest);assert.equal(guestChoice.data.clockOwner,0);assert.equal(guestChoice.data.state.pending.p,0);
 clock+=15000;const selected=await req('/'+room+'/action',{rev:paused.data.rev,requestId:'guest-selects-before-time',action:{type:'choose',value:guestChoice.data.state.pending.options[1]}},guest);
 assert.equal(selected.status,200);assert.equal(selected.data.clockMode,'turn');assert.equal(selected.data.deadline-clock,79000);assert.equal(selected.data.state.turn,1,'Choosing does not consume the active turn');
 // Reset the same legal fixture, then allow the guest's decision to expire.
 clock=record.deadline-79000;bucket.map.get(key).value=fixture;paused=await use();const first=guestChoice.data.state.pending.options[0];clock=paused.data.deadline-1;
 assert.equal((await req('/'+room)).data.clockMode,'choice');clock++;
 const automatic=await req('/'+room);assert.equal(automatic.data.clockMode,'turn');assert.equal(automatic.data.state.turn,1);assert.equal(automatic.data.deadline-clock,79000);assert(!automatic.data.state.players[1].fans.some(f=>f.uid===first),'Timeout chooses the first option');
 clock=automatic.data.deadline;const turnEnded=await req('/'+room);assert.equal(turnEnded.data.state.turn,2);assert.equal(turnEnded.data.deadline-clock,99000);
 // A normal decision gives both seats results and requires mutual rematch consent.
 const ended=JSON.parse(bucket.map.get(key).value);ended.state.winner=0;ended.phase='ended';ended.clockMode='ended';ended.deadline=0;ended.rev++;bucket.map.get(key).value=JSON.stringify(ended);
 assert.equal((await req('/'+room)).data.state.winner,0);assert.equal((await req('/'+room,undefined,guest)).data.state.winner,1);
 const hostNext={team:['rai','hana','shio'],leader:'rai',events:['rai','wit','mc']},guestNext={team:['haru','hakka','homura'],leader:'hakka',events:['haru','hakka','overcome']};
 assert.equal((await req('/'+room+'/rematch',{round:1,config:{...hostNext,team:['rai','rai','shio']}})).status,400);
 assert.equal((await req('/'+room)).data.rematchLocal,false,'Invalid config does not confirm readiness');
 const one=await req('/'+room+'/rematch',{round:1,config:hostNext});assert.equal(one.data.phase,'ended');assert.equal(one.data.rematchLocal,true);
 const waitingGuest=(await req('/'+room,undefined,guest)).data;assert.equal(waitingGuest.rematchOther,true);
 assert(!JSON.stringify(waitingGuest.configLocal).includes('wit'),'Only your own next config is returned');
 assert.deepEqual(one.data.configLocal.team,hostNext.team);
 const retried=await req('/'+room+'/rematch',{round:1,config:guestNext});assert.deepEqual(retried.data.configLocal.team,hostNext.team,'Lost-response retry cannot replace a locked config');
 const two=await req('/'+room+'/rematch',{round:1,config:guestNext},guest);assert.equal(two.data.phase,'opening');assert.equal(two.data.round,2);assert.equal(two.data.state.first,0,'Guest is first after swapping sides');assert.equal(two.data.state.turn,1);assert.equal(two.data.state.winner,null);assert.equal(two.data.deadline,0);assert.deepEqual(two.data.ready,[false,false]);assert(two.data.state.players.every(p=>p.memory.length===0&&p.fans.length===0));
 assert.deepEqual(two.data.state.players[0].team,guestNext.team);assert.equal(two.data.state.players[0].leader,guestNext.leader);assert.deepEqual(two.data.state.players[0].events.map(e=>e.id),guestNext.events);assert.deepEqual(two.data.state.players[1].team,hostNext.team);assert(two.data.state.players[1].events.every(e=>!e.id),'Opponent events stay private');
 assert.deepEqual((await req('/'+room)).data.configLocal.events,hostNext.events,'Reconnection restores confirmed lineup');
 assert.equal((await req('/'+room+'/rematch',{round:1},guest)).data.round,2,'Retry cannot start an extra match');
 await req('/'+room+'/ready',{});const restarted=await req('/'+room+'/ready',{},guest);assert.equal(restarted.data.deadline-clock,99000);
 await req('/'+room+'/leave',{},guest);assert.equal((await req('/'+room)).data.opponentLeft,true);assert.equal((await req('/'+room+'/rematch',{round:2})).status,409);
}finally{Date.now=originalNow;}
console.log('99-second turns, opponent 30-second decisions, paused time restoration, first-option timeout, both result views and mutual idempotent rematches passed');
