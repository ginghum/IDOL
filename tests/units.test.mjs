import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const store=new Map();let blockWrites=false;
function run(check){
 const nodes=new Map(),listeners={};
 const document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',querySelector:()=>null,remove(){},focus(){}});return nodes.get(k);},createElement:()=>({setAttribute(){},remove(){}}),body:{append(){},classList:{toggle(){}}},documentElement:{scrollTop:0},addEventListener(k,fn){listeners[k]=fn;}};
 new Function('document','localStorage','setTimeout','clearTimeout','assert','listeners',code+`
 const click=(action,id)=>listeners.click({target:{closest:()=>({dataset:{action,id:String(id??'')},disabled:false})}});
 `+check)(document,{getItem:k=>store.get(k)||null,setItem(k,v){if(blockWrites)throw Error('quota');store.set(k,v);}},()=>0,()=>{},assert,listeners);
}
run(`
assert.equal(unitSlots.length,15);assert.equal(unitSlots.filter(Boolean).length,0);
assert(unitOK(unitConfig()));
// Saving all slots and checking the maximum after a page reload.
for(let i=0;i<15;i++){unitTarget=i;unitName='チーム '+i;click('unit-save');assert.equal(unitSlots[i].name,'チーム '+i);}
click('unit-library');assert($('#modal').innerHTML.includes('15 / 15'));assert.equal((savedUnitsHTML().match(/data-action="unit-load"/g)||[]).length,15);
// A loaded unit is a deep copy. Editing and playing must not alter saved data.
click('unit-load',0);const original=JSON.stringify(unitSlots[0]);
click('leader','machi');click('setup-event','kayo');click('setup-event','mc');assert(unitDirty());
assert.equal(JSON.stringify(unitSlots[0]),original);
start(true,{team:['rai','hana','shio'],leader:'rai',events:['rai','hana','shio']});assert.equal(screen,'match');assert.equal(state.players[0].leader,'machi');assert(state.players[0].events.some(e=>e.id==='mc'));assert.equal(JSON.stringify(unitSlots[0]),original);
screen='setup';click('unit-save');assert.equal(modal.kind,'unit-overwrite');click('close');assert.equal(JSON.stringify(unitSlots[0]),original);
click('unit-save');click('unit-overwrite-confirm');assert.equal(unitSlots[0].leader,'machi');assert(!unitDirty());
// New drafts do not delete or save anything; only complete units can start/save.
click('unit-new');assert.equal(team.length,0);assert(!unitOK(unitConfig()));const before=localStorage.getItem(UNIT_SAVE);click('unit-save');start();assert.equal(localStorage.getItem(UNIT_SAVE),before);assert.equal(screen,'setup');
click('unit-load',14);click('unit-delete',14);click('unit-delete-confirm');assert.equal(unitSlots[14],null);assert.equal(team.length,3);assert.equal(unitLoaded,null);
// Search includes songs, no-result and selection filters, pagination bounds.
rosterQuery='黄金冒険譚';assert.deepEqual(rosterIDs(),['hakka']);rosterQuery='no such idol';assert.match(rosterResultsHTML(),/該当するメンバーがいません/);rosterQuery='';rosterFilter='selected';assert.deepEqual(rosterIDs(),IDS.filter(id=>team.includes(id)));rosterFilter='all';rosterPage=99;rosterResultsHTML();assert.equal(rosterPage,Math.floor((IDS.length-1)/ROSTER_PAGE_SIZE));
unitName='<img src=x onerror=alert(1)>';unitTarget=14;click('unit-save');assert(savedUnitsHTML().includes('&lt;img'));assert(!savedUnitsHTML().includes('<img src=x'));
`);
run(`assert.equal(unitSlots.length,15);assert.equal(unitSlots[0].leader,'machi');assert(unitSlots[14].name.startsWith('<img'));click('unit-load',14);assert.equal(unitName,unitSlots[14].name);team.pop();assert.equal(unitSlots[14].team.length,3);`);
blockWrites=true;
run(`click('unit-load',0);const original=JSON.stringify(unitSlots);unitName='保存不可';click('unit-save');click('unit-overwrite-confirm');assert.equal(JSON.stringify(unitSlots),original);assert.equal(modal.kind,'unit-overwrite');`);
blockWrites=false;store.set('idol-live-duel-units-v1','broken JSON');run(`assert.equal(unitSlots.length,15);assert(unitStorageWarning);assert(unitOK(unitConfig()));`);
console.log('Units: 15 slots, reload, independent draft, overwrite/cancel, delete, unsaved match, search/pagination, escaping and storage failures passed');
