import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
for(const G of [browser,server]){
 const make=(id,seat=0,third='hakka')=>{const t=[...G.DUETS[id].members,third],s=G.create(t,t[0],t,t[0],seat,323,[id,'overcome','mc'],[id,'overcome','mc']);s.queue=[];s.pending=null;return s;};
 const pay=(s,id)=>{const p=s.players[s.active],owners=[...G.DUETS[id].members];p.memory=owners.flatMap(owner=>Array.from({length:3},(_,n)=>({owner,n:1,uid:'mem-'+owner+'-'+n})));while(p.memory.length<G.DUETS[id].cost[1])p.memory.push({owner:p.team[2],n:1,uid:'extra-memory-'+p.memory.length});return G.autoPay(p,id);};
 const use=(s,id)=>{const a={type:'event',id,memory:pay(s,id)},copy=G.peerAction(s,a,s.active);G.dispatch(s,a);assert.deepEqual(s,copy);};
 const settle=s=>{let n=0;while(s.pending){assert(n++<30);G.dispatch(s,G.ai(s));}};
 for(const seat of [0,1])for(const id of Object.keys(G.DUETS)){
  const s=make(id,seat),p=s.players[seat];const paid=pay(s,id);assert(G.paymentOK(p,id,paid));assert(G.eventOK(s,seat,id));assert.equal(paid.length,G.DUETS[id].cost[1]);
  const [a,b]=G.DUETS[id].members;p.memory=Array.from({length:6},(_,j)=>({owner:a,n:1,uid:'bad'+j}));assert(!G.eventOK(s,seat,id));assert(!G.paymentOK(p,id,p.memory.map(c=>c.uid)));
  p.items=[{item:'meat',uid:'meat1'}];p.memory=[{owner:a,n:1,uid:'a'},...Array.from({length:4},(_,j)=>({owner:'hakka',n:1,uid:'h'+j}))];assert(!G.paymentOK(p,id,[...p.memory.map(c=>c.uid),'meat1']),'one meat cannot cover 3 missing memories');
  p.items.push({item:'meat',uid:'meat2'},{item:'meat',uid:'meat3'});const meatPay=G.autoPay(p,id);assert(G.paymentOK(p,id,meatPay));assert(meatPay.includes('a'));assert(meatPay.filter(x=>x.startsWith('meat')).length===3);
  assert(!G.paymentOK(p,id,[...meatPay.slice(0,5),meatPay[0]]));assert(!G.paymentOK(p,id,meatPay.slice(1)));
  p.items=[];p.ready=[false,false,false];p.service=2;const hand=p.hand.length;
  use(s,id);
  if(id==='tempest'){assert.equal(s.pending.kind,'raiPick');assert.equal(s.pending.count,2);assert.equal(p.fans.length,0);settle(s);assert.equal(p.hand.length,hand+3);}
  if(id==='nightmare'){assert.equal(p.fanChips,3);assert.equal(G.teddyCount(p),3);assert.equal(p.fans.length,0);}
  if(id==='detatoko'){assert.equal(p.hand.length,hand+3);assert.equal(G.ticketCount(p),5);assert.equal(s.lottery.length,15);}
  if(id==='vengeance'){assert.deepEqual(p.ready,[true,true,false]);assert.equal(p.fanChips,4);assert.equal(p.service,2);}
  assert.equal(p.events.find(e=>e.id===id).used,true);assert.equal(p.memory.length,0);assert.equal(p.discard.length,G.DUETS[id].cost[1]);assert(!G.eventOK(s,seat,id));
 }
 for(const seat of [0,1]){
  // Two choices are simultaneous, do not refill or apply acquisition buffs between them.
  const s=make('tempest',seat),p=s.players[seat];s.row=[{uid:'locked',type:'core',lock:1-seat},{uid:'trouble',type:'trouble',lock:null},{uid:'core',type:'core',lock:null},{uid:'light',type:'light',lock:seat},{uid:'cheer',type:'cheer',lock:null}];p.buff=8;p.cardBuff=5;p.eventBuff=2;const hand=p.hand.length;use(s,'tempest');assert(!s.pending.options.includes('locked'));assert(s.pending.options.every(uid=>s.row.some(f=>f.uid===uid)));assert(G.publicView(s,seat).audience.every(f=>f.type===null));
  const snapshot=JSON.stringify(s);assert.throws(()=>G.peerAction(s,{type:'choose',value:'locked'},seat));assert.equal(JSON.stringify(s),snapshot);
  G.dispatch(s,{type:'choose',value:'trouble'});assert.equal(p.fans.length,0);assert.equal(s.row.length,5);assert.equal(p.hand.length,hand);assert.match(s.pending.text,/TEMPEST/);
  G.dispatch(s,{type:'choose',value:'core'});assert.equal(p.fans.length,1);assert.equal(p.fans[0].type,'trouble');assert.equal(p.hand.length,hand+3);assert(s.row.some(f=>f.uid==='locked'));assert.equal(p.buff,8);assert.equal(p.cardBuff,5);assert.equal(p.eventBuff,2);
  // Own locked spectator can be acquired; fewer available cards never pulls replacements or hidden deck cards.
  for(const count of [0,1]){const x=make('tempest',seat),p=x.players[seat];x.row=[{uid:'blocked',type:'core',lock:1-seat},...(count?[{uid:'mine',type:'light',lock:seat}]:[])];const hand=p.hand.length;use(x,'tempest');if(count){assert.deepEqual(x.pending.options,['mine']);G.dispatch(x,{type:'choose',value:'mine'});}assert.equal(p.fans.length,count);assert.equal(p.hand.length,hand+3);}
  const x=make('tempest',seat);use(x,'tempest');G.timeout(x);assert.equal(x.turn,2);assert.equal(x.pending,null);
 }
 // Six memories with both personal requirements met are insufficient after Vengeance tuning.
 {const s=make('vengeance'),p=s.players[0];pay(s,'vengeance');p.memory=p.memory.filter(c=>!c.uid.startsWith('extra-memory'));assert(!G.eventOK(s,0,'vengeance'));assert(!G.paymentOK(p,'vengeance',p.memory.map(c=>c.uid)));const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,{type:'event',id:'vengeance',memory:p.memory.map(c=>c.uid)},0));assert.equal(JSON.stringify(s),before);}
 // Chie can reset any duet through the existing skill; no implicit unlimited reuse.
 const s=make('nightmare',0,'chie'),p=s.players[0];p.leader='chie';p.chips=2;use(s,'nightmare');assert.equal(s.pending.kind,'chieReset');G.dispatch(s,{type:'choose',value:'use'});assert.equal(p.chieResetUsed,true);assert.equal(p.events[0].used,false);
 // Reversed team order readies by member identity, with Hakka follow-up still queued normally.
 const x=make('vengeance'),q=x.players[0];q.team=['hakka','aya','emi'];q.leader='hakka';q.ready=[false,false,false];use(x,'vengeance');assert.deepEqual(q.ready,[false,true,true]);assert.equal(x.pending.kind,'hakkaReady');
}
console.log('Four duet events: both engines/seats, separate memory minima and meat, atomic invalid actions, one use/Chie/Hakka, exact simultaneous locked-safe acquisition, buffs, hidden deck, timeout, draws/items and identity-based ready passed');
