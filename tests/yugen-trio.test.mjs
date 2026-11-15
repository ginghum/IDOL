import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const src=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const browser=new Function(src.split('const $=s=>')[0]+';return IDOL')();
for(const G of [server,browser]){
 const make=(leader='miyabi',i=0)=>{const t=['miyabi','kono','chie'],o=['shio','aya','natsume'];return i?G.create(o,'shio',t,leader,1,42,o,t):G.create(t,leader,o,'natsume',0,42,t,o);};
 const settle=s=>{let n=0;while(s.pending&&s.winner===null){assert(n++<100);G.dispatch(s,G.ai(s));}};
 const give=(s,i,owner,n)=>{const p=s.players[i];for(const z of ['hand','deck','memory','discard']){const at=p[z].findIndex(c=>c.owner===owner&&c.n===n);if(at>=0){const c=p[z].splice(at,1)[0];p.hand.push(c);return c;}}throw Error('card');};
 const cost=(s,i,id)=>{const p=s.players[i];for(let n=0;n<G.EVENTS[id].cost[1];n++)p.items.push({uid:'pay'+s.serial++,item:'meat'});return G.autoPay(p,id);};
 const bad=(s,a,i=s.pending?.p??s.active)=>{const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,a,i));assert.equal(JSON.stringify(s),before);};
 for(const i of [0,1])for(const id of ['miyabi','kono','chie']){
  const s=make(id,i),p=s.players[i];assert.equal(p.vol,G.CHAR[id].vol);assert.equal(p.hand.length,G.CHAR[id].hand);assert.equal(p.hand.length+p.deck.length,27);assert.equal(new Set(p.hand.concat(p.deck).map(c=>c.uid)).size,27);assert.equal(G.cashCount(p),id==='kono'?2:0);
 }
 for(const i of [0,1])for(const owner of ['miyabi','kono','chie'])for(const n of [1,2,3])for(const mode of ['vol','fan']){
  const s=make('miyabi',i),p=s.players[i],q=s.players[1-i];const c=give(s,i,owner,n);p.vol=G.requiredVoltage(p,c);p.chips=2;s.row.forEach(f=>f.type='light');s.audience.forEach(f=>f.type='light');const mem=p.memory.length,deck=p.deck.length,v=p.vol;
  if(mode==='fan'){p.vol--;bad(s,{type:'play',card:c.uid,actors:G.actors(p,c),mode},i);p.vol++;}
  G.dispatch(s,{type:'play',card:c.uid,actors:G.actors(p,c),mode});settle(s);
  assert.equal(p.vol,v+(mode==='vol'?10*n:0));assert.equal(p.memory.length,mem+1+(owner==='chie'&&mode==='vol'?(n===3?2:1):0));assert.equal(p.deck.length,deck-(owner==='chie'&&mode==='vol'?(n===3?2:1):0));assert.equal(G.cashCount(p),owner==='kono'&&mode==='vol'?1:0);if(owner==='miyabi'&&n>1&&mode==='fan'){assert.equal(p.chips,0);assert.equal(q.vol,Math.max(0,G.CHAR[q.leader].vol-20));}
 }
 // Discount is on all own songs and follows leader, including zero-floor specials.
 {const s=make(),p=s.players[0];assert.equal(G.requiredVoltage(p,{owner:'kono',n:1}),40);p.leader='kono';assert.equal(G.requiredVoltage(p,{owner:'miyabi',n:1}),60);p.leader='miyabi';assert.equal(G.requiredVoltage(p,{owner:'shiro',n:3,special:'painted'}),0);}
 // Guard applies to audience and opponent, not voluntary VOL costs or cap changes.
 {const s=make(),p=s.players[0];G.dispatch(s,{type:'event',id:'miyabi',memory:cost(s,0,'miyabi')});assert(p.volGuard);const c=give(s,0,'kono',1);p.vol=60;s.row[0].type='heavy';G.dispatch(s,{type:'play',card:c.uid,actors:[1],mode:'fan'});settle(s);assert.equal(p.vol,60);p.leader='aya';p.vol=80;p.ready=[false,false,false];s.pending={kind:'ayaReady',p:0,options:['skip','0'],cost:30,all:false};G.dispatch(s,{type:'choose',value:'0'});assert.equal(p.vol,50);}
 for(const item of Object.keys(G.SHOP)){
  const s=make('kono'),p=s.players[0];bad(s,{type:'buy',item:'unknown'});G.dispatch(s,{type:'buy',item});settle(s);assert.equal(G.cashCount(p),0);bad(s,{type:'buy',item});if(item==='support')assert.equal(p.chips,2);else if(item==='fanChip')assert.equal(p.fanChips,1);else assert.equal(p.items.filter(c=>c.item===item).length,1);
 }
 {const s=make('kono'),p=s.players[0];G.dispatch(s,{type:'event',id:'kono',memory:cost(s,0,'kono')});assert.equal(G.cashCount(p),8);assert.equal(p.events.find(e=>e.id==='kono').used,true);}
 // Optional one-time rearm; both invocations must pay independently.
 {const s=make('chie'),p=s.players[0];G.dispatch(s,{type:'event',id:'miyabi',memory:cost(s,0,'miyabi')});assert.equal(s.pending.kind,'chieReset');G.dispatch(s,{type:'choose',value:'use'});assert(p.chieResetUsed);assert(!p.events.find(e=>e.id==='miyabi').used);bad(s,{type:'event',id:'miyabi',memory:[]});G.dispatch(s,{type:'event',id:'miyabi',memory:cost(s,0,'miyabi')});assert(!s.pending);assert(p.events.find(e=>e.id==='miyabi').used);}
 // Rescue uses the losing player's seat, mandatory 3-card payment before defeat, preserves privacy.
 for(const i of [0,1])for(const protect of ['none','teddy','mc']){
  const s=make('miyabi',i),p=s.players[i],q=s.players[1-i];q.fans.push({uid:'saved',type:'light',lock:null});q.fanChips=18;if(protect==='teddy')q.items.push({uid:'bear',item:'teddy'});if(protect==='mc')q.fanShield=true;
  const paid=cost(s,i,'chie');q.fanChips=19;G.dispatch(s,{type:'service',actor:0}); // finish after a normal action, before defeat
  assert.equal(s.pending?.kind,'chiePayment');assert.equal(s.pending.p,i);assert.equal(s.winner,null);const view=G.publicView(s,1-i);assert(!view.pending.options.length);bad(s,{type:'choose',value:paid[0]},1-i);
  for(const id of paid)G.dispatch(s,{type:'choose',value:id});settle(s);assert(p.events.find(e=>e.id==='chie').used);assert.equal(q.fanChips,protect==='mc'?38:19);assert.equal(q.fans.length,protect==='none'?0:1);assert.equal(s.winner,protect==='none'?null:1-i);assert.equal(G.cashCount(p),0);
 }
 // Insufficient cost cannot stop defeat.
 {const s=make(),p=s.players[0],q=s.players[1];q.fanChips=20;G.dispatch(s,{type:'end'});assert.equal(s.winner,1);assert(!s.pending);}
 // Shio third song FAN also gains VOL and its native VOL value is preserved.
 {const s=make(),p=s.players[0];p.team=['shio','aya','natsume'];p.leader='natsume';p.vol=100;p.hand.push({uid:'shio3',owner:'shio',n:3});s.row.forEach(f=>f.type='light');s.audience.forEach(f=>f.type='light');G.dispatch(s,{type:'play',card:'shio3',actors:[0,1,2],mode:'fan'});assert.equal(p.vol,110);assert.equal(G.song({owner:'shio',n:3}).vol,40);}
 // Seeded CPU games: no illegal actions, uniqueness and complete resolution.
 for(let seed=1;seed<=90;seed++){let s=G.create(['miyabi','kono','chie'],['miyabi','kono','chie'][seed%3],['shio','hibiki','misa'],['shio','hibiki','misa'][seed%3],seed%2,seed);let steps=0;while(s.winner===null&&steps++<1600)s=G.peerAction(s,G.ai(s),s.pending?.p??s.active);assert.notEqual(s.winner,null,'CPU stalled '+seed);for(const p of s.players){assert(p.vol>=0&&p.vol<=G.maxVoltage(p));const ids=['hand','deck','memory','discard'].flatMap(z=>p[z].map(c=>c.uid));assert.equal(new Set(ids).size,ids.length);}}
}
console.log('Yugen trio: both engines/seats, all modes/thresholds, guard, cash shop, event rearm, paid pre-defeat rescue/protection/privacy and 180 CPU games passed');
