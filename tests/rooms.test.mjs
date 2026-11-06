import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const saved=new Map(),session=new Map(),view={textContent:'',classList:{toggle(){}}};
const storage=map=>({getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)});
let timer=0,requests=[],replaced=null;
const c=vm.createContext({crypto:webcrypto,URLSearchParams,AbortController,Uint8Array,Date,JSON,console,
 setTimeout:()=>++timer,clearTimeout(){},sessionStorage:storage(session),localStorage:storage(saved),
 document:{hidden:false,addEventListener(){},querySelector:()=>view,defaultView:{addEventListener(){}}},
 team:['kayo','machi','natsume'],leader:'kayo',chosenEvents:['kayo','machi','natsume'],firstMode:'0',
 net:null,state:null,modal:null,screen:'setup',selection:{},aiTimer:null,battleMode:'online',
 IDOL:{validateAction:a=>a},updateClockLabel(){},render(){},renderModal(){},captureMotion(){return null;},animateMotion(){},schedule(){},notify(){},
 history:{replaceState:(...args)=>{replaced=args;}},
 fetch:async(url,options)=>{requests.push({url,options});return {ok:true,json:async()=>response};}
});
vm.runInContext(fs.readFileSync(new URL('../rooms.js',import.meta.url),'utf8'),c);
c.location={search:'?room=0123',pathname:'/IDOL/',hash:''};
const snapshot={players:[{hand:[]},{hand:[]}],active:0,pending:null};
let response={protocol:'idol-rooms-1',code:'0123',rev:2,phase:'playing',deadline:Date.now()+60000,now:Date.now(),readyLocal:true,joined:true,state:snapshot};
vm.runInContext('net=roomNet();net.code="0123";roomAccept(net,'+JSON.stringify(response)+');',c);
assert.equal(replaced[2],'/IDOL/','Invite query is removed after joining so reload restores the existing seat');
assert.equal(c.net.phase,'playing');const token=c.net.token;
assert.equal(JSON.parse(session.get('idol-room-session-v1')).token,token);
assert.equal(JSON.parse(saved.get('idol-room-session-v1')).token,token);
// No-change polling preserves an in-progress selection.
c.modal={kind:'song',id:'x'};c.selection={actors:[0]};vm.runInContext('roomAccept(net,'+JSON.stringify(response)+');',c);
assert.equal(c.modal.kind,'song');assert.equal(c.selection.actors[0],0);
// Persist an action before sending and retry the same request ID after a lost response.
c.fetch=async()=>{throw Error('offline');};
vm.runInContext('onlineSend({type:"service",actor:0})',c);
await new Promise(r=>setImmediate(r));
const outbox=JSON.parse(session.get('idol-room-session-v1')).outbox;
assert(outbox.requestId);assert.equal(c.net.connected,false);assert.equal(c.net.outbox.requestId,outbox.requestId);
response={...response,rev:3};c.fetch=async(url,options)=>{requests.push({url,options});return {ok:true,json:async()=>response};};
await vm.runInContext('roomSync(net)',c);
const sent=JSON.parse(requests.at(-1).options.body);assert.equal(sent.requestId,outbox.requestId);assert.equal(c.net.outbox,null);assert.equal(c.net.connected,true);
// A stale action refreshes the board and unlocks input instead of freezing it.
c.net.outbox={...outbox,rev:1};c.net.waiting=true;
c.fetch=async()=>({ok:false,status:409,json:async()=>({...response,rev:4,error:'stale'})});
await vm.runInContext('roomSync(net)',c);assert.equal(c.net.rev,4);assert.equal(c.net.outbox,null);assert.equal(c.net.waiting,false);
// Reload restores this tab's seat even when another tab updated shared local storage.
c.location.search='';saved.set('idol-room-session-v1',JSON.stringify({code:'9999',token:'other-seat'}));
c.fetch=async()=>({ok:true,json:async()=>response});vm.runInContext('roomResume()',c);await new Promise(r=>setImmediate(r));
assert.equal(c.net.token,token);assert.equal(c.net.code,'0123');
c.location.search='?room=0123';const pending=JSON.parse(session.get('idol-room-session-v1'));pending.joining=true;session.set('idol-room-session-v1',JSON.stringify(pending));
c.fetch=async(url,options)=>{requests.push({url,options});return {ok:true,json:async()=>response};};
vm.runInContext('roomResume()',c);await new Promise(r=>setImmediate(r));assert.equal(c.net.token,token);assert(requests.at(-1).url.endsWith('/0123/join'),'A lost join reply resumes with the same ticket even from an invitation URL');
console.log('Room client: invitation reload, per-tab seat persistence, selection stability, durable retry and conflict recovery passed');
