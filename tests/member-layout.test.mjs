import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map(),listeners={};
const document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,fn){listeners[k]=fn;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert','listeners',code+String.raw`
const click=(action,id,p=0)=>listeners.click({target:{closest:()=>({dataset:{action,id,p:String(p)},disabled:false})}});
// The upper selection strip can remove members from any editor step.
const original=['kayo','machi','natsume'];team=[...original];leader='kayo';chosenEvents=[...original];unitSlots[0]={name:'保存済み',team:[...team],leader,events:[...chosenEvents]};unitLoaded=0;
const savedBefore=JSON.stringify(unitSlots[0]);
for(const step of ['members','leader','events','match']){
 team=[...original];leader='kayo';setupTab=step;const html=setupHTML();
 assert.equal((html.match(/class="unit-member-remove"/g)||[]).length,3);
 assert.match(html,/aria-label="小鳥遊佳代を編成から外す"/);
 click('team','kayo');assert.deepEqual(team,['machi','natsume']);assert.equal(leader,'machi');assert(!unitOK(unitConfig()));assert.equal(setupTab,step);assert.deepEqual(chosenEvents,original);assert.equal(JSON.stringify(unitSlots[0]),savedBefore);
}
click('team','machi');click('team','natsume');assert.equal(leader,null);assert.equal(team.length,0);assert(!setupHTML().includes('class="unit-member-remove"'));
rosterQuery='';rosterGroup='all';rosterFilter='all';assert(!rosterResultsHTML().includes('casting-role'));assert(!rosterResultsHTML().includes('手札展開'));
modal={kind:'cpu-setup',draft:{team:[...original],leader:'kayo',events:[...original]}};assert(!cpuSetupHTML().includes('手札展開'));assert(!guideCharacterHTML('kayo').includes('手札展開'));
// Preserve team/actor indices while placing either side's leader second in the DOM.
state=IDOL.create(original,'kayo',['rai','shio','hana'],'rai',0,31,['switch','redo','wit']);screen='match';modal=null;
const ordered=html=>[...html.matchAll(/data-id="(\d)" data-p="\d"/g)].map(x=>Number(x[1]));
for(const seat of [0,1]){const p=state.players[seat],before=JSON.stringify(p);for(const id of p.team){p.leader=id;const snapshot=JSON.stringify(p),markup=tableMembers(p,seat),order=ordered(markup);assert.equal(order.length,3);assert.equal(p.team[order[1]],id);assert.equal(new Set(order).size,3);assert.equal(JSON.stringify(p),snapshot,'render does not mutate engine state');}p.leader=JSON.parse(before).leader;}
const p=state.players[0];assert.deepEqual(ordered(tableMembers(p,0)),[1,0,2]);
click('member-info','0');assert.equal(modal.j,0);assert.match($('#modal').innerHTML,/小鳥遊佳代/);click('service','0');assert.equal(state.players[0].ready[0],false);assert.equal(state.players[0].ready[1],true);
// A real Center Switch immediately moves the new leader while preserving ready states.
const live=state.players[0],teamBefore=[...live.team],readyBefore=[...live.ready];live.memory.push(...live.deck.splice(0,3));state=IDOL.peerAction(state,{type:'event',id:'switch',leader:'natsume',memory:IDOL.autoPay(live,'switch')},0);
assert.deepEqual(state.players[0].team,teamBefore);assert.deepEqual(state.players[0].ready,readyBefore);assert.deepEqual(ordered(tableMembers(state.players[0],0)),[0,2,1]);
// Both remapped online views use the same presentation and keep real actor IDs.
for(const seat of [0,1]){const savedState=state;state=IDOL.publicView(savedState,seat);for(const who of [0,1]){const order=ordered(tableMembers(state.players[who],who));assert.equal(state.players[who].team[order[1]],state.players[who].leader);}state=savedState;}
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert,listeners);
console.log('Member layout: upper-strip removal/all steps/saved draft, no role tags, both-seat centered leaders, real service/switch actor identity and online remapping passed');
