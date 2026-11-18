import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map(),listeners={},document={querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,f){listeners[k]=f;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert','listeners','exists',code+String.raw`
const content=()=>$('#modal').innerHTML,click=(action,id)=>listeners.click({target:{closest:()=>({dataset:{action,id},disabled:false})}});
for(const [id,d] of Object.entries(DUETS)){
 assert.equal(cardSeries('event',id),'extra');assert(exists(ARTWORK['event-'+id]));
 team=[...d.members,'hakka'];leader=team[0];eventFilter='available';assert(eventChoicesHTML().includes('data-id="'+id+'"'));
 assert(cpuEventPool(team).includes(id));assert(!cpuEventPool([d.members[0],'hakka','natsume']).includes(id));
 assert.match(costLabel(d),new RegExp(CHAR[d.members[0]].short+' 2枚以上'));assert.match(costLabel(d),new RegExp(CHAR[d.members[1]].short+' 2枚以上'));
 for(const member of d.members){assert(guideCharacterHTML(member).includes(d.event));modal={kind:'gallery',category:'event',character:member};assert(galleryKeys().includes('event-'+id));}
 team=['kayo','natsume','hana'];eventFilter='duets';const listed=eventChoicesHTML();for(const id of Object.keys(DUETS))assert(listed.includes('data-id="'+id+'"'));assert(!listed.includes('data-id="request"'));
 modal={kind:'rules',section:'events'};renderModal();assert(content().includes(d.event));
 state=IDOL.create([...d.members,'hakka'],d.members[0],['rai','machi','haru'],'rai',0,321,[id,'mc','overcome']);screen='match';const p=state.players[0];p.memory=d.members.flatMap(owner=>[0,1,2].map(n=>({uid:owner+n,owner,n:1})));click('event',id);assert.equal(selection.memory.length,6);assert(!content().match(/data-action="event-confirm" disabled/));
}
for(let i=0;i<200;i++){const c=randomCpuConfig();assert(cpuConfigOK(c));assert(c.events.filter(id=>c.team.includes(id)).length>=2);}
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert,listeners,path=>existsSync(new URL('../'+path,import.meta.url)));
console.log('Duet UI: pair-aware filters/CPU pools, Extra art, guide per member, gallery shared art and valid auto-payment buttons passed');
