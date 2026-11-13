import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
for(const G of [browser,server])for(const seat of [0,1]){
 const make=()=>{const s=G.create(['misa','hakka','kayo'],'kayo',['misa','hakka','kayo'],'kayo',seat,42,['misa','hakka','kayo'],['misa','hakka','kayo']);for(const f of [...s.row,...s.audience]){f.type='light';f.lock=null;}return s;};
 const pay=(s,id)=>{const p=s.players[seat],pool=[...p.hand,...p.deck];const required=pool.filter(c=>c.owner===id).slice(0,G.EVENTS[id].cost[0]);const chosen=[...required,...pool.filter(c=>!required.includes(c)).slice(0,G.EVENTS[id].cost[1]-required.length)];p.hand=p.hand.filter(c=>!chosen.includes(c));p.deck=p.deck.filter(c=>!chosen.includes(c));p.memory.push(...chosen);return chosen.map(c=>c.uid);};
 assert.deepEqual(G.CHAR.kayo.cost,[3,5]);assert.deepEqual(G.CHAR.misa.cost,[4,8]);
 // New cost: eight total, at least four Misa memories; meat remains a wildcard.
 {const s=make(),p=s.players[seat],memory=pay(s,'misa');assert.equal(memory.length,8);assert.equal(p.memory.filter(c=>c.owner==='misa').length,4);assert(G.eventOK(s,seat,'misa'));assert(!G.paymentOK(p,'misa',memory.slice(0,7)));const own=p.memory.find(c=>c.owner==='misa'),other=p.deck.find(c=>c.owner!=='misa');p.deck=p.deck.filter(c=>c.uid!==other.uid);p.memory=p.memory.filter(c=>c.uid!==own.uid);p.deck.push(own);p.memory.push(other);assert(!G.eventOK(s,seat,'misa'));assert(!G.paymentOK(p,'misa',p.memory.map(c=>c.uid)));p.memory=p.memory.filter(c=>c.uid!==other.uid);p.deck.push(other);p.items.push({uid:'misa-cost-meat',item:'meat'});assert(G.eventOK(s,seat,'misa'));assert(G.paymentOK(p,'misa',G.autoPay(p,'misa')));}
 for(const [own,opp] of [[5,10],[10,10],[12,10]]){
 const s=make(),p=s.players[seat],q=s.players[1-seat];p.fanChips=own;q.fanChips=opp;
 G.dispatch(s,{type:'event',id:'misa',memory:pay(s,'misa')});
 assert.equal(p.temp,Math.max(0,opp-own));assert.equal(s.pending.kind,'endDrinks');assert.deepEqual(G.drinkItems(p).map(c=>c.item).sort(),['drinkBlue','drinkPurple','drinkRed']);assert.equal(s.active,seat);assert.throws(()=>G.peerAction(s,{type:'service',actor:0},seat));for(const item of ['drinkBlue','drinkRed','drinkPurple']){const c=G.drinkItems(p).find(c=>c.item===item);G.dispatch(s,{type:'choose',value:c.uid});}assert.equal(s.active,1-seat);assert.equal(p.temp,0);assert.equal(p.vol,50);assert.equal(G.score(p),own+2);assert.equal(G.drinkItems(p).length,0);
 assert.throws(()=>G.peerAction(s,{type:'event',id:'misa',memory:[]},seat));
 }
 {const s=make(),p=s.players[seat];p.fanChips=18;s.players[1-seat].fanChips=17;G.dispatch(s,{type:'event',id:'misa',memory:pay(s,'misa')});for(const item of ['drinkRed','drinkPurple'])G.dispatch(s,{type:'choose',value:G.drinkItems(p).find(c=>c.item===item).uid});assert.equal(s.winner,seat);assert.equal(G.score(p),20);}
 // Comeback uses freshly granted drinks, can win at opponent 18, and can keep all drinks on skip/timeout.
 for(const opp of [17,18,19]){const s=make(),p=s.players[seat];p.fanChips=5;s.players[1-seat].fanChips=opp;G.dispatch(s,{type:'event',id:'misa',memory:pay(s,'misa')});assert.equal(G.score(p),opp);for(const item of ['drinkRed','drinkPurple']){if(s.winner!==null)break;G.dispatch(s,{type:'choose',value:G.drinkItems(p).find(c=>c.item===item).uid});}if(opp>=18)assert.equal(s.winner,seat);else{assert.equal(s.winner,null);G.dispatch(s,{type:'choose',value:'skip'});assert.equal(G.score(p),7);}}
 for(const timeout of [false,true]){const s=make(),p=s.players[seat];p.fanChips=5;s.players[1-seat].fanChips=10;G.dispatch(s,{type:'event',id:'misa',memory:pay(s,'misa')});if(timeout)G.timeout(s);else G.dispatch(s,{type:'choose',value:'skip'});assert.equal(p.temp,0);assert.equal(G.score(p),5);assert.equal(G.drinkItems(p).length,3);assert.equal(s.active,1-seat);}
 {const s=make(),p=s.players[seat];pay(s,'misa');p.ready=[true,true,true];p.fanChips=5;s.players[1-seat].fanChips=18;assert.equal(G.ai(s).id,'misa');}
 for(const extra of [0,3,6]){const s=make(),p=s.players[seat],memory=pay(s,'hakka');p.memory.push(...p.deck.splice(0,extra));G.dispatch(s,{type:'event',id:'hakka',memory});assert.equal(p.fanChips,3+extra/3);assert.equal(p.memory.length,0);}
 {const s=make(),p=s.players[seat],memory=pay(s,'kayo');while(p.hand.length<3)p.hand.push(p.deck.shift());const discard=p.hand.slice(0,3).map(c=>c.uid);G.dispatch(s,{type:'event',id:'kayo',memory,discard});assert.equal(p.fans.length,3);assert.equal(p.memory.length,0);assert.equal(p.discard.length,8);}
 // CPU uses the new ahead/tied branch after normal actions are exhausted.
 {const s=make(),p=s.players[seat];pay(s,'misa');p.ready=[false,false,false];p.fanChips=10;s.players[1-seat].fanChips=10;assert.equal(G.ai(s).id,'misa');}
}
console.log('Three event buffs: both engines/seats, Misa branches/new drink use/forced end/win/CPU, Hakka scaling, Kayo cost and cap passed');
