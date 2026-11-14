import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
for(const G of [browser,server])for(const seat of [0,1]){
 function make(total,self,vol=180){
  const own=['hibiki','shio','hana'],enemy=['kayo','rai','machi'];
  const s=G.create(seat?enemy:own,seat?'kayo':'hibiki',seat?own:enemy,seat?'hibiki':'kayo',seat,123,seat?enemy:['shio','hana','mc'],seat?['shio','hana','mc']:enemy),p=s.players[seat];
  const pool=[...p.hand,...p.deck],picked=[...pool.filter(c=>c.owner==='shio').slice(0,self),...pool.filter(c=>c.owner!=='shio').slice(0,total-self)];
  p.memory=picked;p.hand=p.hand.filter(c=>!picked.includes(c));p.deck=p.deck.filter(c=>!picked.includes(c));p.vol=vol;p.fanChips=13;return s;
 }
 for(const [total,self] of [[5,3],[7,3],[8,2]]){
  const s=make(total,self),p=s.players[seat],before=JSON.stringify(s);
  assert.equal(G.eventOK(s,seat,'shio'),false);
  assert.throws(()=>G.peerAction(s,{type:'event',id:'shio',memory:p.memory.map(c=>c.uid)},seat));assert.equal(JSON.stringify(s),before);
 }
 for(const vol of [179,180]){
  const s=make(8,3,vol),p=s.players[seat],paid=G.autoPay(p,'shio');assert.equal(paid.length,8);assert(G.paymentOK(p,'shio',paid));
  for(const invalid of [paid.slice(0,5),paid.slice(0,7),[...paid.slice(0,7),paid[0]]]){const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,{type:'event',id:'shio',memory:invalid},seat));assert.equal(JSON.stringify(s),before);}
  const next=G.peerAction(s,{type:'event',id:'shio',memory:paid},seat),q=next.players[seat];
  assert.equal(q.temp,vol===180?7:3);assert.equal(q.vol,vol);assert.equal(q.memory.length,0);assert.equal(q.discard.filter(c=>paid.includes(c.uid)).length,8);assert.equal(q.events.find(e=>e.id==='shio').used,true);assert.equal(G.score(q),vol===180?20:16);assert.equal(next.winner,vol===180?seat:null);
 }
 assert.deepEqual(G.EVENTS.shio.cost,[3,8]);assert.equal(G.CHAR.shio.vol,40);assert.equal(G.CHAR.hibiki.vol,30);
}
console.log('Shio event: both engines/seats, Hibiki leader without MAXIMUM, 5/7-card and 2-self rejection, exact 3-of-8 payment, 179/180 VOL effects and 13-to-20 finisher passed');
