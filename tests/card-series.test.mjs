import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map();
const document={querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(){}};
new Function('document','localStorage','setTimeout','clearTimeout','assert',code+`
assert.equal(ORIGINAL_CARDS.characters.length,9);assert.equal(ORIGINAL_CARDS.events.length,16);
for(const id of IDS)assert.equal(cardSeries('character',id),'original');for(const id of Object.keys(EVENTS))assert.equal(cardSeries('event',id),'original');
rosterFilter='series-original';assert.equal(rosterIDs().length,9);rosterFilter='series-extra';assert.equal(rosterIDs().length,0);
eventFilter='series-original';assert.equal((eventChoicesHTML().match(/data-action="setup-event"/g)||[]).length,16);eventFilter='series-extra';assert.match(eventChoicesHTML(),/該当するイベントがありません/);
// New IDs must stay Extra without touching the original boundary or existing saved lineups.
CHAR.future={...CHAR.kayo,name:'追加テスト'};EVENTS.future={...EVENTS.kayo,event:'追加イベント'};IDS.push('future');COMMON.futureCommon={...COMMON.mc,event:'追加共通'};EVENTS.futureCommon=COMMON.futureCommon;
assert.equal(cardSeries('character','future'),'extra');assert.equal(cardSeries('event','future'),'extra');assert.equal(cardSeries('event','futureCommon'),'extra');assert.equal(ORIGINAL_CARDS.characters.length,9);assert.equal(ORIGINAL_CARDS.events.length,16);
assert.deepEqual(rosterIDs(),['future']);assert.equal((eventChoicesHTML().match(/data-action="setup-event"/g)||[]).length,2);assert.match(rosterResultsHTML(),/エクストラ/);
CHAR.kayo.vol=40;assert.equal(cardSeries('character','kayo'),'original','Balance updates preserve collection');
modal={kind:'catalog',tab:'future'};renderModal();assert.match($('#modal').innerHTML,/series-badge extra/);modal={kind:'common-catalog'};renderModal();assert.match($('#modal').innerHTML,/エクストラ/);assert.match($('#modal').innerHTML,/オリジナル/);
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert);
console.log('Card series: fixed 9 characters/16 events, automatic future Extra classification, labels, filters and balance-update stability passed');
