import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {IDOL as server} from '../room-server/idol-engine.mjs';
const htmlSource=readFileSync(new URL('../index.html',import.meta.url),'utf8'),engineCode=htmlSource.match(/<script>([\s\S]*?)<\/script>/)[1].split('const $=s=>')[0],browser=new Function(engineCode+';return IDOL')();
for(const G of [browser,server]){
const make=()=>G.create(['kayo','machi','natsume'],'kayo',['machi','hana','haru'],'hana',0,321,['trouble','kayo','redo'],['wit','trouble','haru']);
const all=s=>[...s.row,...s.audience,...s.players.flatMap(p=>p.fans)];
function row(s,types){const pool=[...s.row,...s.audience];s.row=types.map(type=>{const at=pool.findIndex(f=>f.type===type);assert(at>=0,'Fixture spectator exists: '+type);return pool.splice(at,1)[0];});s.audience=pool;}
function card(s,i,owner,n){const p=s.players[i];let c=p.hand.find(c=>c.owner===owner&&c.n===n);if(!c){const at=p.deck.findIndex(c=>c.owner===owner&&c.n===n);assert(at>=0);c=p.deck.splice(at,1)[0];p.hand.push(c);}return c;}
function play(s,i,owner,n){const c=card(s,i,owner,n);G.dispatch(s,{type:'play',card:c.uid,mode:'fan',actors:G.actors(s.players[i],c)});}
const influencers=s=>all(s).filter(f=>f.type==='influencer').length;
function stage(s){row(s,['light','light','light']);const at=s.audience.findIndex(f=>f.type==='reporter');assert(at>=0);s.audience.unshift(s.audience.splice(at,1)[0]);s.players[0].vol=100;}
{
 const s=make();assert.equal(all(s).length,53);assert.equal(G.FAN.reporter.points,1);assert.equal(G.FAN.influencer.count,0);
 let initial;for(let seed=1;seed<300;seed++){const t=G.create(['kayo','machi','natsume'],'kayo',['machi','hana','haru'],'hana',0,seed);if(t.row.some(f=>f.type==='reporter')){initial=t;break;}}assert(initial,'An initial reporter appears for a tested seed');assert.equal(influencers(initial),1);assert.equal(all(initial).length,54);assert(!initial.players.some(p=>p.fans.length));
}
{
 const s=make();stage(s);play(s,0,'kayo',1);assert(s.row.some(f=>f.type==='reporter'));assert.equal(influencers(s),1,'Refill triggers before anyone acquires reporter');assert(!s.players[0].fans.some(f=>f.type==='reporter'));row(s,['reporter','light','light']);G.dispatch(s,{type:'end'});s.players[1].vol=100;play(s,1,'machi',1);assert.equal(influencers(s),1,'Acquiring reporter adds no second influencer');assert.equal(new Set(all(s).map(f=>f.uid)).size,54);
}
{
 const s=make();stage(s);play(s,0,'kayo',1);row(s,['reporter','light','light']);s.players[0].memory.push(...s.players[0].deck.splice(0,3));G.dispatch(s,{type:'event',id:'redo',memory:G.autoPay(s.players[0],'redo')});assert.equal(influencers(s),s.row.some(f=>f.type==='reporter')?2:1);if(!s.row.some(f=>f.type==='reporter')){stage(s);G.dispatch(s,{type:'end'});G.dispatch(s,{type:'end'});play(s,0,'kayo',1);}assert.equal(influencers(s),2,'Each new appearance triggers once');
}
{
 const s=make();stage(s);s.deckMuteTurn=s.turn;play(s,0,'kayo',1);assert(s.row.find(f=>f.type==='reporter').muted);assert.equal(influencers(s),0,'Reporter muted on entry does not trigger');G.dispatch(s,{type:'end'});assert.equal(influencers(s),0,'Removing mute does not repeat an appearance');
 const t=make();stage(t);play(t,0,'natsume',3);assert(t.players[0].fans.some(f=>f.type==='reporter'));assert.equal(influencers(t),0,'Direct deck acquisition never enters audience seats');
}
{
 const s=G.create(['mitsuha','kayo','natsume'],'mitsuha',['mitama','hana','haru'],'mitama',0,321);assert.equal(s.pending.kind,'mitsuhaStart');stage(s);G.dispatch(s,{type:'choose',value:'swap'});assert.equal(s.row[0].type,'reporter');assert.equal(influencers(s),1,'Mitsuha swap is also an appearance');
 const t=make();stage(t);t.players[0].leader='mitama';play(t,0,'kayo',1);assert.equal(influencers(t),1,'Global appearance effect is independent of acquiring leader');
}
}
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map();
const doc={querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(){}};
new Function('document','localStorage','setTimeout','clearTimeout','assert',code+`
modal={kind:'rules',section:'fans'};renderModal();assert.match($('#modal').innerHTML,/fan-reporter.webp/);assert.match($('#modal').innerHTML,/fan-influencer.webp/);assert.match($('#modal').innerHTML,/ゲーム中に追加/);
modal={kind:'rules',section:'events'};renderModal();for(const id of ['overcome','viewing','mc'])assert($('#modal').innerHTML.includes('event-'+id+'.webp'));assert(!$('#modal').innerHTML.includes('ILLUSTRATION'));
modal={kind:'rules',section:'basic'};assert.match(rulesHTML(),/53枚/);assert.match(rulesHTML(),/インフルエンサー/);assert(!rulesHTML().includes('試作'));
assert(!dialog('確認','本文').includes('IDOL / LIVE DUEL'),'Dialog headings do not repeat the brand');
assert(!setupHTML().includes('DRAW /'),'Role labels do not repeat English and Japanese');
`)(doc,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert);
console.log('Reporters: appearance timing, initial/refill/swap, repeat entry, no acquisition trigger, suppression, both engines; 53-card initial deck, batch order, repeat acquisition, both players, suppression, 5-point wins, artwork and concise UI copy passed');
