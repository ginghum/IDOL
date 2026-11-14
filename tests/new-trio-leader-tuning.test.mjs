import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {IDOL as server} from '../room-server/idol-engine.mjs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
for(const G of [browser,server]){
 assert.equal(G.CHAR.hibiki.vol,30);assert.equal(G.CHAR.misa.vol,20);assert.equal(G.CHAR.hibiki.hand,2);assert.equal(G.CHAR.misa.hand,5);assert.match(G.CHAR.shiro.skill,/2枚以上/);
 for(const seat of[0,1])for(const leader of['hibiki','misa']){
  const teams=[['shiro','hibiki','misa'],['kayo','hana','hakka']],s=seat===0?G.create(teams[0],leader,teams[1],'kayo',0,123):G.create(teams[1],'kayo',teams[0],leader,1,123),p=s.players[seat];assert.equal(p.vol,leader==='hibiki'?40:20);assert.equal(p.hand.length,leader==='hibiki'?2:5);assert.equal(G.maxVoltage(p),leader==='hibiki'?400:200);
 }
 for(const seat of[0,1])for(const count of[0,1,2,3]){
  const team=['shiro','hibiki','misa'],other=['kayo','hana','hakka'],s=seat===0?G.create(team,'shiro',other,'kayo',0,123):G.create(other,'kayo',team,'shiro',1,123);G.dispatch(s,{type:'choose',value:'confirm'});const p=s.players[seat],q=s.players[1-seat];q.hand.push(...Array.from({length:count},(_,n)=>({uid:'paint-'+n,owner:'shiro',n:3,special:'painted'})));G.dispatch(s,{type:'end'});G.dispatch(s,{type:'end'});assert.equal(s.pending.kind,'shiroPeek');assert.equal(p.fanChips,count>=2?1:0);assert.equal(s.pending.cards.filter(c=>c.special==='painted').length,count);const view=G.publicView(s,1-seat);assert(!view.pending.cards);assert.equal(view.pending.options.length,0);G.dispatch(s,{type:'choose',value:'confirm'});
 }
 // With VOL100 and far fewer than six memories, Hibiki should score rather than keep charging.
 {
  const s=G.create(['hibiki','kayo','hana'],'hibiki',['rai','hakka','machi'],'rai',0,7),p=s.players[0];p.vol=100;p.chips=0;p.memory=[];p.events=[{id:'hibiki',used:false}];p.hand=[{uid:'one',owner:'hibiki',n:1},{uid:'two',owner:'hibiki',n:2}];s.row.forEach(f=>f.type='light');const a=G.ai(s);assert.equal(a.type,'play');assert.equal(a.mode,'fan');assert.equal(a.card,'one');G.dispatch(s,a);assert(p.fans.length>=1);
 }
 // In a lineup with another leader, the new members retain their original song values.
 for(const id of['shiro','hibiki','misa'])for(const n of[1,2,3])assert.equal(G.song({owner:id,n}).vol,n*10+(id==='hibiki'?10:0));
}
console.log('Leader tuning: both engines/seats, first-start VOL/hand, Shiro 0/1/2/3-card threshold/private reveal and Hibiki FAN-first policy passed');
