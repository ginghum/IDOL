import assert from 'node:assert/strict';
import {IDOL as G} from '../room-server/idol-engine.mjs';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const front=new Function(code.split('const $=s=>')[0]+';return IDOL;')();
assert.deepEqual(front.COMMON,G.COMMON,'Browser and online server use identical event definitions');
assert.equal(Object.keys(G.COMMON).length,7);assert.equal(G.COMMON.wit.cost[1],4);
const make=(events=['overcome','viewing','mc'],seed=91)=>G.create(['shio','kayo','machi'],'kayo',['machi','haru','hana'],'hana',0,seed,events,['trouble','haru','wit']);
function move(p,owner,n){for(const zone of ['deck','hand']){const at=p[zone].findIndex(c=>(!owner||c.owner===owner)&&(!n||c.n===n));if(at>=0)return p[zone].splice(at,1)[0];}throw Error('fixture card unavailable');}
function prepare(s,i,id){const p=s.players[i],d=G.EVENTS[id];while(p.memory.filter(c=>c.owner===id).length<d.cost[0])p.memory.push(move(p,id));while(p.memory.length<d.cost[1])p.memory.push(move(p));return G.autoPay(p,id);}
function use(s,i,id,extra={}){G.dispatch(s,{type:'event',id,memory:prepare(s,i,id),...extra});}
function play(s,i,owner,n,mode='fan'){const p=s.players[i],card=move(p,owner,n);p.hand.push(card);G.dispatch(s,{type:'play',card:card.uid,actors:G.actors(p,card),mode});}
{
 const s=make(),p=s.players[0];prepare(s,0,'overcome');p.vol=99;assert(!G.eventOK(s,0,'overcome'));const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,{type:'event',id:'overcome',memory:p.memory.map(c=>c.uid)},0));assert.equal(JSON.stringify(s),before,'Invalid VOL does not consume payment');
 p.vol=100;const hand=p.hand.length;use(s,0,'overcome');assert.equal(p.hand.length,hand+2);assert.equal(p.discard.length,3);assert(p.events.find(e=>e.id==='overcome').used);assert(!G.eventOK(s,0,'overcome'));
 const short=make(),q=short.players[0];prepare(short,0,'overcome');q.vol=100;q.discard.push(...q.deck.splice(1));const old=q.hand.length;use(short,0,'overcome');assert.equal(q.hand.length,old+1,'An exhausted draw pile only supplies available cards');
}
{
 const s=make(),p=s.players[0];p.leader='shio';use(s,0,'viewing');const vol=p.vol;G.dispatch(s,{type:'service',actor:0});assert.equal(p.fanChips,1);assert.equal(p.chips,0);assert.equal(p.vol,vol);assert.equal(s.pending,null,'Converted service does not offer Shio chip replacement');
 G.dispatch(s,{type:'service',actor:1});assert.equal(p.fanChips,2);assert.throws(()=>G.peerAction(s,{type:'service',actor:2},0),/ファンサービス/);
 G.dispatch(s,{type:'end'});G.dispatch(s,{type:'end'});assert(p.liveViewing);assert.equal(p.service,0);G.dispatch(s,{type:'service',actor:0});assert.equal(p.fanChips,3);
 // A cheer fan still grants an ordinary support chip (including Shio's choice).
 p.vol=100;s.row[0].type='cheer';play(s,0,'kayo',1);assert.equal(s.pending.kind,'shio');G.dispatch(s,{type:'choose',value:'chip'});assert.equal(p.chips,1);assert.equal(p.fanChips,3);
 const t=make(['viewing','switch','overcome']),q=t.players[0];use(t,0,'viewing');use(t,0,'switch',{leader:'shio'});assert(q.liveViewing,'Leader switching does not remove the event');q.fanChips=19;G.dispatch(t,{type:'service',actor:0});assert.equal(t.winner,0,'Converted service can win on 20 points');
}
{
 const s=make(),p=s.players[0],q=s.players[1];p.fans.push(...s.audience.splice(0,3));p.fans[0].type='dream';const protectedIds=p.fans.map(f=>f.uid);use(s,0,'mc');assert(p.fanShield);G.dispatch(s,{type:'end'});assert(p.fanShield,'Shield lasts throughout the opponent turn');q.vol=100;s.row[0].type='light';
 play(s,1,'machi',1);assert.equal(s.pending,null,'Protected fans do not create an opponent decision');assert.deepEqual(p.fans.map(f=>f.uid),protectedIds);
 q.ready=[true,true,true];play(s,1,'machi',3);while(s.pending)G.dispatch(s,G.ai(s));assert.deepEqual(p.fans.map(f=>f.uid),protectedIds,'Random removal is blocked');
 const qCount=q.fans.length;use(s,1,'trouble');assert.equal(q.fans.length,qCount-1,'The caster still returns their own fan');assert.deepEqual(p.fans.map(f=>f.uid),protectedIds);
 s.row[0].type='dream';const rowDream=s.row[0].uid;use(s,1,'haru');assert(q.fans.some(f=>f.uid===rowDream),'Unprotected audience seats can still move');assert.deepEqual(p.fans.map(f=>f.uid),protectedIds,'Haru cannot steal protected acquired fans');
 G.dispatch(s,{type:'end'});assert.equal(p.fanShield,false,'Shield expires before the next own turn');G.dispatch(s,{type:'end'});q.vol=100;play(s,1,'machi',1);assert.equal(s.pending.kind,'machiRemove');const gone=s.pending.options[0];G.dispatch(s,{type:'choose',value:gone});assert(!p.fans.some(f=>f.uid===gone),'Effects work again after expiry');
}
{
 const s=make(['mc','trouble','viewing']),p=s.players[0];p.fans.push(...s.audience.splice(0,3));s.players[1].fans.push(...s.audience.splice(0,3));use(s,0,'mc');use(s,0,'trouble');assert.equal(p.fans.length,2,'Shield does not prevent own event penalties');assert.equal(s.players[1].fans.length,1);
 p.vol=100;const core=s.row[1];s.row[0].type='trouble';core.type='core';s.row[2].type='light';play(s,0,'kayo',3);while(s.pending)G.dispatch(s,G.ai(s));assert(!p.fans.some(f=>f.uid===core.uid),'Own troublesome-fan penalties remain effective');
 const view=G.publicView(s,1);assert.equal(view.players[1].fanShield,true,'Protection is visible to the opponent');
}
{
 const s=make(['wit','viewing','mc']),p=s.players[0];p.memory.push(...p.deck.splice(0,3));assert(!G.eventOK(s,0,'wit'));p.memory.push(p.deck.shift());assert(G.eventOK(s,0,'wit'));const n=p.hand.length,c=p.hand[0];assert.throws(()=>G.peerAction(s,{type:'event',id:'wit',memory:p.memory.slice(0,2).map(c=>c.uid),hand:c.uid},0));G.dispatch(s,{type:'event',id:'wit',memory:p.memory.map(c=>c.uid),hand:c.uid});assert.equal(p.hand.length,n);assert.equal(p.memory.length,1);assert.equal(p.discard.length,4);assert(!G.eventOK(s,0,'wit'));
}
for(let seed=1;seed<=60;seed++){
 const s=make(seed%2?['overcome','viewing','mc']:['wit','viewing','overcome'],seed);s.players[1].events=['viewing','mc','overcome'].map(id=>({id,used:false,lastTurn:null}));let steps=0;
 while(s.winner===null&&steps++<1800){G.dispatch(s,G.ai(s));for(const p of s.players){assert.equal(p.hand.length+p.deck.length+p.memory.length+p.discard.length,27);assert(p.vol>=0&&p.vol<=200&&p.chips>=0&&p.fanChips>=0);}}
 assert.notEqual(s.winner,null,'New event CPU match terminates');
}
console.log('Extra events: VOL threshold, exact payments, persistent service conversion, 20-point win, protection boundaries, hostile removals/theft, own penalties, Wit four-memory cost and 60 CPU matches passed');
