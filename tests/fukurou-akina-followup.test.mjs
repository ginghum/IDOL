import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),browser=new Function(html.slice(html.indexOf('const IDOL = (() => {'),html.indexOf('const $=s=>'))+';return IDOL;')();
for(const G of [browser,server])for(const seat of [0,1]){
 const make=(id,leader='kayo')=>{const a=[id,...['kana','kayo','shio'].filter(x=>x!==id)].slice(0,3),b=['hana','nina','machi'];const s=seat?G.create(b,'hana',a,leader,seat,2811,b,a):G.create(a,leader,b,'hana',seat,2811,a,b);for(const f of [...s.row,...s.audience])f.type='light';return s;};
 const give=(s,id,n)=>{const p=s.players[seat];for(const z of ['hand','deck']){const i=p[z].findIndex(c=>c.owner===id&&c.n===n);if(i>=0){const c=p[z].splice(i,1)[0];p.hand.push(c);return c;}}throw Error('card');};
 const play=(s,c,mode)=>G.dispatch(s,{type:'play',card:c.uid,mode,actors:G.actors(s.players[seat],c)});
 const bad=(s,a,i=seat)=>{const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,a,i));assert.equal(JSON.stringify(s),before);};
 for(const n of [1,2,3])for(const mode of ['vol','fan'])for(const target of [false,true])for(const sealed of [false,true]){
  const s=make('fukurou'),p=s.players[seat],q=s.players[1-seat],c=give(s,'fukurou',n);p.vol=100;p.songSeal=sealed;if(target)q.fanChips=1;play(s,c,mode);assert.equal(q.fanChips,target&&sealed?1:0);assert.equal(p.chips,!target&&!sealed&&mode==='vol'?1:0);
 }
 for(const n of [1,2,3])for(const mode of ['vol','fan'])for(const value of ['return','skip']){
  const s=make('akina'),p=s.players[seat],c=give(s,'akina',n);p.vol=100;const h=p.hand.length;play(s,c,mode);
  if(mode==='vol'){assert.equal(s.pending,null);assert.equal(p.chips,0);assert(p.memory.includes(c));continue;}
  assert.equal(s.pending.kind,'akinaReturn');bad(s,{type:'choose',value:'invalid'});bad(s,{type:'choose',value},1-seat);
  G.dispatch(s,{type:'choose',value});assert.equal(p.chips,value==='skip'?1:0);assert.equal(p.hand.length,h-(value==='skip'?1:0));assert.equal(p.memory.includes(c),value==='skip');assert.equal(p.ready.filter(Boolean).length,3-n);assert.equal(p.songsPlayed,1);bad(s,{type:'choose',value});
 }
 {const s=make('akina'),p=s.players[seat],c=give(s,'akina',1);p.songSeal=true;p.vol=100;play(s,c,'fan');assert.equal(s.pending,null);assert.equal(p.chips,0);assert(p.memory.includes(c));}
 {const s=make('akina'),p=s.players[seat],c=give(s,'akina',1);p.vol=100;play(s,c,'fan');G.timeout(s);assert.equal(p.chips,1);assert(p.memory.includes(c));assert.equal(s.active,1-seat);}
 // Borrowed Akina effects refer to the actual Kana card and grant exactly one chip if retained.
 {const s=make('kana'),p=s.players[seat],c=give(s,'kana',3),origin={uid:'akina-source',owner:'akina',n:3};p.memory.push(origin);p.vol=100;play(s,c,'fan');assert(s.pending.free);G.dispatch(s,{type:'choose',value:origin.uid});assert.equal(s.pending.kind,'akinaReturn');G.dispatch(s,{type:'choose',value:'skip'});assert.equal(p.chips,1);assert(p.memory.includes(c));assert(p.memory.includes(origin));}
 // CPU returns a unique scarce song, retains duplicates/full hands, and reserves an event's needed memory.
 for(const scenario of ['scarce','duplicate','full','event']){
  const s=make('akina'),p=s.players[seat],c=give(s,'akina',1);p.vol=100;p.discard.push(...p.hand.filter(x=>x.uid!==c.uid));p.hand=[c];
  if(scenario==='duplicate')p.hand.push({uid:'duplicate',owner:'akina',n:1});if(scenario==='full')p.hand.push(...p.deck.splice(0,4));
  if(scenario==='event'){p.events=[{id:'wit',used:false}];p.memory.push(...p.deck.splice(0,3));p.hand.push({uid:'extra-hand',owner:'kana',n:2});}
  play(s,c,'fan');assert.equal(G.ai(s).value,scenario==='scarce'?'return':'skip');
 }
}
console.log('Fukurou/Akina follow-up: both engines/seats, all modes/sizes/targets/seals, exclusive rewards, authority/stale input, timeout, borrowed effects and CPU scarcity/duplicate/event choices passed');
