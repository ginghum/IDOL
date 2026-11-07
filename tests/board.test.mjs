import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const nodes=new Map();const document={querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(){}};
new Function('document','localStorage','setTimeout','clearTimeout','assert',code+`
state=IDOL.create(['kayo','machi','natsume'],'kayo',['rai','shio','hana'],'rai',0,43,['redo','wit','hana']);screen='match';render();
let board=$('#app').innerHTML;
assert.equal((board.match(/class="member-card /g)||[]).length,6);
assert.equal((board.match(/class="audience-card /g)||[]).length,3);
assert.equal((board.match(/class="event-pocket /g)||[]).length,6);
assert.match(board,/aria-label="手札を右へ送る"/);assert.match(board,/aria-label="手札を左へ送る"/);
const track=$('.hand-track'),frame=$('.hand-window');Object.assign(track,{scrollWidth:900,clientWidth:360,scrollLeft:0});frame.dataset={};updateHandScroll();assert.equal(frame.dataset.scrollable,'true');assert.equal($('.hand-arrow.prev').disabled,true);assert.equal($('.hand-arrow.next').disabled,false);
track.scrollLeft=540;updateHandScroll();assert.equal($('.hand-arrow.next').disabled,true);assert.equal($('.hand-arrow.prev').disabled,false);
track.scrollWidth=360;updateHandScroll();assert.equal(frame.dataset.scrollable,'false');

const cpuEvents=tableEvents(state.players[1],1);assert(!cpuEvents.includes('assets/art/event-'),'Opponent event images must remain hidden');
const requestAnimationFrame=callback=>callback();
const p=state.players[0],c=p.hand.find(c=>c.owner==='kayo')||p.hand[0];modal={kind:'song',id:c.uid};selection={actors:[],boost:false,pick:false};render();
assert.equal($('#modal').innerHTML,'','Song selection stays on board');assert.match($('#app').innerHTML,/song-dock/);
const disabled=songDock();assert.match(disabled,/data-action="play-vol" disabled/);
selection.actors=IDOL.actors(p,c)||[];
if(selection.actors.length)assert(!songDock().includes('data-action="play-vol" disabled'));

const readyBefore=[...p.ready];p.ready=[false,true,true];assert.match(tableSong({uid:'check1',owner:'kayo',n:1}),/unplayable/,'Required idol exhausted');assert.match(tableSong({uid:'check2',owner:'machi',n:3}),/unplayable/,'Not enough ready idols');assert(!tableSong({uid:'check3',owner:'machi',n:1}).includes('unplayable'),'VOL stays usable below FAN threshold');p.ready=readyBefore;
assert.match(songDock(),/dock-cover/,'Selected song has large artwork');
const rect=(left)=>({left,top:100,width:100,height:140}),oldFans=[{id:'a',rect:rect(10)},{id:'b',rect:rect(120)},{id:'c',rect:rect(230)}],newFans=[{id:'b',rect:rect(10)},{id:'c',rect:rect(120)},{id:'d',rect:rect(230)}];
const plan=audienceMotionPlan(oldFans,newFans,{left:350,top:150,width:30,height:40});assert.deepEqual(plan.filter(x=>x.kind==='slide').map(x=>[x.id,x.x]),[['b',110],['c',110]]);const refill=plan.find(x=>x.kind==='refill');assert(refill.x>0,'New audience enters from deck on right');assert(refill.delay>=Math.max(...plan.filter(x=>x.kind==='slide').map(x=>x.delay+x.duration)),'Refill follows compaction');assert.deepEqual(audienceMotionPlan(oldFans,oldFans,null),[],'Unchanged row does not replay movement');

p.memory.push(...p.deck.splice(0,3));modal={kind:'event',id:'redo'};selection={memory:p.memory.map(c=>c.uid),discard:[],targets:[]};state.active=1;renderModal();assert.match($('#modal').innerHTML,/data-action="event-confirm" disabled/,'Cannot use own event on CPU turn');
modal=null;recordMove({type:'end'},JSON.parse(JSON.stringify(state)));render();assert.match($('#app').innerHTML,/ターン交代/);assert.equal(lastMove,null);render();assert(!$('#app').innerHTML.includes('move-announcement'),'Selection renders must not repeat the last announcement');
modal={kind:'opening'};renderModal();assert.match($('#modal').innerHTML,/data-action="live-begin"/);assert($('#modal').innerHTML.includes(CHAR[state.players[0].leader].skillName),'Opening shows your leader skill');
modal={kind:'member-info',p:0,j:0};renderModal();assert.match($('#modal').innerHTML,/member-detail-portrait/);
// Existing hand items must not replay the draw animation on unrelated state updates.
modal=null;state.players[0].items=[{uid:'meat-existing',item:'meat'}];state.players[0].fanChips=2;
document.body={};const animated=[],displayed=[...state.players[0].hand,...IDOL.items(state.players[0]),{uid:'fan-chips'}].map(c=>({dataset:{id:c.uid},animate(){animated.push(c.uid);}}));
document.querySelectorAll=selector=>selector==='.hand-track > .playing-card'?displayed:selector==='.playing-card'?[...displayed,{dataset:{id:'dialog-item'},animate(){animated.push('dialog-item');}}]:[];
$('.audience-deck > span').getBoundingClientRect=()=>null;
const beforeOpponent=captureMotion({});

animateMotion(beforeOpponent);assert.deepEqual(animated,[],'Opponent updates must not animate existing meat or fan chips');
displayed.push({dataset:{id:'meat-new'},animate(){animated.push('meat-new');}});animateMotion(beforeOpponent);assert.deepEqual(animated,['meat-new'],'Only a newly acquired item animates');
animated.length=0;const beforeDraw=captureMotion({});state.players[0].items.push({uid:'meat-new',item:'meat'});
const beforeNextDraw=captureMotion({});displayed.push({dataset:{id:'song-new'},animate(){animated.push('song-new');}});animateMotion(beforeNextDraw);assert.deepEqual(animated,['song-new'],'New songs retain their draw animation');
delete document.body;
screen='setup';modal=null;render();assert.match($('#app').innerHTML,/casting-grid/);assert.equal(($('#app').innerHTML.match(/class="casting-card /g)||[]).length,ROSTER_PAGE_SIZE);
`) (document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert);
const map=JSON.parse(html.match(/const ARTWORK = (\{[\s\S]*?\n\});/)[1]);
assert.equal(Object.keys(map).length,78);for(const path of Object.values(map))assert(existsSync(new URL('../'+path,import.meta.url)),path);
console.log('Board UI: member/audience layout, hidden CPU events, inline selection, turn guard and 78 assets verified');
