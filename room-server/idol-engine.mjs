/* IDOL rules engine. Browser-independent; commands and state are JSON serializable. */
const IDOL = (() => {
const CHAR = {
kayo:{skillName:'檻の向こうを見つめて',name:'小鳥遊佳代',short:'佳代',color:'#6179ed',vol:30,hand:6,skill:'自分のターン中、観客デッキの一番上をいつでも見てよい。',songs:['欲望の檻','鎖に囲まれて','革命は始まる'],event:'レヴォリューション・ラピスラズリ',cost:[3,6],effect:'手札を1〜3枚捨て、その枚数の観客を先頭からまとめて獲得。追加強化を含め獲得は最大3枚。'},
machi:{skillName:'世界は私の観客席',name:'芥川麻智',short:'麻智',color:'#b47fe3',vol:30,hand:5,skill:'自分のターン開始時、互いのメモリー合計が10枚以上なら、観客ゾーンから好きな1枚を獲得。',songs:['我信','摩天楼','支配者の景色'],event:'God.Of.Dominant',cost:[2,4],effect:'観客ゾーンから好きな枚数を選び、ランダムな順番で観客デッキの下へ戻す。'},
natsume:{skillName:'感動に定員なし！',name:'険崎夏芽',short:'夏芽',color:'#d8993d',vol:30,hand:5,skill:'自分の3人用楽曲のファン獲得枚数＋1。',songs:['ウェイヨ！','ノってけピーポー！','感動はもうすぐソコに！'],event:'求道エモ駆動',cost:[2,3],effect:'このターン中、自分の楽曲のファン獲得枚数＋1。'},
shio:{skillName:'興が乗っちゃって',name:'雲居時尾',short:'時尾',color:'#4faaa0',vol:40,hand:5,skill:'応援チップを得る時、1枚ごとに、代わりにボルテージ＋10％を選べる。',songs:['旅人','謳歌賛歌','遊楽道中'],event:'常盤戯ノ宴',cost:[4,6],effect:'ボルテージ180％以上なら、ターン終了時まで7ポイントを得る。'},
rai:{skillName:'欲しけりゃ、奪ってみろ',name:'赤兎雷',short:'雷',color:'#d97382',vol:30,hand:5,skill:'独占チップ1枚を持つ。追加応援効果：応援チップ1枚で観客1枚に独占チップを置く。相手はそれを飛ばして獲得し、相手の効果では移動できない。',songs:['雷鳴','暴れハート','運命命運破壊音'],event:'アイアム・デストロイヤー',cost:[2,3],effect:'観客デッキのコアファン1枚と観客ゾーンの1枚を交換し、観客デッキをシャッフル。'},
hana:{skillName:'君の拍手で、今日をつなぐ',name:'入間華',short:'華',color:'#e07aa6',vol:30,hand:5,skill:'応援チップ効果を使うたび、このターンの次のファン獲得枚数＋1。累積し、ファン獲得時にまとめて消費。',songs:['招待状','紅いカーテン','君と私の平和条約'],event:'ピース・ピース・サーカスドーム',cost:[2,4],effect:'自分の行動済みアイドル1人を未行動にする。'},
haru:{skillName:'夢のつづきを、もう一度',name:'福園春',short:'春',color:'#b488db',vol:30,hand:5,skill:'自分のターン開始時、捨て札の楽曲1枚を選び、手札に加える。',songs:['虹空','夢見るだけじゃ足りないの','ふわふわ理想郷へようこそ！'],event:'ゆめかわ★ゆーとぴあ',cost:[2,5],effect:'観客席と相手の獲得済みエリアにある「ゆめかわファン」を全てまとめて獲得する。相手の独占付き観客は除く。'},
hakka:{skillName:'冒険はこれからだ！',name:'一条白花',short:'白花',color:'#ca9944',vol:30,hand:4,skill:'イベント発動時、行動済みの自分のアイドル1人を未行動にしてもよい。',songs:['八戒','天下御免','黄金冒険譚'],event:'地獄極楽感謝祭',cost:[4,4],effect:'ファンチップを2つ得る。その後、残りの自分のメモリーを全て捨て、こうして捨てた楽曲3枚につきファンチップを1つ得る。'},
homura:{skillName:'皆の願いが希望だにょ',name:'紅松焔',short:'焔',color:'#df5a4f',vol:20,hand:4,skill:'自分のターン開始時、応援チップを1つ得る。',songs:['駆け抜ける炎','ヒーロー登場だにょ！','希望の翼をブレイブオン'],event:'ジャスティス・Z・ハリケーン',cost:[4,7],effect:'このターン、観客山札のカードは効果を失い、自分のカードの獲得ファン数＋1。既に観客席にあるカードには無効化しない。'},
hikari:{skillName:'怖いからこそ、全速力！',name:'轍光',short:'光',color:'#dfb638',vol:30,hand:6,skill:'ゲーム中に1度、自分のターン中、VOL100％以上のときに手札を3枚選んで捨てると、応援チップを6枚得る。VOLは消費しない。',songs:['とびこめ、未体験！','衝動アクセラレーター','未知数ジャックポット'],event:'WHITEOUT',cost:[3,6],effect:'使用前の自分の捨て札2枚につき、このターン1ポイントを得る。効果の計算後、支払いに使ったメモリーを捨て札に置く。'},
aya:{skillName:'私にできること、全部',name:'宝槻彩',reading:'ほうつきあや',short:'彩',color:'#a83d4e',vol:30,hand:5,skill:'自分のターン終了時、このターンに手札から楽曲カードを3枚以上使用していたら、ファンチップを2枚得る。',songs:['SAI','彩から、あなたへ。','誰かのための天才'],event:'名もなき才に、喝采を。',cost:[4,6],effect:'使用前の自分のメモリーと捨て札にある1人用楽曲の合計枚数だけ、観客を1人ずつ獲得する（最大6回）。毎回、観客効果と補充を処理する。獲得枚数の増加は適用しない。'},
emi:{skillName:'あなたも、救われる。',name:'黒曜恵美',reading:'こくようえみ',short:'恵美',color:'#786b88',vol:30,hand:5,skill:'自分のターン開始時、応援チップ2枚を支払ってもよい。そうした場合、自分の獲得済みの厄介なファン1枚を信者（3ポイント）と入れ替える。',songs:['唯一神','使命至上主義','愛憎奉納IDOLSTAGE'],event:'BLACK×MISSIONS',cost:[3,5],effect:'相手の獲得済みの1ポイントの観客1枚を選び、アンチ（－3ポイント）と入れ替える。交換元はゲーム外に置く。ファンチップは対象外。'} ,
akina:{skillName:'私なりの最適解',name:'弓城秋奈',reading:'ゆみしろあきな',short:'秋奈',color:'#e99747',vol:30,hand:4,skill:'ターン開始時のドローは、山札の上から最大3枚を見て1枚選ぶ。残りを山札に戻し、山札全体をシャッフルする。初期手札や他のドローには適用しない。',songs:['白chu夢','可愛いの論証','幸福追求エクスキューズ'],event:'真実は嘘より奇なり',cost:[2,2],repeat:true,unlimited:true,effect:'手札の楽曲カードを好きな枚数（0枚も可）、メモリーに置く。支払いは秋奈2メモリー。使用するたびに支払い、同じターンでも何度でも使える。'}
};
const COMMON = {
redo:{event:'やり直し',short:'共通',color:'#73878b',cost:[0,3],effect:'観客ゾーンの観客をすべて観客デッキに戻してシャッフルし、空きを補充する。相手の独占チップ付き観客は移動しない。'},
switch:{event:'センタースイッチ',short:'共通',color:'#73878b',cost:[0,3],effect:'別のメンバーをリーダーにする。前のリーダー能力で得た独占チップなどは取り除く。初期vol・手札は変更しない。'},
trouble:{event:'会場トラブル',short:'共通',color:'#73878b',cost:[0,4],effect:'自分の獲得観客をランダムに1枚戻し、その後、相手の獲得観客をランダムに2枚観客デッキの下に戻す。'},
wit:{event:'機転',short:'共通',color:'#73878b',cost:[0,4],repeat:true,effect:'手札1枚を選んでメモリーに置き、1枚ドロー。再使用可能。自分の各ターン1回まで。'},
overcome:{event:'乗り越える力',short:'共通',color:'#73878b',cost:[0,3],effect:'自分のボルテージが100％以上なら、カードを2枚引く。'},
viewing:{event:'ライブビューイング',short:'共通',color:'#73878b',cost:[0,5],effect:'残りのゲーム中、自分のファンサービスでは応援チップの代わりにファンチップ1つを得る。'},
mc:{event:'MCタイム',short:'共通',color:'#73878b',cost:[0,1],effect:'次の自分のターン開始時まで、自分の獲得ファンエリアは相手のカードの影響を受けない。'}
};
const EVENTS={...CHAR,...COMMON};
const FAN = {
light:{name:'ライトファン',points:1,count:14,text:'効果なし',icon:'♡'},
cheer:{name:'応援するファン',points:1,count:14,text:'応援チップ＋1',icon:'✦'},
trouble:{name:'厄介なファン',points:1,count:12,text:'自身以外の同時獲得観客から最高得点の1枚を観客デッキの下へ戻す。',icon:'！'},
heavy:{name:'愛が重いファン',points:2,count:8,text:'ボルテージ－10％',icon:'♥'},
core:{name:'コアファン',points:3,count:4,text:'効果なし',icon:'★'},
reporter:{name:'記者',points:1,count:1,text:'獲得時、ゲーム外からインフルエンサー1枚を観客山札に加え、シャッフルする。',icon:'▣'},
influencer:{name:'インフルエンサー',points:5,count:0,text:'効果なし。初期観客山札には含まれない。',icon:'☆'},
believer:{name:'信者',points:3,count:0,text:'効果なし。交換時にゲーム外から登場する。',icon:'✧'},
anti:{name:'アンチ',points:-3,count:0,text:'効果なし。交換時にゲーム外から登場する。',icon:'×'},
dream:{name:'ゆめかわファン',points:0,count:0,text:'獲得側のメンバーに春がいるなら1ポイント。初期山札には含まれない。',icon:'☁'}
};
function song(c){return {name:CHAR[c.owner].songs[c.n-1],owner:c.owner,n:c.n,vol:c.n*10-(c.owner==='akina'?10:0)+(c.owner==='shio'||c.owner==='aya'&&c.n===1?10:0),fan:c.owner==='natsume'&&c.n===3?4:c.n,need:[60,80,100][c.n-1]};}
function detail(c){const d=song(c);d.volText=c.owner==='kayo'?'カードを1枚引く。':c.owner==='hana'?'応援チップを1枚得る。':'';d.fanText=c.owner==='machi'?(c.n===3?'相手の獲得済み観客をランダムに1枚戻す。':'相手は自身の獲得済み観客1枚を選んで戻す。'):c.owner==='natsume'&&c.n<3?'volを追加で10％下げると、獲得枚数＋1。':c.owner==='rai'?(c.n===1?'応援チップ1枚で通常獲得の代わりに観客ゾーンの1枚を選んで獲得。':c.n===2?'通常獲得の代わりに観客ゾーンの1枚を選んで獲得してもよい。':'通常獲得の代わりに観客デッキの上2枚を見て、観客ゾーンと合わせた最大5枚から2枚を選び、同時に獲得してもよい。'):c.owner==='hana'&&c.n===3?'応援チップを1枚得る。':'';if(c.owner==='haru'){d.volText=c.n===3?'ゆめかわファン1枚を観客山札の一番上に置く。':'';d.fanText=c.n<3?'ゆめかわファン1枚を観客山札の一番上に置く。':'獲得済みのゆめかわファンが2枚以上なら、獲得枚数＋1。';}
if(c.owner==='hakka'){d.volText='肉を1つ得る。';d.fanText=c.n===3?'肉を1つ得る。':'';}
if(c.owner==='akina')d.volText=d.fanText='使用後、この楽曲をメモリーから手札に戻してもよい。';
if(c.owner==='emi'){d.volText='観客席のカード1枚を選び、観客山札の下に戻してもよい。戻した後、補充する。';if(c.n===3)d.fanText='ファン獲得前に、観客席のカード1枚を選び、観客山札の下に戻してもよい。戻した後、補充する。';}
if(c.owner==='aya'&&c.n>1)d.fanText='使用後、VOLを'+(c.n===2?20:30)+'％下げてもよい。そうした場合、彩以外の行動済みメンバー'+(c.n===2?'1人':'全員')+'を未行動にする。';
if(c.owner==='hikari'){const text='手札を'+(c.n===3?2:1)+'枚選んで捨ててもよい。そうした場合、'+(c.n===3?3:2)+'枚引く。';d.fanText=text;if(c.n===3)d.volText=text;}
if(c.owner==='homura')d.fanText='観客席のカードを'+(c.n===3?2:1)+'枚まで選び、ターン終了時まで効果を無効にする。';return d;}
function rng(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function shuffle(s,a){for(let i=a.length-1;i>0;i--){let j=Math.floor(rng(s)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function uid(s){return 'c'+s.serial++;}
function log(s,t){s.log.push(t);if(s.log.length>120)s.log.shift();}
function voltage(p,n){p.vol=Math.max(0,Math.min(200,p.vol+n));}
function fanPoints(p,f){return f.type==='dream'?(p?.team.includes('haru')&&!f.muted?1:0):FAN[f.type].points;}
function score(p){return p.fans.reduce((a,f)=>a+fanPoints(p,f),0)+(p.temp||0)+(p.fanChips||0);}
function items(p){return p.items||[];}
function paymentCards(p){return [...p.memory,...items(p)];}
function paymentOK(p,id,paid){const d=EVENTS[id],cards=paymentCards(p);return Array.isArray(paid)&&paid.length===d.cost[1]&&new Set(paid).size===paid.length&&paid.every(x=>cards.some(c=>c.uid===x))&&cards.filter(c=>paid.includes(c.uid)&&(c.owner===id||c.item==='meat')).length>=d.cost[0];}
function meat(s,p){(p.items??=[]).push({uid:uid(s),item:'meat'});log(s,'肉を1つ獲得（手札のアイテム）');}
function dream(s){s.audience.unshift({uid:uid(s),type:'dream',lock:null,muted:s.deckMuteTurn===s.turn});log(s,'ゆめかわファンを観客山札の一番上に置いた');}

function draw(s,i,n=1){const p=s.players[i];let got=0;while(n-->0&&p.deck.length){p.hand.push(p.deck.shift());got++;}if(got)log(s,(i?'CPU':'あなた')+'：'+got+'枚ドロー');}
function fill(s){while(s.row.length<3&&s.audience.length){const f=s.audience.shift();if(s.deckMuteTurn===s.turn)f.muted=true;s.row.push(f);}}

function unlocked(s,i){return s.row.filter(f=>f.lock===null||f.lock===i);}
function eventOK(s,i,id){const p=s.players[i],d=EVENTS[id];return !!d&&p.events.some(e=>e.id===id&&!e.used&&(!d.repeat||d.unlimited||e.lastTurn!==s.turn))&&paymentCards(p).length>=d.cost[1]&&paymentCards(p).filter(c=>c.owner===id||c.item==='meat').length>=d.cost[0]&&(id!=='shio'||p.vol>=180)&&(id!=='overcome'||p.vol>=100)&&(id!=='wit'||p.hand.length>0)&&(id!=='kayo'||p.hand.length>0)&&(id!=='hana'||p.ready.some(x=>!x))&&(id!=='emi'||!fansProtected(s,1-i,i)&&s.players[1-i].fans.some(f=>fanPoints(s.players[1-i],f)===1))&&(id!=='rai'||(s.audienceCoreCount??s.audience.filter(f=>f.type==='core').length)>0&&unlocked(s,i).length>0);}

function finish(s){
 if(s.queue.length||s.pending)return;
 const winners=s.players.map((p,i)=>score(p)>=20?i:-1).filter(i=>i>=0);
 if(winners.length){s.winner=winners.includes(s.active)?s.active:winners[0];log(s,s.winner?'CPUの勝利！':'あなたの勝利！');return;}
 for(let i=0;i<2;i++){const p=s.players[i];if(!p.deck.length&&!p.hand.length&&!p.events.some(e=>eventOK(s,i,e.id))){s.winner=1-i;log(s,(i?'CPU':'あなた')+'は山札・手札がなく、使用可能なイベントもないため敗北。');return;}}
}
function fansProtected(s,i,source){return source!==i&&!!s.players[i].fanShield;}
function removeFan(s,i,id,source=i){if(fansProtected(s,i,source))return;const p=s.players[i],at=p.fans.findIndex(f=>f.uid===id);if(at<0)return;const f=p.fans.splice(at,1)[0];f.lock=null;s.audience.push(f);log(s,FAN[f.type].name+'を観客デッキの下へ戻した');}
function exchangeFan(s,i,id,type){const p=s.players[i],at=p.fans.findIndex(f=>f.uid===id);if(at<0)throw Error('交換対象がありません');const old=p.fans[at];(s.exiledFans??=[]).push({...old,lock:null});p.fans[at]={uid:uid(s),type,lock:null};log(s,FAN[old.type].name+'を'+FAN[type].name+'に交換（元の観客はゲーム外）');}
function moveOut(s,f){s.row=s.row.filter(x=>x.uid!==f.uid);s.audience=s.audience.filter(x=>x.uid!==f.uid);f.lock=null;}
function gain(s,i,list){
 list=list.filter(f=>!s.players.some((p,j)=>fansProtected(s,j,i)&&p.fans.some(x=>x.uid===f.uid)));
 if(!list.length)return;
 for(const f of list){if(s.audience.some(x=>x.uid===f.uid)&&s.deckMuteTurn===s.turn)f.muted=true;for(const p of s.players)p.fans=p.fans.filter(x=>x.uid!==f.uid);moveOut(s,f);s.players[i].fans.push(f);}
 log(s,(i?'CPU':'あなた')+'：'+list.map(f=>FAN[f.type].name).join('・')+'を獲得');
 const ids=list.map(f=>f.uid);
 s.queue.unshift(...list.map(f=>({kind:'fanEffect',p:i,f:JSON.parse(JSON.stringify(f)),batch:ids})),{kind:'fill',p:i});
}
function normal(s,i,n){const list=unlocked(s,i).slice(0,n);let left=n-list.length;for(let j=0;j<left&&j<s.audience.length;j++)list.push(s.audience[j]);gain(s,i,list);}
function choice(s,kind,p,options,text,extra={}){s.pending={kind,p,options,text,...extra};}
function chipEffect(s,p){if(s.players[p].leader==='hana'){s.players[p].buff++;log(s,'華：次のファン獲得＋'+s.players[p].buff);}}
function ayaEventCount(p){return Math.min(6,[...p.memory,...p.discard].filter(c=>c.n===1).length);}
function process(s){
 while(s.queue.length&&!s.pending&&s.winner===null){
 const e=s.queue.shift(),p=s.players[e.p];
 if(e.kind==='emiConvert'&&p.chips>=2){const opts=p.fans.filter(f=>f.type==='trouble').map(f=>f.uid);if(opts.length)choice(s,'emiConvert',e.p,['skip',...opts],'あなたも、救われる。：応援2枚で信者に交換しますか？');}
 if(e.kind==='emiBottom'){const opts=unlocked(s,e.p).map(f=>f.uid);if(opts.length)choice(s,'emiBottom',e.p,['skip',...opts],'恵美：観客山札の下に戻す観客を1枚選択（任意）');}
 if(e.kind==='fill')fill(s);
 if(e.kind==='akinaDraw'){const opts=p.deck.slice(0,3).map(c=>c.uid);if(opts.length===1)draw(s,e.p);else if(opts.length)choice(s,'akinaDraw',e.p,opts,'私なりの最適解：山札の上から1枚選択');}
 if(e.kind==='akinaReturn'&&p.memory.some(c=>c.uid===e.card))choice(s,'akinaReturn',e.p,['skip','return'],'秋奈：使用した楽曲を手札に戻しますか？',{card:e.card});
 if(e.kind==='vol')voltage(p,e.n);
 if(e.kind==='recover'&&p.discard.length)choice(s,'recover',e.p,p.discard.map(c=>c.uid),'春：捨て札から手札に戻す楽曲を1枚選択');
 if(e.kind==='hakkaReady'&&p.ready.some(x=>!x))choice(s,'hakkaReady',e.p,[...p.ready.flatMap((r,j)=>r?[]:[String(j)]),'skip'],'白花：未行動にするアイドルを1人選択（任意）');
 if(e.kind==='mutePick'){const opts=s.row.filter(f=>!f.muted&&!e.selected.includes(f.uid)).map(f=>f.uid);if(opts.length&&e.left>0)choice(s,'mutePick',e.p,[...opts,'skip'],'焔：効果を失わせる観客を選択（あと'+e.left+'枚まで）',{left:e.left,selected:e.selected});}
 if(e.kind==='ayaReady'&&p.vol>=e.cost){const opts=p.team.flatMap((id,j)=>id!=='aya'&&!p.ready[j]?[String(j)]:[]);if(opts.length)choice(s,'ayaReady',e.p,['skip',...(e.all?['all']:opts)],'彩：VOLを'+e.cost+'％下げ、彩以外の'+(e.all?'全員':'1人')+'を未行動にしますか？',{cost:e.cost,all:e.all});}
 if(e.kind==='hikariCycle'&&p.hand.length>=e.count)choice(s,'hikariOffer',e.p,['skip','accept'],'光：手札を'+e.count+'枚捨てて'+(e.count+1)+'枚引きますか？',{count:e.count});
 if(e.kind==='draw')draw(s,e.p);
 if(e.kind==='chip'){
 if(p.leader==='shio')choice(s,'shio',e.p,['chip','vol'],'時尾：応援チップ1枚か、vol＋10％を選択');
 else p.chips++;
 }
 if(e.kind==='fanEffect'){
 const f=e.f;if(f.muted)continue;
 if(f.type==='reporter'){const added={uid:uid(s),type:'influencer',lock:null};if(s.deckMuteTurn===s.turn)added.muted=true;s.audience.push(added);shuffle(s,s.audience);log(s,'記者：インフルエンサー1枚を観客山札に加えてシャッフル');}
 if(f.type==='cheer')s.queue.unshift({kind:'chip',p:e.p});
 if(f.type==='heavy'){voltage(p,-10);log(s,'愛が重いファン：vol－10％');}
 if(f.type==='trouble'){
 const candidates=p.fans.filter(x=>e.batch.includes(x.uid)&&x.uid!==f.uid);
 if(candidates.length){const max=Math.max(...candidates.map(x=>fanPoints(p,x)));const opts=candidates.filter(x=>fanPoints(p,x)===max).map(x=>x.uid);
 if(opts.length===1)removeFan(s,e.p,opts[0]);else choice(s,'trouble',e.p,opts,'厄介なファン：戻す観客を1枚選択');}
 }
 }
 if(e.kind==='machiRemove'){
 if(p.fans.length&&!fansProtected(s,e.p,1-e.p)){if(e.random)removeFan(s,e.p,p.fans[Math.floor(rng(s)*p.fans.length)].uid,1-e.p);else choice(s,'machiRemove',e.p,p.fans.map(f=>f.uid),'麻智の効果：自分の獲得済み観客から戻す1枚を選択');}
 }
 if(e.kind==='normal')normal(s,e.p,e.n);
 if(e.kind==='raiPick'){
 const opts=unlocked(s,e.p).map(f=>f.uid);
 if(e.peek)opts.push(...s.audience.slice(0,2).map(f=>f.uid));
 if(opts.length){const count=Math.min(e.count||1,opts.length);choice(s,'raiPick',e.p,opts,'雷：獲得する観客を'+count+'枚選択',{count,selected:[]});}
 }
 }
 finish(s);
}
function create(team,leader,cpuTeam,cpuLeader,first=0,seed=Date.now(),playerEvents=team,cpuEvents=cpuTeam){
 const s={version:1,seed:seed>>>0,serial:1,players:[],row:[],audience:[],exiledFans:[],active:first,turn:1,first,winner:null,queue:[],pending:null,log:[]};
 for(const [t,l,eventIds] of [[team,leader,playerEvents],[cpuTeam,cpuLeader,cpuEvents]]){
 if(eventIds.length!==3||new Set(eventIds).size!==3||eventIds.some(id=>typeof id!=='string'||!Object.hasOwn(EVENTS,id)))throw Error('イベントを異なる3枚選んでください');
 if(t.length!==3||new Set(t).size!==3||!t.includes(l)||t.some(x=>typeof x!=='string'||!Object.hasOwn(CHAR,x)))throw Error('編成を確認してください');
 const p={team:t,leader:l,vol:CHAR[l].vol,hand:[],deck:[],memory:[],discard:[],fans:[],events:eventIds.map(id=>({id,used:false,lastTurn:null})),ready:[true,true,true],chips:0,buff:0,eventBuff:0,cardBuff:0,temp:0,service:0,items:[],fanChips:0,liveViewing:false,fanShield:false,songsPlayed:0};
 t.forEach(owner=>{for(let n=1;n<=3;n++)for(let k=0;k<3;k++)p.deck.push({uid:uid(s),owner,n});});shuffle(s,p.deck);s.players.push(p);
 }
 for(const type in FAN)for(let n=0;n<FAN[type].count;n++)s.audience.push({uid:uid(s),type,lock:null});
 shuffle(s,s.audience);fill(s);for(let i=0;i<2;i++)draw(s,i,CHAR[s.players[i].leader].hand);
 log(s,(first?'CPU':'あなた')+'の先攻でライブ開始！');startSkill(s);process(s);return s;
}
function startSkill(s){const p=s.players[s.active];if(p.leader==='emi')s.queue.push({kind:'emiConvert',p:s.active});if(p.leader==='homura')s.queue.push({kind:'chip',p:s.active});if(p.leader==='haru')s.queue.push({kind:'recover',p:s.active});if(p.leader==='machi'&&s.players.reduce((n,x)=>n+x.memory.length,0)>=10){const opts=unlocked(s,s.active).map(x=>x.uid);if(opts.length)choice(s,'raiPick',s.active,opts,'麻智のリーダースキル：観客を1枚選んで獲得');}}
function next(s){
 const p=s.players[s.active];
 if(p.leader==='aya'&&(p.songsPlayed||0)>=3){p.fanChips=(p.fanChips||0)+2;log(s,'彩：私にできること、全部 ファンチップ＋2');finish(s);if(s.winner!==null)return;}
 p.songsPlayed=0;p.temp=0;p.buff=0;p.eventBuff=0;p.cardBuff=0;s.deckMuteTurn=null;
 for(const f of [...s.row,...s.audience,...s.players.flatMap(p=>p.fans)])delete f.muted;
 s.active=1-s.active;s.turn++;const q=s.players[s.active];q.fanShield=false;q.songsPlayed=0;q.ready=[true,true,true];q.service=0;
 log(s,'── '+(s.active?'CPU':'あなた')+'のターン ──');if(q.leader==='akina')s.queue.push({kind:'akinaDraw',p:s.active});else draw(s,s.active);startSkill(s);process(s);
}

function dispatch(s,a){
 if(s.winner!==null)throw Error('ライブは終了しています');
 if(a.type==='choose'){
 const z=s.pending;if(!z||!z.options.includes(a.value))throw Error('選択対象がありません');
 if(z.kind==='emiConvert'&&a.value!=='skip'&&s.players[z.p].chips<2)throw Error('応援チップが足りません');
 s.pending=null;
 if(z.kind==='akinaDraw'){const p=s.players[z.p],at=p.deck.findIndex(c=>c.uid===a.value);p.hand.push(p.deck.splice(at,1)[0]);shuffle(s,p.deck);log(s,'秋奈：山札の上から1枚選んでドローし、残りの山札をシャッフルした');}
 if(z.kind==='akinaReturn'&&a.value==='return'){const p=s.players[z.p],at=p.memory.findIndex(c=>c.uid===z.card);if(at>=0){p.hand.push(p.memory.splice(at,1)[0]);log(s,'秋奈：使用した楽曲をメモリーから手札へ戻した');}}
 if(z.kind==='emiConvert'&&a.value!=='skip'){s.players[z.p].chips-=2;exchangeFan(s,z.p,a.value,'believer');log(s,'恵美：応援チップ2枚を支払った');}
 if(z.kind==='emiBottom'&&a.value!=='skip'){const f=s.row.find(f=>f.uid===a.value);moveOut(s,f);s.audience.push(f);log(s,'恵美：'+FAN[f.type].name+'を観客山札の下へ戻した');fill(s);}
 if(z.kind==='ayaReady'&&a.value!=='skip'){const p=s.players[z.p];if(p.vol<z.cost)throw Error('追加のVOLが足りません');voltage(p,-z.cost);if(z.all)p.team.forEach((id,j)=>{if(id!=='aya')p.ready[j]=true;});else p.ready[Number(a.value)]=true;log(s,'彩：VOL－'+z.cost+'％、仲間'+(z.all?'全員':'1人')+'を未行動にした');}
 if(z.kind==='hikariOffer'&&a.value==='accept'){const p=s.players[z.p];choice(s,'hikariDiscard',z.p,p.hand.map(c=>c.uid),'光：捨てる手札を'+z.count+'枚選択',{count:z.count,selected:[]});}
 if(z.kind==='hikariDiscard'){const p=s.players[z.p],selected=[...(z.selected||[]),a.value];if(selected.length<z.count){choice(s,'hikariDiscard',z.p,z.options.filter(x=>x!==a.value),'光：捨てる手札をあと'+(z.count-selected.length)+'枚選択',{count:z.count,selected});}else{const cards=p.hand.filter(c=>selected.includes(c.uid));p.hand=p.hand.filter(c=>!selected.includes(c.uid));p.discard.push(...cards);draw(s,z.p,z.count+1);log(s,'光：手札'+z.count+'枚を捨て、'+(z.count+1)+'枚ドロー');}}
 if(z.kind==='recover'){const p=s.players[z.p],at=p.discard.findIndex(c=>c.uid===a.value);if(at>=0){p.hand.push(p.discard.splice(at,1)[0]);log(s,'春：捨て札の楽曲を手札に戻した');}}
 if(z.kind==='hakkaReady'&&a.value!=='skip')s.players[z.p].ready[Number(a.value)]=true;
 if(z.kind==='mutePick'&&a.value!=='skip'){const f=s.row.find(f=>f.uid===a.value);if(f){f.muted=true;log(s,FAN[f.type].name+'の効果をターン終了まで無効');s.queue.unshift({kind:'mutePick',p:z.p,left:z.left-1,selected:[...z.selected,a.value]});}}
 if(z.kind==='shio'){if(a.value==='chip')s.players[z.p].chips++;else voltage(s.players[z.p],10);}
 if(z.kind==='trouble'||z.kind==='machiRemove')removeFan(s,z.p,a.value,z.kind==='machiRemove'?1-z.p:z.p);
 if(z.kind==='raiPick'){const selected=[...(z.selected||[]),a.value],count=z.count||1;if(selected.length<count){choice(s,'raiPick',z.p,z.options.filter(id=>id!==a.value),'雷：獲得する観客をあと'+(count-selected.length)+'枚選択',{count,selected});}else{const fs=[...s.row,...s.audience.slice(0,2)].filter(f=>selected.includes(f.uid));gain(s,z.p,fs);}}
 process(s);return s;
 }
 if(s.pending)throw Error('先に効果を選択してください');
 const i=s.active,p=s.players[i];
 if(a.type==='end'){next(s);return s;}
 if(a.type==='leaderSkill'){
 if(p.leader!=='hikari'||p.hikariSkillUsed)throw Error('光のリーダースキルはゲーム中1度だけです');
 if(p.vol<100)throw Error('光のリーダースキルにはVOL100％以上が必要です');
 const paid=a.discard||[];if(paid.length!==3||new Set(paid).size!==3||paid.some(x=>!p.hand.some(c=>c.uid===x)))throw Error('捨てる手札を異なる3枚選んでください');
 const cards=p.hand.filter(c=>paid.includes(c.uid));p.hand=p.hand.filter(c=>!paid.includes(c.uid));p.discard.push(...cards);p.hikariSkillUsed=true;p.chips+=6;log(s,'光：怖いからこそ、全速力！ 手札3枚を捨て、応援チップ＋6');finish(s);return s;
 }
 if(a.type==='service'){
 if(p.service>=2||!p.ready[a.actor])throw Error('ファンサービスは未行動の1人で各ターン2回までです');
 p.ready[a.actor]=false;p.service++;if(p.liveViewing){p.fanChips=(p.fanChips||0)+1;log(s,'ライブビューイング：ファンチップ＋1');}else s.queue.push({kind:'chip',p:i});log(s,'ファンサービス：'+CHAR[p.team[a.actor]].short);process(s);return s;
 }
 if(a.type==='support'){
 const cost={draw:2,refresh:6,lock:1}[a.effect];
 if(cost===undefined||p.chips<cost)throw Error('応援チップが足りません');
 if(a.effect==='refresh'&&p.ready.every(Boolean))throw Error('全員が未行動です');
 if(a.effect==='draw'&&!p.deck.length)throw Error('山札にカードがありません');
 if(a.effect==='lock'&&(p.leader!=='rai'||s.row.some(f=>f.lock===i)||!s.row.some(f=>f.uid===a.target&&f.lock===null)))throw Error('独占チップを置けません');
 p.chips-=cost;chipEffect(s,i);
 if(a.effect==='draw')draw(s,i);
 if(a.effect==='refresh')p.ready=[true,true,true];
 if(a.effect==='lock')s.row.find(f=>f.uid===a.target).lock=i;
 log(s,'応援チップ効果：'+({draw:'1枚ドロー',refresh:'全員を未行動に',lock:'独占チップを配置'}[a.effect]));finish(s);return s;
 }
 if(a.type==='play'){
 const at=p.hand.findIndex(c=>c.uid===a.card);if(at<0)throw Error('カードがありません');
 const c=p.hand[at],d=song(c),actors=a.actors||[];
 if(!playOK(s,i,c,actors,a.mode))throw Error('必要人数と指定メンバーを選んでください');
 if(a.mode==='fan'&&p.vol<d.need)throw Error('必要ボルテージが足りません');
 if(a.boost&&!(a.mode==='fan'&&c.owner==='natsume'&&c.n<3))throw Error('追加支払いができません');
 if(a.pick&&!(a.mode==='fan'&&c.owner==='rai'))throw Error('選択獲得ができません');
 if(a.pick&&c.n===1&&p.chips<1)throw Error('応援チップが足りません');
 p.hand.splice(at,1);p.memory.push(c);p.songsPlayed=(p.songsPlayed||0)+1;actors.forEach(j=>p.ready[j]=false);log(s,(i?'CPU':'あなた')+'「'+d.name+'」'+(a.mode==='vol'?' vol＋'+d.vol+'％':' fan'));
 if(a.mode==='vol'){
 if(c.owner==='emi')s.queue.push({kind:'emiBottom',p:i});
 if(c.owner==='kayo')s.queue.push({kind:'draw',p:i});
 if(c.owner==='hana')s.queue.push({kind:'chip',p:i});
 if(c.owner==='haru'&&c.n===3)dream(s);
 if(c.owner==='hakka')meat(s,p);
 s.queue.push({kind:'vol',p:i,n:d.vol});
 }else{
 let n=fanCount(p,c);p.buff=0;
 if(a.boost){voltage(p,-10);n++;}
 if(a.pick&&c.n===1)p.chips--;
 if(c.owner==='haru'&&c.n<3)dream(s);
 if(c.owner==='hakka'&&c.n===3)meat(s,p);
 if(c.owner==='homura')s.queue.push({kind:'mutePick',p:i,left:c.n===3?2:1,selected:[]});
 if(c.owner==='emi'&&c.n===3)s.queue.push({kind:'emiBottom',p:i});
 if(c.owner==='machi')s.queue.push({kind:'machiRemove',p:1-i,random:c.n===3});
 if(c.owner==='hana'&&c.n===3)s.queue.push({kind:'chip',p:i});
 if(a.pick)s.queue.push({kind:'raiPick',p:i,peek:c.n===3,count:c.n===3?2:1});else s.queue.push({kind:'normal',p:i,n});
 }
 if(c.owner==='akina')s.queue.push({kind:'akinaReturn',p:i,card:c.uid});
 if(c.owner==='aya'&&c.n>1&&a.mode==='fan')s.queue.push({kind:'ayaReady',p:i,cost:c.n===2?20:30,all:c.n===3});
 if(c.owner==='hikari'&&(a.mode==='fan'||c.n===3))s.queue.push({kind:'hikariCycle',p:i,count:c.n===3?2:1});
 process(s);return s;
 }
 if(a.type==='event'){
 const id=a.id,d=EVENTS[id];if(!d||!eventOK(s,i,id))throw Error('イベントの使用条件を満たしていません');
 const paid=a.memory||[];
 if(!paymentOK(p,id,paid))throw Error('メモリーの支払い条件を確認してください');
 if(id==='kayo'&&(!(a.discard?.length>=1&&a.discard.length<=3)||(a.discard||[]).some(x=>!p.hand.some(c=>c.uid===x))||new Set(a.discard||[]).size!==(a.discard||[]).length))throw Error('捨てる手札を確認してください');
 if(id==='emi'&&(!s.players[1-i].fans.some(f=>f.uid===a.target&&fanPoints(s.players[1-i],f)===1)||fansProtected(s,1-i,i)))throw Error('相手の1ポイントの観客を選んでください');
 if(id==='hana'&&(!Number.isInteger(a.actor)||p.ready[a.actor]!==false))throw Error('行動済みのアイドルを選んでください');
 if(id==='machi'&&((a.targets||[]).some(x=>!unlocked(s,i).some(f=>f.uid===x))||new Set(a.targets||[]).size!==(a.targets||[]).length))throw Error('戻す観客を確認してください');
 if(id==='rai'&&(!s.row.some(f=>f.uid===a.target&&(f.lock===null||f.lock===i))||!s.audience.some(f=>f.type==='core')))throw Error('交換できるコアファンまたは観客がありません');
 if(id==='switch'&&(!p.team.includes(a.leader)||a.leader===p.leader))throw Error('別のリーダーを選んでください');
 if(id==='akina'&&((a.targets||[]).some(x=>!p.hand.some(c=>c.uid===x))||new Set(a.targets||[]).size!==(a.targets||[]).length))throw Error('メモリーに置く手札を確認してください');
 if(id==='wit'&&!p.hand.some(c=>c.uid===a.hand))throw Error('手札を1枚選んでください');
 const ayaCount=ayaEventCount(p),discardBefore=p.discard.length,whiteTrigger=p.leader==='hakka';const spending=p.memory.filter(c=>paid.includes(c.uid));p.items=items(p).filter(c=>!paid.includes(c.uid));p.memory=p.memory.filter(c=>!paid.includes(c.uid));if(id!=='hikari')p.discard.push(...spending);p.events.find(e=>e.id===id).used=!d.repeat;p.events.find(e=>e.id===id).lastTurn=s.turn;log(s,(i?'CPU':'あなた')+' EVENT「'+d.event+'」');
 if(id==='kayo'){const cards=p.hand.filter(c=>(a.discard||[]).includes(c.uid));p.hand=p.hand.filter(c=>!(a.discard||[]).includes(c.uid));p.discard.push(...cards);s.queue.push({kind:'normal',p:i,n:Math.min(3,cards.length+p.buff+(p.cardBuff||0))});p.buff=0;}
 if(id==='machi'){const targets=s.row.filter(f=>(a.targets||[]).includes(f.uid));for(const f of targets)moveOut(s,f);s.audience.push(...shuffle(s,targets));fill(s);}
 if(id==='redo'){const cards=unlocked(s,i);for(const f of cards)moveOut(s,f);s.audience.push(...cards);shuffle(s,s.audience);fill(s);}
 if(id==='switch'){s.row.forEach(f=>{if(f.lock===i)f.lock=null;});p.buff=0;p.leader=a.leader;log(s,'リーダー変更：'+CHAR[p.leader].name);}
 if(id==='trouble'){for(const [who,n] of [[i,1],[1-i,2]]){if(fansProtected(s,who,i))continue;for(let j=0;j<n&&s.players[who].fans.length;j++){const list=s.players[who].fans;removeFan(s,who,list[Math.floor(rng(s)*list.length)].uid,i);}}}
 if(id==='overcome')draw(s,i,2);
 if(id==='viewing')p.liveViewing=true;
 if(id==='mc')p.fanShield=true;
 if(id==='akina'){const cards=p.hand.filter(c=>(a.targets||[]).includes(c.uid));p.hand=p.hand.filter(c=>!(a.targets||[]).includes(c.uid));p.memory.push(...cards);log(s,'秋奈：手札の楽曲'+cards.length+'枚をメモリーに置いた');}
 if(id==='wit'){const at=p.hand.findIndex(c=>c.uid===a.hand);p.memory.push(p.hand.splice(at,1)[0]);draw(s,i);}
 if(id==='haru'){const list=[...unlocked(s,i),...(fansProtected(s,1-i,i)?[]:s.players[1-i].fans)].filter(f=>f.type==='dream');gain(s,i,list);}
 if(id==='hakka'){const n=2+Math.floor(p.memory.length/3);p.fanChips=(p.fanChips||0)+n;p.discard.push(...p.memory);p.memory=[];log(s,'ファンチップ＋'+n+'（1つにつき1ポイント）');}
 if(id==='homura'){s.deckMuteTurn=s.turn;s.audience.forEach(f=>f.muted=true);p.cardBuff=(p.cardBuff||0)+1;}
 if(id==='natsume')p.eventBuff++;
 if(id==='shio')p.temp+=7;
 if(id==='emi')exchangeFan(s,1-i,a.target,'anti');
 if(id==='aya'){log(s,'彩：観客1人の獲得を'+ayaCount+'回繰り返す');for(let j=0;j<ayaCount;j++)s.queue.push({kind:'normal',p:i,n:1});}
 if(id==='hikari'){const n=Math.floor(discardBefore/2);p.temp+=n;log(s,'WHITEOUT：使用前の捨て札'+discardBefore+'枚で、このターン＋'+n+'ポイント');p.discard.push(...spending);}
 if(id==='hana')p.ready[a.actor]=true;
 if(id==='rai'){const at=s.row.findIndex(f=>f.uid===a.target),old=s.row[at],core=s.audience.find(f=>f.type==='core');s.audience=s.audience.filter(f=>f.uid!==core.uid);old.lock=null;s.audience.push(old);s.row[at]=core;shuffle(s,s.audience);}
 if(whiteTrigger)s.queue.push({kind:'hakkaReady',p:i});
 process(s);return s;
 }
 throw Error('不明な操作です');
}
function playOK(s,i,c,selected,mode){const p=s.players[i],a=selected||[];return s.winner===null&&!s.pending&&s.active===i&&p.hand.some(x=>x.uid===c.uid)&&['vol','fan'].includes(mode)&&a.length===c.n&&new Set(a).size===c.n&&a.every(j=>Number.isInteger(j)&&j>=0&&j<3&&p.ready[j])&&a.some(j=>p.team[j]===c.owner)&&(mode!=='fan'||p.vol>=song(c).need);}
function actors(p,c){const own=p.team.indexOf(c.owner);if(!p.ready[own])return null;const a=[own];for(let j=0;j<3&&a.length<c.n;j++)if(j!==own&&p.ready[j])a.push(j);return a.length===c.n?a:null;}
function estimate(s,i,n){
 const list=unlocked(s,i).slice(0,n).map(f=>({...f}));
 let val=0;for(const f of list){val+=fanPoints(s.players[i],f);if(!f.muted&&f.type==='cheer')val+=.3;if(!f.muted&&f.type==='heavy')val-=.25;}
 for(const f of list.filter(f=>f.type==='trouble'&&!f.muted)){const other=list.filter(x=>x!==f&&!x.removed);if(other.length){other.sort((a,b)=>fanPoints(s.players[i],b)-fanPoints(s.players[i],a));other[0].removed=true;val-=fanPoints(s.players[i],other[0]);}}
 val+=Math.max(0,n-list.length)*.95;return Math.max(0,val);
}
function autoPay(p,id){const d=EVENTS[id],cards=paymentCards(p),req=cards.filter(c=>c.owner===id).slice(0,d.cost[0]);for(const c of items(p))if(req.length<d.cost[0])req.push(c);return [...req,...cards.filter(c=>!req.includes(c)).slice(0,d.cost[1]-req.length)].map(c=>c.uid);}
function fanCount(p,c){return song(c).fan+p.buff+p.eventBuff+(p.cardBuff||0)+(p.leader==='natsume'&&c.n===3?1:0)+(c.owner==='haru'&&c.n===3&&p.fans.filter(f=>f.type==='dream').length>=2?1:0);}

function ai(s){
 if(s.pending){const z=s.pending,p=s.players[z.p];

 if(z.kind==='akinaDraw'){const cs=p.deck.slice(0,3).filter(c=>z.options.includes(c.uid));cs.sort((a,b)=>(a.n+(p.hand.some(c=>c.owner===a.owner&&c.n===a.n)?3:0))-(b.n+(p.hand.some(c=>c.owner===b.owner&&c.n===b.n)?3:0)));return {type:'choose',value:cs[0].uid};}
 if(z.kind==='akinaReturn'){const c=p.memory.find(c=>c.uid===z.card),keepForPayment=p.events.some(e=>e.id==='akina'&&!e.used)&&p.memory.filter(c=>c.owner==='akina').length<=2,duplicate=c&&p.hand.some(h=>h.owner===c.owner&&h.n===c.n);return {type:'choose',value:c&&!keepForPayment&&!duplicate?'return':'skip'};}
 if(z.kind==='emiConvert')return {type:'choose',value:p.chips>=2?z.options.find(x=>x!=='skip')||'skip':'skip'};
 if(z.kind==='emiBottom'){const f=s.row.find(f=>z.options.includes(f.uid)&&(fanPoints(p,f)<1||f.type==='heavy'||f.type==='trouble'&&p.leader!=='emi'));return {type:'choose',value:f?.uid||'skip'};}
 if(z.kind==='ayaReady'){const ready=[...p.ready];p.team.forEach((id,j)=>{if(id!=='aya')ready[j]=true;});const needed=p.hand.filter(c=>actors({...p,ready},c));const opts=z.options.filter(x=>x!=='skip');return {type:'choose',value:needed.length?(z.all?'all':opts.find(x=>needed.some(c=>c.owner===p.team[Number(x)]))||opts[0]):'skip'};}
 if(z.kind==='hikariOffer')return {type:'choose',value:p.deck.length>z.count?'accept':'skip'};
 if(z.kind==='hikariDiscard')return {type:'choose',value:p.hand.filter(c=>z.options.includes(c.uid)).sort((a,b)=>b.n-a.n)[0].uid};
 if(z.kind==='recover')return {type:'choose',value:[...p.discard].filter(c=>z.options.includes(c.uid)).sort((a,b)=>a.n-b.n)[0].uid};
 if(z.kind==='raiPick'&&(z.count||1)>1){const pool=[...s.row,...s.audience.slice(0,2)],fixed=pool.filter(f=>z.selected?.includes(f.uid)),options=pool.filter(f=>z.options.includes(f.uid));let best=null,value=-Infinity;for(let j=0;j<options.length;j++){const candidates=fixed.length?[fixed.concat(options[j])]:options.slice(j+1).map(f=>[options[j],f]);for(const pair of candidates){const v=estimate({...s,row:pair},z.p,pair.length);if(v>value){value=v;best=options[j];}}}return {type:'choose',value:(best||options[0]).uid};}
 if(z.kind==='hakkaReady')return {type:'choose',value:z.options.find(x=>x!=='skip')||'skip'};
 if(z.kind==='mutePick'){const fs=s.row.filter(f=>z.options.includes(f.uid)&&['trouble','heavy'].includes(f.type));return {type:'choose',value:fs[0]?.uid||'skip'};}
 if(z.kind==='shio')return {type:'choose',value:p.vol<90||p.vol>=150&&p.vol<180?'vol':'chip'};
 if(z.kind==='trouble'||z.kind==='machiRemove'){const fs=p.fans.filter(f=>z.options.includes(f.uid)).sort((a,b)=>FAN[a.type].points-FAN[b.type].points);return {type:'choose',value:fs[0].uid};}
 const fs=[...s.row,...s.audience.slice(0,2)].filter(f=>z.options.includes(f.uid)).sort((a,b)=>(FAN[b.type].points+(b.type==='cheer'?.3:0))-(FAN[a.type].points+(a.type==='cheer'?.3:0)));
 return {type:'choose',value:fs[0].uid};
 }
 const i=s.active,p=s.players[i],ready=p.ready.filter(Boolean).length,volTarget=p.events.some(e=>e.id==='shio'&&!e.used)?180:100;
 const ev=(id,extra={})=>({type:'event',id,memory:autoPay(p,id),...extra});
 if(p.leader==='hikari'&&!p.hikariSkillUsed&&p.vol>=100&&p.hand.length>=4&&(ready===0||p.chips<2&&p.hand.length>=6))return {type:'leaderSkill',discard:[...p.hand].sort((a,b)=>b.n-a.n).slice(0,3).map(c=>c.uid)};
 if(eventOK(s,i,'akina')){const candidates=p.hand.filter(c=>c.n===3||p.hand.filter(h=>h.owner===c.owner&&h.n===c.n).length>1);if(candidates.length&&((p.leader==='hakka'&&p.ready.some(x=>!x)&&p.hand.some(c=>p.vol>=song(c).need))||p.hand.length>6&&p.events.some(e=>e.id!=='akina'&&!e.used)))return ev('akina',{targets:candidates.slice(0,3).map(c=>c.uid)});}
 if(eventOK(s,i,'emi'))return ev('emi',{target:(s.players[1-i].fans.find(f=>fanPoints(s.players[1-i],f)===1&&f.type==='trouble')||s.players[1-i].fans.find(f=>fanPoints(s.players[1-i],f)===1)).uid});
 if(eventOK(s,i,'aya')&&ayaEventCount(p)>0&&(ayaEventCount(p)>=3||score(p)+ayaEventCount(p)>=20||!p.deck.length))return ev('aya');
 if(eventOK(s,i,'hikari')&&score(p)+Math.floor(p.discard.length/2)>=20)return ev('hikari');
 if(eventOK(s,i,'viewing')&&!p.liveViewing)return ev('viewing');
 if(eventOK(s,i,'overcome')&&p.deck.length&&p.hand.length<6)return ev('overcome');
 if(eventOK(s,i,'mc')&&p.fans.length&&!p.fanShield)return ev('mc');
 if(eventOK(s,i,'haru')&&[...unlocked(s,i),...(fansProtected(s,1-i,i)?[]:s.players[1-i].fans)].some(f=>f.type==='dream'))return ev('haru');
 if(eventOK(s,i,'hakka')&&(score(p)+2+Math.floor((p.memory.length-autoPay(p,'hakka').filter(x=>p.memory.some(c=>c.uid===x)).length)/3)>=20||p.memory.length>=7||!p.deck.length))return ev('hakka');
 if(eventOK(s,i,'homura')&&p.hand.some(c=>actors(p,c)&&p.vol>=song(c).need))return ev('homura');
 if(eventOK(s,i,'wit')&&p.deck.length)return ev('wit',{hand:[...p.hand].sort((a,b)=>b.n-a.n)[0].uid});
 if(eventOK(s,i,'trouble')&&!fansProtected(s,1-i,i)&&s.players[1-i].fans.length>=2)return ev('trouble');
 if(eventOK(s,i,'redo')&&unlocked(s,i).filter(f=>f.type==='trouble').length>=2)return ev('redo');
 if(eventOK(s,i,'switch')&&p.leader==='rai'&&p.team.includes('natsume')&&p.vol>=100)return ev('switch',{leader:'natsume'});
 if(eventOK(s,i,'shio')&&score(p)>=13)return ev('shio');
 if(eventOK(s,i,'kayo')&&p.hand.length>=3&&(estimate(s,i,p.hand.length)>=20-score(p)||p.hand.length>=5))return ev('kayo',{discard:[...p.hand].sort((a,b)=>b.n-a.n).slice(0,3).map(c=>c.uid)});
 if(eventOK(s,i,'natsume')&&p.hand.some(c=>actors(p,c)&&p.vol>=song(c).need))return ev('natsume');
 if(eventOK(s,i,'machi')){
 const bad=unlocked(s,i).filter(f=>f.type==='trouble'||f.type==='heavy'&&p.vol<100);if(bad.length)return ev('machi',{targets:bad.map(f=>f.uid)});
 }
 if(eventOK(s,i,'rai')&&s.audience.some(f=>f.type==='core')){
 const target=unlocked(s,i).find(f=>f.type==='trouble'||f.type==='light');if(target&&p.hand.some(c=>actors(p,c)&&p.vol>=song(c).need))return ev('rai',{target:target.uid});
 }
 if(p.leader==='rai'&&p.chips>=1&&!s.row.some(f=>f.lock===i)){
 const core=unlocked(s,i).find(f=>f.type==='core'&&f.lock===null);
 if(core&&(p.vol<60||ready===0))return {type:'support',effect:'lock',target:core.uid};
 }
 let best=null,bestValue=-1;
 for(const c of p.hand){
 const aa=actors(p,c);if(!aa)continue;const d=song(c);
 if(p.vol<d.need||volTarget===180&&p.vol<180){
 const value=Math.min(d.vol,Math.max(0,volTarget-p.vol))/d.n*.12+(c.owner==='kayo'?.9:c.owner==='hana'?.5:c.owner==='hakka'?.7:0);
 if(value>bestValue){bestValue=value;best={type:'play',card:c.uid,actors:aa,mode:'vol'};}
 }
 if(p.vol>=d.need){
 const n=fanCount(p,c),boost=c.owner==='natsume'&&c.n<3&&p.vol>=d.need+10;
 let value=estimate(s,i,n+(boost?1:0))/d.n+(c.owner==='machi'&&s.players[1-i].fans.length?.8/d.n:0)+(c.owner==='hana'&&c.n===3?.2:0);
 if(estimate(s,i,n+(boost?1:0))+score(p)>=20)value+=50;
 let pick=false;
 if(c.owner==='rai'&&(c.n!==1||p.chips>=1)){
 const row=unlocked(s,i);let top=Math.max(0,...row.map(f=>fanPoints(p,f)));if(c.n===3){top=0;for(let j=0;j<row.length;j++)for(let k=j+1;k<row.length;k++)top=Math.max(top,estimate({...s,row:[row[j],row[k]]},i,2));}if(top/d.n>value){value=top/d.n;pick=true;}
 }
 if(value>bestValue){bestValue=value;best={type:'play',card:c.uid,actors:aa,mode:'fan',boost,pick};}
 }
 }
 if(best&&bestValue>.05)return best;
 if(p.chips>=6&&ready<2&&p.hand.some(c=>p.vol>=song(c).need))return {type:'support',effect:'refresh'};
 if(eventOK(s,i,'hana')){
 const at=p.ready.findIndex((r,j)=>!r&&p.hand.some(c=>c.owner===p.team[j]&&c.n<=ready+1));if(at>=0)return ev('hana',{actor:at});
 }
 if(p.chips>=2&&p.deck.length&&(p.hand.length<4||ready>0))return {type:'support',effect:'draw'};
 if(p.service<2&&ready)return {type:'service',actor:p.ready.findIndex(Boolean)};
 return {type:'end'};
}
// Deterministic timeout: finish already-triggered choices, then end this turn.
function timeout(s){if(s.winner!==null)return s;process(s);const turn=s.turn;let guard=0;while(s.pending&&s.turn===turn&&s.winner===null){if(++guard>512)throw Error('効果の自動処理が上限に達しました');dispatch(s,{type:'choose',value:s.pending.options[0]});}if(s.winner===null&&s.turn===turn){log(s,'99秒経過：未確定の操作を取り消してターン終了');dispatch(s,{type:'end'});}return s;}
function validateAction(a){if(!a||typeof a!=='object'||Array.isArray(a))throw Error('操作が不正です');const str=x=>typeof x==='string'&&x.length>0&&x.length<=60,ids=x=>Array.isArray(x)&&x.length<=256&&x.every(str),actor=x=>Number.isInteger(x)&&x>=0&&x<3;let out={type:a.type};
 if(a.type==='end')return out;
 if(a.type==='leaderSkill'&&ids(a.discard)&&a.discard.length===3)return {...out,discard:[...a.discard]};
 if(a.type==='choose'&&str(a.value))return {...out,value:a.value};
 if(a.type==='service'&&actor(a.actor))return {...out,actor:a.actor};
 if(a.type==='support'&&['draw','refresh','lock'].includes(a.effect)&&(a.effect!=='lock'||str(a.target)))return {...out,effect:a.effect,...(a.target?{target:a.target}:{})};
 if(a.type==='play'&&str(a.card)&&['vol','fan'].includes(a.mode)&&Array.isArray(a.actors)&&a.actors.length<=3&&a.actors.every(actor)&&[a.boost,a.pick].every(x=>x===undefined||typeof x==='boolean'))return {...out,card:a.card,mode:a.mode,actors:[...a.actors],boost:!!a.boost,pick:!!a.pick};
 if(a.type==='event'&&typeof a.id==='string'&&Object.hasOwn(EVENTS,a.id)&&ids(a.memory)&&[a.discard,a.targets].every(x=>x===undefined||ids(x))&&[a.target,a.hand,a.leader].every(x=>x===undefined||x===null||str(x))&&(a.actor===undefined||a.actor===null||actor(a.actor)))return {...out,id:a.id,memory:[...a.memory],discard:a.discard||[],targets:a.targets||[],target:a.target,hand:a.hand,leader:a.leader,actor:a.actor};
 throw Error('操作が不正です');}
function peerAction(s,a,i){if(s.winner!==null)throw Error('ライブは終了しています');if((s.pending?.p??s.active)!==i)throw Error('相手の手番です');const clean=validateAction(a),copy=JSON.parse(JSON.stringify(s));dispatch(copy,clean);return copy;}
function publicView(s,i){const v=JSON.parse(JSON.stringify(s)),remap=x=>x===null?null:x===i?0:1;delete v.seed;delete v.serial;delete v.clock;v.queue=[];v.audienceCoreCount=s.audience.filter(f=>f.type==='core').length;
 const peek=s.players[i].leader==='kayo'&&s.active===i;v.audience=s.audience.map((f,j)=>peek&&j===0||j<2&&s.pending?.p===i&&s.pending.kind==='raiPick'&&(s.pending.options.includes(f.uid)||s.pending.selected?.includes(f.uid))?{...f}:{uid:'hidden-a-'+j,type:null,lock:null});
 v.players=[i,1-i].map((who,j)=>{const p=JSON.parse(JSON.stringify(s.players[who]));p.deck=p.deck.map((c,k)=>j===0&&s.pending?.p===i&&s.pending.kind==='akinaDraw'&&k<3?{...c}:{uid:'hidden-d-'+j+'-'+k});if(j){p.hand=p.hand.map((_,k)=>({uid:'hidden-h-'+k}));p.events=p.events.map(e=>e.used?e:{id:null,used:false,lastTurn:null});}for(const f of p.fans)f.lock=remap(f.lock);return p;});
 v.row.forEach(f=>f.lock=remap(f.lock));v.active=remap(s.active);v.first=remap(s.first);v.winner=remap(s.winner);if(v.pending){v.pending.p=remap(s.pending.p);if(s.pending.p!==i){v.pending.options=[];if(v.pending.selected)v.pending.selected=[];v.pending.text='相手が効果を選択しています';}}
 v.log=v.log.map(t=>t.replace(/あなた|CPU/g,x=>(x==='あなた'?0:1)===i?'あなた':'相手'));return v;}
return {CHAR,COMMON,EVENTS,FAN,song,detail,create,dispatch,playOK,score,fanPoints,fanCount,items,fansProtected,ayaEventCount,paymentCards,paymentOK,eventOK,actors,autoPay,ai,estimate,timeout,validateAction,peerAction,publicView};
})();



export {IDOL};
