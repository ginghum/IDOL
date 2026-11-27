import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const engine=html.slice(html.indexOf('const IDOL = (() => {'),html.indexOf('const $=s=>')).trim();
assert.equal(readFileSync(new URL('../room-server/idol-engine.mjs',import.meta.url),'utf8').split('\n').slice(1).join('\n').trim(),engine+'\n\nexport {IDOL};');
const browser=new Function(engine+';return IDOL')();
const ids=['kazuna','mio','yuu','chris'];
let games=0;
for(const G of [browser,server])for(const seat of [0,1]){
 const make=(id,leader=id)=>{const team=[id,'hana','natsume'],other=['rai','hana','natsume'];const s=seat?G.create(other,'rai',team,leader,1,77,other,team):G.create(team,leader,other,'rai',0,77,team,other);s.pending=null;s.queue=[];s.winner=null;for(const f of [...s.row,...s.audience])f.type='light';return s;};
 const give=(s,id,n)=>{const p=s.players[seat];for(const zone of ['deck','hand','memory','discard']){const j=p[zone].findIndex(c=>c.owner===id&&c.n===n);if(j>=0){const c=p[zone].splice(j,1)[0];p.hand.push(c);return c;}}throw Error('missing');};
 const settle=s=>{let n=0;while(s.pending){assert(n++<200);G.dispatch(s,G.ai(s));}};
 const play=(s,id,n,mode='vol')=>{const p=s.players[seat];p.ready=[true,true,true];const c=give(s,id,n);G.dispatch(s,{type:'play',card:c.uid,actors:G.actors(p,c),mode});settle(s);return c;};
 const cycle=s=>{G.dispatch(s,{type:'end',skipEndSkill:true});settle(s);G.dispatch(s,{type:'end',skipEndSkill:true});settle(s);};
 const event=(s,id)=>{const p=s.players[seat];for(const z of ['deck','hand']){while(p.memory.filter(c=>c.owner===id).length<G.CHAR[id].cost[0]){const j=p[z].findIndex(c=>c.owner===id);if(j<0)break;p.memory.push(p[z].splice(j,1)[0]);}}while(p.memory.length<G.CHAR[id].cost[1])p.memory.push(p.deck.shift());G.dispatch(s,{type:'event',id,memory:G.autoPay(p,id)});settle(s);assert(p.events.find(e=>e.id===id).used);};
 for(const id of ids){const s=make(id),p=s.players[seat];assert.equal(p.vol,G.CHAR[id].vol);assert.equal(p.hand.length,G.CHAR[id].hand);for(const n of [1,2,3])for(const mode of ['vol','fan']){p.vol=100;play(s,id,n,mode);}assert.equal(G.publicView(s,1-seat).players[1].hand.filter(c=>c.owner).length,0);}
 {const s=make('kazuna'),p=s.players[seat];const a=play(s,'kazuna',1);assert.equal(p.goal.uid,a.uid);assert(!p.memory.includes(a));const b=play(s,'kazuna',1);assert.equal(p.chips,0);assert(p.hand.includes(a));assert.equal(p.goal.uid,b.uid);cycle(s);p.goalEvent=true;const c=play(s,'kazuna',1);assert.equal(p.chips,3);assert.equal(p.fanChips,3);assert.equal(p.goal.uid,c.uid);assert(!p.goalEvent);}
 {const s=make('kazuna','hana'),p=s.players[seat];play(s,'kazuna',1);cycle(s);play(s,'natsume',1);assert.equal(p.chips,1);assert.equal(p.goal,null);event(s,'kazuna');assert(p.goalEvent);assert.throws(()=>event(s,'kazuna'));}
 {const s=make('mio','hana'),p=s.players[seat];p.experience=3;p.vol=100;const n=p.fans.length;play(s,'mio',1,'fan');assert.equal(p.fans.length-n,1);assert.equal(p.experience,5);assert.equal(G.fanCount(p,{owner:'mio',n:1}),2);assert.equal(G.fanCount(p,{owner:'hana',n:1}),1);p.experience=7;play(s,'mio',1,'fan');assert.equal(p.experience,8);event(s,'mio');assert.equal(p.experience,8);}
 {const s=make('mio'),p=s.players[seat];G.dispatch(s,{type:'end'});settle(s);assert.equal(p.experience,1);}
 for(const n of [1,2,3]){const s=make('yuu'),p=s.players[seat],c=give(s,'yuu',n);p.vol=[40,60,80][n-1]-1;const a={type:'play',card:c.uid,actors:G.actors(p,c),mode:'fan'},before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,a,seat));assert.equal(JSON.stringify(s),before);p.vol++;G.dispatch(s,a);settle(s);assert(p.borrowDue);assert.equal(p.vol,[40,60,80][n-1]);const h=p.hand.length;cycle(s);assert.equal(p.vol,[30,50,70][n-1]);assert.equal(p.hand.length,h+2);assert(p.chips>=2);assert(!p.borrowDue);}
 {const s=make('yuu'),p=s.players[seat];p.vol=60;play(s,'yuu',1,'fan');assert(!p.borrowDue);p.vol=40;play(s,'yuu',1,'fan');play(s,'yuu',1,'fan');event(s,'yuu');const h=p.hand.length;cycle(s);assert.equal(p.vol,60);assert.equal(p.hand.length,h+4);}
 {const s=make('chris','hana'),p=s.players[seat];play(s,'chris',1);assert.equal(p.wealth,1);assert.equal(p.chips,0);p.wealth=7;cycle(s);assert.equal(p.wealth,7);assert.equal(p.chips,1);const bad=JSON.stringify(s);assert.throws(()=>G.peerAction(s,{type:'wealth',amount:8},seat));assert.equal(JSON.stringify(s),bad);for(const amount of [1,7]){const snapshot=JSON.stringify(s);assert.throws(()=>G.peerAction(s,{type:'wealth',amount},seat));assert.equal(JSON.stringify(s),snapshot);assert.throws(()=>G.dispatch(s,{type:'wealth',amount}));assert.equal(JSON.stringify(s),snapshot);}p.wealth=21;event(s,'chris');assert.equal(p.wealth,0);assert.equal(p.chips,22);assert.equal(p.fanChips,10);}
 {const s=make('chris'),p=s.players[seat];p.chips=2;const h=p.hand.length;G.dispatch(s,{type:'end'});assert.equal(s.pending.kind,'chrisSave');G.dispatch(s,{type:'choose',value:'use'});assert.equal(p.wealth,1);assert.equal(p.chips,0);assert.equal(p.hand.length,h+1);assert.equal(s.active,1-seat);}
 {const s=make('chris'),p=s.players[seat];p.chips=2;G.dispatch(s,{type:'end'});G.timeout(s);assert.equal(s.active,1-seat);assert.equal(p.wealth,0);}

 // Every growth boundary applies only to subsequent songs, and all sources cap at 8.
 for(const before of [2,3,6,7,8]){const s=make('mio'),p=s.players[seat];p.experience=before;p.vol=100;play(s,'mio',1,'fan');assert.equal(p.fans.length,1+Math.floor(before/4));assert.equal(p.experience,Math.min(8,before+2));assert.equal(G.fanCount(p,{owner:'mio',n:3}),3+Math.floor(Math.min(8,before+2)/4));}
 {const s=make('mio'),p=s.players[seat];p.experience=8;G.dispatch(s,{type:'end'});settle(s);assert.equal(p.experience,8);}
 // Kazuna's event now accepts seven memories without any Kazuna cards; six is insufficient.
 {const s=make('kazuna'),p=s.players[seat];for(const z of ['hand','deck']){for(let j=p[z].length-1;j>=0&&p.memory.length<7;j--)if(p[z][j].owner!=='kazuna')p.memory.push(p[z].splice(j,1)[0]);}assert.equal(p.memory.length,7);assert(p.memory.every(c=>c.owner!=='kazuna'));const paid=G.autoPay(p,'kazuna');assert.equal(paid.length,7);const snapshot=JSON.stringify(s);assert.throws(()=>G.peerAction(s,{type:'event',id:'kazuna',memory:paid.slice(0,6)},seat));assert.equal(JSON.stringify(s),snapshot);G.dispatch(s,{type:'event',id:'kazuna',memory:paid});assert(p.goalEvent);}
 for(const id of ids)for(let seed=1;seed<=15;seed++){
  const s=G.create([id,'hana','natsume'],seed%2?id:'hana',['rai','natsume','hana'],'rai',seed%2,seed,[id,'request','lastOrder'],['rai','request','lastOrder']);let steps=0;
  while(s.winner===null&&steps++<1600){G.dispatch(s,G.ai(s));for(const p of s.players){const cards=[...p.deck,...p.hand,...p.memory,...p.discard,...(p.goal?[p.goal]:[]),...(p.rehearsal?[p.rehearsal]:[])];assert.equal(cards.filter(c=>!c.special).length,27);assert.equal(new Set(cards.map(c=>c.uid)).size,cards.length);assert(p.chips>=0&&(p.wealth||0)>=0&&(p.experience||0)<=8);}}
  assert.notEqual(s.winner,null,'new-character CPU game must finish '+id+' '+seed);games++;
 }
}
console.log('FunkFanfare four: both engines/seats, goals, growth, borrowing, wealth, events, privacy, atomic input, timeout and '+games+' CPU matches passed');
