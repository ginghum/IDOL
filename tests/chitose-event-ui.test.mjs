import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
function test(meatPayment=false){const nodes=new Map(),listeners={},document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,fn){listeners[k]=fn;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert','listeners','meatPayment',code+String.raw`
const click=(action,id)=>listeners.click({target:{closest:()=>({dataset:{action,id},disabled:false})}});
state=IDOL.create(['chitose','hakka','kayo'],'chitose',['rai','hana','shio'],'rai',0,1839,['chitose','switch','mc']);screen='match';modal=null;
const p=state.players[0],q=state.players[1],all=[...p.hand,...p.deck],own=all.filter(c=>c.owner==='chitose').slice(0,3),cards=meatPayment?all.filter(c=>c.owner!=='chitose').slice(0,6):[...own,...all.filter(c=>!own.includes(c)).slice(0,6)],ids=new Set(cards.map(c=>c.uid));p.hand=p.hand.filter(c=>!ids.has(c.uid));p.deck=p.deck.filter(c=>!ids.has(c.uid));p.memory.push(...cards);if(meatPayment)for(let i=0;i<3;i++)p.items.push({uid:'payment-meat-'+i,item:'meat'});
assert(IDOL.eventOK(state,0,'chitose'));click('event','chitose');assert.equal(selection.memory.length,9);assert.match($('#modal').innerHTML,/data-action="event-confirm" disabled/);
assert(!$('#modal').innerHTML.includes('data-action="event-target" data-id="rai"'));
click('event-target','hana');assert.equal(selection.target,'hana');assert.deepEqual(selection.targets,[]);assert(!$('#modal').innerHTML.includes('data-action="event-confirm" disabled'));
click('event-target','shio');assert.equal(selection.target,'shio');assert.deepEqual(selection.targets,[]);assert.match($('#modal').innerHTML,/class="primary" data-action="event-target" data-id="shio"/);
const oldReady=[...q.ready],memoryIds=[...selection.memory];click('event-confirm');assert.equal(modal,null);assert(state.players[0].events.find(e=>e.id==='chitose').used);assert.deepEqual(state.players[1].startLocked,['shio']);assert.deepEqual(state.players[1].ready,oldReady);assert.equal(state.players[0].memory.length,0);assert.equal(state.players[0].discard.length,cards.length);assert.equal(IDOL.items(state.players[0]).filter(x=>x.item==='meat').length,0);assert.equal(memoryIds.length,9);
// The selected member is affected at the next start, while other members recover normally.
state.players[1].ready=[false,false,false];IDOL.dispatch(state,{type:'end',skipEndSkill:true});assert.deepEqual(state.players[1].ready,[true,true,false]);
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert,listeners,meatPayment);}
test();test(true);
console.log('Chitose event UI: eligible target click/replacement, enabled confirmation, real nine-memory and meat payments, event consumption and next-start lock passed');
