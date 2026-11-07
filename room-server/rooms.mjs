import { IDOL } from './idol-engine.mjs';
export const PROTOCOL='idol-rooms-1';
const TURN=99000,CHOICE=30000,TTL=6*60*60*1000,LOBBY=30*60*1000;
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','access-control-max-age':'600'}});
class Problem extends Error{constructor(message,status=400){super(message);this.status=status;}}
const ticket=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{24,80}$/.test(x);
function config(c){if(!c||!Array.isArray(c.team)||c.team.length!==3||new Set(c.team).size!==3||c.team.some(x=>!Object.hasOwn(IDOL.CHAR,x))||!c.team.includes(c.leader)||!Array.isArray(c.events)||c.events.length!==3||new Set(c.events).size!==3||c.events.some(x=>!Object.hasOwn(IDOL.EVENTS,x)))throw new Problem('編成を確認してください');return {team:[...c.team],leader:c.leader,events:[...c.events],first:['0','1'].includes(String(c.first))?Number(c.first):null};}
function code(){return String(crypto.getRandomValues(new Uint32Array(1))[0]%10000).padStart(4,'0');}
function bump(r,now){r.rev++;r.updated=now;r.expires=now+(r.phase==='waiting'?LOBBY:TTL);}
function syncClock(r,now,previousTurn){
 if(r.state.winner!==null){r.phase='ended';r.deadline=0;r.clockMode='ended';return;}
 if(r.state.turn!==previousTurn){r.clockMode='turn';r.turnRemaining=TURN;r.deadline=now+TURN;}
 if(r.state.pending&&r.state.pending.p!==r.state.active){
  if(r.clockMode!=='choice')r.turnRemaining=Math.max(0,r.deadline-now);
  r.clockMode='choice';r.deadline=now+CHOICE;
 }else if(r.clockMode==='choice'){r.clockMode='turn';r.deadline=now+Math.max(0,r.turnRemaining??TURN);}
}
function expireTurn(r,now){
 if(r.phase!=='playing'||now<r.deadline)return false;
 const turn=r.state.turn,choice=r.clockMode==='choice'&&r.state.pending&&r.state.pending.p!==r.state.active;
 if(choice){const z=r.state.pending;r.state=IDOL.peerAction(r.state,{type:'choose',value:z.options[0]},z.p);syncClock(r,now,turn);r.move={actor:z.p,title:'選択時間切れ',detail:'30秒経過 · 先頭の候補を選択',art:null};}
 else{
  let guard=0;
  while(r.state.pending&&r.state.pending.p===r.state.active&&r.state.winner===null){if(++guard>512)throw Error('選択処理の上限');const z=r.state.pending;r.state=IDOL.peerAction(r.state,{type:'choose',value:z.options[0]},z.p);}
  if(r.state.pending&&r.state.pending.p!==r.state.active){r.turnRemaining=0;r.clockMode='choice';r.deadline=now+CHOICE;}
  else if(r.state.winner===null){const actor=r.state.active;r.state=IDOL.peerAction(r.state,{type:'end'},actor);syncClock(r,now,turn);r.move={actor,title:'時間切れ · ターン終了',detail:'99秒経過',art:null};}
  else syncClock(r,now,turn);
 }
 bump(r,now);return true;
}
function view(r,seat,now){return {protocol:PROTOCOL,code:r.code,rev:r.rev,round:r.round||1,phase:r.phase,deadline:r.deadline||0,clockMode:r.clockMode||'turn',clockOwner:r.clockMode==='choice'?(r.state.pending.p===seat?0:1):(r.state?.active===seat?0:1),turnRemaining:r.clockMode==='choice'?(r.turnRemaining??0):Math.max(0,(r.deadline||0)-now),now,ready:r.ready,readyLocal:!!r.ready[seat],configLocal:r.seats[seat].config,rematchLocal:!!r.rematchReady?.[seat],rematchOther:!!r.rematchReady?.[1-seat],opponentLeft:!!r.departed?.[1-seat],joined:!!r.seats[1],expires:r.expires,state:r.state?IDOL.publicView(r.state,seat):null,move:r.move?{...r.move,who:r.move.actor===seat?'YOU':'相手'}:null};}
function notice(s,a,seat){const c=s.players[seat].hand.find(c=>c.uid===a.card);return {actor:seat,title:c?IDOL.song(c).name:a.type==='event'?IDOL.EVENTS[a.id].event:({end:'ターン交代',service:'ファンサービス',support:'応援チップ効果',leaderSkill:'怖いからこそ、全速力！',choose:'効果を選択'})[a.type]||'',art:c?'song-'+c.owner+'-'+c.n:a.type==='event'?'event-'+a.id:null,detail:a.mode==='vol'?'VOLモード':a.mode==='fan'?'FANモード':''};}
async function body(request){const raw=await request.text();if(raw.length>16000)throw new Problem('操作データが大きすぎます');try{return JSON.parse(raw||'{}');}catch{throw new Problem('操作を読み取れませんでした');}}
async function transaction(bucket,code,fn,now){const key='rooms/'+code+'.json';for(let attempt=0;attempt<8;attempt++){const obj=await bucket.get(key);if(!obj)throw new Problem('その部屋は見つかりません。番号を確認してください',404);const r=await obj.json();if(r.expires<now)throw new Problem('部屋の有効期限が切れました。新しい部屋を作ってください',410);const result=fn(r);if(!result.changed)return result.response;const saved=await bucket.put(key,JSON.stringify(r),{onlyIf:{etagMatches:obj.etag},httpMetadata:{contentType:'application/json'}});if(saved)return result.response;}throw new Problem('同時に操作がありました。もう一度お試しください',409);}
export async function handle(request,env){
 if(request.method==='OPTIONS')return json({ok:true});
 try{
 const url=new URL(request.url),parts=url.pathname.replace(/^\/api\/rooms\/?/,'').split('/').filter(Boolean),now=Date.now();
 if(request.method==='GET'&&parts[0]==='health')return json({ok:true,protocol:PROTOCOL,storage:!!env.BUCKET});
 if(!env.BUCKET)throw new Problem('対戦サーバーの準備中です',503);
 if(request.method==='POST'&&!parts.length){const b=await body(request);if(b.protocol!==PROTOCOL)throw new Problem('ゲームを再読み込みしてください',426);if(!ticket(b.ticket))throw new Problem('参加情報がありません');const c=config(b.config);
 for(let n=0;n<30;n++){const num=code(),key='rooms/'+num+'.json',old=await env.BUCKET.get(key);if(old&&(await old.json()).expires>=now)continue;const r={code:num,protocol:PROTOCOL,rev:1,phase:'waiting',selectBeforeStart:b.flow==='selection',seats:[{token:b.ticket,config:c},null],ready:[false,false],rematchReady:[false,false],departed:[false,false],round:1,state:null,deadline:0,seen:[],created:now,updated:now,expires:now+LOBBY};const saved=await env.BUCKET.put(key,JSON.stringify(r),{onlyIf:old?{etagMatches:old.etag}:new Headers({'if-none-match':'*'}),httpMetadata:{contentType:'application/json'}});if(saved)return json(view(r,0,now));}throw new Problem('空き部屋を作れませんでした。少し待ってください',503);}
 const num=parts[0];if(!/^\d{4}$/.test(num||''))throw new Problem('部屋番号は4桁の数字で入力してください');
 const b=request.method==='POST'?await body(request):{},token=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 if(request.method==='POST'&&parts[1]==='join'){
 if(b.protocol!==PROTOCOL)throw new Problem('ゲームを再読み込みしてください',426);if(!ticket(b.ticket))throw new Problem('参加情報がありません');const c=config(b.config);
 return await transaction(env.BUCKET,num,r=>{const existing=r.seats.findIndex(s=>s?.token===b.ticket);if(existing>=0)return {changed:false,response:json(view(r,existing,now))};if(r.phase!=='waiting'||r.seats[1])throw new Problem('この部屋は満員、または対戦済みです',409);r.seats[1]={token:b.ticket,config:c};if(r.selectBeforeStart){r.phase='selecting';bump(r,now);return {changed:true,response:json(view(r,1,now))};}const a=r.seats[0].config,first=a.first??(crypto.getRandomValues(new Uint32Array(1))[0]%2);r.state=IDOL.create(a.team,a.leader,c.team,c.leader,first,crypto.getRandomValues(new Uint32Array(1))[0],a.events,c.events);r.phase='opening';bump(r,now);return {changed:true,response:json(view(r,1,now))};},now);}
 if(!ticket(token))throw new Problem('この端末の参加情報がありません',401);
 return await transaction(env.BUCKET,num,r=>{
 const seat=r.seats.findIndex(s=>s?.token===token);if(seat<0)throw new Problem('この部屋の参加情報がありません',403);
 let changed=expireTurn(r,now);
 if(request.method==='GET'&&parts.length===1)return {changed,response:json(view(r,seat,now))};
 if(request.method!=='POST')throw new Problem('操作が見つかりません',404);
 if(parts[1]==='rematch'||parts[1]==='prepare'){
 if(b.round!==undefined&&b.round!==(r.round||1))return {changed,response:json(view(r,seat,now))};
 const initial=parts[1]==='prepare'&&r.phase==='selecting';if(!initial&&r.phase!=='ended')throw new Problem('編成選択中か決着後に対戦準備をしてください',409);
 if(r.departed?.some(Boolean))throw new Problem('相手が部屋を退出しました。新しい部屋を作ってください',409);
 r.rematchReady??=[false,false];
 // A confirmed lineup is immutable for this round, including lost-response retries.
 if(r.rematchReady[seat])return {changed,response:json(view(r,seat,now))};
 const next=config(b.config??r.seats[seat].config);
 r.seats[seat].config=next;r.rematchReady[seat]=true;
 if(r.rematchReady.every(Boolean)){const a=r.seats[0].config,c=r.seats[1].config,first=initial?(a.first??(crypto.getRandomValues(new Uint32Array(1))[0]%2)):1-r.state.first;r.state=IDOL.create(a.team,a.leader,c.team,c.leader,first,crypto.getRandomValues(new Uint32Array(1))[0],a.events,c.events);r.round=initial?(r.round||1):(r.round||1)+1;r.phase='opening';r.ready=[false,false];r.rematchReady=[false,false];r.seen=[];r.move=null;r.deadline=0;r.clockMode='turn';r.turnRemaining=TURN;}
 bump(r,now);changed=true;
 }else if(parts[1]==='ready'){if(r.phase==='opening'&&!r.ready[seat]){r.ready[seat]=true;if(r.ready.every(Boolean)){r.phase='playing';r.clockMode='turn';r.turnRemaining=TURN;r.deadline=now+TURN;syncClock(r,now,r.state.turn);}bump(r,now);changed=true;}}
 else if(parts[1]==='action'){
 if(typeof b.requestId!=='string'||!/^[a-zA-Z0-9_-]{12,80}$/.test(b.requestId))throw new Problem('操作番号がありません');
 if(r.seen.includes(seat+':'+b.requestId))return {changed,response:json(view(r,seat,now))};
 if(changed)return {changed:true,response:json({...view(r,seat,now),error:'時間切れの処理を反映しました'},409)};
 if(r.phase!=='playing')throw new Problem('まだ対戦を開始できません',409);
 if(b.rev!==r.rev)return {changed:false,response:json({...view(r,seat,now),error:'盤面を更新しました。もう一度操作してください'},409)};
 let clean;try{clean=IDOL.validateAction(b.action);}catch(e){throw new Problem(e.message);}
 const move=notice(r.state,clean,seat),turn=r.state.turn;
 try{r.state=IDOL.peerAction(r.state,clean,seat);}catch(e){throw new Problem(e.message);}
 r.move=move;r.seen.push(seat+':'+b.requestId);r.seen=r.seen.slice(-128);syncClock(r,now,turn);bump(r,now);changed=true;
 }else if(parts[1]==='leave'){
 r.departed??=[false,false];r.departed[seat]=true;if(r.state&&r.state.winner===null){r.state.winner=1-seat;r.state.endReason='resign';r.phase='ended';r.deadline=0;r.clockMode='ended';r.move={actor:seat,title:'投了',art:null,detail:''};}else if(r.phase==='waiting'||r.phase==='selecting')r.phase='closed';bump(r,now);changed=true;
 }else throw new Problem('操作が見つかりません',404);
 return {changed,response:json(view(r,seat,now))};
 },now);
 }catch(e){return json({error:e instanceof Problem?e.message:'通信を処理できませんでした。再接続をお待ちください'},e instanceof Problem?e.status:500);}
}
