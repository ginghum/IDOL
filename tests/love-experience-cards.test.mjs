import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map(),listeners={},document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,f){listeners[k]=f;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert','listeners',code+String.raw`
state=IDOL.create(['mio','chris','hana'],'hana',['mio','chris','kayo'],'kayo',0,2467);screen='match';modal=null;const p=state.players[0],q=state.players[1];
for(const experience of [0,3,4,7,8])for(const wealth of [0,1,3,11]){
 p.experience=experience;p.wealth=wealth;const before=JSON.stringify(state),cards=resourceStacks(p),view=matchHTML();
 assert.equal(cards.length,Number(experience>0)+Number(wealth>0));assert.equal(resourceCount(p),experience+wealth);
 assert.equal(view.includes('data-id="experience-cards"'),experience>0);assert.equal(view.includes('data-id="love-cards"'),wealth>0);
 assert.equal((view.match(/data-id="experience-cards"/g)||[]).length,experience?1:0);assert.equal((view.match(/data-id="love-cards"/g)||[]).length,wealth?1:0);
 assert(!tableHUD(p,0).includes('経験'));assert(!tableHUD(p,0).includes('愛'));assert(!tableHUD(q,1).includes('経験'));assert(!tableHUD(q,1).includes('愛'));
 if(experience)assert(view.includes('現在FAN＋'+Math.floor(experience/4)));assert.equal(JSON.stringify(state),before);
}
const h=p.hand.length,m=p.memory.length,points=IDOL.score(p);p.wealth=200;p.experience=8;const snapshot=JSON.stringify(state);render();assert.equal(p.hand.length,h);assert.equal(p.memory.length,m);assert.equal(IDOL.score(p),points);assert.equal(JSON.stringify(state),snapshot);
for(const id of ['love-cards','experience-cards']){listeners.click({target:{closest:()=>({dataset:{action:'resource-info',id,p:'0'},disabled:false})}});assert.equal(modal.kind,'resource');assert($('#modal').innerHTML.includes(id==='love-cards'?'愛カード':'経験カード'));assert.match($('#modal').innerHTML,/楽曲の手札枚数・メモリー・得点には数えず/);assert.equal(JSON.stringify(state),snapshot);}
assert.match(tableEvents(p,0),/>Event<\/button>/);assert.match(tableEvents(q,1),/>Event<\/button>/);assert(!tableEvents(q,1).includes('伏せ札 3'));
assert(!CHAR.chris.skill.includes('財産'));assert.match(CHAR.chris.skill,/愛/);assert.match(CHAR.chris.effect,/愛/);
p.hand=[];p.items=[];p.chips=0;p.fanChips=0;const onlyResources=matchHTML();assert(onlyResources.includes('love-cards'));assert(onlyResources.includes('experience-cards'));assert(!onlyResources.includes('empty-hand'));
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert,listeners);
// Resource cards remain public chip-style counters, never playable songs, payment cards or ordinary items.
for(const seat of [0,1]){
 const s=server.create(['mio','chris','hana'],'hana',['mio','chris','kayo'],'kayo',seat,2467),p=s.players[seat];p.experience=8;p.wealth=200;
 const v=server.publicView(s,1-seat);assert.equal(v.players[1].experience,8);assert.equal(v.players[1].wealth,200);assert(v.players[1].hand.every(c=>!c.owner));
 for(const id of ['love-cards','experience-cards']){const before=JSON.stringify(s);assert.throws(()=>server.peerAction(s,{type:'play',card:id,mode:'vol',actors:[0]},seat));assert.equal(JSON.stringify(s),before);assert.throws(()=>server.peerAction(s,{type:'event',id:'chris',memory:[id]},seat));assert.equal(JSON.stringify(s),before);}
 const restored=JSON.parse(JSON.stringify(s));assert.equal(restored.players[seat].wealth,200);assert.equal(restored.players[seat].experience,8);assert.equal(server.paymentCards(p).length,0);assert.equal(server.items(p).length,0);
}
console.log('Love/experience hand cards: zero/count/cap/bonus rendering, resource-only hand, details and Event labels, no left HUD duplication, read-only rendering, legacy saves/public privacy and rejected song/payment input passed');
