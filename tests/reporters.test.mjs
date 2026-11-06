import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {IDOL as G} from '../room-server/idol-engine.mjs';
const make=()=>G.create(['kayo','machi','natsume'],'kayo',['machi','hana','haru'],'hana',0,321,['trouble','kayo','redo'],['wit','trouble','haru']);
const all=s=>[...s.row,...s.audience,...s.players.flatMap(p=>p.fans)];
function row(s,types){const pool=[...s.row,...s.audience];s.row=types.map(type=>{const at=pool.findIndex(f=>f.type===type);assert(at>=0,'Fixture spectator exists: '+type);return pool.splice(at,1)[0];});s.audience=pool;}
function card(s,i,owner,n){const p=s.players[i];let c=p.hand.find(c=>c.owner===owner&&c.n===n);if(!c){const at=p.deck.findIndex(c=>c.owner===owner&&c.n===n);assert(at>=0);c=p.deck.splice(at,1)[0];p.hand.push(c);}return c;}
function play(s,i,owner,n){const c=card(s,i,owner,n);G.dispatch(s,{type:'play',card:c.uid,mode:'fan',actors:G.actors(s.players[i],c)});}
{
 const s=make();assert.equal(all(s).length,53);assert.equal(s.audience.length,50);assert.equal(all(s).filter(f=>f.type==='reporter').length,1);assert(!all(s).some(f=>f.type==='influencer'||f.type==='dream'));assert.equal(G.FAN.reporter.points,1);assert.equal(G.FAN.influencer.points,5);assert.equal(G.FAN.influencer.count,0);
}
{
 const s=make(),p=s.players[0];p.vol=100;row(s,['reporter','light','light']);const reporter=s.row[0].uid,originalFourth=s.audience.find(f=>f.type==='core');s.audience=s.audience.filter(f=>f.uid!==originalFourth.uid);s.audience.unshift(originalFourth);
 play(s,0,'natsume',3);assert.equal(p.fans.length,4);assert(p.fans.some(f=>f.uid===reporter));assert(p.fans.some(f=>f.uid===originalFourth.uid),'The fourth card comes from the pre-existing deck');assert(!p.fans.some(f=>f.type==='influencer'),'Generated spectator cannot enter the same acquisition batch');
 assert.equal(all(s).length,54);assert.equal(all(s).filter(f=>f.type==='influencer').length,1);assert.equal(s.row.length,3);assert.equal(new Set(all(s).map(f=>f.uid)).size,54);
}
{
 const s=make(),p=s.players[0];p.vol=100;row(s,['reporter','light','light']);const id=s.row[0].uid;play(s,0,'kayo',1);assert.equal(all(s).filter(f=>f.type==='influencer').length,1);
 p.memory.push(...p.deck.splice(0,3));G.dispatch(s,{type:'event',id:'trouble',memory:G.autoPay(p,'trouble')});assert(!p.fans.length);assert(s.audience.some(f=>f.uid===id));assert.equal(all(s).filter(f=>f.type==='influencer').length,1,'Returning the reporter is not another acquisition');
 row(s,['reporter','light','light']);G.dispatch(s,{type:'end'});s.players[1].vol=100;play(s,1,'machi',1);assert(s.players[1].fans.some(f=>f.uid===id));assert.equal(all(s).filter(f=>f.type==='influencer').length,2,'Either player reacquiring the same reporter creates a new influencer');assert.equal(new Set(all(s).map(f=>f.uid)).size,55);
}
{
 const s=make();s.players[0].vol=100;row(s,['trouble','reporter','light']);const reporter=s.row[1].uid;play(s,0,'kayo',3);assert.equal(s.pending.kind,'trouble');G.dispatch(s,{type:'choose',value:reporter});assert(!s.players[0].fans.some(f=>f.uid===reporter));assert.equal(all(s).filter(f=>f.type==='influencer').length,1,'A returned reporter still resolves its acquired effect');
}
{
 const s=make();s.players[0].vol=100;row(s,['reporter','light','light']);s.row[0].muted=true;play(s,0,'kayo',1);assert.equal(G.score(s.players[0]),1);assert.equal(all(s).filter(f=>f.type==='influencer').length,0,'Muted reporters do not spawn cards');
 const t=make();t.players[0].vol=100;row(t,['light','light','light']);const at=t.audience.findIndex(f=>f.type==='reporter');t.audience.unshift(t.audience.splice(at,1)[0]);t.deckMuteTurn=t.turn;play(t,0,'natsume',3);assert.equal(all(t).filter(f=>f.type==='influencer').length,0,'Deck-only muting applies when reporter is acquired directly from the deck');
 const u=make();u.players[0].vol=100;row(u,['reporter','light','light']);u.deckMuteTurn=u.turn;play(u,0,'kayo',1);const added=all(u).find(f=>f.type==='influencer');assert(added,'Reporter already in audience seats keeps its effect');assert(added.muted);assert.equal(G.fanPoints(u.players[0],added),5,'Losing effects never removes printed points');
}
{
 const s=make(),p=s.players[0];p.vol=100;row(s,['reporter','light','light']);play(s,0,'kayo',1);row(s,['influencer','light','light']);G.dispatch(s,{type:'end'});G.dispatch(s,{type:'end'});p.fanChips=14;play(s,0,'kayo',1);assert.equal(G.score(p),20);assert.equal(s.winner,0);const guest=G.publicView(s,1);assert.equal(guest.winner,1);assert(guest.players[1].fans.some(f=>f.type==='influencer'));
}
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map();
const doc={querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(){}};
new Function('document','localStorage','setTimeout','clearTimeout','assert',code+`
modal={kind:'fan-catalog'};renderModal();assert.match($('#modal').innerHTML,/fan-reporter.webp/);assert.match($('#modal').innerHTML,/fan-influencer.webp/);assert.match($('#modal').innerHTML,/ゲーム中に追加/);
modal={kind:'common-catalog'};renderModal();for(const id of ['overcome','viewing','mc'])assert($('#modal').innerHTML.includes('event-'+id+'.webp'));assert(!$('#modal').innerHTML.includes('ILLUSTRATION'));
assert.match(rulesHTML(),/53枚/);assert.match(rulesHTML(),/インフルエンサー/);assert(!rulesHTML().includes('試作'));
assert(!dialog('確認','本文').includes('IDOL / LIVE DUEL'),'Dialog headings do not repeat the brand');
assert(!setupHTML().includes('DRAW /'),'Role labels do not repeat English and Japanese');
`)(doc,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert);
console.log('Reporters: 53-card initial deck, batch order, repeat acquisition, both players, suppression, 5-point wins, artwork and concise UI copy passed');
