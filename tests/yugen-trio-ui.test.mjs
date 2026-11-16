import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map(),listeners={};
const document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,f){listeners[k]=f;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert','listeners','exists',code+String.raw`
const click=(action,id,p)=>listeners.click({target:{closest:()=>({dataset:{action,id,p},disabled:false})}});
for(const id of ['miyabi','kono','chie']){rosterFilter='series-extra';rosterQuery=CHAR[id].reading;assert.deepEqual(rosterIDs(),[id]);assert.equal(cardSeries('character',id),'extra');assert.equal(cardSeries('event',id),'extra');for(const key of ['idol-'+id,'event-'+id,...[1,2,3].map(n=>'song-'+id+'-'+n)])assert(exists(ARTWORK[key]),key);modal={kind:'rules',section:'characters',character:id};renderModal();assert.match($('#modal').innerHTML,new RegExp(CHAR[id].name));}
assert(IDOL_GROUPS.find(g=>g.id==='yugen').members.includes('chie'));
assert(ARTWORK['song-misa-1'].includes('-v2.webp'));
state=IDOL.create(['miyabi','kono','chie'],'miyabi',['kayo','hana','hakka'],'kayo',0,123);screen='match';modal=null;let p=state.players[0];render();
const song={uid:'sample',owner:'miyabi',n:1};assert.match(tableSong(song),/40%〜/);
p.items.push({uid:'cash1',item:'cash'},{uid:'cash2',item:'cash'});let snapshot=JSON.stringify(state);click('item-info','cash1');assert.match($('#modal').innerHTML,/現金/);assert.match($('#modal').innerHTML,/声援チップ2枚/);assert.match($('#modal').innerHTML,/data-action="cash-buy"/);assert.match($('#app').innerHTML+itemHTML({...p.items[0],count:2}),/現金/);assert.equal(JSON.stringify(state),snapshot);
// Hiding a drink decision changes no state, retains forced choice and allows viewing public zones.
modal=null;state.pending={kind:'misaPurple',p:0,options:['skip','use'],text:'紫のドリンク'};p.chips=2;selection={memory:['keep-selection']};snapshot=JSON.stringify(state);render();assert.match($('#modal').innerHTML,/盤面を見る/);click('board-view');assert.equal($('#modal').innerHTML,'');assert.match($('#app').innerHTML,/選択画面へ戻る/);assert(!humanTurn());assert.equal(JSON.stringify(state),snapshot);
click('zones',null,'0');assert.match($('#modal').innerHTML,/自分のカード束/);click('close');assert.equal($('#modal').innerHTML,'');click('board-resume');assert.match($('#modal').innerHTML,/紫のドリンク/);assert.deepEqual(selection.memory,['keep-selection']);assert.equal(JSON.stringify(state),snapshot);
// Third-song discount is shown in both the explanation and payment button.
boardView=null;modal=null;state.pending={kind:'misaPurple',p:0,options:['skip','use'],text:'紫のドリンク',cost:1};p.chips=1;render();assert.match($('#modal').innerHTML,/声援1枚で紫のドリンク/);assert.match($('#modal').innerHTML,/声援1枚で獲得/);assert(!$('#modal').innerHTML.includes('声援2枚'));
// Event payment selections survive viewing other dialogs and returning to the board.
state.pending=null;modal={kind:'event',id:'miyabi'};selection={memory:[p.hand[0].uid],discard:[],targets:[],target:null,actor:null};snapshot=JSON.stringify(state);const paid=[...selection.memory];renderModal();click('board-view');click('table-log');click('close');click('board-resume');assert.equal(modal.kind,'event');assert.deepEqual(selection.memory,paid);assert.equal(JSON.stringify(state),snapshot);
// A server update or timeout discards the suspended view instead of resurrecting stale choices.
modal=null;state.pending={kind:'misaPurple',p:0,options:['skip','use'],text:'old'};renderModal();click('board-view');state.pending={kind:'miyabiDebuff',p:0,options:['skip','use'],text:'new'};render();assert.equal(boardView,null);assert.match($('#modal').innerHTML,/VOL－20/);assert(!$('#app').innerHTML.includes('選択画面へ戻る'));
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert,listeners,p=>existsSync(new URL('../'+p,import.meta.url)));
console.log('Yugen trio UI: approved assets, extra/team filters, actual leader cost, cash shop and reversible/stale-safe board viewing passed');
