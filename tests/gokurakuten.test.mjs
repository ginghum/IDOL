import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const src=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const browser=new Function(src.split('const $=s=>')[0]+';return IDOL')();
for(const G of [server,browser])for(const i of [0,1]){
 const settle=(s,skip=true)=>{let n=0;while(s.pending){assert(n++<150);G.dispatch(s,{type:'choose',value:skip?s.pending.options[0]:G.ai(s).value});}};
 const make=(id,leader=id)=>{const t=[id,...['tenko','kayo','kana'].filter(x=>x!==id)].slice(0,3);const o=['rai','shio','hana'];const s=i?G.create(o,'rai',t,leader,i,781,o,t):G.create(t,leader,o,'rai',i,781,t,o);settle(s);for(const f of [...s.row,...s.audience])f.type='light';return s;};
 const give=(s,id,n)=>{const p=s.players[i];for(const z of ['hand','deck']){const at=p[z].findIndex(c=>c.owner===id&&c.n===n);if(at>=0){const c=p[z].splice(at,1)[0];p.hand.push(c);return c;}}throw Error('card missing');};
 const pay=(s,id)=>{const p=s.players[i];for(let j=0;j<G.EVENTS[id].cost[1];j++)p.items.push({uid:'pay-'+s.serial++,item:'meat'});return G.autoPay(p,id);};
 const bad=(s,a,seat=i)=>{const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,a,seat));assert.equal(JSON.stringify(s),before);};
 for(const id of ['kana','tenko','mitsuha','mitama']){
  const s=make(id),p=s.players[i];assert.equal(p.hand.length,G.CHAR[id].hand);assert.equal(p.vol,G.CHAR[id].vol);bad(s,{type:'event',id,memory:[]});assert.equal(p.hand.length+p.deck.length,27);assert.equal(new Set([...p.hand,...p.deck].map(c=>c.uid)).size,27);
  for(const n of [1,2,3])for(const mode of ['vol','fan']){
   const s=make(id),p=s.players[i],c=give(s,id,n);p.vol=G.requiredVoltage(p,c);p.chips=1;const v=p.vol,deck=s.audience.length;
   if(mode==='fan'){p.vol--;bad(s,{type:'play',card:c.uid,actors:G.actors(p,c),mode});p.vol++;}
   G.dispatch(s,{type:'play',card:c.uid,actors:G.actors(p,c),mode});settle(s);
   assert.equal(p.vol,v+(mode==='vol'?10*n:0));assert.equal(p.memory.length,1);
   assert.equal(p.fans.length,mode==='fan'?n+(id==='mitama'&&n>1?1:0):0);
   assert.equal(p.chips,id==='tenko'?1+(n>1?1:0)+(n===2?1:0):id==='mitama'&&mode==='fan'?0:1);
   if(id==='mitsuha'&&mode==='vol'){assert.equal(s.audience.length,deck+1);assert.equal(s.audience[0].type,'local');}
  }
 }
 // Every character's printed song effects are sealed, but base values, normal acquisition and Tenko's leader survive.
 for(const id of Object.keys(G.CHAR))for(const n of [1,2,3])for(const mode of ['vol','fan']){
  const s=make(id,'tenko'),p=s.players[i],q=s.players[1-i],c=give(s,id,n);p.songSeal=true;p.chips=3;p.vol=100;const hand=p.hand.length,deck=p.deck.length,audience=s.audience.length;const d=G.song(c);
  G.dispatch(s,{type:'play',card:c.uid,actors:G.actors(p,c),mode});assert.equal(s.pending,null,id);assert.equal(p.chips,3+(n===2?1:0),id);assert.equal(p.hand.length,hand-1,id);assert.equal(p.deck.length,deck,id);assert.equal(p.memory.length,1,id);assert.equal(p.items.length,0,id);assert.equal(q.items.length,0,id);assert.equal(p.vol,100+(mode==='vol'?d.vol:0),id);assert.equal(p.fans.length,mode==='fan'?d.fan:0,id);assert.equal(s.audience.length,audience-(mode==='fan'?d.fan:0),id);assert(!p.moeDouble,id);
 }
 {const s=make('kana'),p=s.players[i];p.chips=1;G.dispatch(s,{type:'end'});assert.equal(s.pending,null);assert.equal(p.chips,1);assert(!s.players[1-i].songSeal);}
 {const s=make('kana');s.players[i].chips=1;G.timeout(s);assert.equal(s.pending,null);assert(!s.players[1-i].songSeal);}
 {const s=make('kana'),p=s.players[i];p.memory.push(...p.hand,...p.deck);p.hand=[];p.deck=[];const paid=G.autoPay(p,'kana'),remaining=p.memory.filter(c=>c.owner==='kana'&&!paid.includes(c.uid)).length;G.dispatch(s,{type:'event',id:'kana',memory:paid});assert.equal(s.pending.kind,'kanaMemory');assert(s.pending.options.every(x=>!paid.includes(x)));bad(s,{type:'choose',value:paid[0]});settle(s,false);assert.equal(p.temp,remaining);assert(p.events.find(e=>e.id==='kana').used);G.dispatch(s,{type:'end',skipEndSkill:true});assert.equal(p.temp,0);}
 {const s=make('mitsuha'),p=s.players[i];s.row[0].lock=1-i;const original=s.row[0].uid;G.dispatch(s,{type:'event',id:'mitsuha',memory:pay(s,'mitsuha')});assert.equal(s.row[0].uid,original);assert.equal(s.row[0].lock,1-i);assert.equal(s.row.filter(f=>f.type==='local').length,1);assert.equal(p.fans.length,1);assert.equal(p.fans[0].type,'local');}
 {const s=make('mitsuha'),p=s.players[i];p.fans.push({uid:'local1',type:'local',lock:null},{uid:'local2',type:'local',lock:null});p.leader='tenko';G.dispatch(s,{type:'end',skipEndSkill:true});G.dispatch(s,{type:'end',skipEndSkill:true});assert.equal(p.chips,2);p.leader='mitama';G.dispatch(s,{type:'end',skipEndSkill:true});G.dispatch(s,{type:'end',skipEndSkill:true});assert.equal(p.chips,2);}
 {const s=make('mitsuha');G.dispatch(s,{type:'end',skipEndSkill:true});G.dispatch(s,{type:'end',skipEndSkill:true});assert.equal(s.pending.kind,'mitsuhaStart');const top=s.audience[0].uid,old=s.row[0].uid;const v=G.publicView(s,i);assert.equal(v.audience[0].type,null);assert(!JSON.stringify(v.pending).includes(top));G.dispatch(s,{type:'choose',value:'swap'});assert.equal(s.row[0].uid,top);assert.equal(s.audience[0].uid,old);}
 // Immunity includes reporter, positive chips, VOL loss and troublesome returns.
 {const s=make('mitama'),p=s.players[i],c=give(s,'mitama',3);p.vol=100;p.chips=0;['reporter','heavy','trouble'].forEach((type,j)=>s.row[j].type=type);s.audience[0].type='cheer';const count=s.audience.length;G.dispatch(s,{type:'play',card:c.uid,actors:G.actors(p,c),mode:'fan'});assert.equal(p.fans.length,4);assert.equal(p.vol,100);assert.equal(p.chips,0);assert.equal(s.audience.filter(f=>f.type==='influencer').length,0);assert.equal(s.audience.length,count-4);}
 {const s=make('mitama'),p=s.players[i];p.vol=0;p.ready=[false,false,false];G.dispatch(s,{type:'event',id:'mitama',memory:pay(s,'mitama')});assert.equal(p.fans.length,2);assert.equal(p.vol,0);assert.deepEqual(p.ready,[false,false,false]);}
 {const s=make('tenko'),p=s.players[i];G.dispatch(s,{type:'event',id:'tenko',memory:pay(s,'tenko')});assert.equal(s.active,i);assert.equal(p.extraTurns,1);p.ready=[false,false,false];p.temp=3;p.buff=2;const hand=p.hand.length,turn=s.turn;G.dispatch(s,{type:'end',skipEndSkill:true});assert.equal(s.active,i);assert.equal(s.turn,turn+1);assert.equal(p.hand.length,hand+1);assert(p.ready.every(Boolean));assert.equal(p.temp,0);assert.equal(p.buff,0);assert.equal(p.extraTurns,0);G.dispatch(s,{type:'end',skipEndSkill:true});assert.equal(s.active,1-i);}
}
// CPU uses all four, stays legal against legacy mechanics, conserves cards and terminates.
for(const G of [server,browser])for(let seed=1;seed<=70;seed++){
 const ids=['kana','tenko','mitsuha','mitama'],team=ids.filter((_,j)=>j!==seed%4),other=seed%2?['mitama','mitsuha','hakka']:['chie','moe','miyabi'];let s=G.create(team,team[seed%3],other,other[seed%3],seed%2,seed);let steps=0;
 while(s.winner===null&&steps++<1800)s=G.peerAction(s,G.ai(s),s.pending?.p??s.active);
 assert.notEqual(s.winner,null,'CPU stalled '+seed);for(const p of s.players){assert(p.chips>=0);assert(p.vol>=0&&p.vol<=G.maxVoltage(p));const cards=['hand','deck','memory','discard'].flatMap(z=>p[z]);assert.equal(new Set(cards.map(c=>c.uid)).size,cards.length);}
}
console.log('Gokurakuten: both engines/seats, all song modes, legacy saved-effect compatibility, exact costs, local fan/locks/privacy, audience immunity, extra turn/reset and 140 CPU games passed');
