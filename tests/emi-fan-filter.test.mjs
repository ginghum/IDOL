import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{IDOL as server}from'../room-server/idol-engine.mjs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
for(const G of[browser,server])for(const seat of[0,1])for(const n of[1,2,3])for(const skip of[false,true]){
 const own=['emi','kayo','hana'],enemy=['rai','hakka','homura'],s=G.create(seat?enemy:own,seat?'rai':'kayo',seat?own:enemy,seat?'kayo':'rai',seat,123),p=s.players[seat];
 const c=[...p.hand,...p.deck].find(c=>c.owner==='emi'&&c.n===n);p.deck=p.deck.filter(x=>x.uid!==c.uid);p.hand=p.hand.filter(x=>x.uid!==c.uid);p.hand.push(c);p.vol=100;for(const f of[...s.row,...s.audience])f.type='light';s.row[0].type='heavy';s.row[1].lock=1-seat;const removed=s.row[0],locked=s.row[1],refill=s.audience[0];
 assert.match(G.detail(c).fanText,/ファン獲得前/);
 G.dispatch(s,{type:'play',card:c.uid,actors:Array.from({length:n},(_,j)=>j),mode:'fan'});assert.equal(s.pending.kind,'emiBottom');assert.equal(p.fans.length,0);assert(s.pending.options.includes(removed.uid));assert(!s.pending.options.includes(locked.uid));assert.equal(p.vol,100);
 const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,{type:'choose',value:locked.uid},seat));assert.equal(JSON.stringify(s),before);
 G.dispatch(s,{type:'choose',value:skip?'skip':removed.uid});assert.equal(s.pending,null);assert.equal(p.fans.length,n);assert.equal(p.vol,skip?90:100);assert.equal(p.fans.some(f=>f.uid===removed.uid),skip);if(!skip)assert.equal(s.audience.at(-1).uid,removed.uid);assert([...s.row,...p.fans].some(f=>f.uid===refill.uid));
 assert(s.row.some(f=>f.uid===locked.uid));assert(p.memory.some(x=>x.uid===c.uid));
}
console.log('Emi FAN filter: both engines/seats, all three songs, pre-acquisition choice/refill, optional skip, opponent lock/atomic rejection and heavy-VOL effect avoidance passed');
