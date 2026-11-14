import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {IDOL as server} from '../room-server/idol-engine.mjs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
for(const G of[browser,server])for(const seat of[0,1]){
 function make(leader='hibiki'){
  const own=['hibiki','shio','kayo'],enemy=['rai','hana','hakka'],s=G.create(seat?enemy:own,seat?'rai':leader,seat?own:enemy,seat?leader:'rai',seat,123,seat?enemy:['hibiki','shio','mc'],seat?['hibiki','shio','mc']:enemy);return s;
 }
 assert.deepEqual(G.EVENTS.hibiki.cost,[4,6]);assert.equal(G.CHAR.hibiki.vol,30);assert.equal(G.CHAR.hibiki.hand,2);assert.deepEqual(G.EVENTS.shio.cost,[3,8]);
 {const s=make(),p=s.players[seat];assert.equal(p.vol,40);assert.equal(p.hand.length,2);G.dispatch(s,{type:'end'});assert.equal(p.vol,40);G.dispatch(s,{type:'end'});assert.equal(p.vol,50);assert.equal(G.maxVoltage(p),400);}
 for(const [self,total]of[[3,6],[4,4],[4,5],[4,6],[5,6],[4,7]]){
  const s=make(),p=s.players[seat];p.vol=300;const pool=[...p.hand,...p.deck],cards=[...pool.filter(c=>c.owner==='hibiki').slice(0,self),...pool.filter(c=>c.owner!=='hibiki').slice(0,total-self)];p.memory=cards;p.hand=p.hand.filter(c=>!cards.includes(c));p.deck=p.deck.filter(c=>!cards.includes(c));const paid=cards.map(c=>c.uid),before=JSON.stringify(s);
  assert.equal(G.eventOK(s,seat,'hibiki'),self>=4&&total>=6);assert.equal(G.paymentOK(p,'hibiki',paid),self>=4&&total===6);
  if(self<4||total!==6){assert.throws(()=>G.peerAction(s,{type:'event',id:'hibiki',memory:paid},seat));assert.equal(JSON.stringify(s),before);}else{const next=G.peerAction(s,{type:'event',id:'hibiki',memory:paid},seat),q=next.players[seat];assert.equal(q.fanChips,0);assert.equal(q.temp,15);assert.equal(q.vol,300);assert.equal(q.discard.filter(c=>paid.includes(c.uid)).length,6);assert.equal(q.events.find(e=>e.id==='hibiki').used,true);}
 }
 // The unchanged fallback remains available under another leader; meat follows the existing wildcard rule.
 {const s=make('shio'),p=s.players[seat];p.vol=200;p.memory=Array.from({length:3},(_,n)=>({uid:'h'+n,owner:'hibiki',n:1}));p.memory.push(...Array.from({length:2},(_,n)=>({uid:'other'+n,owner:'shio',n:1})));p.items=[{uid:'wild',item:'meat'}];const paid=G.autoPay(p,'hibiki');assert.equal(paid.length,6);assert(G.paymentOK(p,'hibiki',paid));const next=G.peerAction(s,{type:'event',id:'hibiki',memory:paid},seat);let n=0;while(next.pending&&n++<20)G.dispatch(next,{type:'choose',value:'chip'});assert.equal(next.players[seat].chips,10);assert.equal(next.players[seat].vol,200);assert.equal(G.maxVoltage(next.players[seat]),200);}
}
console.log('Hibiki: both engines/seats, own-start +10, unchanged initial 30/2 and caps, exact four-Hibiki-in-six payment/atomic rejection, temporary 15-point and 10-cheer fallback/meat passed');
