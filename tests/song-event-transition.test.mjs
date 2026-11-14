import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const nodes=new Map(),listeners={};
const document={querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,fn){listeners[k]=fn;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert','listeners',code+`
const click=(action,id,p)=>listeners.click({target:{closest:()=>({dataset:{action,id,p},disabled:false})}});
state=IDOL.create(['kayo','machi','natsume'],'kayo',['rai','shio','hana'],'rai',0,43,['redo','wit','hana']);screen='match';modal=null;render();
const s0=JSON.stringify(state),uid=state.players[0].hand[0].uid;
const pick=()=>{click('song',uid);assert.equal(modal.kind,'song');assert.match($('#app').innerHTML,/song-dock/);};
const clearDock=()=>{assert(!$('#app').innerHTML.includes('song-dock'),'Changing away from song selection must remove the stale VOL/FAN dock');assert(!$('#app').innerHTML.includes('data-action="board-actor"'),'Members return to normal interaction');};
// Mobile event menu -> close: the hand must be usable again.
pick();click('events-menu',null,'0');assert.equal(modal.kind,'events-menu');assert.match($('#modal').innerHTML,/自分のイベント/);clearDock();click('close');assert.equal(modal,null);assert.equal($('#modal').innerHTML,'');clearDock();assert.equal(JSON.stringify(state),s0);
// Menu -> event -> change payment -> close, repeatedly, must not leave old controls.
for(let n=0;n<3;n++){pick();click('events-menu',null,'0');click('event','redo');assert.equal(modal.kind,'event');assert(Array.isArray(selection.memory));assert(!Object.hasOwn(selection,'actors'));clearDock();assert.match($('#modal').innerHTML,/やり直し/);click('close');clearDock();assert.equal(JSON.stringify(state),s0);}
// Desktop event pockets and other inspection dialogs have the same transition.
for(const [action,id,p] of [['event','redo'],['events-menu',null,'1'],['zones',null,'0'],['member-info','0','0'],['fan-info',state.row[0].uid],['table-log']]){pick();click(action,id,p);clearDock();click('close');clearDock();}
pick();click('event','redo');listeners.keydown({key:'Escape'});assert.equal(modal,null);clearDock();
// Following the transition, a fresh song can actually be used (not just displayed).
pick();const before=state.players[0].memory.length;click('play-vol');assert.equal(modal,null);clearDock();assert.equal(state.players[0].memory.length,before+1);assert(!state.players[0].hand.some(c=>c.uid===uid));assert(state.players[0].ready.some(x=>!x));
// Rendering a still-selected song must retain its normal actor interaction.
const next=state.players[0].hand.find(c=>IDOL.actors(state.players[0],c));if(next){click('song',next.uid);const actors=[...selection.actors];renderModal();assert.equal(modal.kind,'song');assert.deepEqual(selection.actors,actors);assert.match($('#app').innerHTML,/song-dock/);}
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert,listeners);
console.log('Song/event transitions: mobile menu, direct event, close/Escape, repeated switching, other dialogs and actual follow-up play passed');
