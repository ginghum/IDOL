import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map(),document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(){}};
new Function('document','localStorage','setTimeout','clearTimeout','assert',code+String.raw`
state=IDOL.create(['kayo','hana','fukurou'],'kayo',['nina','ayame','hakka'],'nina',0,7);screen='match';let p=state.players[0];const hand=p.hand.length;
render();assert(!$('#app').innerHTML.includes('data-id="support-chips"'));
IDOL.dispatch(state,{type:'service',actor:0});render();assert.equal(p.chips,1);assert.equal(p.hand.length,hand);assert.equal(IDOL.items(p).length,0);assert.equal(IDOL.score(p),0);assert.match($('#app').innerHTML,/data-id="support-chips"/);assert.match($('#app').innerHTML,/声援チップ<\/b><span>ITEM ×1/);
IDOL.dispatch(state,{type:'service',actor:1});render();assert.equal(p.chips,2);assert.match($('#app').innerHTML,/声援チップ<\/b><span>ITEM ×2/);assert.equal(($('#app').innerHTML.match(/data-id="support-chips"/g)||[]).length,1);
modal={kind:'item',id:'support-chips'};const before=JSON.stringify(state);renderModal();assert.equal(JSON.stringify(state),before);assert.match($('#modal').innerHTML,/現在の声援チップは2枚/);assert.match($('#modal').innerHTML,/アイテム破壊の対象にもなりません/);assert(!$('#modal').innerHTML.includes('券を1枚使って'));
IDOL.dispatch(state,{type:'support',effect:'draw'});modal=null;render();assert.equal(p.chips,0);assert.equal(p.hand.length,hand+1);assert(!$('#app').innerHTML.includes('data-id="support-chips"'));
p.chips=9;p.fanChips=3;render();assert.match($('#app').innerHTML,/data-id="support-chips"/);assert.match($('#app').innerHTML,/data-id="fan-chips"/);assert.match($('#app').innerHTML,/HAND <b>7<\/b>/);assert.equal(IDOL.score(p),3);assert.equal(IDOL.paymentCards(p).length,0);
const old=JSON.stringify(state);assert.throws(()=>IDOL.peerAction(state,{type:'event',id:'collection',memory:['support-chips']},0));assert.equal(JSON.stringify(state),old);
// Capture both existing chip stacks so unrelated updates don't replay their entry animation.
document.body={};const motion=captureMotion({});assert(motion.handIds.includes('support-chips'));assert(motion.handIds.includes('fan-chips'));
// Seat remapping keeps the local player's support stack correct in online views.
state=IDOL.publicView(state,1);p=state.players[0];p.chips=4;render();assert.match($('#app').innerHTML,/声援チップ<\/b><span>ITEM ×4/);assert.equal(IDOL.items(p).length,0);
assert.equal(ARTWORK['song-fukurou-2'],'assets/art/song-fukurou-2-v3.webp');assert.equal(ARTWORK['event-fukurou'],'assets/art/event-fukurou-v3.webp');assert.equal(ARTWORK['song-fukurou-3'],'assets/art/song-fukurou-3.webp');
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert);
console.log('Support hand: earned/spent stack and count, details, actual-hand/payment/score separation, animation IDs and online seat view passed');
