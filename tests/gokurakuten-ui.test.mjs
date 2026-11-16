import assert from'node:assert/strict';import{readFileSync,existsSync}from'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map();
const document={querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(){}};
new Function('document','localStorage','setTimeout','clearTimeout','assert',code+`
rosterGroup='gokurakuten';assert.deepEqual(rosterIDs(),['hakka','kana','tenko','mitsuha','mitama']);
for(const id of ['kana','tenko','mitsuha','mitama']){assert.equal(cardSeries('character',id),'extra');assert.equal(cardSeries('event',id),'extra');modal={kind:'catalog',tab:id};renderModal();const text=$('#modal').innerHTML;assert(text.includes(CHAR[id].name));assert(text.includes(CHAR[id].event));for(const name of CHAR[id].songs)assert(text.includes(name));for(const key of ['idol-'+id,...[1,2,3].map(n=>'song-'+id+'-'+n),'event-'+id])assert(ARTWORK[key]);}
state=IDOL.create(['kana','tenko','mitsuha'],'kana',['mitama','hakka','kayo'],'mitama',0,12);screen='match';state.players[0].chips=1;IDOL.dispatch(state,{type:'end'});modal=null;renderModal();assert.match($('#modal').innerHTML,/声援1枚で封印/);assert.match($('#modal').innerHTML,/使わず終了/);
state.pending={kind:'kanaMemory',p:0,options:['done'],text:'河奈'};modal=null;renderModal();assert.match($('#modal').innerHTML,/選択を終える/);
state.pending={kind:'mitsuhaStart',p:0,options:['skip','swap'],text:'三葉'};modal=null;renderModal();assert.match($('#modal').innerHTML,/非公開の山札/);assert.match($('#modal').innerHTML,/入れ替えない/);
state.pending=null;const p=state.players[0];p.team=['miyabi','natsume','rai'];p.leader='natsume';p.songSeal=true;p.vol=100;p.chips=4;p.ready=[true,true,true];p.hand=[{uid:'sealed',owner:'miyabi',n:3}];modal={kind:'song',id:'sealed'};selection={actors:[0,1,2],boost:false,pick:false,debuff:false};let dock=songDock();assert.match(dock,/河奈の効果で追加効果なし/);assert(!dock.includes('data-field="debuff"'));p.hand[0]={uid:'sealed',owner:'rai',n:1};assert(!songDock().includes('data-field="pick"'));p.hand[0]={uid:'sealed',owner:'natsume',n:1};assert(!songDock().includes('data-field="boost"'));
assert.match(fanHTML({uid:'local',type:'local',lock:null}),/地元ファン/);
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert);
console.log('Gokurakuten UI: five-member group, 20 character assets, all titles, local fan and mobile-friendly choices/sealed controls passed');
