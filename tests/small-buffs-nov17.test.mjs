import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const browser=new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1].split('const $=s=>')[0]+';return IDOL')();
for(const G of [server,browser])for(const seat of [0,1]){
 const make=(team,leader=team[0],events=team)=>{const other=['kayo','rai','nina'];const s=seat?G.create(other,'kayo',team,leader,seat,17,other,events):G.create(team,leader,other,'kayo',seat,17,events,other);s.pending=null;s.queue=[];for(const f of [...s.row,...s.audience])f.type='light';return s;};
 const give=(s,owner,n)=>{const p=s.players[seat];for(const zone of ['hand','deck']){const at=p[zone].findIndex(c=>c.owner===owner&&c.n===n);if(at>=0){const c=p[zone].splice(at,1)[0];p.hand.push(c);return c;}}throw Error('song missing');};
 const act=(s,a)=>{G.peerAction(s,a,seat);return G.dispatch(s,a);};
 const play=(s,c,mode)=>act(s,{type:'play',card:c.uid,actors:G.actors(s.players[seat],c),mode});
 const settle=s=>{let n=0;while(s.pending){assert(n++<100);G.dispatch(s,G.ai(s));}};
 const bad=(s,a)=>{const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,a,seat));assert.equal(JSON.stringify(s),before);};
 {const s=make(['homura','hana','misa']),p=s.players[seat];assert.equal(p.vol,30);assert.equal(p.hand.length,4);}
 for(const n of [1,2,3])for(const mode of ['vol','fan'])for(const sealed of [false,true]){
  const s=make(['hibiki','hana','misa'],'hana'),p=s.players[seat],c=give(s,'hibiki',n);p.vol=100;p.chips=0;p.songSeal=sealed;play(s,c,mode);settle(s);
  assert.equal(p.chips,n===3&&mode==='fan'&&!sealed?1:0);assert.equal(p.vol,mode==='vol'?100+G.song(c).vol:100);
 }
 for(const n of [1,2,3])for(const chips of [0,1,2])for(const sealed of [false,true]){
  const s=make(['misa','hana','hibiki'],'hana'),p=s.players[seat],c=give(s,'misa',n),cost=n===3?1:2;p.chips=chips;p.songSeal=sealed;play(s,c,'vol');
  if(chips>=cost&&!sealed){assert.equal(s.pending.kind,'misaPurple');assert.equal(s.pending.cost,cost);assert.match(s.pending.text??s.pending.title??s.pending.message??'',new RegExp('声援'+cost+'枚'));assert.equal(G.ai(s).value,'use');act(s,{type:'choose',value:'use'});assert.equal(p.chips,chips-cost);assert.equal(G.drinkItems(p).length,1);}
  else{assert.equal(s.pending,null);assert.equal(p.chips,chips);assert.equal(G.drinkItems(p).length,0);}
 }
 // Skipping and an unaffordable response preserve resources.
 {const s=make(['misa','hana','hibiki'],'hana'),p=s.players[seat];p.chips=1;play(s,give(s,'misa',3),'vol');act(s,{type:'choose',value:'skip'});assert.equal(p.chips,1);assert.equal(G.drinkItems(p).length,0);}
 {const s=make(['misa','hana','hibiki'],'hana'),p=s.players[seat];p.chips=1;play(s,give(s,'misa',3),'vol');p.chips=0;bad(s,{type:'choose',value:'use'});}
 // Drift inherits both the third-song discount and the new Hibiki reward.
 for(const [owner,mode]of [['misa','vol'],['hibiki','fan']]){
  const s=make(['kana','hana','tenko']),p=s.players[seat],q=s.players[1-seat],c=give(s,'kana',3);p.vol=100;p.chips=owner==='misa'?1:0;const source={uid:'borrow-'+s.serial++,owner,n:3};q.memory.push(source);play(s,c,mode);assert.equal(s.pending.kind,'kanaDrift');act(s,{type:'choose',value:source.uid});settle(s);assert.equal(p.chips,owner==='misa'?0:1);assert.equal(G.drinkItems(p).length,owner==='misa'?1:0);
 }
 // The event really accepts one Hana plus two other memory cards, and readies an actor.
 {const s=make(['hana','misa','hibiki']),p=s.players[seat];assert.deepEqual(G.CHAR.hana.cost,[1,3]);for(const owner of ['hana','misa','hibiki']){const c=give(s,owner,1);p.hand=p.hand.filter(h=>h.uid!==c.uid);p.memory.push(c);}p.ready[0]=false;const memory=G.autoPay(p,'hana');assert.equal(memory.length,3);bad(s,{type:'event',id:'hana',actor:0,memory:memory.slice(0,2)});act(s,{type:'event',id:'hana',actor:0,memory});assert(p.ready[0]);assert.equal(p.memory.length,0);}
 assert.match(G.detail({owner:'hibiki',n:3}).fanText,/声援チップを1枚/);assert.match(G.detail({owner:'misa',n:3}).volText,/声援チップ1枚/);assert.match(G.detail({owner:'misa',n:2}).volText,/声援チップ2枚/);
}
assert.match(html,/声援'\+\(z.cost\?\?2\)\+'枚で獲得/);
console.log('Four small buffs: both engines/seats, cost boundaries, skip, invalid payment, sealing, Drift, event payment and dynamic UI passed');
