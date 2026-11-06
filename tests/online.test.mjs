import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const G=new Function(code.split('const $=s=>')[0]+';return IDOL;')();
assert.throws(()=>G.create(['__proto__','kayo','machi'],'kayo',['rai','shio','hana'],'rai',0,1));assert.throws(()=>G.create(['kayo','machi','natsume'],'kayo',['rai','shio','hana'],'rai',0,1,['__proto__','wit','redo']));
const make=()=>G.create(['kayo','machi','natsume'],'kayo',['rai','shio','hana'],'rai',0,333,['rai','wit','redo'],['kayo','switch','wit']);
{
 const s=make(),p=s.players[0],before=p.hand.length;p.buff=3;p.eventBuff=2;p.temp=7;G.timeout(s);assert.equal(s.turn,2);assert.equal(s.active,1);assert.equal(p.hand.length,before);assert.equal(p.buff,0);assert.equal(p.eventBuff,0);assert.equal(p.temp,0);assert(s.log.some(t=>t.includes('99秒')));
}
{
 const s=make();s.players[0].leader='shio';s.queue=[{kind:'chip',p:0},{kind:'chip',p:0}];s.pending={kind:'shio',p:0,options:['chip','vol'],text:'選択'};G.timeout(s);assert.equal(s.turn,2);assert.equal(s.players[0].chips,3);assert.equal(s.pending,null);
}
{
 const s=make();s.players[0].fans.push(...s.audience.splice(0,25));G.timeout(s);assert.equal(s.winner,0);assert.equal(s.turn,1,'Resolved victory does not start another turn');
}
{
 const s=make();const canonical=JSON.stringify(s);assert.throws(()=>G.peerAction(s,{type:'end'},1));assert.throws(()=>G.peerAction(s,{type:'timeout'},0));assert.throws(()=>G.peerAction(s,{type:'service',actor:'__proto__'},0));assert.throws(()=>G.peerAction(s,{type:'play',card:s.players[0].hand[0].uid,mode:'vol',actors:[4]},0));assert.equal(JSON.stringify(s),canonical,'Invalid commands cannot partly mutate authority');
 const next=G.peerAction(s,{type:'end'},0);assert.equal(next.active,1);assert.equal(s.active,0);
}
{
 const s=make();s.row[0].lock=0;const v=G.publicView(s,1);assert.equal(v.active,1);assert.equal(v.players[0].leader,'rai');assert.equal(v.row[0].lock,1);assert(!('seed'in v));assert(!('serial'in v));assert.deepEqual(v.queue,[]);assert(v.players[1].hand.every(c=>!('owner'in c)));assert(v.players.every(p=>p.deck.every(c=>!('owner'in c))));assert(v.players[1].events.every(e=>e.id===null));assert(v.audience.every(f=>f.type===null));assert.deepEqual(v.players[0].hand,s.players[1].hand);
 s.pending={kind:'raiPick',p:1,options:s.audience.slice(0,2).map(f=>f.uid),text:'選択'};const peek=G.publicView(s,1);assert(peek.audience.slice(0,2).every(f=>f.type));assert(peek.audience.slice(2).every(f=>f.type===null));assert.deepEqual(G.publicView(s,0).pending.options,[],'Opponent does not receive private options');
 const kayo=G.publicView(s,0);assert(kayo.audience[0].type);assert.equal(kayo.audience[1].type,null);
}
// Exercise authoritative revision and real deadline boundaries through the UI adapter.
const nodes=new Map(),document={querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(){}};
new Function('document','localStorage','setTimeout','clearTimeout','assert',code+`
const realNow=Date.now;Date.now=()=>1000;
try{
state=IDOL.create(['kayo','machi','natsume'],'kayo',['rai','shio','hana'],'rai',0,9);screen='match';modal=null;
net={role:'host',connected:true,phase:'playing',waiting:false,rev:2,clockTurn:1,deadline:100000,link:{send(){}}};
applyOnlineAction({type:'service',actor:0},0,2);assert.equal(net.rev,3);assert.equal(net.deadline,100000,'Actions do not reset the 99 seconds');assert.equal(state.players[0].service,1);
assert.throws(()=>applyOnlineAction({type:'end'},0,2),/更新/,'Reject repeated / old revisions');
Date.now=()=>100000;const count=state.players[0].memory.length;assert.throws(()=>applyOnlineAction({type:'service',actor:1},0,3),/99秒/);assert.equal(state.turn,2);assert.equal(state.active,1);assert.equal(state.players[0].service,1,'Late action is not committed');assert.equal(state.players[0].memory.length,count);assert.equal(net.deadline,199000);
}finally{Date.now=realNow;net=null;}
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert);
vm.runInThisContext(readFileSync(new URL('../online.js',import.meta.url),'utf8'));
const packet={v:1,type:'offer',session:'a'.repeat(32),token:'b'.repeat(64),expires:Date.now()+600000,sdp:'v=0\r\na=fingerprint:sha-256 AA:BB\r\n'};
const invitation=await IDOLLink.encode(packet);assert.deepEqual(await IDOLLink.decode(invitation),packet);assert.deepEqual(await IDOLLink.decode(' \n'+invitation+'\n'),packet);await assert.rejects(()=>IDOLLink.decode(invitation.slice(0,-1)+(invitation.endsWith('0')?'1':'0')));await assert.rejects(()=>IDOLLink.decode('bad'));const expired=await IDOLLink.encode({...packet,expires:Date.now()-1});await assert.rejects(()=>IDOLLink.decode(expired));
console.log('Online: privacy, role checks, atomic validation, timeout effects, deadline/revision boundaries and connection codes verified');
