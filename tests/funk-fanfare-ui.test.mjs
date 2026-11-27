import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map(),listeners={},document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,f){listeners[k]=f;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert','listeners',code+String.raw`
state=IDOL.create(['kazuna','mio','chris'],'kazuna',['hana','natsume','rai'],'hana',0,345);screen='match';modal=null;
const p=state.players[0],q=state.players[1],c=p.deck.find(c=>c.owner==='kazuna');p.deck=p.deck.filter(x=>x!==c);p.goal=c;p.goalTurn=state.turn;p.wealth=7;p.experience=8;
const click=(action,seat)=>listeners.click({target:{closest:()=>({dataset:{action,p:String(seat)},disabled:false})}}),content=()=>$('#modal').innerHTML,before=JSON.stringify(state);
assert.match(CHAR.kazuna.skill,/目標.*次の自分のターン以降.*同じ人数用/);
assert.match(tableStacks(p,0),/data-action="goal-info" data-p="0" data-zone="goal"/);
assert.match(tableHUD(p,0),/経験 8\/8 · 澪FAN＋2/);
assert(!matchHTML().includes('wealth-one'));assert(!matchHTML().includes('wealth-all'));
for(const seat of [0,1]){
 click('zones',seat);assert.equal(modal.kind,'zones');assert.match(content(),/data-action="goal-info"/);assert.match(content(),new RegExp('目標 '+(seat?0:1)+'枚'));assert(!content().includes('data-art="song-kazuna-'));
 click('goal-info',seat);assert.equal(modal.kind,'goal-info');assert.equal(modal.p,seat);
 if(seat)assert.match(content(),/目標は空です/);else assert(content().includes('data-art="'+IDOL.songArt(c)+'"'));
 assert.match(content(),/次の自分のターン以降/);assert.match(content(),/声援1枚/);
}
assert.equal(JSON.stringify(state),before);
modal={kind:'rules',section:'characters',character:'mio'};renderModal();assert.match(content(),/最大8枚/);assert(!content().includes('最大12枚'));
modal={kind:'rules',section:'characters',character:'chris'};renderModal();assert.match(content(),/声援に戻せるのは専用イベントのみ/);
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert,listeners);
console.log('FunkFanfare UI: goal pile buttons for both seats, separate goal details/empty state, concise rules, eight-experience HUD and no ordinary wealth withdrawal passed');
