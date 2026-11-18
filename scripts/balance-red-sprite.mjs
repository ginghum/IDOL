import fs from 'node:fs';
import {IDOL as G} from '../room-server/idol-engine.mjs';
const newIDs=['riri','chitose','kokone'],old=Object.keys(G.CHAR).filter(id=>!newIDs.includes(id));
let randSeed=0x18112026;const rand=()=>((randSeed=(Math.imul(randSeed,1664525)+1013904223)>>>0)/2**32);
const pick=a=>a[Math.floor(rand()*a.length)];
const sample=(a,n)=>{a=[...a];const out=[];while(out.length<n)out.push(a.splice(Math.floor(rand()*a.length),1)[0]);return out;};
const rows=[];
function run(a,b,seed,seat){const cfg=seat?[b,a]:[a,b],s=G.create(cfg[0].team,cfg[0].leader,cfg[1].team,cfg[1].leader,0,seed,cfg[0].events,cfg[1].events);let steps=0,events=0,rehearsals=0,passes=0;
 while(s.winner===null&&steps++<2500){const who=s.pending?.p??s.active,act=G.ai(s);if(who===seat){events+=act.type==='event'&&act.id===a.team[0]?1:0;rehearsals+=s.pending?.kind==='kokoneUse'?1:0;passes+=s.pending?.kind==='ririPass'&&act.value==='pass'?1:0;}try{G.dispatch(s,act);}catch(e){throw Error(JSON.stringify({a,b,seed,seat,steps,act,pending:s.pending})+' '+e.message);}
  for(const p of s.players){const cards=[...p.hand,...p.deck,...p.memory,...p.discard,...(p.rehearsal?[p.rehearsal]:[])].filter(c=>!c.special);if(cards.length!==27||new Set(cards.map(c=>c.uid)).size!==27||p.chips<0||p.fanChips<0||p.vol<0||p.vol>G.maxVoltage(p))throw Error('card/resource invariant');}
 }
 if(s.winner===null)throw Error('unfinished '+JSON.stringify({a,b,seed,seat,turn:s.turn,steps}));
 return {win:s.winner===seat,turn:s.turn,events,rehearsals,passes,triggered:!!s.players[seat].ririUsed};
}
const rounds=250;
for(const id of newIDs)for(const role of ['leader','member']){
 for(let n=0;n<rounds;n++){
  const mates=sample(old,2),enemy=sample(old,3),control=pick(old.filter(x=>!mates.includes(x))),seed=Math.floor(rand()*2**32),team=[id,...mates],baseline=[control,...mates],leader=role==='leader'?id:mates[0],common=pick(['overcome','trouble','viewing','collection','buzz','mc']),events=n%2?[id,mates[0],common]:team,controlEvents=n%2?[control,mates[0],common]:baseline;
  const a={team,leader,events},c={team:baseline,leader:role==='leader'?control:mates[0],events:controlEvents},b={team:enemy,leader:pick(enemy),events:n%2?[enemy[0],enemy[1],common]:enemy};
  for(const seat of [0,1])rows.push({id,role,mates,enemy,enemyLeader:b.leader,seed,seat,treatment:run(a,b,seed,seat),control:run(c,b,seed,seat)});
 }
 console.log(id,role,'complete');
}
const summarize=a=>({n:a.length,winPct:+(100*a.filter(x=>x.treatment.win).length/a.length).toFixed(1),controlWinPct:+(100*a.filter(x=>x.control.win).length/a.length).toFixed(1),eventPct:+(100*a.filter(x=>x.treatment.events).length/a.length).toFixed(1),ririTriggerPct:+(100*a.filter(x=>x.treatment.triggered).length/a.length).toFixed(1),rehearsalMean:+(a.reduce((n,x)=>n+x.treatment.rehearsals,0)/a.length).toFixed(2),passesMean:+(a.reduce((n,x)=>n+x.treatment.passes,0)/a.length).toFixed(2),meanTurns:+(a.reduce((n,x)=>n+x.treatment.turn,0)/a.length).toFixed(1)});
const summary={seed:'0x18112026',rounds,games:rows.length*2,unfinished:0,results:newIDs.flatMap(id=>['leader','member'].map(role=>({id,role,...summarize(rows.filter(x=>x.id===id&&x.role===role))}))),partners:newIDs.flatMap(id=>old.map(mate=>({id,mate,...summarize(rows.filter(x=>x.id===id&&x.mates.includes(mate)))}))).sort((a,b)=>b.winPct-a.winPct)};
fs.mkdirSync(new URL('../docs',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('../docs/'+(process.argv[2]||'red-sprite-balance-results-20261118')+'.json',import.meta.url),JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary.results,null,2));
