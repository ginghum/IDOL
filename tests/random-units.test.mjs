import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],rooms=fs.readFileSync(new URL('../rooms.js',import.meta.url),'utf8');
const nodes=new Map(),listeners={},saved=new Map(),document={hidden:false,querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',classList:{toggle(){}},setAttribute(){},querySelector:()=>null,remove(){}});return nodes.get(k);},createElement:()=>({setAttribute(){},remove(){}}),addEventListener(k,fn){(listeners[k]??=[]).push(fn);}};
const storage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)};
const c=vm.createContext({document,localStorage:storage,sessionStorage:storage,setTimeout:()=>0,clearTimeout(){},crypto:webcrypto,URLSearchParams,AbortController,Date,console});
vm.runInContext(code+'\n'+rooms,c);const run=s=>vm.runInContext(s,c);
run('notify=function(){}');
const click=action=>{for(const fn of listeners.click)fn({target:{closest:()=>({dataset:{action},disabled:false})}});};
// Main preparation has both controls; random events always suit the selected members.
assert(run("setupMatchHTML().includes('data-action=\"unit-save-open\"')"));assert(run("setupMatchHTML().includes('data-action=\"unit-random\"')"));
const original=run('JSON.stringify(unitConfig())');
for(let i=0;i<150;i++){click('unit-random');assert(run('cpuConfigOK(modal.draft)'));assert.equal(run('JSON.stringify(unitConfig())'),original);click('unit-random-cancel');}
run("unitSlots[0]=unitSnapshot('保存テスト',unitConfig());unitLoaded=0;unitName='保存テスト';");const savedUnit=run('JSON.stringify(unitSlots[0])');
click('unit-random');const preview=run('JSON.stringify(modal.draft)');click('unit-random-again');assert.equal(run('JSON.stringify(unitConfig())'),original);click('close');assert.equal(run('JSON.stringify(unitConfig())'),original);
click('unit-random');const accepted=run('JSON.stringify(modal.draft)');click('unit-random-confirm');assert.equal(run('JSON.stringify(unitConfig())'),accepted);assert.equal(run('setupTab'),'match');assert.equal(run('screen'),'setup');assert.equal(run('unitLoaded'),null);assert.equal(run('JSON.stringify(unitSlots[0])'),savedUnit);assert.equal(saved.size,0,'Random apply never persists a unit');
click('unit-save-open');assert.equal(run('modal.kind'),'unit-save');click('close');
run("battleMode='online'");click('unit-random');click('unit-random-confirm');assert.equal(run('battleMode'),'online','Online preparation uses the same random flow');assert.equal(run('net'),null,'Randomizing never creates or leaves a room');
// Random rematch is a draft until explicitly applied and separately confirmed for replay.
run(`state=IDOL.create(team,leader,['rai','hana','shio'],'rai',0,123,chosenEvents,['rai','hana','shio']);state.winner=0;screen='match';net=roomNet();net.code='1234';net.phase='ended';net.round=1;net.rev=9;net.connected=true;modal={kind:'rematch-unit',draft:JSON.parse(JSON.stringify(net.config)),name:'元の編成',slot:0};`);
const beforeRematch=run('JSON.stringify(modal.draft)'),token=run('net.token');
click('unit-random');assert.equal(run('modal.kind'),'unit-random-confirm');assert.equal(run('JSON.stringify(modal.returnTo.draft)'),beforeRematch);
run("location={search:'',pathname:'/IDOL/',hash:''};history={replaceState(){}}");
c.poll={protocol:'idol-rooms-1',code:'1234',rev:10,round:1,phase:'ended',now:Date.now(),rematchLocal:false,rematchOther:true,readyLocal:true,state:run('JSON.parse(JSON.stringify(state))'),configLocal:run('net.config')};
run('roomAccept(net,poll)');assert.equal(run('modal.kind'),'unit-random-confirm','Opponent readiness must preserve the confirmation preview');
click('unit-random-cancel');assert.equal(run('JSON.stringify(modal.draft)'),beforeRematch);assert.equal(run('modal.slot'),0);
click('unit-random');const rematchRandom=run('JSON.stringify(modal.draft)');click('unit-random-confirm');assert.equal(run('modal.kind'),'rematch-unit');assert.equal(run('modal.slot'),'random');assert.equal(run('JSON.stringify({team:modal.draft.team,leader:modal.draft.leader,events:modal.draft.events})'),rematchRandom);assert.equal(run('net.rematchPending'),null);assert.equal(run('net.token'),token);assert.equal(run('JSON.stringify(unitSlots[0])'),savedUnit);
assert(nodes.get('#modal').innerHTML.includes('value="random" selected'));
click('unit-random');c.poll={...c.poll,rev:11,opponentLeft:true};run('roomAccept(net,poll)');assert.equal(run('modal.kind'),'result','Departed opponents close the random picker');const configBefore=run('JSON.stringify(net.config)');click('unit-random-confirm');assert.equal(run('JSON.stringify(net.config)'),configBefore);
console.log('Random units: compatible events, confirmation/cancel/reroll, untouched saves, main online mode, rematch session stability and opponent readiness/departure passed');
