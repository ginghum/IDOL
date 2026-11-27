import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),browser=new Function(html.slice(html.indexOf('const IDOL = (() => {'),html.indexOf('const $=s=>'))+';return IDOL;')();
for(const G of [server,browser])for(const seat of [0,1]){
 const make=(id,leader=id)=>{const own=[id,...['kana','kayo','hana'].filter(x=>x!==id)].slice(0,3),enemy=['machi','nina','shio'];const s=seat?G.create(enemy,'nina',own,leader,seat,2739,enemy,own):G.create(own,leader,enemy,'nina',seat,2739,own,enemy);for(const f of [...s.row,...s.audience])f.type='light';return s;};
 const give=(s,id,n,zone='hand')=>{const p=s.players[seat];for(const z of ['deck','hand','memory','discard']){const j=p[z].findIndex(c=>c.owner===id&&c.n===n);if(j>=0){const c=p[z].splice(j,1)[0];p[zone].push(c);return c;}}throw Error('fixture');};
 const settle=s=>{let n=0;while(s.pending){assert(n++<100);G.dispatch(s,G.ai(s));}};
 const play=(s,c,mode)=>G.dispatch(s,{type:'play',card:c.uid,actors:G.actors(s.players[seat],c),mode});
 const bad=(s,a)=>{const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,a,seat));assert.equal(JSON.stringify(s),before);};
 assert.equal(make('kokone').players[seat].vol,20);assert.equal(make('kokone').players[seat].hand.length,4);
 assert.equal(make('mitama').players[seat].vol,30);assert.equal(make('mitama').players[seat].hand.length,3);
 assert.deepEqual(G.EVENTS.akina.cost,[0,1]);assert.deepEqual(G.EVENTS.machi.cost,[1,2]);assert.deepEqual(G.EVENTS.riri.cost,[2,6]);
 for(const n of [1,2,3])for(const mode of ['vol','fan'])for(const victim of ['none','item','fanChip','sealed']){
  const s=make('fukurou','kayo'),p=s.players[seat],q=s.players[1-seat],c=give(s,'fukurou',n);p.vol=100;p.chips=0;q.chips=5;
  if(victim==='item')q.items.push({uid:'victim',item:'teddy'});if(victim==='fanChip')q.fanChips=1;if(victim==='sealed')p.songSeal=true;
  play(s,c,mode);settle(s);assert.equal(p.chips,victim==='none'&&mode==='vol'?1:0);assert.equal(q.items.length,0);assert.equal(q.fanChips,0);assert.equal(q.chips,5);
 }
 // A 3-person Drift is free for a non-leader, but source payments remain mandatory.
 for(const mode of ['vol','fan']){
  const s=make('kana','kayo'),p=s.players[seat],q=s.players[1-seat],c=give(s,'kana',3),source={uid:'source',owner:'miyabi',n:3};q.memory.push(source);p.vol=100;p.chips=1;q.vol=100;
  play(s,c,mode);assert.equal(s.pending.kind,'kanaDrift');assert.equal(s.pending.free,true);G.dispatch(s,{type:'choose',value:source.uid});assert.equal(p.chips,1);assert.equal(s.pending.kind,'kanaDriftOption');G.dispatch(s,{type:'choose',value:'use'});settle(s);assert.equal(p.chips,0);assert.equal(q.vol,80);
 }
 {const s=make('kana','kayo'),p=s.players[seat],q=s.players[1-seat],c=give(s,'kana',3);q.memory.push({uid:'free-fallback',owner:'fukurou',n:3});p.chips=0;play(s,c,'vol');assert(s.pending.free);G.dispatch(s,{type:'choose',value:'free-fallback'});assert.equal(p.chips,1);}
 {const s=make('kana','kayo'),p=s.players[seat],q=s.players[1-seat],c=give(s,'kana',1);q.memory.push({uid:'paid-fallback',owner:'fukurou',n:1});p.chips=0;play(s,c,'vol');assert.equal(s.pending,null);assert.equal(p.chips,0);}
 // Cheap Machi event still requires one own memory; invalid payments are atomic.
 {const s=make('machi','kayo'),p=s.players[seat],own=give(s,'machi',1,'memory'),a=give(s,'kayo',1,'memory'),b=give(s,'kayo',2,'memory');bad(s,{type:'event',id:'machi',memory:[a.uid,b.uid],targets:[]});bad(s,{type:'event',id:'machi',memory:[own.uid],targets:[]});G.dispatch(s,{type:'event',id:'machi',memory:[own.uid,a.uid],targets:[]});assert(p.events.find(e=>e.id==='machi').used);assert(p.memory.some(c=>c.uid===b.uid));}
 // Akina pays any one memory, including a teammate, and can repeat while paying each time.
 {const s=make('akina','kayo'),p=s.players[seat],a=give(s,'kayo',1,'memory'),b=give(s,'kana',1,'memory');for(const c of [a,b])G.dispatch(s,{type:'event',id:'akina',memory:[c.uid],targets:[]});assert.equal(p.discard.length,2);assert.equal(p.events.find(e=>e.id==='akina').used,false);}
 // Multi-person Chitose retains removal; solo never removes, even at high VOL.
 for(const n of [1,2,3]){const s=make('chitose','kayo'),p=s.players[seat],q=s.players[1-seat],c=give(s,'chitose',n),f=s.audience.shift();q.fans.push(f);p.vol=100;play(s,c,'fan');settle(s);assert.equal(q.fans.some(x=>x.uid===f.uid),n===1);assert.equal(Boolean(G.detail(c).fanText),n>1);}
}
console.log('Nov27 nine-character balance: both engines/seats, initial values, empty-target-only Fukurou reward/seal, free 3-person Drift and extra payments, exact Machi/Akina costs and repeat/atomic rejection, Chitose solo vs group effects passed');
