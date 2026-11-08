import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const nodes=new Map(),listeners={};
const document={querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,fn){listeners[k]=fn;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert','listeners',code+`
const click=(action,id)=>listeners.click({target:{closest:()=>({dataset:{action,id},disabled:false})}});
for(let n=0;n<300;n++){const c=randomCpuConfig();assert(cpuConfigOK(c));assert(c.events.every(id=>c.team.includes(id)||Object.hasOwn(COMMON,id)),'Random opponent never has another member’s event');}
// No manual selection: generate each time and start directly, without an opponent editor.
const makeRandom=randomCpuConfig;let generated=0;randomCpuConfig=()=>{generated++;return makeRandom();};
openCpuSetup(false);click('close');assert.equal(cpuConfig,null,'Cancel does not select a CPU lineup');generated=0;
start();assert.equal(screen,'match');assert.equal(modal.kind,'opening');assert.equal(generated,1);assert.equal(cpuConfig,null);assert(cpuConfigOK({team:state.players[1].team,leader:state.players[1].leader,events:state.players[1].events.map(e=>e.id)}));
screen='setup';modal=null;start();assert.equal(generated,2,'Every unconfigured new match draws a fresh lineup');assert.equal(cpuConfig,null);
screen='setup';modal=null;openCpuSetup(true);assert.equal(modal.kind,'cpu-setup');assert(modal.launch);

modal.draft={team:['shio','kayo','hana'],leader:'kayo',events:['shio','kayo','hana']};
click('cpu-member','shio');assert(!modal.draft.events.includes('shio'));assert(!cpuSetupHTML().includes('data-id="shio" aria-pressed="true"'));assert(!cpuConfigOK(modal.draft));assert.match(cpuSetupHTML(),/data-action="cpu-confirm" disabled/);
click('cpu-member','shio');click('cpu-event','shio');assert(cpuConfigOK(modal.draft));
listeners.change({target:{id:'cpu-leader',value:'hana'}});assert.equal(modal.draft.leader,'hana');
const beforeManualStart=generated;click('cpu-confirm');assert.equal(generated,beforeManualStart,'A manually confirmed opponent is used directly');assert.equal(screen,'match');assert.equal(state.players[1].leader,'hana');assert.deepEqual(state.players[1].team,['kayo','hana','shio']);assert.deepEqual(state.players[1].events.map(e=>e.id),['kayo','hana','shio']);assert.equal(modal.kind,'opening');
const before={team:[...state.players[1].team],leader:state.players[1].leader,events:state.players[1].events.map(e=>e.id)};
click('rematch');assert.deepEqual(state.players[1].team,before.team);assert.equal(state.players[1].leader,before.leader);assert.deepEqual(state.players[1].events.map(e=>e.id),before.events);
// Editing is a draft: cancel doesn't overwrite the previous opponent.
screen='setup';openCpuSetup(false);click('cpu-member','shio');click('close');assert(cpuConfig.team.includes('shio'));assert.equal(modal,null);
assert(!cpuConfigOK({team:['kayo','hana','shio'],leader:'kayo',events:['machi','kayo','hana']}));
// A non-leader Shio's event still motivates voltage at/above 100%.
state=IDOL.create(['kayo','hana','shio'],'kayo',['rai','machi','natsume'],'rai',0,123,['shio','hana','kayo']);const p=state.players[0];p.vol=100;p.hand=[{uid:'vol-shio',owner:'shio',n:1}];p.ready=[false,false,true];state.row=state.row.map(f=>({...f,type:'trouble'}));const a=IDOL.ai(state);assert.equal(a.type,'play');assert.equal(a.mode,'fan');
// Event use remains subject to its voltage and exact payment requirements.
p.memory=Array.from({length:6},(_,n)=>({uid:'pay'+n,owner:n<4?'shio':'kayo',n:1}));assert(IDOL.eventOK(state,0,'shio'));p.vol=180;assert(IDOL.eventOK(state,0,'shio'));p.fanChips=13;const event=IDOL.ai(state);assert.equal(event.type,'event');assert.equal(event.id,'shio');assert.equal(event.memory.length,5);assert(IDOL.paymentOK(p,event.id,event.memory));
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert,listeners);
console.log('CPU setup: valid random events, draft editing, member/leader/event selection, start confirmation, same-opponent rematch and Shio voltage passed');
