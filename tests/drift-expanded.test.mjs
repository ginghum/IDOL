import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {IDOL as server} from '../room-server/idol-engine.mjs';
const code=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],browser=new Function(code.split('const $=s=>')[0]+';return IDOL')();
for(const G of [server,browser])for(const seat of [0,1]){
 const make=(leader='kana')=>{const a=['kana','miyabi','rai'],b=['kayo','hana','tenko'];const s=seat?G.create(b,'hana',a,leader,seat,1717,b,a):G.create(a,leader,b,'hana',seat,1717,a,b);s.pending=null;s.queue=[];const p=s.players[seat];p.vol=100;p.chips=0;for(const f of [...s.row,...s.audience])f.type='light';return s;};
 const give=(s,owner,n)=>{const p=s.players[seat];for(const z of ['hand','deck']){const j=p[z].findIndex(c=>c.owner===owner&&c.n===n);if(j>=0){const c=p[z].splice(j,1)[0];p.hand.push(c);return c;}}throw Error('card missing');};
 const play=(s,c,mode='vol',debuff=false)=>G.dispatch(s,{type:'play',card:c.uid,actors:G.actors(s.players[seat],c),mode,debuff});
 const choose=(s,value)=>G.dispatch(s,{type:'choose',value});
 const bad=(s,a)=>{const before=JSON.stringify(s);assert.throws(()=>G.peerAction(s,a,seat));assert.equal(JSON.stringify(s),before);};
 for(const side of [seat,1-seat])for(const zone of ['memory','discard']){
  const s=make(),p=s.players[seat],origin={uid:'public-'+s.serial++,owner:'kayo',n:1};s.players[side][zone].push(origin);const before=JSON.stringify(s.players[side][zone]),c=give(s,'kana',1),count=p.hand.length;play(s,c);assert.equal(s.pending.kind,'kanaDrift');assert(s.pending.options.includes(origin.uid));const view=G.publicView(s,1-seat);assert.deepEqual(view.pending.options,[]);choose(s,origin.uid);assert.equal(p.vol,110);assert.equal(p.hand.length,count);assert.equal(p.chips,0);assert(s.players[side][zone].includes(origin));if(side!==seat||zone!=='memory')assert.equal(JSON.stringify(s.players[side][zone]),before);
 }
 // Chosen sources are revalidated, hidden zones and recursive/special/wrong-size effects excluded.
 {const s=make(),p=s.players[seat],q=s.players[1-seat];q.hand.push({uid:'hidden',owner:'kayo',n:1});p.deck.push({uid:'hidden-own',owner:'kayo',n:1});for(const side of [seat,1-seat])for(const zone of ['memory','discard'])s.players[side][zone].push({uid:'recursive-'+s.serial++,owner:'kana',n:1},{uid:'special-'+s.serial++,owner:'shiro',n:1,special:'world'},{uid:'wrong-size-'+s.serial++,owner:'kayo',n:2});assert.equal(G.driftSources(s,seat,1,'vol').length,0);const origin={uid:'remove-me',owner:'kayo',n:1};q.discard.push(origin);play(s,give(s,'kana',1));bad(s,{type:'choose',value:'hidden'});q.discard=[];bad(s,{type:'choose',value:origin.uid});choose(s,'skip');assert.equal(p.vol,110);}
 // Every source zone supports the updated extra payment, with Drift still paid independently.
 for(const side of [seat,1-seat])for(const zone of ['memory','discard'])for(const leader of ['kana','miyabi']){
  const s=make(leader),p=s.players[seat],q=s.players[1-seat],origin={uid:'雅-'+s.serial++,owner:'miyabi',n:3};s.players[side][zone].push(origin);p.chips=leader==='kana'?1:2;q.vol=80;play(s,give(s,'kana',3));choose(s,origin.uid);assert.equal(p.chips,1);assert.equal(s.pending.kind,'kanaDriftOption');assert.match(s.pending.optionText,/声援1枚/);assert.equal(G.ai(s).value,'use');choose(s,'use');assert.equal(p.chips,0);assert.equal(q.vol,60);assert(s.players[side][zone].includes(origin));
 }
 // The AI's optional three-person pick uses its actual source even in own discard.
 {const s=make(),p=s.players[seat],origin={uid:'rai3-public',owner:'rai',n:3};p.discard.push(origin);play(s,give(s,'kana',3),'fan');choose(s,origin.uid);assert.equal(s.pending.kind,'kanaDriftOption');assert.equal(G.ai(s).value,'use');}
 for(const [n,mode] of [[2,'fan'],[3,'fan'],[3,'vol']])for(const chips of [0,1]){
  const s=make(),p=s.players[seat],q=s.players[1-seat],c=give(s,'miyabi',n);p.chips=chips;q.vol=80;const a={type:'play',card:c.uid,actors:G.actors(p,c),mode,debuff:true};if(!chips)bad(s,a);else{G.dispatch(s,a);assert.equal(p.chips,0);assert.equal(q.vol,60);}
 }
 // Skipped Drift, disabled effects and timeout still resolve without extra costs.
 {const s=make(),p=s.players[seat];p.discard.push({uid:'skip-src',owner:'kayo',n:1});play(s,give(s,'kana',1));choose(s,'skip');assert.equal(p.chips,0);assert.equal(p.vol,110);}
 {const s=make(),p=s.players[seat];p.discard.push({uid:'seal-src',owner:'kayo',n:1});p.songSeal=true;play(s,give(s,'kana',1));assert.equal(s.pending,null);assert.equal(p.vol,110);}
 {const s=make(),p=s.players[seat];p.discard.push({uid:'time-src',owner:'kayo',n:1});play(s,give(s,'kana',1));G.timeout(s);assert.equal(s.active,1-seat);assert.equal(p.chips,0);}
}
console.log('Expanded Drift: four source zones/both engines/seats, actual effects and source preservation, hidden/invalid source rejection, AI, separate costs, Miyabi 0/1 boundaries, sealing/skip/timeout passed');

const nodes=new Map(),listeners={},document={querySelectorAll:()=>[],querySelector(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',querySelector:()=>null});return nodes.get(k);},addEventListener(k,f){listeners[k]=f;}};
new Function('document','localStorage','setTimeout','clearTimeout','assert',code+String.raw`
state=IDOL.create(['kana','miyabi','rai'],'kana',['kayo','hana','tenko'],'kayo',0,17);screen='match';modal=null;const options=['skip'];for(const seat of [0,1])for(const zone of ['memory','discard']){const uid='zone-'+seat+'-'+zone;state.players[seat][zone]=[{uid,owner:'kayo',n:1}];options.push(uid);}state.pending={kind:'kanaDrift',p:0,options,card:'unused',mode:'vol',free:true};render();const content=$('#modal').innerHTML;for(const text of ['自分のメモリー','自分の捨て札','相手のメモリー','相手の捨て札',...options.slice(1)])assert(content.includes(text),text);
state.pending=null;modal=null;const c={owner:'miyabi',n:3};state.players[0].chips=1;selection.debuff=false;assert(!miyabiOptionHTML(c,state.players[0]).includes('disabled'));assert.match(miyabiOptionHTML(c,state.players[0]),/声援1枚/);
`)(document,{getItem:()=>null,setItem(){}},()=>0,()=>{},assert);
console.log('Expanded Drift UI: four labelled source groups, selectable cards and Miyabi one-chip checkbox passed');
