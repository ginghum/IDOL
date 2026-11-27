import assert from 'node:assert/strict';import {handle,PROTOCOL} from '../room-server/rooms.mjs';import {IDOL as G} from '../room-server/idol-engine.mjs';
class Bucket{
 constructor(){this.map=new Map();this.serial=0;}
 async get(k){const x=this.map.get(k);return x?{etag:x.etag,json:async()=>JSON.parse(x.value)}:null;}
 async put(k,value,options={}){const old=this.map.get(k),cond=options.onlyIf;if(cond instanceof Headers){if(cond.get('if-none-match')==='*'&&old)return null;}else if(cond?.etagMatches&&cond.etagMatches!==old?.etag)return null;const etag=String(++this.serial);this.map.set(k,{value,etag});return {etag};}
}
const bucket=new Bucket(),env={BUCKET:bucket},tickets=['justice-host-12345678901234567890','justice-guest-12345678901234567890'];
async function req(path='',body,seat=0){const headers={'content-type':'application/json',authorization:'Bearer '+tickets[seat]};const res=await handle(new Request('https://test/api/rooms'+path,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined}),env);return {status:res.status,data:await res.json()};}
const config={team:['nitro','kagami','homura'],leader:'nitro',events:['nitro','kagami','request'],first:'0'};
let r=await req('',{ticket:tickets[0],config,protocol:PROTOCOL});assert.equal(r.status,200);const code=r.data.code;assert.equal((await req('/'+code+'/join',{ticket:tickets[1],config,protocol:PROTOCOL},1)).status,200);await req('/'+code+'/ready',{});await req('/'+code+'/ready',{},1);
let mods=0,steps=0;while(steps++<1400){const record=JSON.parse(bucket.map.get('rooms/'+code+'.json').value);const s=record.state;if(s.winner!==null)break;const seat=s.pending?.p??s.active,v=await req('/'+code,undefined,seat);assert(v.data.state.players[0].modDeck.every(x=>x===null));assert(v.data.state.players[1].hand.every(c=>!c.owner&&!c.mod));const a=G.ai(s);if(a.type==='choose'&&s.pending?.kind==='nitroMod'&&a.value!=='skip')mods++;const action=await req('/'+code+'/action',{rev:v.data.rev,requestId:'justice-nitro-action-'+steps,action:a},seat);assert.equal(action.status,200,JSON.stringify(action.data));}
assert(steps<1400);assert(mods>0);await req('/'+code+'/leave',{});await req('/'+code+'/leave',{},1);console.log('Justice/Nitro room API: full two-seat game, modifications, hidden deck/hand, action validation and completion passed');
