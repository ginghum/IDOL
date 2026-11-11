import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
for(const G of [browser,server]){
 const make=(who=0)=>G.create(['fukurou','moe','hakka'],'fukurou',['fukurou','nina','ayame'],'fukurou',who,724,['fukurou','switch','moe'],['fukurou','nina','mc']);
 const give=(s,i,n,owner='fukurou')=>{const p=s.players[i];for(const zone of ['hand','deck']){const at=p[zone].findIndex(c=>c.owner===owner&&c.n===n);if(at>=0){const c=p[zone].splice(at,1)[0];p.hand.push(c);return c;}}throw Error('missing song');};
 const bad=(s,a,i=s.active)=>{const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,a,i));assert.equal(JSON.stringify(s),before);};
 const settle=s=>{let guard=0;while(s.pending&&guard++<100)G.dispatch(s,G.ai(s));assert(!s.pending);};
 const pay=(s,i)=>{const p=s.players[i],all=[...p.hand,...p.deck],cs=[...all.filter(c=>c.owner==='fukurou').slice(0,2),...all.filter(c=>c.owner!=='fukurou').slice(0,4)],ids=cs.map(c=>c.uid);p.hand=p.hand.filter(c=>!ids.includes(c.uid));p.deck=p.deck.filter(c=>!ids.includes(c.uid));p.memory.push(...cs);return ids;};
 assert.equal(G.CHAR.fukurou.name,'月田フクロウ');assert.equal(make().players[0].vol,30);assert.equal(make().players[0].hand.length,5);
 for(const who of [0,1])for(const n of [1,2,3])for(const mode of ['vol','fan'])for(const target of ['none','teddy','meat','ticket','fanChip']){
  const s=make(who),p=s.players[who],q=s.players[1-who],c=give(s,who,n);p.vol=[60,80,100][n-1];s.row.forEach(f=>f.type='light');s.audience.forEach(f=>f.type='light');q.chips=7;
  if(target==='fanChip')q.fanChips=1;else if(target!=='none')q.items.push({uid:'victim',item:target});
  G.dispatch(s,{type:'play',card:c.uid,mode,actors:Array.from({length:n},(_,j)=>j)});settle(s);
  assert.equal(q.items.length,0);assert.equal(q.fanChips,0);assert.equal(q.chips,7);assert.equal(p.fans.length,mode==='fan'?n:0);assert.equal(p.vol,[60,80,100][n-1]+(mode==='vol'?n*10:0));assert.match(G.detail(c).volText,/破壊/);assert.equal(G.detail(c).volText,G.detail(c).fanText);assert.equal(G.supportSealed(s,who),mode==='fan');
 }
 for(const n of [1,2,3]){const s=make(),c=give(s,0,n);s.players[0].vol=[60,80,100][n-1]-1;bad(s,{type:'play',card:c.uid,mode:'fan',actors:Array.from({length:n},(_,j)=>j)});}
 // Combined pool: each of 2 items and each of 3 fan tokens gets one slot, not a 50/50 category roll.
 const counts={teddy:0,ticket:0,chip:0};for(let seed=1;seed<=500;seed++){const s=make(),p=s.players[0],q=s.players[1],c=give(s,0,1);q.items=[{uid:'a',item:'teddy'},{uid:'b',item:'ticket'}];q.fanChips=3;s.seed=seed*7919;G.dispatch(s,{type:'play',card:c.uid,actors:[0],mode:'vol'});if(q.fanChips===2)counts.chip++;else counts[q.items.some(c=>c.item==='teddy')?'ticket':'teddy']++;assert.equal(q.items.length+q.fanChips,4);}
 assert(counts.chip>270&&counts.chip<330);assert(counts.teddy>80&&counts.teddy<120);assert(counts.ticket>80&&counts.ticket<120);
 for(const who of [0,1]){
  const s=make(who),p=s.players[who],c=give(s,who,1);p.vol=60;p.chips=10;p.moeFreeSupport=3;p.moeDouble=true;s.row[0].type='cheer';
  G.dispatch(s,{type:'play',card:c.uid,actors:[0],mode:'fan'});assert(G.supportSealed(s,who));assert.equal(p.chips,11,'chip gain stays legal');
  for(const a of [{type:'service',actor:1},...['draw','refresh','lock','hold'].flatMap(effect=>[false,true].map(free=>({type:'support',effect,free,target:'x'})))])bad(s,a);
  assert.equal(p.moeFreeSupport,3);assert(p.moeDouble);
  for(const seat of [0,1]){const v=G.publicView(s,seat);assert.equal(G.supportSealed(v,who===seat?0:1),true);assert(!('seed'in v));assert(v.players[1].hand.every(c=>!c.owner));}
  // Sealed ticket use and further song are legal; no token-based trigger against a newly changed leader.
  p.items.push({uid:'legal-ticket',item:'ticket'});s.lottery=Object.entries(G.LOTTERY).flatMap(([id,d])=>Array(d.count).fill(id));G.dispatch(s,{type:'ticket',id:'legal-ticket'});assert(G.supportSealed(s,who));
  const more=give(s,who,1,p.team[1]);G.dispatch(s,{type:'play',card:more.uid,actors:[1],mode:'vol'});
  G.dispatch(s,{type:'end'});assert(!G.supportSealed(s,who));G.dispatch(s,{type:'end'});assert(!G.supportSealed(s,who));G.dispatch(s,{type:'service',actor:0});settle(s);
 }
 for(const who of [0,1])for(const chips of [0,1,5,6,10]){const s=make(who),p=s.players[who],q=s.players[1-who],memory=pay(s,who);q.chips=chips;p.chips=2;p.supportSealTurn=s.turn;assert(G.eventOK(s,who,'fukurou'));G.dispatch(s,{type:'event',id:'fukurou',memory});assert.equal(p.chips,2+Math.min(6,chips));assert.equal(q.chips,Math.max(0,chips-6));assert.equal(p.discard.length,6);assert(p.events.find(e=>e.id==='fukurou').used);bad(s,{type:'event',id:'fukurou',memory});}
 {const s=make(),paid=pay(s,0);bad(s,{type:'event',id:'fukurou',memory:paid.slice(0,5)});bad(s,{type:'event',id:'fukurou',memory:[...paid.slice(0,5),paid[0]]});const wrong=s.players[0].deck.find(c=>c.owner!=='fukurou');bad(s,{type:'event',id:'fukurou',memory:[...paid.slice(1),wrong.uid]});}
 {const s=make(),p=s.players[0];pay(s,0);p.discard.push(...p.hand,...p.deck);p.hand=[];p.deck=[];p.events.forEach(e=>e.used=e.id!=='fukurou');const a=G.ai(s);assert.equal(a.type,'event');assert.equal(a.id,'fukurou');G.dispatch(s,a);assert.equal(s.winner,1,'CPU uses its last event even when no chips remain');}
 // Moe 3 readies even when its FAN has sealed automatic service. No resource or action is consumed by the skipped service.
 {const s=make(),p=s.players[0],c=give(s,0,3,'moe');p.vol=100;s.row.forEach(f=>f.type='light');G.dispatch(s,{type:'play',card:c.uid,actors:[0,1,2],mode:'fan'});assert.equal(s.pending.kind,'moeReady');G.dispatch(s,{type:'choose',value:'0'});assert(p.ready[0]);assert.equal(p.service,0);assert.equal(p.chips,0);}
 // A single fan chip does not seal; first gain can happen during the leader's own turn and expires at its end.
 {const s=make();const p=s.players[0];p.items.push({uid:'ticket',item:'ticket'});s.lottery=['small',...Object.entries(G.LOTTERY).flatMap(([id,d])=>Array(d.count-(id==='small'?1:0)).fill(id))];G.dispatch(s,{type:'ticket',id:'ticket'});assert(!G.supportSealed(s,0));G.dispatch(s,{type:'service',actor:0});settle(s);}
 {const s=make();s.players[0].supportSealTurn=s.turn;G.timeout(s);assert.equal(s.active,1);assert(!G.supportSealed(s,0));}
 const ids=Object.keys(G.CHAR).filter(x=>x!=='fukurou');for(let seed=1;seed<=200;seed++){const a=['fukurou',ids[seed%16],ids[(seed+5)%16]],b=['fukurou',ids[(seed+2)%16],ids[(seed+7)%16]],s=G.create(a,a[seed%3],b,b[(seed+1)%3],seed%2,seed,a,b);let guard=0;while(s.winner===null&&guard++<2000){G.dispatch(s,G.ai(s));for(const p of s.players){const cs=[...p.hand,...p.deck,...p.memory,...p.discard];assert.equal(cs.length,27);assert.equal(new Set(cs.map(c=>c.uid)).size,27);assert(p.chips>=0&&p.fanChips>=0);}}assert.notEqual(s.winner,null);}
}
// User-facing Extra/search/status and disabled support/service buttons use the same rule helper.
const nodes=new Map(),document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(){}};
new Function('document','localStorage','setTimeout','clearTimeout','assert',code+`
assert.equal(cardSeries('character','fukurou'),'extra');assert.equal(cardSeries('event','fukurou'),'extra');rosterQuery='つきたふくろう';assert.deepEqual(rosterIDs(),['fukurou']);
state=IDOL.create(['fukurou','moe','hakka'],'fukurou',['nina','ayame','hana'],'nina',0,3);screen='match';const p=state.players[0];p.supportSealTurn=state.turn;p.chips=9;p.moeFreeSupport=3;render();assert.match($('#app').innerHTML,/ファンサ・応援封印中/);for(const a of ['draw','refresh','free-support'])assert.match($('#app').innerHTML,new RegExp('data-action="'+a+'" disabled'));
modal={kind:'member-info',p:0,j:0};renderModal();assert.match($('#modal').innerHTML,/data-action="service" disabled/);assert.match($('#modal').innerHTML,/お静かに、患者様/);
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert);
console.log('Fukurou: both engines/seats, combined resource pool, all modes, seals/payments/privacy/expiry, Moe automatic service, once-only event, Extra/UI and 400 CPU games passed');
