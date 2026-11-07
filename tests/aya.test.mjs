import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
for(const G of [browser,server]){
 const make=(leader='aya',team=['aya','hikari','hana'])=>G.create(team,leader,['machi','rai','homura'],'machi',0,42,['aya','switch','wit']);
 function give(s,owner,n){const p=s.players[0];for(const z of ['hand','deck','memory','discard']){const at=p[z].findIndex(c=>c.owner===owner&&c.n===n);if(at>=0){const [c]=p[z].splice(at,1);p.hand.push(c);return c;}}throw Error('missing');}
 function quiet(s){for(const f of [...s.row,...s.audience]){f.type='light';f.lock=null;}}
 function eventPrep(s,count){const p=s.players[0],pool=[...p.hand,...p.deck,...p.memory,...p.discard];p.hand=[];p.deck=[];p.memory=[];p.discard=[];for(let j=0;j<4;j++){const at=pool.findIndex(c=>c.owner==='aya'&&c.n>1);p.memory.push(pool.splice(at,1)[0]);}for(let j=0;j<2;j++){const at=pool.findIndex(c=>c.n>1);p.memory.push(pool.splice(at,1)[0]);}for(let j=0;j<count;j++){const at=pool.findIndex(c=>c.n===1);p.discard.push(pool.splice(at,1)[0]);}p.hand=pool;return G.autoPay(p,'aya');}
 {const s=make(),p=s.players[0];assert.equal(p.vol,30);assert.equal(p.hand.length,5);assert.equal(p.deck.length,22);assert.equal(G.detail({owner:'aya',n:1}).vol,20);assert.equal(G.detail({owner:'aya',n:1}).fan,1);}
 for(const n of [2,3]){
 const s=make(),p=s.players[0];quiet(s);p.vol=n===2?80:100;const c=give(s,'aya',n);G.dispatch(s,{type:'play',card:c.uid,actors:Array.from({length:n},(_,j)=>j),mode:'fan'});
 assert.equal(p.fans.length,n);assert.equal(p.vol,n===2?80:100);assert.equal(s.pending.kind,'ayaReady');assert.equal(p.songsPlayed,1);assert(!s.pending.options.includes('0'));
 const skip=G.peerAction(s,{type:'choose',value:'skip'},0);assert.equal(skip.players[0].vol,p.vol);assert.equal(skip.pending,null);
 const snapshot=JSON.stringify(s);assert.throws(()=>G.peerAction(s,{type:'choose',value:'0'},0));assert.equal(JSON.stringify(s),snapshot);assert.throws(()=>G.peerAction(s,{type:'choose',value:s.pending.options[1]},1));
 const v=G.publicView(s,1);assert.deepEqual(v.pending.options,[]);
 G.dispatch(s,{type:'choose',value:n===2?'1':'all'});assert.equal(p.vol,n===2?60:70);assert.deepEqual(p.ready,[false,true,true]);assert.equal(s.pending,null);
 }
 // 2-person skill can revive an already exhausted other member, not only an actor of this song.
 {const s=make(),p=s.players[0];quiet(s);p.vol=80;p.ready[2]=false;const c=give(s,'aya',2);G.dispatch(s,{type:'play',card:c.uid,actors:[0,1],mode:'fan'});assert(s.pending.options.includes('2'));G.dispatch(s,{type:'choose',value:'2'});assert.deepEqual(p.ready,[false,false,true]);}
 // VOL mode never offers refresh. Heavy-fan voltage loss happens before the optional payment.
 {const s=make(),p=s.players[0];quiet(s);const c=give(s,'aya',3);G.dispatch(s,{type:'play',card:c.uid,actors:[0,1,2],mode:'vol'});assert.equal(p.vol,60);assert.equal(s.pending,null);}
 {const s=make(),p=s.players[0];quiet(s);s.row[0].type='heavy';p.vol=80;const c=give(s,'aya',2);G.dispatch(s,{type:'play',card:c.uid,actors:[0,1],mode:'fan'});assert.equal(p.vol,70);G.dispatch(s,{type:'choose',value:'1'});assert.equal(p.vol,50);}
 // Successful uses of hand songs, both modes, count; no bonus until END, and exactly two chips.
 {const s=make(),p=s.players[0];quiet(s);for(const [j,owner] of p.team.entries()){const c=give(s,owner,1);G.dispatch(s,{type:'play',card:c.uid,actors:[j],mode:'vol'});}assert.equal(p.songsPlayed,3);assert.equal(p.fanChips,0);G.dispatch(s,{type:'end'});assert.equal(p.fanChips,2);assert.equal(p.songsPlayed,0);assert.equal(s.active,1);G.dispatch(s,{type:'end'});G.dispatch(s,{type:'end'});assert.equal(p.fanChips,2);}
 {const s=make(),p=s.players[0];quiet(s);p.songsPlayed=3;p.fanChips=18;G.dispatch(s,{type:'end'});assert.equal(s.winner,0);assert.equal(s.active,0);assert.equal(G.score(p),20);assert.throws(()=>G.dispatch(s,{type:'end'}));}
 {const s=make(),p=s.players[0];p.songsPlayed=3;G.timeout(s);assert.equal(p.fanChips,2);assert.equal(s.turn,2);}
 {const s=make(),p=s.players[0];G.dispatch(s,{type:'service',actor:0});assert.equal(p.songsPlayed,0);const paid=eventPrep(s,3),c=p.hand[0];G.dispatch(s,{type:'event',id:'wit',memory:paid.slice(0,4),hand:c.uid});assert.equal(p.songsPlayed,0);G.dispatch(s,{type:'end'});assert.equal(p.fanChips,0);}
 // Leader at turn end governs reward; switching never reapplies initial hand/voltage.
 {const s=make('hikari'),p=s.players[0];quiet(s);const pay=eventPrep(s,0);p.songsPlayed=3;G.dispatch(s,{type:'event',id:'switch',memory:pay.slice(0,3),leader:'aya'});G.dispatch(s,{type:'end'});assert.equal(p.fanChips,2);}
 {const s=make(),p=s.players[0];quiet(s);const pay=eventPrep(s,0);p.songsPlayed=3;G.dispatch(s,{type:'event',id:'switch',memory:pay.slice(0,3),leader:'hana'});G.dispatch(s,{type:'end'});assert.equal(p.fanChips,0);}
 for(const count of [0,1,5,6,9]){const s=make(),p=s.players[0];quiet(s);const pay=eventPrep(s,count);p.buff=3;p.eventBuff=2;p.cardBuff=1;const before=G.ayaEventCount(p);G.dispatch(s,{type:'event',id:'aya',memory:pay});assert.equal(p.fans.length,Math.min(6,count));assert.equal(before,Math.min(6,count));assert.equal(p.buff,3);assert.equal(p.songsPlayed,0);assert(p.events[0].used);assert(pay.every(uid=>p.discard.some(c=>c.uid===uid)));}
 // Count one-person cards in MEMORY too, including cards used to pay; no double count.
 {const s=make(),p=s.players[0];quiet(s);eventPrep(s,3);p.memory.push(...p.discard);p.discard=[];assert.equal(G.ayaEventCount(p),3);const mem=G.autoPay(p,'aya');G.dispatch(s,{type:'event',id:'aya',memory:mem});assert.equal(p.fans.length,3);}
 // Each trouble fan is a one-card batch; it never returns a previous acquisition.
 {const s=make(),p=s.players[0];quiet(s);const mem=eventPrep(s,6);s.row.forEach(f=>f.type='trouble');G.dispatch(s,{type:'event',id:'aya',memory:mem});assert.equal(p.fans.length,6);assert.equal(p.fans.filter(f=>f.type==='trouble').length,3);}
 // Each observation effect and refill finishes BEFORE the next single acquisition.
 {const s=make('aya',['aya','shio','hikari']),p=s.players[0];quiet(s);const mem=eventPrep(s,2);p.leader='shio';s.row[0].type='cheer';s.row[1].type='core';G.dispatch(s,{type:'event',id:'aya',memory:mem});assert.equal(p.fans.length,1);assert.equal(s.pending.kind,'shio');assert.equal(s.row.length,2);G.dispatch(s,{type:'choose',value:'chip'});assert.equal(p.fans.length,2);assert.equal(p.fans[1].type,'core');assert.equal(s.row.length,3);assert.equal(p.chips,1);}
 // Preserve opposing locks during each refill/acquisition.
 {const s=make(),p=s.players[0];quiet(s);const mem=eventPrep(s,6),locked=s.row[0];locked.lock=1;G.dispatch(s,{type:'event',id:'aya',memory:mem});assert(s.row.includes(locked));assert.equal(p.fans.length,6);assert(!p.fans.includes(locked));}
 // Both seats, legal CPU choices and card conservation with Aya/Extra teams.
 const ids=Object.keys(G.CHAR).filter(x=>x!=='aya');
 for(let seed=1;seed<=150;seed++){const a=['aya',ids[seed%ids.length],ids[(seed+3)%ids.length]],b=['aya',ids[(seed+2)%ids.length],ids[(seed+5)%ids.length]],s=G.create(a,a[seed%3],b,b[(seed+1)%3],seed%2,seed);let moves=0;while(s.winner===null&&moves++<2000){G.dispatch(s,G.ai(s));for(const p of s.players){assert.equal(p.hand.length+p.deck.length+p.memory.length+p.discard.length,27);assert(p.vol>=0&&p.vol<=200&&p.chips>=0);}}assert.notEqual(s.winner,null,'CPU terminates');}
}
const nodes=new Map(),document={querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(){}};
new Function('document','localStorage','setTimeout','clearTimeout','assert',code+`
assert.equal(cardSeries('character','aya'),'extra');assert.equal(cardSeries('event','aya'),'extra');rosterQuery='ほうつきあや';assert.deepEqual(rosterIDs(),['aya']);
state=IDOL.create(['aya','hikari','hana'],'aya',['shio','rai','homura'],'shio',0,9);screen='match';modal=null;state.players[0].songsPlayed=3;assert.match(tableHUD(state.players[0],0),/終了時★2/);
state.pending={kind:'ayaReady',p:0,options:['skip','1'],cost:20,all:false,text:'彩の追加効果'};renderModal();assert.match($('#modal').innerHTML,/今回は使わない/);assert.match($('#modal').innerHTML,/轍光を未行動に/);
state.pending={kind:'ayaReady',p:0,options:['skip','all'],cost:30,all:true,text:'彩の追加効果'};renderModal();assert.match($('#modal').innerHTML,/仲間全員を未行動に/);
modal={kind:'catalog',tab:'aya'};renderModal();assert.match($('#modal').innerHTML,/名もなき才に、喝采を。/);assert.match($('#modal').innerHTML,/私にできること、全部/);
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert);
console.log('Aya: post-use payment, optional partner/all refresh, turn-end scoring/wins/timeout/switch, fixed sequential event, fan effects/locks, Extra/search/UI and 300 CPU games passed');
