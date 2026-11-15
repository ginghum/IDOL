import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{IDOL as server}from'../room-server/idol-engine.mjs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
for(const G of [server,browser]){
 const make=(seat=0)=>{const a=['miyabi','kono','chie'],b=['fukurou','misa','kayo'];let s=seat?G.create(b,'kayo',a,'miyabi',1,931):G.create(a,'miyabi',b,'kayo',0,931);for(const f of[...s.row,...s.audience])f.type='light';return s;};
 const give=(s,seat,n)=>{const p=s.players[seat];for(const z of['hand','deck']){const at=p[z].findIndex(c=>c.owner==='miyabi'&&c.n===n);if(at>=0){const c=p[z].splice(at,1)[0];p.hand.push(c);return c;}}throw Error('missing card');};
 for(const seat of[0,1])for(const n of[1,2,3])for(const mode of['vol','fan'])for(const chips of[0,1,2,3])for(const selected of[false,true])for(const guard of[false,true]){
 const s=make(seat),p=s.players[seat],q=s.players[1-seat],c=give(s,seat,n);p.vol=100;p.chips=chips;p.supportSealTurn=s.turn;p.moeFreeSupport=3;q.vol=45;q.volGuard=guard;const action={type:'play',card:c.uid,actors:G.actors(p,c),mode,debuff:selected},before=JSON.stringify(s),eligible=n===3||n===2&&mode==='fan';
 if(selected&&(!eligible||chips<2)){assert.throws(()=>G.peerAction(s,action,seat));assert.equal(JSON.stringify(s),before);continue;}
 const t=G.peerAction(s,action,seat);assert.equal(JSON.stringify(s),before);assert.equal(t.players[seat].chips,chips-(selected?2:0));assert.equal(t.players[1-seat].vol,selected&&!guard?25:45);assert.equal(t.players[seat].vol,100+(mode==='vol'?10*n:0));assert.equal(t.players[seat].fans.length,mode==='fan'?n:0);assert.equal(t.pending,null);assert.equal(t.players[seat].moeFreeSupport,3);assert.equal(G.detail(c).volText.includes('－20'),n===3);assert.equal(G.detail(c).fanText.includes('－20'),n>1);}
 for(const seat of[0,1]){
 let s=make(seat),p=s.players[seat],c=give(s,seat,3);p.vol=0;p.chips=2;s.players[1-seat].vol=10;s=G.peerAction(s,{type:'play',card:c.uid,actors:[0,1,2],mode:'vol',debuff:true},seat);assert.equal(s.players[seat].vol,30);assert.equal(s.players[1-seat].vol,0);assert.equal(s.players[seat].chips,0);assert.equal(s.pending,null);
 s=make(seat);p=s.players[seat];c=give(s,seat,3);p.chips=2;const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,{type:'play',card:c.uid,actors:[0,1,2],mode:'vol',debuff:'yes'},seat));assert.equal(JSON.stringify(s),before);
 const team=['chie','misa','fukurou'];for(const lead of team){const t=G.create(team,lead,['kono','miyabi','kayo'],'kono',0,34);assert.equal(t.players[0].hand.length,lead==='chie'?6:4);assert.equal(t.players[0].deck.length,lead==='chie'?21:23);assert.equal(t.players[1].vol,30);assert.equal(G.cashCount(t.players[1]),2);}
 }
 // Old in-flight optional confirmations can still finish after the server update.
 {const s=make(),p=s.players[0];p.chips=2;s.pending={kind:'miyabiDebuff',p:0,options:['skip','use']};const v=s.players[1].vol;G.dispatch(s,{type:'choose',value:'use'});assert.equal(p.chips,0);assert.equal(s.players[1].vol,Math.max(0,v-20));}
 for(let seed=0;seed<100;seed++){const a=['miyabi','kono','chie'],b=['fukurou','misa','moe'];let s=G.create(a,a[seed%3],b,b[seed%3],seed%2,seed+203,a,b),steps=0;while(s.winner===null&&steps++<1800)s=G.peerAction(s,G.ai(s),s.pending?.p??s.active);assert.notEqual(s.winner,null);}
}
const nodes=new Map(),listeners={},document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,f){listeners[k]=f;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert','listeners',code+String.raw`
const click=(action,id)=>listeners.click({target:{closest:()=>({dataset:{action,id},disabled:false})}});let captured;send=a=>{captured=IDOL.validateAction(a)};
for(const n of[1,2,3])for(const mode of['vol','fan']){
state=IDOL.create(['miyabi','kono','chie'],'miyabi',['fukurou','misa','kayo'],'kayo',0,199);screen='match';const p=state.players[0];p.vol=100;p.chips=2;const c=[...p.hand,...p.deck].find(c=>c.owner==='miyabi'&&c.n===n);p.deck=p.deck.filter(x=>x.uid!==c.uid);p.hand=p.hand.filter(x=>x.uid!==c.uid);p.hand.push(c);click('song',c.uid);assert.equal(selection.debuff,false);assert.equal(songDock().includes('data-field="debuff"'),n>1);
if(n>1){listeners.change({target:{dataset:{field:'debuff'},checked:true}});assert.equal(selection.debuff,true);assert(songDock().includes('checked'));}
click('play-'+mode);assert.equal(!!captured.debuff,n===3||n===2&&mode==='fan');assert.equal(captured.mode,mode);assert.equal(captured.card,c.uid);
}
state=IDOL.create(['miyabi','kono','chie'],'miyabi',['kayo','hana','hakka'],'kayo',0,39);screen='match';let p=state.players[0],c=[...p.hand,...p.deck].find(c=>c.owner==='miyabi'&&c.n===3);p.deck=p.deck.filter(x=>x.uid!==c.uid);p.hand.push(c);p.chips=1;click('song',c.uid);assert.match(miyabiOptionHTML(c,p),/disabled/);selection.debuff=true;assert(!miyabiOptionHTML(c,p).includes('disabled'),'Can uncheck if resources changed');listeners.change({target:{dataset:{field:'debuff'},checked:false}});assert.equal(selection.debuff,false);
assert(!RULE_CHARACTER_NOTES.moe.join('').includes('他メンバーごとの必要メモリー'));
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert,listeners);
console.log('Miyabi checkbox: both engines/seats/modes, optional exact payment, no post-dialog, guard/floor/atomicity, in-flight compatibility, initial values, actual UI flag forwarding and 200 CPU games passed');
