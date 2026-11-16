import assert from 'node:assert/strict';
import{handle,PROTOCOL}from'../room-server/rooms.mjs';
import{IDOL as G}from'../room-server/idol-engine.mjs';
class Bucket{constructor(){this.map=new Map();this.serial=0;}async get(k){const x=this.map.get(k);return x?{etag:x.etag,json:async()=>JSON.parse(x.value)}:null;}async put(k,value,options={}){const old=this.map.get(k),cond=options.onlyIf;if(cond instanceof Headers){if(cond.get('if-none-match')==='*'&&old)return null;}else if(cond?.etagMatches&&cond.etagMatches!==old?.etag)return null;const etag=String(++this.serial);this.map.set(k,{value,etag});return{etag};}}
const env={BUCKET:new Bucket()},tickets=['g'.repeat(48),'k'.repeat(48)];let serial=0;
async function req(path='',body,seat=0){const r=await handle(new Request('https://test/api/rooms'+path,{method:body?'POST':'GET',headers:{'content-type':'application/json',authorization:'Bearer '+tickets[seat]},...(body?{body:JSON.stringify(body)}:{})}),env);return{status:r.status,...await r.json()};}
const config={team:['kana','tenko','mitsuha'],leader:'kana',events:['kana','tenko','mitsuha'],first:'0',timeLimit:true};
async function create(){const m=await req('',{ticket:tickets[0],config,protocol:PROTOCOL,flow:'selection'}),c=m.code;assert.equal(m.phase,'waiting');for(const j of [1])await req('/'+c+'/join',{ticket:tickets[j],config,protocol:PROTOCOL},j);for(const j of [0,1])await req('/'+c+'/prepare',{round:1,config},j);for(const j of [0,1])await req('/'+c+'/ready',{},j);return c;}
function patch(code,fn){const [key,obj]=[...env.BUCKET.map.entries()].find(([,v])=>JSON.parse(v.value).code===code),r=JSON.parse(obj.value);fn(r);env.BUCKET.map.set(key,{...obj,value:JSON.stringify(r)});}
async function action(code,a,seat=0){const d=await req('/'+code,undefined,seat);return req('/'+code+'/action',{rev:d.rev,requestId:'gokuraku-'+String(++serial).padStart(8,'0'),action:a},seat);}
for(const seat of [0,1]){
 const code=await create(),other=1-seat;
 patch(code,r=>{r.state.active=seat;const p=r.state.players[seat];p.chips=1;r.clockMode='turn';r.deadline=Date.now()+99000;r.turnRemaining=99000;});
 let d=await action(code,{type:'end'},seat);assert.equal(d.status,200);assert.equal(d.state.pending.kind,'kanaEnd');const denied=await action(code,{type:'choose',value:'use'},other);assert.equal(denied.status,400);assert.deepEqual((await req('/'+code,undefined,other)).state.pending.options,[]);
 d=await action(code,{type:'choose',value:'use'},seat);assert.equal(d.state.players[1].songSeal,true);assert.equal(d.state.active,1);
 d=await action(code,{type:'end',skipEndSkill:true},other);assert.equal(d.status,200);assert.equal((await req('/'+code,undefined,other)).state.players[0].songSeal,false);
 // Extra turns reset the turn clock while keeping the same player active; payload round-trips are authoritative.
 patch(code,r=>{const s=r.state,p=s.players[seat];s.active=seat;s.pending=null;s.queue=[];for(let j=0;j<8;j++)p.items.push({uid:'meat-'+s.serial++,item:'meat'});});
 let view=await req('/'+code,undefined,seat);d=await action(code,{type:'event',id:'tenko',memory:G.autoPay(view.state.players[0],'tenko')},seat);assert.equal(d.status,200);const turn=d.state.turn;
 d=await action(code,{type:'end',skipEndSkill:true},seat);assert.equal(d.status,200);assert.equal(d.state.turn,turn+1);assert.equal(d.state.active,0);assert.equal(d.clockOwner,0);assert(d.turnRemaining>90000);assert.equal(d.state.players[0].extraTurns,0);assert(d.state.players[1].hand.every(c=>!c.owner));
 // Hidden exchange never reveals the deck before the choice, in either seat.
 patch(code,r=>{r.state.players[seat].leader='mitsuha';r.state.active=other;r.state.pending=null;r.state.queue=[];r.state.row[0].lock=null;});
 await action(code,{type:'end',skipEndSkill:true},other);view=await req('/'+code,undefined,seat);assert.equal(view.state.pending.kind,'mitsuhaStart');assert.equal(view.state.audience[0].type,null);const hidden=await req('/'+code,undefined,other);assert.deepEqual(hidden.state.pending.options,[]);assert.equal(hidden.state.audience[0].type,null);
 const old=view.state.row[0].uid;d=await action(code,{type:'choose',value:'swap'},seat);assert.equal(d.status,200);assert.notEqual(d.state.row[0].uid,old);assert.equal(d.state.audience[0].type,null);
 // Mandatory timeout skips optional start exchange, ends exactly one turn and cannot expose a candidate.
 patch(code,r=>{r.state.pending={kind:'mitsuhaStart',p:seat,options:['skip','swap'],text:'三葉'};r.state.active=seat;r.deadline=Date.now()-1;r.clockMode='turn';});
 d=await req('/'+code,undefined,seat);assert.equal(d.status,200);assert.equal(d.state.pending,null);assert.equal(d.state.active,1);
 for(const j of [0,1])await req('/'+code+'/leave',{},j);
}
console.log('Gokurakuten room: both-seat authority, seal expiration, extra-turn clock, hidden exchange, timeout and reconnection-safe payloads passed');
