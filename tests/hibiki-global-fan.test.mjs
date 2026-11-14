import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{IDOL as server}from'../room-server/idol-engine.mjs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
for(const G of[browser,server])for(const seat of[0,1]){
 function make(other='kayo',events=['hibiki','kayo','switch']){const own=['hibiki',other,other==='shiro'?'kayo':'shiro'],enemy=['rai','hana','hakka'],s=G.create(seat?enemy:own,seat?'rai':'hibiki',seat?own:enemy,seat?'hibiki':'rai',seat,123,seat?enemy:events,seat?events:enemy);for(const f of[...s.row,...s.audience])f.type='light';return s;}
 const pof=s=>s.players[seat];
 function give(s,owner,n){const p=pof(s);for(const z of['hand','deck']){const at=p[z].findIndex(c=>c.owner===owner&&c.n===n);if(at>=0){const c=p[z].splice(at,1)[0];p.hand.push(c);return c;}}throw Error('missing song');}
 function pay(s,id){const p=pof(s),d=G.EVENTS[id];while(p.memory.filter(c=>c.owner===id).length<d.cost[0]){const c=[...p.hand,...p.deck].find(c=>c.owner===id);p.hand=p.hand.filter(x=>x!==c);p.deck=p.deck.filter(x=>x!==c);p.memory.push(c);}while(p.memory.length<d.cost[1])p.memory.push(p.deck.shift()||p.hand.shift());return G.autoPay(p,id);}
 function play(s,c,extra={}){pof(s).vol=100;return G.dispatch(s,{type:'play',card:c.uid,actors:G.actors(pof(s),c),mode:'fan',...extra});}
 for(const n of[0,1,2,3])assert.equal(G.acquisitionCount({leader:'hibiki'},n),Math.max(0,n-1));
 for(const n of[1,2,3]){const s=make(),p=pof(s),c=give(s,'hibiki',n);assert.equal(G.fanCount(p,c),n-1);play(s,c);assert.equal(p.fans.length,n-1);assert.equal(s.pending,null);}
 // Apply all bonuses before the reduction, then subtract exactly once.
 {const s=make('natsume'),p=pof(s),c=give(s,'natsume',1);p.buff=2;p.eventBuff=1;p.cardBuff=1;play(s,c,{boost:true});assert.equal(p.fans.length,5);assert.equal(p.vol,90);assert.equal(p.buff,0);}
 // Lack of supply must not cause a second subtraction.
 {const s=make(),p=pof(s),c=give(s,'hibiki',3);s.row=s.row.slice(0,1);s.audience=[];play(s,c);assert.equal(p.fans.length,1);}
 // Zero acquisitions do not resolve audience effects or trigger Fukurou's seal.
 {const s=make(),p=pof(s),c=give(s,'hibiki',1);s.players[1-seat].leader='fukurou';s.row[0].type='heavy';const row=s.row.map(f=>f.uid);play(s,c);assert.equal(p.vol,100);assert.equal(p.fans.length,0);assert(!G.supportSealed(s,seat));assert.deepEqual(s.row.map(f=>f.uid),row);}
 for(const count of[1,3]){const s=make(),p=pof(s),memory=pay(s,'kayo');p.vol=100;while(p.hand.length<count)p.hand.push(p.deck.shift());const discard=p.hand.slice(0,count).map(c=>c.uid);assert.equal(discard.length,count);G.dispatch(s,{type:'event',id:'kayo',memory,discard});assert.equal(p.fans.length,count-1);}
 for(const n of[1,2,3]){const s=make('rai'),p=pof(s),c=give(s,'rai',n);p.chips=2;play(s,c,{pick:true});if(n===3){assert.equal(s.pending.count,1);assert.equal(s.pending.options.length,5);G.dispatch(s,{type:'choose',value:s.pending.options[0]});assert.equal(p.fans.length,1);}else{assert.equal(s.pending,null);assert.equal(p.fans.length,0);}}
 for(const item of['drinkRed','drinkPurple']){const s=make(),p=pof(s);p.vol=100;p.items=[{uid:'drink',item}];G.dispatch(s,{type:'end'});assert.equal(s.pending.kind,'endDrinks');G.dispatch(s,{type:'choose',value:'drink'});assert.equal(p.fans.length,0);assert.equal(p.vol,item==='drinkPurple'?110:100);}
 // Each single acquisition is reduced, rather than once for an entire multi-step event.
 {const s=make('aya',['hibiki','aya','switch']),p=pof(s),memory=pay(s,'aya');p.discard.push({uid:'one-song',owner:'aya',n:1});G.dispatch(s,{type:'event',id:'aya',memory});assert.equal(p.fans.length,0);}
 // Direct batch acquisition paths also share the penalty.
 {const s=make('haru',['hibiki','haru','switch']),p=pof(s),memory=pay(s,'haru');for(const f of s.row)f.type='dream';G.dispatch(s,{type:'event',id:'haru',memory});assert.equal(p.fans.length,2);assert.equal(s.row.filter(f=>f.type==='dream').length,1);}
 {const s=make('mimizuku',['hibiki','mimizuku','switch']),p=pof(s),memory=pay(s,'mimizuku');G.dispatch(s,{type:'event',id:'mimizuku',memory});G.dispatch(s,{type:'choose',value:'confirm'});assert.equal(p.fans.length,4);}
 // Switching away immediately removes the penalty; fan chips are not audience acquisitions.
 {const s=make(),p=pof(s);p.liveViewing=true;G.dispatch(s,{type:'service',actor:0});assert.equal(p.fanChips,1);const memory=pay(s,'switch');G.dispatch(s,{type:'event',id:'switch',memory,leader:'kayo'});assert.equal(G.acquisitionCount(p,1),1);assert.equal(G.maxVoltage(p),200);}
 // MAXIMUM: exact 4-of-6 cost, temporary points, unchanged VOL and low-VOL branch.
 for(const vol of[299,300])for(const base of[4,5]){const s=make(),p=pof(s),memory=pay(s,'hibiki');p.vol=vol;p.fanChips=base;G.dispatch(s,{type:'event',id:'hibiki',memory});assert.equal(p.fanChips,base);assert.equal(p.temp,vol>=300?15:0);assert.equal(p.chips,vol<300?10:0);assert.equal(p.vol,vol);assert.equal(s.winner,vol>=300&&base===5?seat:null);if(s.winner===null){G.dispatch(s,{type:'end'});assert.equal(p.temp,0);assert.equal(p.fanChips,base);}}
 // CPU saves the temporary finisher until it wins, and never chooses a zero-FAN fallback.
 {const s=make(),p=pof(s);pay(s,'hibiki');p.vol=300;p.fanChips=4;p.events=p.events.filter(e=>e.id==='hibiki');give(s,'hibiki',2);const a=G.ai(s);assert(!(a.type==='event'&&a.id==='hibiki'));p.fanChips=5;const b=G.ai(s);assert.equal(b.type,'event');assert.equal(b.id,'hibiki');G.dispatch(s,b);assert.equal(s.winner,seat);}
}
console.log('Hibiki global penalty: both engines/seats, songs/bonuses/zero/supply, events/all-batches/repeated singles, selection counts, drinks, leader switches, chip distinction, 4-of-6 costs, temporary MAXIMUM expiry/win and CPU timing passed');
