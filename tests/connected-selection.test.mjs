import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {handle} from '../room-server/rooms.mjs';
class Bucket{constructor(){this.map=new Map();this.serial=0;}async get(k){const x=this.map.get(k);return x?{etag:x.etag,json:async()=>JSON.parse(x.value)}:null;}async put(k,value,o={}){const old=this.map.get(k),c=o.onlyIf;if(c instanceof Headers){if(c.get('if-none-match')==='*'&&old)return null;}else if(c?.etagMatches&&c.etagMatches!==old?.etag)return null;const etag=String(++this.serial);this.map.set(k,{value,etag});return {etag};}}
const bucket=new Bucket(),env={BUCKET:bucket},html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],rooms=fs.readFileSync(new URL('../rooms.js',import.meta.url),'utf8');
function client(store=new Map()){
 const nodes=new Map(),listeners={},storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 const document={hidden:false,querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',classList:{toggle(){}},setAttribute(){},querySelector:()=>null});return nodes.get(k);},addEventListener(k,f){(listeners[k]??=[]).push(f);}};
 const c=vm.createContext({document,localStorage:storage,sessionStorage:storage,setTimeout:()=>0,clearTimeout(){},crypto:webcrypto,URLSearchParams,AbortController,Date,console,location:{search:'',pathname:'/IDOL/',hash:''},history:{replaceState(){}},fetch:async(url,o)=>{if(c.offline)throw Error('offline');return handle(new Request(url,{method:o.method,headers:o.headers,body:o.body}),env);}});vm.runInContext(code+'\n'+rooms,c);
 return {c,run:s=>vm.runInContext(s,c),nodes,store,listeners};
}
const a=client(),b=client(),tick=()=>new Promise(r=>setImmediate(r));
a.run('firstMode="0";battleMode="online";onlineLobby()');await a.run("onlineAction('online-host')");
const number=a.run('net.code'),token=a.run('net.token');assert.equal(a.run('screen'),'setup');assert.equal(a.run('net.phase'),'waiting');assert.equal(a.run('state'),null);assert.match(a.nodes.get('#app').innerHTML,/接続中キャラ選択/);
b.run('battleMode="online";onlineLobby()');b.run('net.input='+JSON.stringify(number));await b.run("onlineAction('online-join')");await a.run('roomSync(net)');
for(const x of [a,b]){assert.equal(x.run('screen'),'setup');assert.equal(x.run('net.phase'),'selecting');assert.equal(x.run('state'),null);assert.equal(x.run('net.deadline'),0);assert.match(x.nodes.get('#app').innerHTML,/編成を呼び出す/);assert.match(x.nodes.get('#app').innerHTML,/編成ランダム/);}
// Editing survives unchanged polls and an opponent's confirmation. No hands exist yet.
a.run("team=['emi','hikari','aya'];leader='emi';chosenEvents=['emi','hikari','aya'];setupTab='leader';render()");await a.run('roomSync(net)');assert.equal(a.run('leader'),'emi');assert.equal(a.run('setupTab'),'leader');
await b.run("onlineAction('online-lineup-confirm')");await tick();assert.equal(b.run('modal.kind'),'lineup-wait');assert.equal(b.run('net.rematchLocal'),true);assert.equal(b.run('state'),null);
await a.run('roomSync(net)');assert.equal(a.run('leader'),'emi');assert.equal(a.run('net.rematchOther'),true);assert.equal(a.run('setupTab'),'leader');
await a.run("onlineAction('online-lineup-confirm')");await tick();assert.equal(a.run('modal.kind'),'opening');assert.equal(a.run('state.players[0].leader'),'emi');assert.equal(a.run('net.deadline'),0);await b.run('roomSync(net)');
await a.run('onlineReady()');assert.equal(a.run('net.phase'),'opening');assert.equal(a.run('net.deadline'),0);await b.run('onlineReady()');await a.run('roomSync(net)');assert.equal(a.run('net.phase'),'playing');assert.equal(a.run('screen'),'match');assert(a.run('net.deadline')>Date.now());
// Finish a fixture match and verify both winner and loser see exactly one result control.
const key='rooms/'+number+'.json',record=JSON.parse(bucket.map.get(key).value);record.state.winner=0;record.phase='ended';record.deadline=0;record.rev++;await bucket.put(key,JSON.stringify(record));
for(const x of [a,b]){await x.run('roomSync(net)');assert.equal(x.run('modal.kind'),'result');const result=x.nodes.get('#modal').innerHTML;assert.equal((result.match(/<button/g)||[]).length,1);assert.match(result,/online-result-ok/);assert(!result.includes('data-action="close"'));await x.run("onlineAction('online-result-ok')");assert.equal(x.run('screen'),'setup');assert.equal(x.run('modal'),null);assert.equal(x.run('net.code'),number);await x.run('roomSync(net)');assert.equal(x.run('screen'),'setup');assert.equal(x.run('modal'),null);}
assert.equal(a.run('net.token'),token);
a.run("team=['aya','kayo','shio'];leader='aya';chosenEvents=['aya','kayo','shio'];setupTab='events';render();roomStore()");
const reloaded=client(a.store);await tick();await reloaded.run('roomSync(net)');assert.equal(reloaded.run('screen'),'setup');assert.equal(reloaded.run('leader'),'aya');assert.equal(reloaded.run('net.resultAckRound'),1);assert.equal(reloaded.run('modal'),null);
// Durable confirmation retry keeps the selected lineup rather than overwriting it with the old config.
a.c.offline=true;await a.run("onlineAction('online-lineup-confirm')");await tick();assert.equal(a.run('net.rematchPending.config.leader'),'aya');assert.equal(a.run('modal.kind'),'lineup-wait');a.c.offline=false;await a.run('roomSync(net)');assert.equal(a.run('net.rematchLocal'),true);
await b.run('roomSync(net)');assert.equal(b.run('modal'),null);assert.equal(b.run('screen'),'setup');await b.run("onlineAction('online-lineup-confirm')");await tick();await a.run('roomSync(net)');assert.equal(a.run('net.round'),2);assert.equal(a.run('modal.kind'),'opening');assert.equal(a.run('state.players[0].leader'),'aya');assert.equal(a.run('state.first'),1);assert.equal(a.run('net.token'),token);
console.log('Connected selection: no game/clock before mutual lineups, draft preservation, confirmation locks, both result OK only, same-room return, reload, offline retry and changed-lineup rematch passed');
