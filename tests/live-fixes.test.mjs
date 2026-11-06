import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const G=new Function(code.split('const $=s=>')[0]+';return IDOL;')();
const make=()=>G.create(['kayo','machi','hana'],'kayo',['natsume','rai','shio'],'natsume',0,6);
{
 const s=make(),p=s.players[0],pool=[...p.deck,...p.hand];p.memory=[...pool.filter(c=>c.owner==='kayo').slice(0,3),...pool.filter(c=>c.owner!=='kayo').slice(0,3)];const used=new Set(p.memory.map(c=>c.uid));p.hand=pool.filter(c=>!used.has(c.uid));p.deck=[];const payment=G.autoPay(p,'kayo'),before=JSON.stringify(s);
 for(const count of [0,4])assert.throws(()=>G.peerAction(s,{type:'event',id:'kayo',memory:payment,discard:p.hand.slice(0,count).map(c=>c.uid)},0));assert.equal(JSON.stringify(s),before);
 p.buff=4;p.cardBuff=2;s.row=[{uid:'l1',type:'light',lock:null},{uid:'l2',type:'light',lock:null},{uid:'l3',type:'light',lock:null}];G.dispatch(s,{type:'event',id:'kayo',memory:payment,discard:p.hand.slice(0,3).map(c=>c.uid)});assert.equal(p.fans.length,3,'All acquisition bonuses capped at three');assert.equal(p.buff,0);
}
{
 const s=make(),p=s.players[0],c=p.hand[0],actors=G.actors(p,c);p.vol=0;assert(!G.playOK(s,0,c,actors,'fan'));assert(G.playOK(s,0,c,actors,'vol'));p.vol=200;assert(G.playOK(s,0,c,actors,'fan'));p.ready[actors[0]]=false;assert(!G.playOK(s,0,c,actors,'fan'));assert(!G.playOK(s,0,c,[0,0],'fan'));assert(!G.playOK(s,0,c,[-1],'fan'));
}
const nodes=new Map(),document={querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(){}};
new Function('document','localStorage','setTimeout','clearTimeout','assert',code+`
state=IDOL.create(['kayo','machi','hana'],'kayo',['rai','shio','natsume'],'rai',0,9);screen='match';modal=null;net=null;state.clock={turn:state.turn,deadline:1};const beforeTurn=state.turn;clockTick();assert.equal(state.turn,beforeTurn);assert.equal(clockDeadline(),0);assert.equal(clockHTML(),'');armCpuClock();assert.equal(state.clock,undefined);assert.equal(state.turn,beforeTurn);
send({type:'service',actor:0});assert.equal(state.players[0].service,1,'Solo can act after old saved deadline');
const p=state.players[0],c=p.hand.find(c=>c.owner==='kayo')||p.hand[0];p.vol=0;modal={kind:'song',id:c.uid};selection={actors:IDOL.actors(p,c)||[],boost:false,pick:false};assert.match(songDock(),/data-action="play-fan" disabled/);p.vol=200;selection.actors=[0,0,0];assert.match(songDock(),/data-action="play-fan" disabled/);
assert(html===undefined||true);
` .replace('assert(html===undefined||true);',''))(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert);
console.log('Live fixes: solo clock removal, saved deadlines, FAN legality, atomic validation and Kayo cap passed');
