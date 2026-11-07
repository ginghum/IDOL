import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const G=new Function(code.split('const $=s=>')[0]+';return IDOL;')();
const make=(leader='haru',events=['haru','hakka','homura'])=>G.create(['haru','hakka','homura'],leader,['kayo','machi','hana'],'kayo',0,212,events,['wit','redo','trouble']);
function give(s,owner,n){const p=s.players[s.active];for(const z of ['hand','deck','discard','memory']){const at=p[z].findIndex(c=>c.owner===owner&&c.n===n);if(at>=0){const c=p[z].splice(at,1)[0];p.hand.push(c);return c;}}throw Error('Song unavailable');}
function row(s,types){const all=[...s.row,...s.audience];s.row=types.map(type=>{const at=all.findIndex(f=>f.type===type);assert(at>=0);return all.splice(at,1)[0];});s.audience=all;}
function settle(s){let guard=0;while(s.pending){assert(guard++<100);G.dispatch(s,G.ai(s));}}
function play(s,owner,n,mode='fan'){const c=give(s,owner,n),p=s.players[s.active];G.dispatch(s,{type:'play',card:c.uid,mode,actors:G.actors(p,c)});return c;}
function mem(s,owner,n){const p=s.players[0];for(let j=0;j<n;j++){const c=give(s,owner,(j%3)+1);p.hand=p.hand.filter(x=>x.uid!==c.uid);p.memory.push(c);}}
function event(s,id){G.dispatch(s,{type:'event',id,memory:G.autoPay(s.players[0],id)});}
{
 for(const [id,hand,vol] of [['haru',5,30],['hakka',4,30],['homura',4,20]]){const s=make(id),p=s.players[0];assert.equal(p.hand.length,hand);assert.equal(p.vol,vol);assert.equal(p.deck.length+hand,27);assert.equal(p.chips,id==='homura'?1:0);assert.equal(s.row.length+s.audience.length,53);assert(!s.audience.some(f=>f.type==='dream'));}
 const s=make(),p=s.players[0],c=p.deck.shift();p.discard.push(c);G.dispatch(s,{type:'end'});G.dispatch(s,{type:'end'});assert.equal(s.pending.kind,'recover');const view=G.publicView(s,0);assert(view.pending.options.includes(c.uid));G.dispatch(s,{type:'choose',value:c.uid});assert(p.hand.includes(c));assert.equal(p.discard.length,0);
}
{
 const s=make(),p=s.players[0];p.vol=100;row(s,['light','light','light']);const rowIds=s.row.map(f=>f.uid);play(s,'haru',1);assert.equal(p.fans.length,1);assert.equal(s.row[2].type,'dream');assert.equal(s.row[0].uid,rowIds[1]);assert.equal(s.row[1].uid,rowIds[2]);assert.equal(G.fanPoints(p,s.row[2]),1);assert.equal(G.fanPoints(s.players[1],s.row[2]),0);
 // Four-card acquisition takes the newly generated deck top in the same batch.
 const t=make(),q=t.players[0];q.vol=100;q.eventBuff=2;row(t,['light','light','light']);play(t,'haru',2);assert.equal(q.fans.length,4);assert(q.fans.some(f=>f.type==='dream'));assert.equal(G.score(q),4);
 const u=make(),r=u.players[0];row(u,['light','light','light']);play(u,'haru',3,'vol');assert.equal(u.audience[0].type,'dream');assert.equal(r.vol,60);assert.equal(r.fans.length,0);
 r.ready=[true,true,true];r.vol=100;r.fans.push({uid:'d1',type:'dream',lock:null},{uid:'d2',type:'dream',lock:null});const before=r.fans.length;play(u,'haru',3);assert.equal(r.fans.length-before,4);
}
{
 const s=make(),p=s.players[0];mem(s,'haru',2);mem(s,'hakka',3);s.row=[{uid:'row-d',type:'dream',lock:null},{uid:'locked-d',type:'dream',lock:1},s.row[2]];s.players[1].fans=[{uid:'opp-d',type:'dream',lock:null}];event(s,'haru');assert.deepEqual(p.fans.map(f=>f.uid),['row-d','opp-d']);assert.equal(s.players[1].fans.length,0);assert(s.row.some(f=>f.uid==='locked-d'));assert.equal(G.score(p),2);
}
{
 const s=make('hakka'),p=s.players[0];play(s,'hakka',1,'vol');assert.equal(p.items.length,1);assert.equal(p.vol,40);p.ready=[true,true,true];p.vol=100;row(s,['light','light','light']);play(s,'hakka',3);assert.equal(p.items.length,2);
 // Two actual Hakka memories and two wildcard meat satisfy exactly four Hakka.
 assert(G.eventOK(s,0,'hakka'));const paid=G.autoPay(p,'hakka');assert.equal(paid.length,4);assert(p.items.every(c=>paid.includes(c.uid)));assert.throws(()=>G.peerAction(s,{type:'event',id:'hakka',memory:[...paid,'extra']},0));
 mem(s,'haru',3);event(s,'hakka');assert.equal(p.items.length,0);assert.equal(p.fanChips,3);assert.equal(p.memory.length,0);assert.equal(p.discard.length,5);assert.equal(s.pending.kind,'hakkaReady');G.dispatch(s,{type:'choose',value:'1'});assert(p.ready[1]);assert.equal(G.score(p),6);
 // Meat also substitutes another character's named memory and total, not only Hakka.
 const t=make('hakka',['haru','wit','redo']),q=t.players[0];q.items=Array.from({length:5},(_,j)=>({uid:'meat'+j,item:'meat'}));assert(G.eventOK(t,0,'haru'));event(t,'haru');assert.equal(q.items.length,0);assert.equal(q.discard.length,0);
 // Optional leader recovery triggers on reusable common events too.
 const u=make('hakka',['wit','redo','hakka']),r=u.players[0];mem(u,'hakka',4);r.ready[0]=false;G.dispatch(u,{type:'event',id:'wit',memory:G.autoPay(r,'wit'),hand:r.hand[0].uid});assert.equal(u.pending.kind,'hakkaReady');G.dispatch(u,{type:'choose',value:'skip'});assert.equal(r.ready[0],false);
}
{
 const s=make('homura'),p=s.players[0];p.vol=100;row(s,['trouble','core','heavy']);play(s,'homura',3);assert.equal(s.pending.kind,'mutePick');const bad=s.row[0],heavy=s.row[2];G.dispatch(s,{type:'choose',value:bad.uid});G.dispatch(s,{type:'choose',value:heavy.uid});assert.equal(p.fans.length,3);assert.equal(G.score(p),6);assert.equal(p.vol,100);assert(p.fans.find(f=>f.uid===bad.uid).muted);assert.equal(s.row.length,3);G.dispatch(s,{type:'end'});assert(p.fans.every(f=>!f.muted));G.dispatch(s,{type:'end'});assert.equal(p.chips,2);
}
{
 const s=make('homura'),p=s.players[0];p.vol=100;row(s,['trouble','core','heavy']);const deckBad=s.audience.findIndex(f=>f.type==='heavy');s.audience.unshift(s.audience.splice(deckBad,1)[0]);const fourth=s.audience[0];mem(s,'homura',4);mem(s,'hakka',3);event(s,'homura');assert(s.row.every(f=>!f.muted),'Existing row remains effective');assert(s.audience.every(f=>f.muted));assert.equal(p.cardBuff,1);p.ready=[true,true,true];play(s,'homura',3);G.dispatch(s,{type:'choose',value:s.row[0].uid});G.dispatch(s,{type:'choose',value:s.row[2].uid});assert.equal(p.fans.length,4);assert(p.fans.some(f=>f.uid===fourth.uid));assert.equal(p.vol,100,'Deck-acquired heavy effect suppressed');assert.equal(G.score(p),8);assert(s.row.every(f=>f.muted),'Refills from affected deck remain muted');G.dispatch(s,{type:'end'});assert.equal(p.cardBuff,0);assert(s.row.every(f=>!f.muted));
 // Event alone does not silence row heavy/trouble effects.
 const t=make('homura'),q=t.players[0];q.vol=100;row(t,['heavy','light','light']);mem(t,'homura',4);mem(t,'hakka',3);event(t,'homura');play(t,'hakka',1);assert.equal(q.vol,90);assert.equal(q.fans.length,2);
}
{
 const s=make('homura'),p=s.players[0];p.vol=100;play(s,'homura',3);G.timeout(s);assert.equal(s.active,1);assert.equal(s.pending,null);assert.equal(s.turn,2);
 const t=make('hakka'),q=t.players[0];q.items=[{uid:'meat-private',item:'meat'}];q.fanChips=2;const v=G.publicView(t,1);assert.equal(v.players[1].items.length,1);assert.equal(v.players[1].fanChips,2);assert(v.players[1].hand.every(c=>!c.owner));
}
// Existing extra abilities run before the base mode, and refilling waits for choices.
{
 const s=G.create(['hana','shio','kayo'],'shio',['haru','hakka','homura'],'hakka',0,3),p=s.players[0];p.vol=0;play(s,'hana',1,'vol');assert.equal(s.pending.kind,'shio');assert.equal(p.vol,0,'VOL base waits for extra ability choice');G.dispatch(s,{type:'choose',value:'chip'});assert.equal(p.vol,10);
 const t=make(),q=t.players[0];q.vol=100;q.eventBuff=1;row(t,['trouble','cheer','light']);const c=give(t,'haru',2);G.dispatch(t,{type:'play',card:c.uid,mode:'fan',actors:G.actors(q,c)});assert.equal(t.pending.kind,'trouble');assert.equal(t.row.length,0,'No refill before acquired effects resolve');settle(t);assert.equal(t.row.length,3);assert.equal(q.chips,1,'Returning an acquired card does not cancel its trigger');
}
// New characters participate in full CPU matches; conserve 27 songs and the original 53 spectators.
const ids=Object.keys(G.CHAR);
for(let seed=1;seed<=180;seed++){
 const a=['haru','hakka','homura'],b=[ids[seed%9],ids[(seed+3)%9],ids[(seed+6)%9]],s=G.create(a,a[seed%3],b,b[(seed+1)%3],seed%2,seed);
 let n=0;while(s.winner===null&&n++<2000){try{G.dispatch(s,G.ai(s));}catch(e){throw Error('seed '+seed+' step '+n+': '+e.message,{cause:e});}const fs=[...s.row,...s.audience,...s.players.flatMap(p=>p.fans)];assert.equal(fs.filter(f=>f.type!=='dream'&&f.type!=='influencer').length,53);assert.equal(new Set(fs.map(f=>f.uid)).size,fs.length);for(const p of s.players){assert.equal(p.hand.length+p.deck.length+p.memory.length+p.discard.length,27);assert(p.vol>=0&&p.vol<=200&&p.chips>=0);}}
 assert.notEqual(s.winner,null,'CPU match terminates seed '+seed);
}
// Render payment, recovery, items, scores, ordering and all new art without DOM dependencies.
const nodes=new Map(),document={querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(){}};
new Function('document','localStorage','setTimeout','clearTimeout','assert',code+`
state=IDOL.create(['haru','hakka','homura'],'hakka',['kayo','machi','hana'],'kayo',0,4);screen='match';modal=null;state.players[0].items=[{uid:'meat-test',item:'meat'}];state.players[0].fanChips=3;render();assert.match($('#app').innerHTML,/data-id="meat-test"/);assert.match($('#app').innerHTML,/ファンチップ/);assert.match($('#app').innerHTML,/ITEM/);
modal={kind:'event',id:'hakka'};selection={memory:['meat-test'],discard:[],targets:[]};renderModal();assert.match($('#modal').innerHTML,/data-action="pay" data-id="meat-test"/);
modal=null;const p=state.players[0];p.discard.push(p.deck.shift());state.pending={kind:'recover',p:0,options:p.discard.map(c=>c.uid),text:'recover'};renderModal();assert.match($('#modal').innerHTML,/data-action="choose"/);
state.pending=null;screen='setup';modal=null;setupTab='events';eventFilter='all';render();const setup=$('#app').innerHTML;for(const id of ['haru','hakka','homura'])assert(setup.indexOf('data-action="setup-event" data-id="'+id+'"')<setup.indexOf('data-action="setup-event" data-id="redo"'));
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert);
console.log('Trio: rule interactions, turn timing, meat payments, UI, online views and 180 CPU matches passed');
