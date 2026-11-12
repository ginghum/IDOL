import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map(),listeners={},document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,f){listeners[k]=f;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert','listeners',code+String.raw`
state=IDOL.create(['ayame','nina','hakka'],'ayame',['kayo','hana','rai'],'kayo',0,7,['ayame','switch','mc']);screen='match';let p=state.players[0];
p.items=[{uid:'t1',item:'ticket'},{uid:'m1',item:'meat'},{uid:'t2',item:'ticket'},{uid:'b1',item:'teddy'},{uid:'m2',item:'meat'},{uid:'t3',item:'ticket'},{uid:'b2',item:'teddy'}];p.chips=4;p.fanChips=2;
const before=JSON.stringify(state);render();assert.equal(JSON.stringify(state),before);
let hand=()=>$('#app').innerHTML.split('class="hand-track"')[1].split('<button class="hand-arrow')[0];
assert.equal((hand().match(/class="playing-card item-card/g)||[]).length,5);
assert.match(hand(),/くじ引き券<\/b><span>ITEM ×3/);assert.match(hand(),/肉<\/b><span>ITEM ×2/);assert.match(hand(),/くまのぬいぐるみ<\/b><span>ITEM ×2/);
assert.equal(p.items.length,7);assert.equal(p.hand.length,5);
const click=(action,id)=>listeners.click({target:{closest:()=>({dataset:{action,id},disabled:false})}});
click('item-info','t1');assert.match($('#modal').innerHTML,/ITEM ×3/);assert.match($('#modal').innerHTML,/data-action="ticket-use"[^>]*data-id="t1"/);
// Consume the real UID represented by the stack; the next copy remains usable.
IDOL.dispatch(state,{type:'ticket',id:'t1'});modal=null;render();assert.match(hand(),/くじ引き券<\/b><span>ITEM ×2/);click('item-info','t2');assert.match($('#modal').innerHTML,/data-action="ticket-use"[^>]*data-id="t2"/);
IDOL.dispatch(state,{type:'ticket',id:'t2'});IDOL.dispatch(state,{type:'ticket',id:'t3'});modal=null;render();assert(!hand().includes('くじ引き券</b>'));
// Meat payments must still allow choosing two distinct copies independently.
p.memory.push(p.hand.pop());modal={kind:'event',id:'switch'};selection={memory:[]};renderModal();assert.match($('#modal').innerHTML,/data-action="pay" data-id="m1"/);assert.match($('#modal').innerHTML,/data-action="pay" data-id="m2"/);click('pay','m1');click('pay','m2');assert.deepEqual(selection.memory,['m1','m2']);click('pay',p.memory[0].uid);assert.equal(IDOL.paymentOK(p,'switch',selection.memory),true);
p.items=p.items.filter(c=>c.uid!=='b1');modal=null;render();assert.match(hand(),/くまのぬいぐるみ<\/b><span>ITEM ×1/);
// Online public views group only the local seat's items.
state.players[1].items=[{uid:'other1',item:'meat'},{uid:'other2',item:'meat'},{uid:'other3',item:'meat'}];state=IDOL.publicView(state,1);render();assert.match(hand(),/肉<\/b><span>ITEM ×3/);assert(!hand().includes('くまのぬいぐるみ</b>'));
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert,listeners);
console.log('Item stacks: counts, real ticket consumption, empty removal, separate meat payments, teddy decrement and online seat display passed');
