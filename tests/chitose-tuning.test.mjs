import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const browser=new Function(html.slice(html.indexOf('const IDOL = (() => {'),html.indexOf('const $=s=>'))+';return IDOL;')();
for(const G of [browser,server])for(const seat of [0,1]){
 const make=()=>{const a=['chitose','kana','kokone'],b=['chitose','kayo','hana'];return seat?G.create(b,'kayo',a,'chitose',seat,1831):G.create(a,'chitose',b,'kayo',seat,1831);};
 function give(p,owner,n,zone='hand'){for(const z of ['hand','deck','memory','discard']){const at=p[z].findIndex(c=>c.owner===owner&&c.n===n);if(at>=0){const c=p[z].splice(at,1)[0];p[zone].push(c);return c;}}throw Error('fixture card');}
 function target(s){const q=s.players[1-seat],at=s.audience.findIndex(f=>f.type==='light'),f=s.audience.splice(at,1)[0];q.fans.push(f);return f;}
 const settle=s=>{while(s.pending)G.dispatch(s,G.ai(s));};
 {const s=make(),p=s.players[seat];assert.equal(p.hand.length,5);assert.equal(p.deck.length,22);assert.equal(p.vol,30);assert.equal(G.song({owner:'chitose',n:1}).need,60);assert.match(G.detail({owner:'chitose',n:1}).fanText,/自分のVOLが80％以上なら/);assert(!G.detail({owner:'chitose',n:2}).fanText.includes('80％以上なら'));}
 for(const vol of [60,79,80,100])for(const mode of ['fan','vol']){
  const s=make(),p=s.players[seat],q=s.players[1-seat],f=target(s),c=give(p,'chitose',1);p.vol=vol;
  G.dispatch(s,{type:'play',card:c.uid,actors:G.actors(p,c),mode});settle(s);
  assert.equal(q.fans.some(x=>x.uid===f.uid),!(mode==='fan'&&vol>=80),`${vol} ${mode}`);
  assert.equal(p.vol,vol+(mode==='vol'?10:0),'threshold does not spend VOL');
  if(mode==='fan')assert.equal(p.fans.length,1,'basic FAN still works from VOL60');
 }
 // Check at song use, before the acquired heavy fan lowers VOL80 to VOL70.
 {const s=make(),p=s.players[seat],q=s.players[1-seat],f=target(s);s.audience.push(...s.row);const at=s.audience.findIndex(f=>f.type==='heavy');s.row=[s.audience.splice(at,1)[0]];p.vol=80;const c=give(p,'chitose',1);G.dispatch(s,{type:'play',card:c.uid,actors:G.actors(p,c),mode:'fan'});settle(s);assert(!q.fans.some(x=>x.uid===f.uid));assert.equal(p.vol,70);}
 // Borrowing with Drift carries the new VOL condition.
 for(const vol of [79,80]){const s=make(),p=s.players[seat],q=s.players[1-seat],f=target(s),source=give(q,'chitose',1,'memory'),c=give(p,'kana',1);p.leader='kana';p.vol=vol;G.dispatch(s,{type:'play',card:c.uid,actors:G.actors(p,c),mode:'fan'});assert.equal(s.pending.kind,'kanaDrift');G.dispatch(s,{type:'choose',value:source.uid});settle(s);assert.equal(q.fans.some(x=>x.uid===f.uid),vol<80);assert.equal(p.vol,vol);}
 // Event ignores song-specific conditions and effects, including Chitose removal.
 {const s=make(),p=s.players[seat],q=s.players[1-seat],f=target(s),c=give(p,'chitose',1);p.hand=p.hand.filter(x=>x.uid!==c.uid);p.rehearsal=c;p.events=[{id:'kokone',used:false}];while(p.memory.filter(x=>x.owner==='kokone').length<3){const x=[...p.deck,...p.hand].find(x=>x.owner==='kokone');give(p,x.owner,x.n,'memory');}while(p.memory.length<9){const x=p.deck[0];give(p,x.owner,x.n,'memory');}p.vol=100;G.dispatch(s,{type:'event',id:'kokone',memory:G.autoPay(p,'kokone')});settle(s);assert(q.fans.some(x=>x.uid===f.uid));}
}
console.log('Chitose tuning: both engines/seats, initial hand5, VOL60/79/80 boundaries, no VOL payment, VOL mode, pre-acquisition timing, Drift and event suppression passed');
