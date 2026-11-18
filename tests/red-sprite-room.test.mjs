import assert from 'node:assert/strict';
import {handle,PROTOCOL} from '../room-server/rooms.mjs';
class Bucket{constructor(){this.map=new Map();this.serial=0;}async get(k){const x=this.map.get(k);return x?{etag:x.etag,json:async()=>JSON.parse(x.value)}:null;}async put(k,value,options={}){const old=this.map.get(k),cond=options.onlyIf;if(cond instanceof Headers){if(cond.get('if-none-match')==='*'&&old)return null;}else if(cond?.etagMatches&&cond.etagMatches!==old?.etag)return null;const etag=String(++this.serial);this.map.set(k,{value,etag});return {etag};}}
const env={BUCKET:new Bucket()},tickets=['c'.repeat(48),'d'.repeat(48)];let serial=0;
async function req(path='',body,seat=0){const r=await handle(new Request('https://test/api/rooms'+path,{method:body?'POST':'GET',headers:{'content-type':'application/json',authorization:'Bearer '+tickets[seat]},...(body?{body:JSON.stringify(body)}:{})}),env);return {status:r.status,...await r.json()};}
async function action(code,a,seat=0){const d=await req('/'+code,undefined,seat);return req('/'+code+'/action',{rev:d.rev,requestId:'redsprite-'+String(++serial).padStart(8,'0'),action:a},seat);}
for(const leader of ['riri','chitose','kokone'])for(const seat of [0,1]){
 const config={team:['riri','chitose','kokone'],leader,events:['riri','chitose','kokone'],first:String(seat)};
 const m=await req('',{ticket:tickets[0],config,protocol:PROTOCOL,flow:'selection'}),code=m.code;assert.equal(m.status,200);assert.equal(m.phase,'waiting');assert.equal(m.state,null);
 assert.equal((await req('/'+code+'/join',{ticket:tickets[1],config,protocol:PROTOCOL},1)).status,200);
 for(const who of [0,1])assert.equal((await req('/'+code+'/prepare',{round:1,config},who)).status,200);
 for(const who of [0,1])assert.equal((await req('/'+code+'/ready',{},who)).status,200);
 let d=await req('/'+code,undefined,seat);assert.equal(d.state.active,0);assert.equal(d.state.players[0].leader,leader);assert(d.state.players[1].hand.every(c=>!c.owner));
 const card=d.state.players[0].hand[0],p=d.state.players[0],own=p.team.indexOf(card.owner),actors=[own,...p.team.map((_,j)=>j).filter(j=>j!==own)].slice(0,card.n);
 const rev=d.rev;assert.equal((await action(code,{type:'play',card:card.uid,actors,mode:'vol'},1-seat)).status,400);assert.equal((await req('/'+code)).rev,rev);
 d=await action(code,{type:'play',card:card.uid,actors,mode:'vol'},seat);assert.equal(d.status,200);assert(d.state.players[0].memory.some(c=>c.uid===card.uid));
 d=await action(code,{type:'end'},seat);assert.equal(d.status,200);
 if(leader==='kokone'&&d.state.pending){assert.equal(d.state.pending.kind,'kokoneSet');const other=await req('/'+code,undefined,1-seat);assert.deepEqual(other.state.pending.options,[]);const staged=d.state.players[0].hand.find(c=>d.state.pending.options.includes(c.uid));if(staged){d=await action(code,{type:'choose',value:staged.uid},seat);assert.equal(d.status,200);assert.equal(d.state.players[0].rehearsal.uid,staged.uid);assert.equal((await req('/'+code,undefined,1-seat)).state.players[1].rehearsal.uid,staged.uid);}else await action(code,{type:'choose',value:'skip'},seat);}
 for(const who of [0,1])assert.equal((await req('/'+code+'/leave',{},who)).status,200);
}
console.log('RedSprite room API: all three leaders, both seats, live selection/readiness/real play, authority/revision, public rehearsal and private staging passed');
