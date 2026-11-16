import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const src=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const browser=new Function(src.split('const $=s=>')[0]+';return IDOL')();
let cases=0;
for(const G of [server,browser])for(const seat of [0,1]){
 const make=(leader='kana')=>{const own=['kana','tenko','kayo'],enemy=['miyabi','natsume','rai'];const s=seat?G.create(enemy,'rai',own,leader,seat,456,enemy,own):G.create(own,leader,enemy,'rai',seat,456,own,enemy);s.pending=null;s.queue=[];for(const f of [...s.row,...s.audience])f.type='light';s.players[seat].vol=100;return s;};
 const give=(s,n=1)=>{const p=s.players[seat];for(const zone of ['hand','deck']){const at=p[zone].findIndex(c=>c.owner==='kana'&&c.n===n);if(at>=0){const c=p[zone].splice(at,1)[0];p.hand.push(c);return c;}}throw Error('No song');};
 const source=(s,owner,n=1)=>{const c={uid:'borrow-'+owner+'-'+s.serial++,owner,n};s.players[1-seat].memory.push(c);return c;};
 const play=(s,c,mode='vol')=>G.dispatch(s,{type:'play',card:c.uid,actors:G.actors(s.players[seat],c),mode});
 const choose=(s,value)=>G.dispatch(s,{type:'choose',value});
 const settle=s=>{let n=0;while(s.pending){assert(n++<100);choose(s,G.ai(s).value);}};
 const bad=(s,a,i=seat)=>{const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,a,i));assert.equal(JSON.stringify(s),before);};
 // All legal printed effects, all three sizes and both modes execute in both engines and seats.
 for(const id of Object.keys(G.CHAR).filter(id=>id!=='kana'))for(const n of [1,2,3])for(const mode of ['vol','fan']){
  const s=make(),p=s.players[seat],q=s.players[1-seat],c=give(s,n),b=source(s,id,n);p.chips=6;
  q.fanChips=2;q.items.push({uid:'enemy-resource',item:'meat'});q.fans.push({uid:'enemy-fan',type:'light',lock:null});
  const before=JSON.stringify(q.memory),hasEffect=!!G.detail(b)[mode+'Text'];play(s,c,mode);
  if(hasEffect){assert.equal(s.pending.kind,'kanaDrift',id+' '+n+' '+mode);assert(s.pending.free);assert(s.pending.options.includes(b.uid));choose(s,b.uid);settle(s);}else assert.equal(s.pending,null);
  assert.equal(JSON.stringify(q.memory),before,id);assert.equal(p.kanaSongsPlayed,1);assert(p.chips>=0);assert(!p.memory.some(x=>x.owner===id));assert(p.memory.some(x=>x.uid===c.uid)||p.hand.some(x=>x.uid===c.uid));assert.equal(s.pending,null);cases++;
 }
 // No hidden cards, different sizes, special cards or recursive Drift sources are candidates.
 {const s=make(),c=give(s),q=s.players[1-seat];source(s,'tenko',2);source(s,'kana');q.memory.push({uid:'special',owner:'shiro',n:1,special:'world'});q.hand.push({uid:'hidden',owner:'kayo',n:1});play(s,c);assert.equal(s.pending,null);assert.equal(s.players[seat].vol,110);}
 // First song is free; the same turn's next song costs one even after skipped Drift. Reset on the next own turn.
 {const s=make(),p=s.players[seat],b=source(s,'kayo');p.chips=0;play(s,give(s));assert(s.pending.free);const privateView=G.publicView(s,1-seat);assert.deepEqual(privateView.pending.options,[]);assert(privateView.players[1].hand.every(x=>!x.owner));bad(s,{type:'choose',value:b.uid},1-seat);bad(s,{type:'choose',value:'not-memory'});choose(s,'skip');assert.equal(p.chips,0);p.ready=[true,true,true];play(s,give(s));assert.equal(s.pending,null);assert.equal(p.kanaSongsPlayed,2);G.dispatch(s,{type:'end'});G.dispatch(s,{type:'end',skipEndSkill:true});assert.equal(p.kanaSongsPlayed,0);p.ready=[true,true,true];play(s,give(s));assert(s.pending.free);choose(s,b.uid);assert.equal(p.chips,0);}
 // Non-leader costs are paid before borrowed rewards; zero chips cannot fund Drift from its future reward.
 {const s=make('tenko'),p=s.players[seat],b=source(s,'hana');p.chips=0;play(s,give(s));assert.equal(s.pending,null);p.ready=[true,true,true];p.chips=1;play(s,give(s));assert.equal(s.pending.free,false);choose(s,b.uid);assert.equal(p.chips,1);}
 // An ordinary, paid copy consumes exactly one chip and leaves the opponent's memory untouched.
 {const s=make('tenko'),p=s.players[seat],b=source(s,'kayo');p.chips=1;const count=p.hand.length+p.deck.length;play(s,give(s));choose(s,b.uid);assert.equal(p.chips,0);assert.equal(p.hand.length+p.deck.length,count-1);assert(s.players[1-seat].memory.includes(b));}
 // Copy only the chosen mode: Kayo FAN has no draw; Mitama base FAN is never copied, but its penalty is.
 {const s=make(),p=s.players[seat];source(s,'kayo');const c=give(s);const before=p.hand.length;play(s,c,'fan');assert.equal(s.pending,null);assert.equal(p.hand.length,before-1);assert.equal(p.fans.length,1);}
 {const s=make(),p=s.players[seat],b=source(s,'mitama',2);p.chips=2;play(s,give(s,2),'fan');choose(s,b.uid);assert.equal(p.fans.length,2);assert.equal(p.chips,1);}
 // Optional source costs and effects are preserved, independently from Drift's own payment.
 {const s=make('tenko'),p=s.players[seat],b=source(s,'miyabi',3);p.chips=3;const enemyVol=s.players[1-seat].vol;play(s,give(s,3));choose(s,b.uid);assert.equal(p.chips,2);assert.equal(s.pending.kind,'kanaDriftOption');choose(s,'use');assert.equal(p.chips,0);assert.equal(s.players[1-seat].vol,enemyVol-20);assert.equal(p.vol,130);}
 {const s=make(),p=s.players[seat],b=source(s,'natsume');p.vol=60;play(s,give(s),'fan');choose(s,b.uid);choose(s,'use');assert.equal(p.vol,50);assert.equal(p.fans.length,2);}
 {const s=make(),p=s.players[seat],b=source(s,'rai');p.chips=1;s.row[1].type='core';play(s,give(s),'fan');choose(s,b.uid);choose(s,'use');assert.equal(p.chips,0);assert.equal(s.pending.kind,'raiPick');const target=s.row[1].uid;choose(s,target);assert(p.fans.some(f=>f.uid===target));}
 // 'This song' refers to the real Kana card; source ownership is never substituted in memory or hand.
 {const s=make(),p=s.players[seat],b=source(s,'akina'),c=give(s);play(s,c);choose(s,b.uid);assert.equal(s.pending.kind,'akinaReturn');choose(s,'return');assert(p.hand.some(x=>x.uid===c.uid&&x.owner==='kana'));assert(!p.memory.some(x=>x.uid===c.uid));assert(s.players[1-seat].memory.includes(b));}
 // Named conditions remain literal: making a local fan without Mitsuha grants no recurring income.
 {const s=make(),p=s.players[seat],b=source(s,'mitsuha');play(s,give(s));choose(s,b.uid);const f=s.audience.shift();assert.equal(f.type,'local');p.fans.push(f);const chips=p.chips;G.dispatch(s,{type:'end'});G.dispatch(s,{type:'end',skipEndSkill:true});assert.equal(p.chips,chips);}
 // A timeout skips unpaid Drift, still resolves the played card, and ends one turn.
 {const s=make(),p=s.players[seat];source(s,'kayo');p.chips=2;play(s,give(s));const turn=s.turn;G.timeout(s);assert.equal(s.turn,turn+1);assert.equal(p.vol,110);assert.equal(p.chips,2);assert.equal(s.pending,null);}
 // Extra turns also renew the first-song discount.
 {const s=make(),p=s.players[seat];source(s,'kayo');play(s,give(s));choose(s,'skip');p.extraTurns=1;G.dispatch(s,{type:'end'});assert.equal(s.active,seat);assert.equal(p.kanaSongsPlayed,0);play(s,give(s));assert(s.pending.free);choose(s,'skip');}
 assert.equal(G.CHAR.tenko.vol,30);assert.equal(G.CHAR.kana.hand,5);assert.equal(G.song({owner:'mitama',n:1}).fan,1);assert.deepEqual(G.EVENTS.mitama.cost,[3,5]);
}
console.log('Kana Drift:',cases,'copy combinations; costs, discount/reset, choices/privacy, source conditions, real-card identity, timeout and extra turns passed');
