import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],rooms=fs.readFileSync(new URL('../rooms.js',import.meta.url),'utf8');
const nodes=new Map(),listeners={},saved=new Map(),requests=[];
const storage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)};
const document={hidden:false,querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',classList:{toggle(){}},setAttribute(){},querySelector:()=>null});return nodes.get(k);},addEventListener(k,fn){(listeners[k]??=[]).push(fn);}};
let response,offline=false;
const c=vm.createContext({document,localStorage:storage,sessionStorage:storage,setTimeout:()=>0,clearTimeout(){},crypto:webcrypto,URLSearchParams,AbortController,Date,console,location:{search:'',pathname:'/IDOL/',hash:''},fetch:async(url,options)=>{requests.push({url,body:options.body&&JSON.parse(options.body)});if(offline)throw Error('offline');return {ok:true,json:async()=>response};}});
vm.runInContext(code+'\n'+rooms,c);
const run=s=>vm.runInContext(s,c),tick=()=>new Promise(r=>setImmediate(r));
run(`
state=IDOL.create(team,leader,['rai','hana','shio'],'rai',0,123,chosenEvents,['rai','hana','shio']);state.winner=0;screen='match';
net=roomNet();net.code='1234';net.phase='ended';net.connected=true;net.round=1;net.rev=9;
unitSlots[4]={name:'雷の新編成',team:['rai','haru','homura'],leader:'rai',events:['rai','haru','mc']};modal={kind:'result'};renderModal();
`);
assert(nodes.get('#modal').innerHTML.includes('保存した編成で再戦'));
await run("onlineAction('online-rematch-choose')");assert.equal(run('modal.kind'),'rematch-unit');
assert(nodes.get('#modal').innerHTML.includes('雷の新編成'));
document.querySelector('#rematch-unit-slot').value='4';await run("onlineAction('online-rematch-pick')");
assert.equal(run('modal.draft.leader'),'rai');assert.equal(run('modal.name'),'雷の新編成');
assert.equal(run('team[0]'),'kayo','Picking a rematch does not edit setup draft');
// Opponent confirmation while the picker is open must not discard local selection.
response={protocol:'idol-rooms-1',code:'1234',rev:10,round:1,phase:'ended',now:Date.now(),readyLocal:true,rematchLocal:false,rematchOther:true,joined:true,state:run('JSON.parse(JSON.stringify(state))'),configLocal:run('net.config')};
c.response=response;run('roomAccept(net,response)');assert.equal(run('modal.kind'),'rematch-unit');assert.equal(run('modal.slot'),4);assert(nodes.get('#modal').innerHTML.includes('相手は再戦を希望'));
// A dropped reply retains the exact selected lineup for retry, including reload.
offline=true;await run("onlineAction('online-rematch-confirm')");await tick();
assert(requests.at(-1).url.endsWith('/1234/rematch'));assert.equal(requests.at(-1).body.config.leader,'rai');assert.equal(run('net.rematchPending.config.leader'),'rai');
const pending=JSON.parse(saved.get('idol-room-session-v1'));assert.equal(pending.rematchPending.config.leader,'rai');assert.equal(run('unitSlots[4].name'),'雷の新編成');
offline=false;response={...response,rev:11,rematchLocal:true,configLocal:requests.at(-1).body.config};await run('roomSync(net)');assert.equal(run('net.rematchPending'),null);assert.equal(run('net.rematchLocal'),true);assert.equal(run('net.config.leader'),'rai');assert.equal(run('net.code'),'1234');assert.equal(run('modal.kind'),'result');
await run("onlineAction('online-rematch-choose')");assert.equal(run('modal.kind'),'result','Confirmed lineups cannot be edited');
// Next round uses the same session and transitions to the normal opening screen.
const token=run('net.token');response={...response,rev:12,round:2,phase:'opening',readyLocal:false,rematchLocal:false,rematchOther:false,state:run("IDOL.create(net.config.team,net.config.leader,['hana','hakka','shio'],'hakka',1,456,net.config.events,['hana','hakka','shio'])")};await run('roomSync(net)');assert.equal(run('modal.kind'),'opening');assert.equal(run('net.token'),token);assert.equal(run('state.players[0].leader'),'rai');assert.equal(run('unitSlots[4].leader'),'rai');
console.log('Saved-lineup rematch: picker, selection stability, untouched saved/draft units, offline retry, config restore, locked confirmation and same-session opening passed');
