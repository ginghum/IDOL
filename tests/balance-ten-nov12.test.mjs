import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
for(const G of [browser,server]){
 const make=(team,leader=team[0],seat=0)=>G.create(team,leader,['hana','rai','kayo'],'hana',seat,1212,team,['hana','rai','kayo']);
 const give=(s,owner,n)=>{const p=s.players[0];for(const z of ['hand','deck']){const j=p[z].findIndex(c=>c.owner===owner&&c.n===n);if(j>=0){const c=p[z].splice(j,1)[0];p.hand.push(c);return c;}}throw Error('missing song');};
 const memory=(s,owner,n)=>{const p=s.players[0];for(let j=0;j<n;j++){const c=give(s,owner,1);p.hand.splice(p.hand.indexOf(c),1);p.memory.push(c);}};
 const bad=(s,a,i=s.active)=>{const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,a,i));assert.equal(JSON.stringify(s),before);};
 const settle=s=>{let n=0;while(s.pending&&n++<30)G.dispatch(s,G.ai(s));assert(!s.pending);};
 assert.deepEqual([1,2,3].map(n=>G.song({owner:'shio',n}).vol),[20,30,40]);
 // Tabibito: both seats, leader/member, one actor, unchanged FAN and immediate teammate follow-up.
 for(const seat of [0,1])for(const leader of ['shio','hana']){
 const team=['shio','hana','aya'],opponent=['kayo','rai','natsume'];const pair=seat?[opponent,team]:[team,opponent],leaders=seat?['kayo',leader]:[leader,'kayo'];const t=G.create(pair[0],leaders[0],pair[1],leaders[1],seat,1411),p=t.players[seat];
 const giveOwn=(owner)=>{for(const zone of ['hand','deck']){const at=p[zone].findIndex(c=>c.owner===owner&&c.n===1);if(at>=0){const c=p[zone].splice(at,1)[0];p.hand.push(c);return c;}}throw Error('missing song');};
 const c=giveOwn('shio'),d=G.detail(c),before=p.vol;assert.equal(d.vol,20);assert.equal(d.fan,1);assert.equal(d.need,60);G.dispatch(t,{type:'play',card:c.uid,actors:[0],mode:'vol'});assert.equal(p.vol,before+20);assert.deepEqual(p.ready,[false,true,true]);assert.equal(G.actors(p,c),null);assert.equal(p.chips,0);
 if(leader==='shio'){assert.equal(p.vol,60);const next=giveOwn('hana');assert(G.playOK(t,seat,next,[1],'fan'));for(const f of [...t.row,...t.audience])f.type='light';G.dispatch(t,{type:'play',card:next.uid,actors:[1],mode:'fan'});assert.equal(p.fans.length,1);assert.equal(p.vol,60);}
 }

 assert.deepEqual([1,2,3].map(n=>G.song({owner:'akina',n}).vol),[10,20,30]);
 // Actual VOL use for changed songs, including Akina's optional return.
 for(const owner of ['akina','shio'])for(const n of [1,2,3]){const s=make([owner,'hakka','aya']),p=s.players[0],c=give(s,owner,n),before=p.vol;G.dispatch(s,{type:'play',card:c.uid,actors:Array.from({length:n},(_,j)=>j),mode:'vol'});settle(s);assert.equal(p.vol,before+G.song(c).vol);}
 // Summer's 129/130 boundary is sampled before heavy-fan VOL loss, and remains optional.
 for(const n of [1,2])for(const vol of [129,130])for(const boost of [false,true]){const s=make(['natsume','hakka','aya'],'hakka'),p=s.players[0],c=give(s,'natsume',n);p.vol=vol;s.row.forEach(f=>f.type='light');s.row[0].type='heavy';G.dispatch(s,{type:'play',card:c.uid,actors:Array.from({length:n},(_,j)=>j),mode:'fan',boost});assert.equal(p.fans.length,n+Number(boost));assert.equal(p.vol,vol-10-(boost&&vol<130?10:0));}
 // Machi starts at exactly 12 memories across both players.
 for(const count of [11,12]){const s=make(['machi','hakka','aya'],'machi',1),p=s.players[0];p.memory.push(...p.deck.splice(0,count));G.dispatch(s,{type:'end'});assert.equal(s.pending?.kind,count===12?'raiPick':undefined);}
 // Dedicated support costs are atomic at the lower boundary.
 for(const [leader,effect,cost] of [['rai','lock',2],['moe','hold',3]]){const s=make([leader,'hakka','aya']),p=s.players[0];s.players[1].ready[0]=false;const a={type:'support',effect,target:effect==='lock'?s.row[0].uid:'hana'};p.chips=cost-1;bad(s,a);p.chips=cost;G.dispatch(s,a);assert.equal(p.chips,0);}
 // Mimizuku is now an optional end-of-turn skill, not a support action.
 {const s=make(['mimizuku','moe','hakka']),p=s.players[0];p.chips=2;p.moeFreeSupport=3;for(const free of [false,true])bad(s,{type:'support',effect:'discard',free});G.dispatch(s,{type:'end'});assert.equal(s.pending.kind,'mimizukuEnd');G.dispatch(s,{type:'choose',value:'use'});G.dispatch(s,G.ai(s));assert.equal(s.active,1);assert.equal(p.chips,1);}
 // Moe payment needs exactly five including two Moe; meat substitutes.
 for(const meats of [0,1,5]){const s=make(['moe','hakka','aya']),p=s.players[0];if(meats<5){memory(s,'moe',2);memory(s,'hakka',1);memory(s,'hakka',1);if(!meats)memory(s,'aya',1);}for(let j=0;j<meats;j++)p.items.push({uid:'wild'+j,item:'meat'});const pay=G.autoPay(p,'moe');assert.equal(pay.length,5);assert(G.paymentOK(p,'moe',pay));assert(G.eventOK(s,0,'moe'));G.dispatch(s,{type:'event',id:'moe',memory:pay});assert.equal(p.moeFreeSupport,3);assert.equal(p.items.length,0);}
 {const s=make(['moe','hakka','aya']),p=s.players[0];memory(s,'moe',3);const c=give(s,'moe',2);p.hand.splice(p.hand.indexOf(c),1);p.memory.push(c);assert(!G.paymentOK(p,'moe',p.memory.map(c=>c.uid)));assert(!G.eventOK(s,0,'moe'));}
 // Bomb selects distinct original spectators; each teddy protects only one chosen spectator.
 for(const count of [0,1,2,5])for(const bears of [0,1,3]){const s=make(['ayame','nina','hakka']),p=s.players[0];p.fans=s.audience.splice(0,count);p.items=[{uid:'ticket',item:'ticket'},...Array.from({length:bears},(_,j)=>({uid:'bear'+j,item:'teddy'}))];s.lottery=['bomb'];G.dispatch(s,{type:'ticket',id:'ticket'});const targets=Math.min(3,count),protectedCount=Math.min(bears,targets);assert.equal(p.fans.length,count-targets+protectedCount);assert.equal(G.teddyCount(p),bears-protectedCount);assert.equal(new Set(p.fans.map(f=>f.uid)).size,p.fans.length);}
}
assert.match(html,/✦2 独占/);assert.match(html,/✦3 行動封じ/);assert(!html.includes('✦1 手札破棄（各ターン1回）'));assert.match(html,/使用時VOL130％以上：VOLを下げず獲得＋1枚/);
console.log('Ten-member rebalance: both engines, real song VOL, 129/130 pre-acquisition boundary, Machi 11/12, atomic support costs, shared paid/free discard cap/reset, Moe 2+1+1/meat payments, distinct three-target bombs and UI copy passed');
