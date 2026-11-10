import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
for(const G of [browser,server]){
 const make=(seat=0)=>G.create(['haru','aya','nina'],'haru',['haru','hikari','ayame'],'haru',seat,11010,['haru','mc','wit'],['haru','mc','wit']);
 const give=(s,i,owner,n)=>{const p=s.players[i];for(const zone of ['hand','deck']){const at=p[zone].findIndex(c=>c.owner===owner&&c.n===n);if(at>=0){const c=p[zone].splice(at,1)[0];p.hand.push(c);return c;}}throw Error('missing card');};
 const bad=(s,a,i)=>{const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,a,i));assert.equal(JSON.stringify(s),before);};
 assert.deepEqual(Object.fromEntries(Object.entries(G.LOTTERY).map(([id,d])=>[id,d.count])),{grand:1,medium:2,small:3,miss:8,bomb:1});
 for(const seat of [0,1])for(const chips of [0,1,2])for(const use of ['pay','skip','timeout']){
  const s=make(seat),p=s.players[seat],c=p.deck.shift();p.discard.push(c);p.chips=chips;
  G.dispatch(s,{type:'end'});G.dispatch(s,{type:'end'});
  if(!chips){assert.equal(s.pending,null);assert(p.discard.includes(c));assert.equal(p.chips,0);continue;}
  assert.equal(s.pending.kind,'recover');assert.equal(s.pending.p,seat);assert.equal(s.pending.options[0],'skip');assert.equal(p.chips,chips);
  const mine=G.publicView(s,seat),other=G.publicView(s,1-seat);assert(mine.pending.options.includes(c.uid));assert.deepEqual(other.pending.options,[]);bad(s,{type:'choose',value:c.uid},1-seat);
  if(use==='timeout'){G.timeout(s);assert.equal(p.chips,chips);assert(p.discard.includes(c));}
  else{G.dispatch(s,{type:'choose',value:use==='pay'?c.uid:'skip'});assert.equal(p.chips,chips-(use==='pay'?1:0));assert.equal(p.hand.includes(c),use==='pay');assert.equal(p.discard.includes(c),use!=='pay');}
 }
 // An absent discard never spends support. Choosing recovery with no remaining support is atomic.
 {const s=make(),p=s.players[0];p.chips=1;G.dispatch(s,{type:'end'});G.dispatch(s,{type:'end'});assert.equal(s.pending,null);assert.equal(p.chips,1);}
 {const s=make(),p=s.players[0],c=p.deck.shift();p.discard.push(c);p.chips=1;G.dispatch(s,{type:'end'});G.dispatch(s,{type:'end'});p.chips=0;bad(s,{type:'choose',value:c.uid},0);G.dispatch(s,{type:'choose',value:'skip'});assert.equal(p.chips,0);}
 // New Aya payment boundary is evaluated AFTER audience effects.
 for(const n of [2,3])for(const after of [n===2?29:39,n===2?30:40]){
  const s=make(),p=s.players[0];s.row.forEach(f=>{f.type='heavy';f.muted=false;});s.row[0].type='light';
  // Use a deterministic resolved-effect queue to exercise the exact threshold independently of FAN eligibility.
  p.vol=after;p.ready=[false,false,false];s.queue.push({kind:'ayaReady',p:0,cost:n===2?30:40,all:n===3});G.dispatch(s,{type:'end'});
  if(after<(n===2?30:40)){assert.equal(s.pending,null);assert.equal(p.vol,after);}else{assert.equal(s.pending.kind,'ayaReady');G.dispatch(s,{type:'choose',value:n===2?'0':'all'});assert.equal(p.vol,0);assert.equal(p.ready[1],false);assert.equal(p.ready[0],true);}
 }
 // The new payment still follows actual heavy-fan resolution during normal song play.
 {const s=make(),p=s.players[0];p.vol=80;s.row.forEach(f=>f.type='heavy');const c=give(s,0,'aya',2);G.dispatch(s,{type:'play',card:c.uid,actors:[0,1],mode:'fan'});assert.equal(p.vol,60);assert.equal(s.pending.cost,30);G.dispatch(s,{type:'choose',value:'0'});assert.equal(p.vol,30);}
}
assert.match(html,/今回は支払わない/);assert.match(html,/大あたり1・中あたり2・小あたり3・ハズレ8・爆弾1/);
console.log('Five nerfs: both engines, exact lottery counts, Haru paid/skip/no-support/timeout/both-seat privacy and atomicity, Aya new thresholds and post-effect payment passed');
