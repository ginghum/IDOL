import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
assert.equal(code.slice(code.indexOf('const IDOL = (() => {'),code.indexOf('const $=s=>')).trim(),readFileSync(new URL('../room-server/idol-engine.mjs',import.meta.url),'utf8').split('export {IDOL};')[0].split('*/')[1].trim(),'browser/server engine parity');
for(const G of [browser,server]){
 const make=()=>G.create(['hikari','kayo','hana'],'hikari',['machi','natsume','rai'],'machi',0,73,['hikari','switch','redo']);
 const give=(s,n)=>{const p=s.players[0];for(const z of ['hand','deck','memory','discard']){const at=p[z].findIndex(c=>c.owner==='hikari'&&c.n===n);if(at>=0){const [c]=p[z].splice(at,1);p.hand.push(c);return c;}}throw Error('missing');};
 {const s=make(),p=s.players[0];assert.equal(p.vol,30);assert.equal(p.hand.length,6);assert.equal(p.deck.length,21);const bad=[p.hand[0].uid,p.hand[0].uid,p.hand[1].uid],before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,{type:'leaderSkill',discard:bad},0));assert.equal(JSON.stringify(s),before);assert.throws(()=>G.peerAction(s,{type:'leaderSkill',discard:p.hand.slice(0,3).map(c=>c.uid)},1));
 const paid=p.hand.slice(0,3).map(c=>c.uid),t=G.peerAction(s,{type:'leaderSkill',discard:paid},0),q=t.players[0];assert.equal(q.chips,6);assert.equal(q.hand.length,3);assert.equal(q.discard.length,3);assert(q.hikariSkillUsed);assert.deepEqual(q.ready,[true,true,true]);assert.throws(()=>G.peerAction(t,{type:'leaderSkill',discard:q.hand.map(c=>c.uid)},0));
 // Actually switch out and back; usage survives both changes.
 const paySwitch=()=>{q.memory.push(...q.deck.splice(0,3));q.events.find(e=>e.id==='switch').used=false;G.dispatch(t,{type:'event',id:'switch',memory:G.autoPay(q,'switch'),leader:q.leader==='hikari'?'kayo':'hikari'});};paySwitch();paySwitch();assert.equal(q.leader,'hikari');assert.throws(()=>G.peerAction(t,{type:'leaderSkill',discard:q.hand.map(c=>c.uid)},0));
 }
 for(const n of [1,2,3])for(const mode of ['vol','fan']){
 const s=make(),p=s.players[0],c=give(s,n);p.vol=100;s.row.forEach(f=>{f.type='light';});const h=p.hand.length,d=p.deck.length;G.dispatch(s,{type:'play',card:c.uid,actors:Array.from({length:n},(_,j)=>j),mode});
 assert.equal(p.memory.at(-1).uid,c.uid);if(mode==='vol'&&n<3){assert.equal(s.pending,null);assert.equal(p.hand.length,h-1);continue;}
 assert.equal(s.pending.kind,'hikariOffer');const skip=G.peerAction(s,{type:'choose',value:'skip'},0);assert.equal(skip.players[0].hand.length,h-1);assert.equal(skip.players[0].deck.length,d);
 G.dispatch(s,{type:'choose',value:'accept'});const count=n===3?2:1,ids=p.hand.slice(0,count).map(c=>c.uid),handBefore=p.hand.length;
 for(const id of ids){G.dispatch(s,{type:'choose',value:id});if(s.pending){assert.equal(p.hand.length,handBefore);assert(!s.pending.options.includes(id));const v=G.publicView(s,1);assert.deepEqual(v.pending.options,[]);assert.deepEqual(v.pending.selected,[]);}}
 assert.equal(s.pending,null);assert.equal(p.hand.length,h);assert.equal(p.deck.length,d-count-1);assert.equal(p.discard.length,count);assert(ids.every(id=>p.discard.some(c=>c.uid===id)));
 }
 // Not enough cards to pay: no prompt. Short draws never recycle discarded cards.
 {const s=make(),p=s.players[0],c=give(s,3);p.deck.push(...p.hand.filter(x=>x!==c));p.hand=[c];G.dispatch(s,{type:'play',card:c.uid,actors:[0,1,2],mode:'vol'});assert.equal(s.pending,null);}
 {const s=make(),p=s.players[0],c=give(s,3);p.discard.push(...p.deck.splice(1));G.dispatch(s,{type:'play',card:c.uid,actors:[0,1,2],mode:'vol'});G.dispatch(s,{type:'choose',value:'accept'});const ids=p.hand.slice(0,2).map(c=>c.uid),h=p.hand.length;ids.forEach(value=>G.dispatch(s,{type:'choose',value}));assert.equal(p.hand.length,h-1);assert.equal(p.deck.length,0);}
 // WHITEOUT counts before six paid cards move into discard, floors odds, expires after turn.
 for(const count of [0,5,6,9]){const s=make(),p=s.players[0];const pool=[...p.hand,...p.deck];p.hand=[];p.deck=[];p.memory=[];for(let j=0;j<3;j++){const at=pool.findIndex(c=>c.owner==='hikari');p.memory.push(pool.splice(at,1)[0]);}p.memory.push(...pool.splice(0,3));p.discard=pool.splice(0,count);p.hand=pool;
 G.dispatch(s,{type:'event',id:'hikari',memory:G.autoPay(p,'hikari')});assert.equal(p.temp,Math.floor(count/2));assert.equal(p.discard.length,count+6);assert(p.events[0].used);G.dispatch(s,{type:'end'});assert.equal(p.temp,0);}
 {const s=make(),p=s.players[0];p.memory.push(...p.deck.splice(0,6));while(p.memory.filter(c=>c.owner==='hikari').length<3){const c=give(s,1);p.hand=p.hand.filter(x=>x!==c);p.memory.push(c);}p.discard.push(...p.deck.splice(0,4));p.fanChips=18;G.dispatch(s,{type:'event',id:'hikari',memory:G.autoPay(p,'hikari')});assert.equal(s.winner,0);}
 {const s=make(),c=give(s,3);G.dispatch(s,{type:'play',card:c.uid,actors:[0,1,2],mode:'vol'});G.dispatch(s,{type:'choose',value:'accept'});G.timeout(s);assert.equal(s.turn,2);assert.equal(s.pending,null);assert.equal(s.players[0].discard.length,2);}
 // CPU plays Hikari and resolves all new choices with legal actions.
 const ids=Object.keys(G.CHAR).filter(x=>x!=='hikari');
 for(let seed=1;seed<=100;seed++){
 const a=['hikari',ids[seed%9],ids[(seed+3)%9]],b=['hikari',ids[(seed+2)%9],ids[(seed+5)%9]],s=G.create(a,a[seed%3],b,b[(seed+1)%3],seed%2,seed);let moves=0;
 while(s.winner===null&&moves++<2000){G.dispatch(s,G.ai(s));for(const p of s.players){assert.equal(p.hand.length+p.deck.length+p.memory.length+p.discard.length,27);assert(p.chips>=0);}}
 assert.notEqual(s.winner,null,'Hikari CPU match terminates');
 }
}
// Exercise real pending and skill selection render paths, including cancellation and opponent privacy.
const nodes=new Map(),listeners={};const document={querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(t,f){listeners[t]=f;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert',code+`
state=IDOL.create(['hikari','kayo','hana'],'hikari',['rai','shio','machi'],'rai',0,5);screen='match';modal=null;
state.pending={p:0,kind:'hikariOffer',count:2,options:['skip','accept'],text:'手札交換'};renderModal();assert.match($('#modal').innerHTML,/今回は使わない/);
state.pending={p:0,kind:'hikariDiscard',count:2,selected:[],options:state.players[0].hand.map(c=>c.uid),text:'手札選択'};renderModal();assert.match($('#modal').innerHTML,/data-action="choose"/);
state.pending=null;modal={kind:'hikari-skill'};selection={discard:state.players[0].hand.slice(0,3).map(c=>c.uid)};renderModal();assert.match($('#modal').innerHTML,/3枚捨てて応援＋6/);assert.match($('#modal').innerHTML,/キャンセル/);
assert.match(matchHTML(),/光 · 手札3枚→応援6/);
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert);
console.log('Hikari: both engines, exact/optional discard, privacy, skill reuse/switch, WHITEOUT pre-payment count, timeout, UI and 200 CPU matches passed');
