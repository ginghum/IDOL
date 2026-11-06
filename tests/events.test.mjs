import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const G=new Function(script.split('const $=s=>')[0]+';return IDOL;')();
let checks=0;function ok(x,m){if(!x)throw Error(m);checks++;}
function game(events=['redo','switch','wit']){const s=G.create(['rai','kayo','hana'],'rai',['machi','natsume','shio'],'machi',0,9,events,['trouble','redo','wit']);const p=s.players[0];p.memory.push(...p.deck.splice(0,8));return s;}
function use(s,id,opts={}){G.dispatch(s,{type:'event',id,memory:G.autoPay(s.players[s.active],id),...opts});}
{
 const s=game();ok(s.players[0].events.map(e=>e.id).join(',')==='redo,switch,wit','chosen events');
 let threw=false;try{G.dispatch(s,{type:'event',id:'redo',memory:s.players[0].memory.slice(0,4).map(c=>c.uid)});}catch{threw=true;}ok(threw,'overpayment rejected');ok(s.players[0].memory.length===8,'invalid payment atomic');
 const locked=s.row[0];locked.lock=1;const own=s.row[1];own.lock=0;use(s,'redo');ok(s.row.includes(locked)&&locked.lock===1,'opponent lock protected');ok(s.row.length===3,'refill');ok(own.lock===null,'own token returned');
}
{
 const s=game();s.row[0].lock=0;s.row[1].lock=1;const p=s.players[0],vol=p.vol,hand=p.hand.length;
 use(s,'switch',{leader:'hana'});ok(p.leader==='hana','leader replaced');ok(s.row[0].lock===null&&s.row[1].lock===1,'only departing leader token removed');ok(p.vol===vol&&p.hand.length===hand,'no initial stats reapplied');
}
{
 const s=game(),p=s.players[0],card=p.hand[0],n=p.hand.length,mem=p.memory.length;
 use(s,'wit',{hand:card.uid});ok(p.hand.length===n,'wit draws');ok(p.memory.length===mem-2&&p.memory.includes(card),'wit moves hand to memory after paying three');ok(!G.eventOK(s,0,'wit'),'once per turn');
 G.dispatch(s,{type:'end'});G.dispatch(s,{type:'end'});ok(G.eventOK(s,0,'wit'),'reusable next turn');
}
{
 const s=game(['trouble','redo','wit']);s.players[0].fans.push(s.audience.shift());s.players[1].fans.push(...s.audience.splice(0,3));use(s,'trouble');ok(s.players[0].fans.length===0&&s.players[1].fans.length===1,'1 own then 2 opposing audience');
}
for(let seed=1;seed<=120;seed++){
 const s=G.create(['kayo','rai','hana'],'hana',['machi','natsume','shio'],'machi',seed%2,seed,['wit','trouble','switch'],['redo','wit','trouble']);
 let n=0;while(s.winner===null&&n++<1500){G.dispatch(s,G.ai(s));ok([...s.audience,...s.row,...s.players.flatMap(p=>p.fans)].filter(f=>f.type!=='influencer'&&f.type!=='dream').length===53,'53 initial audience cards preserved');for(const p of s.players)ok(p.hand.length+p.deck.length+p.memory.length+p.discard.length===27,'27 songs preserved');}
 ok(s.winner!==null,'common event CPU match finishes');
}
console.log('Common events:',checks,'checks, 120 matches');

