import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map(),listeners={},document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,f){listeners[k]=f;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert','exists',code+String.raw`
for(const id of ['shiro','hibiki','misa']){rosterFilter='series-extra';rosterQuery=CHAR[id].reading;assert.deepEqual(rosterIDs(),[id]);assert.equal(cardSeries('character',id),'extra');assert.equal(cardSeries('event',id),'extra');for(const key of ['idol-'+id,'event-'+id,...[1,2,3].map(n=>'song-'+id+'-'+n)])assert(exists(ARTWORK[key]),key);modal={kind:'rules',section:'characters',character:id};renderModal();assert($('#modal').innerHTML.includes(CHAR[id].name));}
state=IDOL.create(['shiro','hibiki','misa'],'shiro',['kayo','hana','hakka'],'kayo',0,123);screen='match';modal=null;renderModal();assert.match($('#modal').innerHTML,/色が音になる時/);assert.match($('#modal').innerHTML,/確認しました/);
IDOL.dispatch(state,{type:'choose',value:'confirm'});let p=state.players[0];p.hand.push({uid:'paint',owner:'shiro',n:3,special:'painted'},{uid:'world',owner:'shiro',n:1,special:'world'});p.items.push({uid:'blue1',item:'drinkBlue'},{uid:'blue2',item:'drinkBlue'},{uid:'red',item:'drinkRed'},{uid:'purple',item:'drinkPurple'});
let before=JSON.stringify(state);render();assert.equal(JSON.stringify(state),before);assert.match($('#app').innerHTML,/data-art="special-painted"/);assert.match($('#app').innerHTML,/data-art="special-world"/);assert.match($('#app').innerHTML,/青のドリンク<\/b><span>ITEM ×2/);
modal={kind:'song',id:'paint'};selection={actors:[0,1,2],boost:false,pick:false};const dock=songDock();assert.match(dock,/指定なし・任意の3人/);assert(!dock.includes('しろを含む'));
for(const item of ['blue1','red','purple']){modal={kind:'item',id:item};renderModal();assert.match($('#modal').innerHTML,/ドリンク/);assert.match($('#modal').innerHTML,/自分のターン終了時/);assert(!$('#modal').innerHTML.includes('券を1枚使って'));
}
modal=null;IDOL.dispatch(state,{type:'end'});render();assert.match($('#modal').innerHTML,/ターン終了/);assert.match($('#modal').innerHTML,/残りを使わず終了/);assert.match($('#modal').innerHTML,/data-action="choose" data-id="blue1"/);assert(!humanTurn());
state=IDOL.create(['hibiki','shiro','misa'],'hibiki',['kayo','hana','hakka'],'kayo',0,123);p=state.players[0];p.vol=300;assert.match(tableHUD(p,0),/width:75%/);assert.match(tableHUD(p,0),/VOL 300%/);
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert,p=>existsSync(new URL('../'+p,import.meta.url)));
console.log('New trio UI: Extra readings, all approved assets/guide, private peek, special-song art/member wording, stacked drinks/details/end choices and 400% meter passed');
