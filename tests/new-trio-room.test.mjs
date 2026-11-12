import assert from 'node:assert/strict';
import {handle,PROTOCOL} from '../room-server/rooms.mjs';
class Bucket{constructor(){this.map=new Map();this.serial=0;}async get(k){const x=this.map.get(k);return x?{etag:x.etag,json:async()=>JSON.parse(x.value)}:null;}async put(k,value,options={}){const old=this.map.get(k),cond=options.onlyIf;if(cond instanceof Headers){if(cond.get('if-none-match')==='*'&&old)return null;}else if(cond?.etagMatches&&cond.etagMatches!==old?.etag)return null;const etag=String(++this.serial);this.map.set(k,{value,etag});return {etag};}}
const env={BUCKET:new Bucket()},tickets=['a'.repeat(48),'b'.repeat(48)];let serial=0;
async function req(path='',body,seat=0){const r=await handle(new Request('https://test/api/rooms'+path,{method:body?'POST':'GET',headers:{'content-type':'application/json',authorization:'Bearer '+tickets[seat]},...(body?{body:JSON.stringify(body)}:{})}),env);return {status:r.status,...await r.json()};}
const config=leader=>({team:['shiro','hibiki','misa'],leader,events:['shiro','hibiki','misa'],first:'0'});
async function create(leader){const c=config(leader),m=await req('',{ticket:tickets[0],config:c,protocol:PROTOCOL,flow:'selection'}),code=m.code;await req('/'+code+'/join',{ticket:tickets[1],config:c,protocol:PROTOCOL},1);await req('/'+code+'/prepare',{round:1,config:c});await req('/'+code+'/prepare',{round:1,config:c},1);await req('/'+code+'/ready',{});await req('/'+code+'/ready',{},1);return code;}
async function action(code,a,seat=0){const d=await req('/'+code,undefined,seat);return req('/'+code+'/action',{rev:d.rev,requestId:'newtrio-'+String(++serial).padStart(8,'0'),action:a},seat);}
const record=code=>[...env.BUCKET.map.entries()].find(([,v])=>JSON.parse(v.value).code===code);
function patch(code,fn){const [key,obj]=record(code),r=JSON.parse(obj.value);fn(r);env.BUCKET.map.set(key,{...obj,value:JSON.stringify(r)});}
const close=async code=>{await req('/'+code+'/leave',{});await req('/'+code+'/leave',{},1);};
for(const seat of [0,1]){
 const c=await create('shiro');let d=await req('/'+c);assert.equal(d.state.pending.kind,'shiroPeek');assert(d.state.pending.cards.length);let hidden=await req('/'+c,undefined,1);assert(!hidden.state.pending.cards);assert.deepEqual(hidden.state.pending.options,[]);
 assert.equal((await action(c,{type:'choose',value:'confirm'},1)).status,400);assert.equal((await action(c,{type:'choose',value:'confirm'})).status,200);
 if(seat===1){await action(c,{type:'end'});await action(c,{type:'choose',value:'confirm'},1);}
 // Pure API real hand play, not state injection, tests the new room notice + generated deck cards.
 d=await req('/'+c,undefined,seat);const card=d.state.players[0].hand.find(x=>x.owner==='shiro')||d.state.players[0].hand[0];
 const actors=Array.from({length:card.n},(_,j)=>j);const own=d.state.players[0].team.indexOf(card.owner);if(!actors.includes(own))actors[0]=own;
 const played=await action(c,{type:'play',card:card.uid,actors,mode:'vol'},seat);assert.equal(played.status,200);let pending=played;while(pending.state.pending?.p===0)pending=await action(c,{type:'choose',value:pending.state.pending.options[0]},seat);
 assert(pending.state.players[1].hand.every(x=>!x.owner));await close(c);
}
// Fixture-level CAS storage injection exercises hard-to-reach timing boundaries without a public debug route.
for(const seat of [0,1]){
 const c=await create('misa');patch(c,r=>{r.state.active=seat;r.state.pending=null;r.state.players[seat].items=[{uid:'drink-test',item:'drinkRed'}];r.state.players[seat].temp=7;r.deadline=Date.now()+99000;});
 const ended=await action(c,{type:'end'},seat);assert.equal(ended.state.pending.kind,'endDrinks');assert.equal(ended.clockMode,'turn');const turn=ended.state.turn,rev=ended.rev;
 assert.equal((await action(c,{type:'choose',value:'drink-test'},1-seat)).status,400);assert.equal((await req('/'+c)).rev,rev);
 patch(c,r=>r.deadline=Date.now()-1);const timed=await req('/'+c,undefined,seat);assert.equal(timed.state.turn,turn+1,'timeout advances exactly one turn');assert.equal(timed.state.active,1);assert.equal(timed.state.players[0].items.length,1,'optional drink is kept');assert.equal(timed.state.players[0].temp,0);
 // New turn still has a full turn clock rather than being expired by the previous player's timeout.
 assert(timed.turnRemaining>90000);await close(c);
}
// Timing out normal action phase also keeps optional drinks without opening another end choice.
{
 const c=await create('misa');patch(c,r=>{r.state.pending=null;r.state.players[0].items=[{uid:'drink-test2',item:'drinkBlue'}];r.deadline=Date.now()-1;});const timed=await req('/'+c);assert.equal(timed.state.active,1);assert.equal(timed.state.players[0].items.length,1);assert.equal(timed.state.pending,null);await close(c);
}
console.log('New trio room API: private initial peeks, both-seat real plays, authority/CAS and optional-drink timeout advancing exactly one turn passed');
