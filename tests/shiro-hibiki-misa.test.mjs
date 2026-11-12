import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
assert.equal(code.slice(code.indexOf('const IDOL = (() => {'),code.indexOf('const $=s=>')).trim(),readFileSync(new URL('../room-server/idol-engine.mjs',import.meta.url),'utf8').split('*/')[1].split('export {IDOL};')[0].trim());
let matches=0;
for(const G of [browser,server]){
 const settle=s=>{let n=0;while(s.pending&&s.winner===null){assert(n++<300);G.dispatch(s,G.ai(s));}};
 const make=(leader='shiro',who=0,team=['shiro','hibiki','misa'],events=team)=>{const other=['kayo','hana','hakka'],oe=['kayo','hana','switch'];const s=who===0?G.create(team,leader,other,'kayo',0,123,events,oe):G.create(other,'kayo',team,leader,1,123,oe,events);settle(s);return s;};
 const give=(s,i,owner,n)=>{const p=s.players[i];for(const z of ['hand','deck','memory','discard']){const at=p[z].findIndex(c=>!c.special&&c.owner===owner&&c.n===n);if(at>=0){const c=p[z].splice(at,1)[0];p.hand.push(c);return c;}}throw Error('no song');};
 const play=(s,i,owner,n,mode)=>{const c=give(s,i,owner,n);G.dispatch(s,{type:'play',card:c.uid,actors:G.actors(s.players[i],c),mode});return c;};
 const paint=(p,id='paint')=>{const c={uid:id,owner:'shiro',n:3,special:'painted'};p.hand.push(c);return c;};
 const world=(p,id='world')=>{const c={uid:id,owner:'shiro',n:1,special:'world'};p.hand.push(c);return c;};
 const pay=(s,i,id)=>{const p=s.players[i],d=G.CHAR[id];for(let n=0;n<d.cost[1];n++)p.items.push({uid:'payment-'+id+'-'+n,item:'meat'});return G.autoPay(p,id);};
 const bad=(s,a,i=s.pending?.p??s.active)=>{const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,a,i));assert.equal(JSON.stringify(s),before);};
 const addDrink=(p,item,id=item)=>p.items.push({uid:id,item});
 const lightRow=s=>{s.row.forEach(f=>{f.type='light';f.lock=null;});s.audience.forEach(f=>f.type='light');};
 // Both seats: modes, thresholds, generated UIDs and opponent deck shuffle.
 for(const i of [0,1])for(const n of [1,2,3])for(const mode of ['vol','fan']){
  const s=make('shiro',i),p=s.players[i],q=s.players[1-i];p.vol=[60,80,100][n-1];lightRow(s);const deck=q.deck.length,seed=s.seed,c=play(s,i,'shiro',n,mode);settle(s);
  assert.equal(q.deck.length,deck+(mode==='vol'?2:0));assert.equal(q.deck.filter(c=>c.special==='painted').length,mode==='vol'?2:0);assert.equal(p.vol,[60,80,100][n-1]+(mode==='vol'?n*10:0));assert.equal(p.fans.length,mode==='fan'?n:0);assert(p.memory.some(x=>x.uid===c.uid));if(mode==='vol')assert.notEqual(s.seed,seed);
 }
 for(const i of [0,1]){
  const s=make('shiro',i),p=s.players[i],q=s.players[1-i];paint(q,'poison1');paint(q,'poison2');const chips=p.fanChips;
  G.dispatch(s,{type:'end'});settle(s);G.dispatch(s,{type:'end'});assert.equal(s.pending.kind,'shiroPeek');assert.equal(p.fanChips,chips+1);assert(s.pending.cards.some(c=>c.uid==='poison1'));
  const own=G.publicView(s,i),other=G.publicView(s,1-i);assert(own.pending.cards.some(c=>c.special==='painted'));assert(!other.pending.cards);assert(other.pending.options.length===0);assert(own.players[1].hand.every(c=>!c.owner));bad(s,{type:'choose',value:'confirm'},1-i);
  G.dispatch(s,{type:'choose',value:'confirm'});assert(!G.publicView(s,i).pending);assert(G.publicView(s,i).players[1].hand.every(c=>!c.owner));
  const memory=pay(s,i,'shiro');const items=p.items.length;G.dispatch(s,{type:'event',id:'shiro',memory});assert.equal(q.hand.filter(c=>c.special==='painted').length,0);assert.equal(p.hand.filter(c=>c.special==='world').length,2);assert.equal(p.items.length,items-4);assert(p.hand.some(c=>c.uid==='poison1'&&c.n===1));bad(s,{type:'event',id:'shiro',memory});
 }
 // Painted cards: no member requirement, no buffs, no chosen discard/memory, exile after use.
 {
  const s=make('kayo',0,['kayo','akina','hikari'],['akina','wit','kayo']),p=s.players[0],c=paint(p);p.chips=6;p.buff=3;p.eventBuff=2;p.cardBuff=1;p.vol=0;
  assert.deepEqual(G.actors(p,c),[0,1,2]);assert(G.playOK(s,0,c,[0,1,2],'fan'));assert(!G.playOK(s,0,c,[0,1],'vol'));assert.equal(G.fanCount(p,c),0);
  p.memory.push({uid:'akina-cost',owner:'akina',n:1});bad(s,{type:'event',id:'akina',memory:['akina-cost'],targets:[c.uid]});p.items.push(...[0,1,2].map(n=>({uid:'m'+n,item:'meat'})));bad(s,{type:'event',id:'wit',memory:['m0','m1','m2','akina-cost'],hand:c.uid});
  p.vol=100;p.leader='hikari';bad(s,{type:'leaderSkill',discard:[c.uid,p.hand[0].uid,p.hand[1].uid]});
  G.dispatch(s,{type:'play',card:c.uid,actors:[0,1,2],mode:'fan'});assert.equal(p.fans.length,0);assert(!p.memory.some(c=>c.special));assert(s.exiledCards.some(x=>x.uid===c.uid));assert.deepEqual(p.ready,[false,false,false]);
 }
 // Mimizuku cannot force painted discards; special world can be discarded, then exiled.
 {
  const s=make('mimizuku',0,['mimizuku','shiro','hikari']),p=s.players[0],q=s.players[1];q.deck.push(...q.hand);q.hand=[];paint(q);p.chips=1;G.dispatch(s,{type:'end'});assert.equal(p.chips,1);assert.equal(s.active,1);
 }
 for(const mode of ['vol','fan']){
  const s=make(),p=s.players[0],c=world(p);p.vol=99;bad(s,{type:'play',card:c.uid,actors:[0],mode:'fan'});p.vol=100;lightRow(s);const v=p.vol;G.dispatch(s,{type:'play',card:c.uid,actors:[0],mode});settle(s);assert.equal(p.vol,v+(mode==='vol'?50:0));assert.equal(p.fans.length,mode==='fan'?5:0);assert(s.exiledCards.some(x=>x.uid===c.uid));assert(!p.memory.some(x=>x.uid===c.uid));
 }
 {
  const s=make('akina',0,['akina','shiro','hana'],['akina','wit','mc']),p=s.players[0],c=world(p);p.memory.push({uid:'cost',owner:'akina',n:1});G.dispatch(s,{type:'event',id:'akina',memory:['cost'],targets:[c.uid]});assert(!p.memory.some(x=>x.uid===c.uid));assert(s.exiledCards.some(x=>x.uid===c.uid));
 }
 // Hibiki: own starts only, first start, mode values, cap and switches, event boundary.
 for(const i of [0,1]){
  const s=make('hibiki',i),p=s.players[i];assert.equal(p.hand.length,2); // Both seats receive the same first-start bonus.
  assert.equal(p.vol,60);
  p.vol=250;G.dispatch(s,{type:'end'});assert.equal(p.vol,250);settle(s);G.dispatch(s,{type:'end'});assert.equal(p.vol,270);settle(s);
 }
 for(const n of [1,2,3]){const s=make('hibiki'),p=s.players[0];p.vol=390;play(s,0,'hibiki',n,'vol');settle(s);assert.equal(p.vol,400);assert.equal(G.song({owner:'hibiki',n}).vol,10*n+10);}
 for(const v of [299,300,400]){
  const s=make('hibiki'),p=s.players[0],memory=pay(s,0,'hibiki');p.vol=v;G.dispatch(s,{type:'event',id:'hibiki',memory});settle(s);assert.equal(p.vol,v);assert.equal(p.fanChips,v>=300?15:0);assert.equal(p.chips,v>=300?0:10);bad(s,{type:'event',id:'hibiki',memory});
 }
 {
  const s=make('hibiki',0,['hibiki','shiro','misa'],['switch','hibiki','misa']),p=s.players[0];p.vol=375;p.items.push(...[0,1,2].map(n=>({uid:'sw'+n,item:'meat'})));G.dispatch(s,{type:'event',id:'switch',memory:['sw0','sw1','sw2'],leader:'shiro'});assert.equal(p.vol,200);assert.equal(G.maxVoltage(p),200);
 }
 // Misa: optional start, purple paid after VOL, no free-support substitution and no seal restriction.
 for(const color of ['drinkBlue','drinkRed','skip']){
  const s=make('misa'),p=s.players[0];p.chips=1;G.dispatch(s,{type:'end'});settle(s);G.dispatch(s,{type:'end'});assert.equal(s.pending.kind,'misaStart');G.dispatch(s,{type:'choose',value:color});assert.equal(p.chips,color==='skip'?1:0);assert.equal(G.drinkItems(p).length,color==='skip'?0:1);if(color!=='skip')assert.equal(p.items[0].item,color);
 }
 for(const i of [0,1])for(const n of [1,2,3]){
  const s=make('misa',i),p=s.players[i];p.chips=2;p.supportSealTurn=s.turn;p.moeFreeSupport=3;const v=p.vol;play(s,i,'misa',n,'vol');assert.equal(p.vol,v+10*n);assert.equal(s.pending.kind,'misaPurple');G.dispatch(s,{type:'choose',value:'use'});assert.equal(p.chips,0);assert.equal(p.moeFreeSupport,3);assert.equal(G.drinkItems(p)[0].item,'drinkPurple');assert(!G.paymentCards(p).some(c=>c.item==='drinkPurple'));
 }
 // Ordered one-at-a-time consumption, queue effects/refill, type stacking, held copies and no return to actions.
 {
  const s=make('misa'),p=s.players[0];lightRow(s);addDrink(p,'drinkRed','r1');addDrink(p,'drinkRed','r2');addDrink(p,'drinkBlue','b');addDrink(p,'drinkPurple','v');p.vol=100;
  G.dispatch(s,{type:'end'});assert(s.ending);assert.equal(s.pending.kind,'endDrinks');bad(s,{type:'play',card:p.hand[0].uid,actors:[0],mode:'vol'});bad(s,{type:'choose',value:'fake'});
  G.dispatch(s,{type:'choose',value:'v'});assert.equal(p.vol,110);assert.equal(p.fans.length,1);assert.equal(s.row.length,3);G.dispatch(s,{type:'choose',value:'r2'});assert.equal(p.fans.length,2);assert.equal(p.items.length,2);G.dispatch(s,{type:'choose',value:'skip'});assert.equal(s.active,1);assert(!s.ending);assert.equal(p.items.length,2);
 }
 // Event temporary scoring persists through the closing drinks, vanishes on pass, never creates fan chips.
 for(const win of [false,true]){
  const s=make('misa'),p=s.players[0],q=s.players[1];p.fanChips=5;q.fanChips=19;lightRow(s);const memory=pay(s,0,'misa');if(win)addDrink(p,'drinkRed','last');else addDrink(p,'drinkBlue','last');
  G.dispatch(s,{type:'event',id:'misa',memory});assert.equal(p.fanChips,5);assert.equal(p.temp,14);assert.equal(G.score(p),19);assert.equal(s.pending.kind,'endDrinks');G.dispatch(s,{type:'choose',value:'last'});assert.equal(p.fanChips,5);if(win){assert.equal(s.winner,0);assert.equal(G.score(p),20);}else{assert.equal(s.winner,null);assert.equal(s.active,1);assert.equal(p.temp,0);assert.equal(G.score(p),5);}
 }
 // Opponent effects can pause closing drinks; clock timeout skips all remaining optional drinks.
 {
  const s=make('misa'),p=s.players[0];addDrink(p,'drinkRed','kept');G.dispatch(s,{type:'end'});G.timeout(s);assert.equal(s.active,1);assert(p.items.some(c=>c.uid==='kept'));
 }
 {
  const s=make('misa'),p=s.players[0];addDrink(p,'drinkRed','kept');G.timeout(s);assert.equal(s.active,1);assert(p.items.some(c=>c.uid==='kept'));
 }
 // Seeded games, all three leaders plus old synergies; unique UIDs and original-card conservation.
 for(let seed=1;seed<=120;seed++){
  const ids=Object.keys(G.CHAR),a=['shiro','hibiki','misa'],b=[ids[seed%18],ids[(seed+5)%18],ids[(seed+11)%18]],s=G.create(a,a[seed%3],b,b[(seed+1)%3],seed%2,seed);let n=0;
  while(s.winner===null&&n++<3500){const action=G.ai(s);s.players.forEach(p=>{assert(p.vol>=0&&p.vol<=G.maxVoltage(p));});G.dispatch(s,action);for(const p of s.players){const original=[...p.deck,...p.hand,...p.memory,...p.discard].filter(c=>!c.special);assert.equal(original.length,27);assert(!p.memory.some(c=>c.special));assert(!p.discard.some(c=>c.special));}const all=s.players.flatMap(p=>[...p.deck,...p.hand,...p.memory,...p.discard,...p.items]);assert.equal(all.length,new Set(all.map(c=>c.uid)).size);}
  assert.notEqual(s.winner,null,'new CPU match terminates');matches++;
 }
}
console.log('Shiro/Hibiki/Misa: both engines/seats, private peeks, poison restrictions/exile/transform, caps/start/payment boundaries, optional drinks/forced endings/temp wins/timeout and '+matches+' CPU matches passed');
