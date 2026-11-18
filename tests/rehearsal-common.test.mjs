import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const browser=new Function(html.slice(html.indexOf('const IDOL = (() => {'),html.indexOf('const $=s=>'))+';return IDOL;')();
for(const G of [browser,server])for(const seat of [0,1]){
 const a=['kokone','kana','miyabi'],b=['kayo','hana','machi'];
 const make=()=>seat?G.create(b,'kayo',a,'kokone',1,1893,b,['kokone','switch','mc']):G.create(a,'kokone',b,'kayo',0,1893,['kokone','switch','mc'],b);
 function give(p,owner,n,zone='hand'){for(const z of ['hand','deck','memory','discard']){const at=p[z].findIndex(c=>c.owner===owner&&c.n===n);if(at>=0){const c=p[z].splice(at,1)[0];p[zone].push(c);return c;}}throw Error('fixture');}
 function stage(s){const p=s.players[seat],c=give(p,'kokone',2);p.vol=100;G.dispatch(s,{type:'end'});G.dispatch(s,{type:'choose',value:c.uid});G.dispatch(s,{type:'end',skipEndSkill:true});assert.equal(s.pending.kind,'kokoneUse');assert.equal(s.pending.options[0],'skip');return c;}
 const settle=s=>{while(s.pending)G.dispatch(s,G.ai(s));};
 assert.equal(G.CHAR.kokone.skill,'自分のターン終了時、空のリハーサルに手札の2人用・3人用楽曲1枚を表向きで置いてもよい。');
 // Holding at a valid start consumes neither members, VOL, cards nor the rehearsal.
 {const s=make(),c=stage(s),p=s.players[seat],before={vol:p.vol,ready:[...p.ready],hand:p.hand.length,memory:p.memory.length};G.dispatch(s,{type:'choose',value:'skip'});assert.equal(s.pending,null);assert.equal(p.rehearsal.uid,c.uid);assert.equal(p.vol,before.vol);assert.deepEqual(p.ready,before.ready);assert.equal(p.hand.length,before.hand);assert.equal(p.memory.length,before.memory);
  // Use a real Center Switch; the common rehearsal rule still offers use next turn.
  p.memory.push(...p.deck.splice(0,3));G.dispatch(s,{type:'event',id:'switch',leader:'kana',memory:G.autoPay(p,'switch')});assert.equal(p.leader,'kana');G.dispatch(s,{type:'end',skipEndSkill:true});G.dispatch(s,{type:'end',skipEndSkill:true});assert.equal(s.pending.kind,'kokoneUse');assert(s.pending.options.includes('skip'));const actors=s.pending.options.find(x=>x!=='skip');G.dispatch(s,{type:'choose',value:actors});settle(s);assert.equal(p.rehearsal,null);assert.equal(p.ready.filter(x=>!x).length,1);assert(p.memory.some(x=>x.uid===c.uid));assert.equal(p.songsPlayed,0);
 }
 // Holding allows the prepared event to resolve twice in the same turn.
 {const s=make(),c=stage(s),p=s.players[seat];G.dispatch(s,{type:'choose',value:'skip'});while(p.memory.filter(x=>x.owner==='kokone').length<3){const x=[...p.deck,...p.hand].find(x=>x.owner==='kokone');give(p,x.owner,x.n,'memory');}while(p.memory.length<9){const x=p.deck[0];give(p,x.owner,x.n,'memory');}const ready=[...p.ready],vol=p.vol;const before=s.log.length;G.dispatch(s,{type:'event',id:'kokone',memory:G.autoPay(p,'kokone')});settle(s);assert.equal(s.log.slice(before).filter(x=>x.includes('狐々音イベント：')).length,2);assert.equal(p.rehearsal,null);assert(p.memory.some(x=>x.uid===c.uid));assert.deepEqual(p.ready,ready);assert.equal(p.vol,vol);}
 // Timeout chooses the optional hold, advances once, and leaves all members unused.
 {const s=make(),c=stage(s),p=s.players[seat],turn=s.turn;const enemy=G.publicView(s,1-seat);assert.equal(enemy.players[1].rehearsal.uid,c.uid);assert.deepEqual(enemy.pending.options,[]);const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,{type:'choose',value:'skip'},1-seat));assert.equal(JSON.stringify(s),before);G.timeout(s);assert.equal(s.turn,turn+1);assert.equal(s.active,1-seat);assert.equal(p.rehearsal.uid,c.uid);assert(p.ready.every(Boolean));}
 // A retained rehearsal remains usable under any leader, but VOL and required members still apply.
 for(const leader of ['kana','miyabi'])for(const vol of [0,100]){const s=make(),p=s.players[seat],c=give(p,'kokone',3);p.hand=p.hand.filter(x=>x.uid!==c.uid);p.rehearsal=c;p.leader=leader;p.vol=vol;G.dispatch(s,{type:'end',skipEndSkill:true});G.dispatch(s,{type:'end',skipEndSkill:true});assert.equal(s.pending?.kind??null,vol===100?'kokoneUse':null);assert.equal(p.rehearsal.uid,c.uid);}
 // CPU holds when the double-use event is ready, otherwise it uses the rehearsal.
 {const s=make();stage(s);const p=s.players[seat];assert.notEqual(G.ai(s).value,'skip');while(p.memory.filter(x=>x.owner==='kokone').length<3){const x=[...p.deck,...p.hand].find(x=>x.owner==='kokone');give(p,x.owner,x.n,'memory');}while(p.memory.length<9){const x=p.deck[0];give(p,x.owner,x.n,'memory');}assert.equal(G.ai(s).value,'skip');}
}
console.log('Common rehearsal: both engines/seats, optional hold/use, real leader switch, prepared double event, conditions, privacy/authority, timeout and CPU passed');
