import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {IDOL as server} from '../room-server/idol-engine.mjs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
for(const G of [server,browser])for(const seat of [0,1])for(const active of [0,1])for(const meats of [1,2,3]){
 const team=['chie','hakka','kayo'],other=['hana','rai','tenko'];const s=seat?G.create(other,'hana',team,'hakka',0,17,other,team):G.create(team,'hakka',other,'hana',0,17,team,other);s.active=active;s.pending=null;s.queue=[];const p=s.players[seat],q=s.players[1-seat];p.items=Array.from({length:meats},(_,n)=>({uid:'meat-'+n,item:'meat'}));p.memory=Array.from({length:3-meats},(_,n)=>({uid:'chie-'+n,owner:'chie',n:1}));q.fanChips=20;G.dispatch(s,{type:'service',actor:0});assert.equal(s.pending.kind,'chiePayment');assert.equal(s.pending.p,seat);const paid=[...s.pending.options];assert.equal(paid.length,3);for(const id of paid){const original=JSON.stringify(s),otherSeat=1-seat;assert.throws(()=>G.peerAction(s,{type:'choose',value:id},otherSeat));assert.equal(JSON.stringify(s),original);G.dispatch(s,{type:'choose',value:id});}assert.equal(p.items.length,0);assert.equal(p.memory.length,0);assert.equal(p.discard.filter(c=>c.owner==='chie').length,3-meats);assert(p.events.find(e=>e.id==='chie').used);assert.equal(q.fanChips,19);assert.equal(s.winner,null);
}
const nodes=new Map(),listeners={},document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,f){listeners[k]=f;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert','listeners',code+String.raw`
const click=(action,id)=>listeners.click({target:{closest:()=>({dataset:{action,id},disabled:false})}});
for(const count of [1,2,3])for(const active of [0,1]){
state=IDOL.create(['chie','hakka','kayo'],'hakka',['hana','rai','tenko'],'hana',0,17);screen='match';modal=null;boardView=null;net=null;state.active=active;state.pending=null;state.queue=[];let p=state.players[0];p.items=Array.from({length:count},(_,n)=>({uid:'meat-'+n,item:'meat'}));p.memory=Array.from({length:3-count},(_,n)=>({uid:'chie-'+n,owner:'chie',n:1}));state.players[1].fanChips=20;IDOL.dispatch(state,{type:'service',actor:0});render();assert.equal(state.pending.kind,'chiePayment');
for(let n=0;n<count;n++){click('item-info','meat-0');if(n<2){assert.equal(state.pending.kind,'chiePayment');assert.equal(state.pending.selected.length,n+1);assert.equal(modal,null);}}
if(count<3)for(let n=0;n<3-count;n++)click('choose','chie-'+n);
assert.equal(state.players[0].items.length,0);assert.equal(state.players[1].fanChips,19);assert(state.players[0].events.find(e=>e.id==='chie').used);assert.equal(state.winner,null);
}
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert,listeners);
console.log('Chie auto event: mixed/all meat, both engines/seats/active turns, UI hand stacks, actual payment and unauthorized rejection passed');
