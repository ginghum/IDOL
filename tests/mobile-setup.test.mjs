import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const nodes=new Map(),listeners={},store=new Map();let mobile=true;
const document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',querySelector:()=>null,remove(){},focus(){}});return nodes.get(k);},createElement:()=>({setAttribute(){},remove(){}}),body:{append(){},classList:{toggle(){}}},documentElement:{scrollTop:0,classList:{toggle(){}}},addEventListener(k,fn){listeners[k]=fn;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert','listeners','matchMedia','innerHeight',code+`
const click=(action,id)=>listeners.click({target:{closest:()=>({dataset:{action,id:String(id??'')},disabled:false})}});
assert(compactSetupEnabled());assert.match(setupHTML(),/compact-editor/);
const original=JSON.stringify(unitConfig());
click('setup-layout-legacy');assert(!compactSetupEnabled());assert.match(setupHTML(),/studio-tidy/);assert.equal(localStorage.getItem(SETUP_LAYOUT_KEY),'legacy');
click('setup-layout-compact');assert(compactSetupEnabled());assert.equal(JSON.stringify(unitConfig()),original);
// Every character remains reachable with compact paging, including the short last page.
const seen=new Set();rosterQuery='';rosterFilter='all';rosterGroup='all';
for(let page=0;page<Math.ceil(IDS.length/3);page++){rosterPage=page;const markup=rosterResultsHTML();for(const id of IDS)if(markup.includes('data-action="team" data-id="'+id+'"'))seen.add(id);}
assert.equal(seen.size,IDS.length);rosterPage=999;rosterResultsHTML();assert.equal(rosterPage,Math.ceil(IDS.length/3)-1);
rosterQuery='にとろ';rosterPage=0;assert.match(rosterResultsHTML(),/data-id="nitro"/);rosterQuery='';
// Detail values must come from the engine, rather than assuming every character's base values.
modal={kind:'compact-detail',id:'natsume',page:0};assert(compactDetailPages().some(p=>p.text.includes('FAN +4')));
for(const id of IDS){modal={kind:'compact-detail',id,page:0};assert(compactDetailPages().every(p=>p.text.length<230));}
click('cs-menu');assert.equal(modal.kind,'cs-menu');click('unit-save-open');unitName='mobile';click('unit-save');assert.equal(unitSlots[0].name,'mobile');
click('unit-library');assert.match(compactModalHTML(),/保存枠 1/);click('cs-library-next');assert.equal(compactLibraryPage,1);click('cs-library-prev');click('unit-load',0);assert.equal(JSON.stringify(unitConfig()),original);
// CPU detail returns to the same independent draft.
click('cpu-setup');const cpuDraft=JSON.stringify(modal.draft);click('cs-cpu-events');const event=modal.draft.events[0];click('cs-event-detail',event);click('close');assert.equal(modal.kind,'cpu-setup');assert.equal(JSON.stringify(modal.draft),cpuDraft);assert.equal(modal.compactTab,'events');click('close');
// Event filters clamp pagination and retain the selected cards.
eventFilter='all';compactEventPage=999;compactEventsHTML();assert(compactEventPage<Object.keys(EVENTS).length);listeners.change({target:{id:'event-filter',value:'selected',dataset:{}}});assert.equal(compactEventPage,0);assert.deepEqual(chosenEvents,JSON.parse(original).events);
net={mode:'room',code:'1234',phase:'selecting',joined:false,timeLimit:false};setupTab='match';assert.match(setupHTML(),/data-action="online-lineup-confirm"[^>]*disabled/);assert.match(compactMatchHTML(),/相手の参加待ち/);
net.joined=true;assert(!/data-action="online-lineup-confirm"[^>]*disabled/.test(setupHTML()));net.rematchLocal=true;assert.match(setupHTML(),/data-action="online-lineup-confirm"[^>]*disabled/);
`)(document,{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},()=>0,()=>{},assert,listeners,()=>({matches:mobile}),568);
console.log('Compact editor: draft-preserving restore, complete pagination, detail values, saved units, CPU draft and connected-room readiness passed');
