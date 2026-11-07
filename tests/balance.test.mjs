import assert from 'node:assert/strict';
import {IDOL as G} from '../room-server/idol-engine.mjs';
import {readFileSync} from 'node:fs';
const make=()=>G.create(['rai','kayo','hana'],'rai',['machi','natsume','shio'],'machi',0,991,['rai','wit','viewing']);
function give(s,n){const p=s.players[0];for(const z of ['hand','deck']){const at=p[z].findIndex(c=>c.owner==='rai'&&c.n===n);if(at>=0){const c=p[z].splice(at,1)[0];p.hand.push(c);return c;}}}
function setup(types=['light','cheer','heavy','core','influencer']){const s=make();s.row=types.slice(0,3).map((type,j)=>({uid:'row'+j,type,lock:null}));s.audience=types.slice(3).map((type,j)=>({uid:'top'+j,type,lock:null})).concat(s.audience);s.players[0].vol=100;return s;}
function play(s,n,pick=true){const c=give(s,n);G.dispatch(s,{type:'play',card:c.uid,actors:G.actors(s.players[0],c),mode:'fan',pick});}
assert.deepEqual(G.CHAR.rai.cost,[2,3]);assert.deepEqual(G.COMMON.wit.cost,[0,4]);assert.deepEqual(G.COMMON.viewing.cost,[0,5]);assert.equal(G.CHAR.homura.vol,20);assert.equal(G.CHAR.homura.hand,4);
{
 const s=setup(),p=s.players[0];p.buff=5;p.cardBuff=1;play(s,3);assert.equal(s.pending.count,2);assert.equal(s.pending.options.length,5);const original=s.audience.map(f=>f.uid);let v=G.publicView(s,0);assert(v.audience.slice(0,2).every(f=>f.type));assert(G.publicView(s,1).audience.every(f=>f.type===null));
 G.dispatch(s,{type:'choose',value:'top1'});assert.equal(p.fans.length,0,'First selection must not acquire or trigger effects');assert.equal(s.row.length,3);assert.deepEqual(s.audience.map(f=>f.uid),original);assert.equal(s.pending.options.length,4);assert.deepEqual(s.pending.selected,['top1']);v=G.publicView(s,0);assert.equal(v.audience[1].type,'influencer','Selected private card stays visible until batch commits');
 const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,{type:'choose',value:'top1'},0));assert.equal(JSON.stringify(s),before,'Duplicate selection is rejected atomically');
 G.dispatch(s,{type:'choose',value:'row0'});assert.equal(p.fans.length,2,'All bonuses are replaced by exactly two selected spectators');assert.deepEqual(p.fans.map(f=>f.uid),['row0','top1'],'Effect order follows row then original deck order');assert.deepEqual(s.audience.map(f=>f.uid),original.filter(x=>x!=='top1').slice(1));assert.equal(s.row.length,3);assert.equal(s.pending,null);assert.equal(p.buff,0);
}
{
 const s=setup(['trouble','light','light','core','cheer']),p=s.players[0];play(s,3);G.dispatch(s,{type:'choose',value:'top0'});assert.equal(p.fans.length,0);G.dispatch(s,{type:'choose',value:'row0'});assert.equal(p.fans.length,1);assert.equal(p.fans[0].type,'trouble');assert.equal(s.audience.at(-1).uid,'top0','Troublesome fan processes the same two-card batch');
}
{
 const s=setup();s.row[0].lock=1;play(s,3);assert(!s.pending.options.includes('row0'));G.timeout(s);assert.equal(s.pending,null);assert.equal(s.active,1);assert(s.row.some(f=>f.uid==='row0'),'Opponent lock is skipped through timeout');assert.equal(s.players[0].fans.length,2);
}
{
 const s=setup();s.row=s.row.slice(0,1);s.audience=[];play(s,3);assert.equal(s.pending.count,1);G.dispatch(s,{type:'choose',value:'row0'});assert.equal(s.players[0].fans.length,1,'Limited pool only supplies existing cards');
}
for(const n of [1,2]){const s=setup();s.players[0].chips=1;play(s,n);assert.equal(s.pending.count,1);assert.equal(s.pending.options.length,3);assert(G.publicView(s,0).audience.every(f=>f.type===null));G.dispatch(s,{type:'choose',value:'row0'});assert.equal(s.players[0].fans.length,1);}
{
 const s=setup(['light','light','light','core','cheer']);play(s,3,false);assert.equal(s.players[0].fans.length,3,'Normal FAN mode remains three cards');
}
for(const [id,cost,owned] of [['wit',4,0],['viewing',5,0],['rai',3,2]]){const s=make(),p=s.players[0];const cards=[...p.hand,...p.deck],named=cards.filter(c=>c.owner===id).slice(0,owned),others=cards.filter(c=>!named.includes(c));p.memory=[...named,...others.slice(0,cost-owned)];const paid=new Set(p.memory.map(c=>c.uid));p.hand=p.hand.filter(c=>!paid.has(c.uid));p.deck=p.deck.filter(c=>!paid.has(c.uid));assert(G.eventOK(s,0,id));assert(G.paymentOK(p,id,G.autoPay(p,id)));const memory=G.autoPay(p,id);assert(!G.paymentOK(p,id,memory.slice(0,-1)));const a={type:'event',id,memory,...(id==='wit'?{hand:p.hand[0].uid}:id==='rai'?{target:s.row[0].uid}:{})};G.dispatch(s,a);assert.equal(p.discard.length,cost);}
{
 const s=make(),p=s.players[0];p.items=[{uid:'meat-a',item:'meat'},{uid:'meat-b',item:'meat'},{uid:'meat-c',item:'meat'}];assert(G.eventOK(s,0,'rai'));G.dispatch(s,{type:'event',id:'rai',memory:p.items.map(c=>c.uid),target:s.row[0].uid});assert.equal(p.items.length,0);assert.equal(p.discard.length,0);
}
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');assert(html.includes('通常獲得を${c.n===3?2:1}枚選択に変更'));assert(html.includes('選択済み：'));assert(!html.includes('機転は3メモリーで'));
// Exercise both player's CPU choices with the new paired acquisition and costs.
for(let seed=1;seed<=120;seed++){const s=G.create(['rai','hana','hakka'],'hakka',['rai','machi','haru'],'haru',seed%2,seed,['rai','wit','viewing'],['rai','wit','viewing']);let guard=0;while(s.winner===null&&guard++<2000)G.dispatch(s,G.ai(s));assert.notEqual(s.winner,null);}
console.log('Balance: new exact costs, two-card simultaneous Rai picks, selection privacy, locks, batch penalties, timeout, normal mode and CPU matches passed');
