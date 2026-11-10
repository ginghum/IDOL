import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
for(const G of [browser,server]){
 const make=(leader='nina',first=0)=>G.create(['nina','emi','haru'],leader,['nina','hakka','haru'],'nina',first,271,['nina','trouble','emi'],['nina','haru','trouble']);
 const give=(s,who,owner,n)=>{const p=s.players[who];for(const z of ['deck','hand','memory','discard']){const at=p[z].findIndex(c=>c.owner===owner&&(!n||c.n===n));if(at>=0){const c=p[z].splice(at,1)[0];p.hand.push(c);return c;}}throw Error('missing card');};
 const prep=(s,who,id,n)=>{const p=s.players[who];for(let j=0;j<n;j++){const c=give(s,who,id);p.hand.splice(p.hand.indexOf(c),1);p.memory.push(c);}};
 const bear=(p,n=1)=>{for(let j=0;j<n;j++)p.items.push({uid:'bear-'+p.items.length,item:'teddy'});};
 const settle=s=>{let n=0;while(s.pending&&n++<100)G.dispatch(s,G.ai(s));assert(!s.pending);};
 const bad=(s,a,who=0)=>{const old=JSON.stringify(s);assert.throws(()=>G.peerAction(s,a,who));assert.equal(JSON.stringify(s),old);};
 const queued=(s,e)=>{s.queue.push(e);G.dispatch(s,{type:'end'});settle(s);};
 {const s=make(),p=s.players[0];assert.equal(p.vol,30);assert.equal(p.hand.length,5);assert.equal(G.teddyCount(p),0);assert.deepEqual(G.CHAR.nina.songs,['等身大リアル','今イズマイ頂点','世界は私のお気に入り']);}
 for(const who of [0,1])for(const n of [1,2,3])for(const mode of ['vol','fan']){const s=make('nina',who),p=s.players[who];for(const f of [...s.row,...s.audience])f.type='light';const c=give(s,who,'nina',n),need=[60,80,100][n-1];p.vol=need;G.dispatch(s,{type:'play',card:c.uid,actors:Array.from({length:n},(_,j)=>j),mode});assert.equal(p.vol,need+(mode==='vol'?n*10:0));assert.equal(G.teddyCount(p),mode==='vol'&&n>1?1:0);assert.equal(p.fans.length,mode==='fan'?n:0);assert.equal(p.chips,mode==='fan'?n:0);assert(p.memory.some(x=>x.uid===c.uid));if(n>1)assert.match(G.detail(c).volText,/くまのぬいぐるみ/);else assert.equal(G.detail(c).volText,'');}
 for(const n of [1,2,3]){const s=make(),p=s.players[0],c=give(s,0,'nina',n);p.vol=[60,80,100][n-1]-1;bad(s,{type:'play',card:c.uid,actors:Array.from({length:n},(_,j)=>j),mode:'fan'});}
 // Leader trigger is independent of the spectator's own muted effect, and counts each card.
 {const s=make(),p=s.players[0];s.row.forEach(f=>{f.type='light';f.muted=true;});queued(s,{kind:'normal',p:0,n:3});assert.equal(p.chips,3);}
 {const s=make('emi'),p=s.players[0];s.row.forEach(f=>f.type='light');queued(s,{kind:'normal',p:0,n:2});assert.equal(p.chips,0);}
 // A bear prevents each individual departure; prevented high-point cards remain valid for subsequent penalties.
 for(const bears of [0,1,2]){const s=make(),p=s.players[0];bear(p,bears);s.row[0].type='core';s.row[1].type=s.row[2].type='trouble';queued(s,{kind:'normal',p:0,n:3});assert.equal(G.teddyCount(p),0);assert.equal(p.fans.some(f=>f.type==='core'),bears===2);}
 // Own/random removals consume one bear per attempted move, not all items, and MC protection runs first.
 for(const shield of [false,true]){const s=make(),p=s.players[0],q=s.players[1];const f=s.row.shift();f.type='core';p.fans.push(f);bear(p,2);p.fanShield=shield;queued(s,{kind:'machiRemove',p:0,random:true});assert.equal(p.fans.length,1);assert.equal(G.teddyCount(p),shield?2:1);assert.equal(q.items.length,0);}
 {const s=make(),p=s.players[0],q=s.players[1];p.fans.push(s.row.shift());q.fans.push(s.row.shift(),s.row.shift());bear(p);bear(q,2);prep(s,0,'nina',1);prep(s,0,'emi',3);G.dispatch(s,{type:'event',id:'trouble',memory:G.autoPay(p,'trouble')});assert.equal(p.fans.length,1);assert.equal(q.fans.length,2);assert.equal(G.teddyCount(p),0);assert.equal(G.teddyCount(q),0);}
 // Forced exchange replacement cancels both source exile and replacement creation, including beneficial own conversion.
 {const s=make(),p=s.players[0],q=s.players[1];prep(s,0,'emi',3);prep(s,0,'nina',2);const f=s.row.shift();f.type='light';q.fans.push(f);bear(q);G.dispatch(s,{type:'event',id:'emi',memory:G.autoPay(p,'emi'),target:f.uid});assert.equal(q.fans[0].uid,f.uid);assert.equal(G.teddyCount(q),0);assert.equal(s.exiledFans?.length||0,0);}
 {const s=make('emi'),p=s.players[0],f=s.row.shift();f.type='trouble';p.fans.push(f);p.chips=2;bear(p);s.queue.push({kind:'emiConvert',p:0});G.dispatch(s,{type:'end'});assert.equal(s.pending.kind,'emiConvert');G.dispatch(s,{type:'choose',value:f.uid});assert.equal(p.fans[0].type,'trouble');assert.equal(p.chips,0);assert.equal(G.teddyCount(p),0);}
 // Haru's theft is prevented independently for each transferred spectator; neither duplicate nor acquire effects occur.
 {const s=make(),p=s.players[0],q=s.players[1];for(let j=0;j<2;j++){const f=s.row.shift();f.type='dream';q.fans.push(f);}bear(q);prep(s,1,'haru',2);prep(s,1,'hakka',3);G.dispatch(s,{type:'end'});G.dispatch(s,{type:'event',id:'haru',memory:G.autoPay(q,'haru')});/* Self-owned dream fans are not transfer sources in normal play. */assert.equal(G.teddyCount(q),1);}
 {const s=make(),p=s.players[0],q=s.players[1];const f=s.row.shift();f.type='dream';p.fans.push(f);bear(p);prep(s,1,'haru',2);prep(s,1,'hakka',3);G.dispatch(s,{type:'end'});G.dispatch(s,{type:'event',id:'haru',memory:G.autoPay(q,'haru')});assert.equal(p.fans[0].uid,f.uid);assert(!q.fans.some(x=>x.uid===f.uid));assert.equal(G.teddyCount(p),0);}
 // Event: exact 2 Nina + 2 other memories, no bear payment, resolves without consuming bears, once per game.
 for(const count of [0,1,5]){const s=make(),p=s.players[0];prep(s,0,'nina',2);prep(s,0,'emi',2);bear(p,count);assert.equal(G.paymentCards(p).length,4);const pay=G.autoPay(p,'nina');assert.equal(pay.length,4);if(count)bad(s,{type:'event',id:'nina',memory:[...pay.slice(0,3),p.items[0].uid]});G.dispatch(s,{type:'event',id:'nina',memory:pay});assert.equal(p.fanChips,count);assert.equal(G.teddyCount(p),count);assert.equal(p.discard.length,4);bad(s,{type:'event',id:'nina',memory:pay});}
 {const s=make(),p=s.players[0];bear(p,4);p.items.push({uid:'meat-a',item:'meat'},{uid:'meat-b',item:'meat'},{uid:'meat-c',item:'meat'},{uid:'meat-d',item:'meat'});assert(G.paymentOK(p,'nina',G.autoPay(p,'nina')));assert(G.autoPay(p,'nina').every(x=>x.startsWith('meat')));p.fanChips=16;G.dispatch(s,{type:'event',id:'nina',memory:G.autoPay(p,'nina')});assert.equal(s.winner,0);assert.equal(G.teddyCount(p),4);}
 {const s=make(),p=s.players[0];bear(p,5);p.items.push({uid:'only-meat',item:'meat'});assert.equal(G.eventOK(s,0,'nina'),false);assert.equal(G.autoPay(p,'nina').length,1);bad(s,{type:'play',card:p.items[0].uid,actors:[0],mode:'vol'});}
 // Items stay visible as public resources in both seat views, while songs remain hidden.
 {const s=make();bear(s.players[0],2);bear(s.players[1]);for(const who of [0,1]){const v=G.publicView(s,who);assert.equal(G.teddyCount(v.players[0]),who===0?2:1);assert.equal(G.teddyCount(v.players[1]),who===0?1:2);assert(v.players[1].hand.every(c=>!c.owner));}}
 // Timeout resolves a pending trouble choice and consumes its compulsory replacement.
 {const s=make(),p=s.players[0];bear(p);s.row[0].type=s.row[1].type='core';s.row[2].type='trouble';s.queue.push({kind:'normal',p:0,n:3});G.dispatch(s,{type:'end'});assert.equal(s.pending.kind,'trouble');G.timeout(s);assert.equal(G.teddyCount(p),0);assert.equal(p.fans.filter(f=>f.type==='core').length,2);}
 const ids=Object.keys(G.CHAR).filter(x=>x!=='nina');for(let seed=1;seed<=80;seed++){const a=['nina',ids[seed%ids.length],ids[(seed+4)%ids.length]],b=['nina',ids[(seed+1)%ids.length],ids[(seed+7)%ids.length]],s=G.create(a,a[seed%3],b,b[(seed+1)%3],seed%2,seed,['nina','trouble','mc'],['nina','trouble','mc']);let n=0;while(s.winner===null&&n++<2500){G.dispatch(s,G.ai(s));for(const p of s.players){const cards=[...p.hand,...p.deck,...p.memory,...p.discard];assert.equal(cards.length,27);assert.equal(new Set(cards.map(c=>c.uid)).size,27);assert(p.chips>=0&&p.vol>=0&&p.vol<=200);assert(p.items.every(c=>['teddy','meat','ticket'].includes(c.item)));}}assert.notEqual(s.winner,null);}
}
const nodes=new Map(),document={querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(){}};
new Function('document','localStorage','setTimeout','clearTimeout','assert',code+`
assert.equal(cardSeries('character','nina'),'extra');assert.equal(cardSeries('event','nina'),'extra');rosterQuery='まちかどにな';assert.deepEqual(rosterIDs(),['nina']);
state=IDOL.create(['nina','hakka','emi'],'nina',['moe','rai','aya'],'moe',0,91);screen='match';const p=state.players[0];p.items=[{uid:'bear-ui',item:'teddy'},{uid:'meat-ui',item:'meat'}];modal=null;
assert.match(matchHTML(),/item-teddy/);assert.match(matchHTML(),/くまのぬいぐるみ/);assert.match(matchHTML(),/item-meat/);
modal={kind:'item',id:'bear-ui'};renderModal();assert.match($('#modal').innerHTML,/強制効果/);assert.match($('#modal').innerHTML,/メモリーの代用/);
modal={kind:'event',id:'nina'};selection={memory:[],discard:[],targets:[]};renderModal();assert.match($('#modal').innerHTML,/現在のくまのぬいぐるみ：1個/);assert.doesNotMatch($('#modal').innerHTML,/data-id="bear-ui"/);assert.match($('#modal').innerHTML,/data-id="meat-ui"/);
modal={kind:'catalog',tab:'nina'};renderModal();assert.match($('#modal').innerHTML,/世界は私のお気に入り/);assert.equal(artworkLabel('item-teddy'),'くまのぬいぐるみのイラスト');
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert);
console.log('Nina: both engines, all song modes/VOL boundaries, light acquisition, compulsory return/exchange/theft prevention, exact memory/meat payments excluding bears, event/win/privacy/timeout, Extra/item UI and 160 seeded CPU games passed');
