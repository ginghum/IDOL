import assert from 'node:assert/strict';
import {handle,PROTOCOL} from '../room-server/rooms.mjs';
class Bucket{constructor(){this.map=new Map();this.serial=0;}async get(k){const x=this.map.get(k);return x?{etag:x.etag,json:async()=>JSON.parse(x.value)}:null;}async put(k,value,options={}){const old=this.map.get(k),cond=options.onlyIf;if(cond instanceof Headers){if(cond.get('if-none-match')==='*'&&old)return null;}else if(cond?.etagMatches&&cond.etagMatches!==old?.etag)return null;const etag=String(++this.serial);this.map.set(k,{value,etag});return {etag};}}
const env={BUCKET:new Bucket()},tickets=['e'.repeat(48),'f'.repeat(48)];let serial=0;
async function req(path='',body,seat=0){const r=await handle(new Request('https://test/api/rooms'+path,{method:body?'POST':'GET',headers:{'content-type':'application/json',authorization:'Bearer '+tickets[seat]},...(body?{body:JSON.stringify(body)}:{})}),env);return {status:r.status,...await r.json()};}
const config={team:['miyabi','kono','chie'],leader:'miyabi',events:['miyabi','kono','chie'],first:'0'};
async function create(){const m=await req('',{ticket:tickets[0],config,protocol:PROTOCOL,flow:'selection'}),c=m.code;await req('/'+c+'/join',{ticket:tickets[1],config,protocol:PROTOCOL},1);await req('/'+c+'/prepare',{round:1,config});await req('/'+c+'/prepare',{round:1,config},1);await req('/'+c+'/ready',{});await req('/'+c+'/ready',{},1);return c;}
async function action(code,a,seat=0){const d=await req('/'+code,undefined,seat);return req('/'+code+'/action',{rev:d.rev,requestId:'yugen-'+String(++serial).padStart(8,'0'),action:a},seat);}
function patch(code,fn){const [key,obj]=[...env.BUCKET.map.entries()].find(([,v])=>JSON.parse(v.value).code===code),r=JSON.parse(obj.value);fn(r);env.BUCKET.map.set(key,{...obj,value:JSON.stringify(r)});}
for(const seat of [0,1]){
 const code=await create(),other=1-seat;
 // Fixture storage setup reaches pre-defeat boundary without adding a production debug route.
 patch(code,r=>{const s=r.state,p=s.players[seat],q=s.players[other];s.active=other;s.pending=null;s.queue=[];q.fanChips=19;const f=s.audience.shift();f.type='light';q.fans.push(f);const cards=[...p.hand,...p.deck].filter(c=>c.owner==='chie').slice(0,3),ids=new Set(cards.map(c=>c.uid));p.hand=p.hand.filter(c=>!ids.has(c.uid));p.deck=p.deck.filter(c=>!ids.has(c.uid));p.memory.push(...cards);r.clockMode='turn';r.turnRemaining=99000;r.deadline=Date.now()+99000;});
 const started=await action(code,{type:'service',actor:0},other);assert.equal(started.status,200);assert.equal(started.state.winner,null);assert.equal(started.clockMode,'choice');assert.equal(started.clockOwner,1);assert.deepEqual(started.state.pending.options,[]);assert.deepEqual(started.state.pending.selected,[]);
 let own=await req('/'+code,undefined,seat);assert.equal(own.state.pending.kind,'chiePayment');assert.equal(own.state.pending.p,0);assert.equal(own.state.pending.options.length,3);assert.equal(own.clockOwner,0);assert(own.turnRemaining>90000);const turn=own.state.turn,rev=own.rev;
 const rejected=await action(code,{type:'choose',value:own.state.pending.options[0]},other);assert.equal(rejected.status,400);assert.equal((await req('/'+code,undefined,seat)).rev,rev);
 // Every opponent-choice timeout spends just the next selected memory, with no unpaid rescue or skipped turn.
 for(let n=0;n<3;n++){
  patch(code,r=>r.deadline=Date.now()-1);own=await req('/'+code,undefined,seat);assert.equal(own.status,200);
  if(n<2){assert.equal(own.state.winner,null);assert.equal(own.state.turn,turn);assert.equal(own.state.pending.selected.length,n+1);assert.equal(own.clockMode,'choice');const hidden=await req('/'+code,undefined,other);assert.deepEqual(hidden.state.pending.options,[]);assert.deepEqual(hidden.state.pending.selected,[]);}
 }
 assert.equal(own.state.turn,turn+1);assert.equal(own.state.active,0);assert.equal(own.state.winner,null);assert.equal(own.state.pending,null);assert.equal(own.state.players[0].discard.filter(c=>c.owner==='chie').length,3);assert(own.state.players[0].events.find(e=>e.id==='chie').used);assert.equal(own.state.players[1].fanChips,19);assert.equal(own.state.players[1].fans.length,0);assert(own.turnRemaining>90000);
 await req('/'+code+'/leave',{});await req('/'+code+'/leave',{},1);
}
console.log('Yugen room API: both-seat inactive pre-defeat rescue, mandatory payment, hidden choices, authority/revision and three choice timeouts advance exactly one turn passed');
