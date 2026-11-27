import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map(),listeners={};
const document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,f){listeners[k]=f;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert','listeners',code+`
const click=(action,id,extra={})=>listeners.click({target:{closest:()=>({dataset:{action,id,...extra}})}});
assert.deepEqual(IDOL_GROUPS.find(x=>x.id==='justi-3z').members,['homura','kagami','nitro']);
state=IDOL.create(['nitro','kagami','homura'],'nitro',['hana','aya','miyabi'],'hana',0,127);state.pending=null;state.queue=[];screen='match';
const p=state.players[0];let c=p.hand.find(c=>c.owner==='nitro');if(!c){c=p.deck.splice(p.deck.findIndex(c=>c.owner==='nitro'),1)[0];p.hand.push(c);}click('song',c.uid);assert.equal(selection.modify,false);assert.match(songDock(),/data-field="modify"/);assert.match(songDock(),/VOL消費なし/);
listeners.change({target:{dataset:{field:'modify'},checked:true}});assert.equal(selection.modify,true);
c.mod='power';assert.match(tableSong(c),/改造済/);assert.match(songDock(),/元の値/);assert.match(tableSong(c),/mod-power/);
modal=null;click('mod-info',null,{p:'0'});assert.equal(modal.kind,'mod-info');assert.match($('#modal').innerHTML,/全12枚/);for(const id in IDOL.MODS)assert($('#modal').innerHTML.includes('assets/art/mod-'+id));
state.pending={kind:'nitroMod',p:0,options:['skip',...p.hand.filter(c=>!c.mod).map(c=>c.uid)],text:'改造'};modal=null;renderModal();assert.match($('#modal').innerHTML,/今回は改造しない/);assert.match($('#modal').innerHTML,/data-action="choose"/);
state.pending={kind:'modEncore',p:0,options:['0','1'],text:'再行動'};renderModal();assert.match($('#modal').innerHTML,/にとろ/);assert.match($('#modal').innerHTML,/鑑/);
for(const id of ['kagami','nitro']){modal={kind:'rules',section:'characters',character:id};renderModal();assert($('#modal').innerHTML.includes(CHAR[id].skill));}
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert,listeners);
console.log('Justice/Nitro UI: team, checkbox defaults/toggle, modification effects/base values, deck/count/art, pending choices and guide passed');
