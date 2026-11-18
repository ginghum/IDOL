import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map(),listeners={};
const document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,f){listeners[k]=f;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert','exists','listeners',code+String.raw`
for(const id of ['riri','chitose','kokone']){rosterFilter='series-extra';rosterQuery=CHAR[id].reading;assert.deepEqual(rosterIDs(),[id]);assert.equal(cardSeries('character',id),'extra');assert.equal(cardSeries('event',id),'extra');for(const key of ['idol-'+id,'event-'+id,...[1,2,3].map(n=>'song-'+id+'-'+n)])assert(exists(ARTWORK[key]),key);modal={kind:'rules',section:'characters',character:id};renderModal();assert($('#modal').innerHTML.includes(CHAR[id].name));assert(RULE_CHARACTER_NOTES[id].length);}
assert.deepEqual(IDOL_GROUPS.find(g=>g.id==='red-sprite').members,['rai','riri','chitose','kokone']);
state=IDOL.create(['riri','chitose','kokone'],'kokone',['kayo','hana','machi'],'kayo',0,123);screen='match';modal=null;
const p=state.players[0],c=p.hand.find(c=>c.n>=2)||p.deck.find(c=>c.n>=2);p.deck=p.deck.filter(x=>x.uid!==c.uid);if(!p.hand.includes(c))p.hand.push(c);
IDOL.dispatch(state,{type:'end'});render();assert.match($('#modal').innerHTML,/リハーサル/);assert.match($('#modal').innerHTML,/data-action="choose" data-id="/);assert(!humanTurn());
const click=(action,id)=>listeners.click({target:{closest:()=>({dataset:{action,id},disabled:false})}});
click('choose',c.uid);assert.equal(state.players[0].rehearsal.uid,c.uid);assert.equal(state.active,1);assert.match(tableStacks(state.players[0],0),/data-zone="rehearsal"/);assert(!tableStacks(state.players[0],0).includes('rehearsal-pile'));modal={kind:'zones',p:0};renderModal();assert.match($('#modal').innerHTML,/リハーサル 1枚/);modal={kind:'zones',p:1};renderModal();assert.match($('#modal').innerHTML,/リハーサル 0枚/);modal=null;
state.row[0].plusOne=2;assert.match(tableFan(state.row[0],0),/＋1チップ ×2/);assert.match(tableFan(state.row[0],0),new RegExp('>'+IDOL.fanPoints(state.players[0],state.row[0])+'<small>PT'));
// Both optional and mandatory choices render working controls rather than an empty generic fan picker.
state.active=0;state.pending={kind:'kokoneUse',p:0,options:['skip','0','0,1'],text:'リハーサル'};renderModal();assert.match($('#modal').innerHTML,/data-id="0,1"/);assert.match($('#modal').innerHTML,/使用せずリハーサルに残す/);assert(!$('#modal').innerHTML.includes('data-id="NaN"'));assert(guideBasicHTML().includes(REHEARSAL_RULE));
state.pending={kind:'kokoneExtra',p:0,options:['skip','use'],text:'追加効果',optionText:'追加で声援1枚'};renderModal();assert.match($('#modal').innerHTML,/追加で声援1枚/);assert.match($('#modal').innerHTML,/data-id="use"/);
state.pending={kind:'ririPass',p:0,options:['skip','pass'],text:'梨里',cards:[state.row[0]]};renderModal();assert.match($('#modal').innerHTML,/data-id="pass"/);
state.pending=null;delete state.ending;modal={kind:'event',id:'chitose'};selection={memory:[],discard:[],targets:[],target:null,actor:null};renderModal();const markup=$('#modal').innerHTML;assert.match(markup,/data-action="event-target" data-id="hana"/);assert(!markup.includes('data-action="event-target" data-id="kayo"'));
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert,p=>existsSync(new URL('../'+p,import.meta.url)),listeners);
console.log('RedSprite UI: Extra search/art/guide/group, real staging click, public pile, bonus point display and all new effect/target dialogs passed');
