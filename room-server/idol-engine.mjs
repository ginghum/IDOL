/* IDOL shared rules engine. */
const IDOL = (() => {
const CHAR = {
kayo:{skillName:'檻の向こうを見つめて',name:'小鳥遊佳代',short:'佳代',color:'#6179ed',vol:30,hand:5,skill:'自分のターン開始時、ドロー前の手札が4枚以下なら、1枚のかわりに2枚ドローする。',songs:['欲望の檻','鎖に囲まれて','革命は始まる'],event:'レヴォリューション・ラピスラズリ',cost:[3,5],effect:'手札を1〜3枚捨て、その枚数の観客を先頭からまとめて獲得。追加強化を含め獲得は最大3枚。'},
machi:{skillName:'世界は私の観客席',name:'芥川麻智',short:'麻智',color:'#b47fe3',vol:30,hand:5,skill:'自分のターン開始時、互いのメモリー合計が10枚以上なら、観客ゾーンから好きな1枚を獲得。',songs:['我信','摩天楼','支配者の景色'],event:'God.Of.Dominant',cost:[2,4],effect:'観客ゾーンから好きな枚数を選び、ランダムな順番で観客デッキの下へ戻す。'},
natsume:{skillName:'感動に定員なし！',name:'険崎夏芽',short:'夏芽',color:'#d8993d',vol:40,hand:5,skill:'自分の3人用楽曲のファン獲得枚数＋1。',songs:['ウェイヨ！','ノってけピーポー！','感動はもうすぐソコに！'],event:'求道エモ駆動',cost:[1,3],effect:'このターン中、自分の楽曲のファン獲得枚数＋1。'},
shio:{skillName:'興が乗っちゃって',name:'雲居時尾',short:'時尾',color:'#4faaa0',vol:30,hand:5,skill:'声援チップを得る時、1枚ごとに、代わりにボルテージ＋10％を選べる。',songs:['旅人','謳歌賛歌','遊楽道中'],event:'常盤戯ノ宴',cost:[3,8],effect:'自分のボルテージが180％以上ならこのターン7ポイント、そうでなければこのターン3ポイントを得る。'},
rai:{skillName:'欲しけりゃ、奪ってみろ',name:'赤兎雷',short:'雷',color:'#d97382',vol:30,hand:5,skill:'独占チップ1枚を持つ。追加声援効果：声援チップ2枚で観客1枚に独占チップを置く。相手はそれを飛ばして獲得し、相手の効果では移動できない。',songs:['雷鳴','暴れハート','運命命運破壊音'],event:'アイアム・デストロイヤー',cost:[2,3],effect:'観客デッキのコアファン1枚と観客ゾーンの1枚を交換し、観客デッキをシャッフル。'},
hana:{skillName:'君の拍手で、今日をつなぐ',name:'入間華',short:'華',color:'#e07aa6',vol:30,hand:5,skill:'声援チップ効果を使うたび、このターンの次のファン獲得枚数＋1。累積し、ファン獲得時にまとめて消費。',songs:['招待状','紅いカーテン','君と私の平和条約'],event:'ピース・ピース・サーカスドーム',cost:[1,3],effect:'自分の行動済みアイドル1人を未行動にする。'},
haru:{skillName:'夢のつづきを、もう一度',name:'福園春',short:'春',color:'#b488db',vol:30,hand:5,skill:'自分のターン開始時、声援チップ1枚を支払ってもよい。そうしたら、捨て札の楽曲1枚を選び、手札に加える。',songs:['虹空','夢見るだけじゃ足りないの','ふわふわ理想郷へようこそ！'],event:'ゆめかわ★ゆーとぴあ',cost:[2,5],effect:'観客席と相手の獲得済みエリアにある「ゆめかわファン」を全てまとめて獲得する。相手の独占付き観客は除く。'},
hakka:{skillName:'冒険はこれからだ！',name:'一条白花',short:'白花',color:'#ca9944',vol:30,hand:5,skill:'イベント発動時、行動済みの自分のアイドル1人を未行動にしてもよい。',songs:['八戒','天下御免','黄金冒険譚'],event:'地獄極楽感謝祭',cost:[4,4],effect:'ファンチップを3つ得る。その後、残りの自分のメモリーを全て捨て、こうして捨てた楽曲3枚につきファンチップを1つ得る。'},
homura:{skillName:'皆の願いが希望だにょ',name:'紅松焔',short:'焔',color:'#df5a4f',vol:30,hand:4,skill:'自分のターン開始時、声援チップを1つ得る。',songs:['駆け抜ける炎','ヒーロー登場だにょ！','希望の翼をブレイブオン'],event:'ジャスティス・Z・ハリケーン',cost:[3,6],effect:'このターン、観客山札のカードは効果を失い、自分のカードの獲得ファン数＋1。既に観客席にあるカードには無効化しない。'},
hikari:{skillName:'怖いからこそ、全速力！',name:'轍光',short:'光',color:'#dfb638',vol:30,hand:6,skill:'ゲーム中に1度、自分のターン中、VOL100％以上のときに手札を3枚選んで捨てると、声援チップを6枚得る。VOLは消費しない。',songs:['とびこめ、未体験！','衝動アクセラレーター','未知数ジャックポット'],event:'WHITEOUT',cost:[3,6],effect:'使用前の自分の捨て札3枚につき、このターン1ポイントを得る。効果の計算後、支払いに使ったメモリーを捨て札に置く。'},
aya:{skillName:'私にできること、全部',name:'宝槻彩',reading:'ほうつきあや',short:'彩',color:'#a83d4e',vol:30,hand:5,skill:'自分のターン終了時、このターンに手札から楽曲カードを3枚以上使用していたら、ファンチップを2枚得る。',songs:['SAI','彩から、あなたへ。','誰かのための天才'],event:'名もなき才に、喝采を。',cost:[3,5],effect:'使用前の自分のメモリーと捨て札にある1人用楽曲の合計枚数だけ、観客を1人ずつ獲得する（最大6回）。毎回、観客効果と補充を処理する。獲得枚数の増加は適用しない。'},
emi:{skillName:'あなたも、救われる。',name:'黒曜恵美',reading:'こくようえみ',short:'恵美',color:'#786b88',vol:30,hand:5,skill:'自分のターン開始時、声援チップ2枚を支払ってもよい。そうした場合、自分の獲得済みの厄介なファン1枚を信者（3ポイント）と入れ替える。',songs:['唯一神','使命至上主義','愛憎奉納IDOLSTAGE'],event:'BLACK×MISSIONS',cost:[3,5],effect:'相手の獲得済みの1ポイントの観客1枚を選び、アンチ（－3ポイント）と入れ替える。交換元はゲーム外に置く。ファンチップは対象外。'} ,
akina:{skillName:'私なりの最適解',name:'弓城秋奈',reading:'ゆみしろあきな',short:'秋奈',color:'#e99747',vol:30,hand:5,skill:'ターン開始時のドローは、山札の上から最大3枚を見て1枚選ぶ。残りを山札に戻し、山札全体をシャッフルする。初期手札や他のドローには適用しない。',songs:['白chu夢','可愛いの論証','幸福追求エクスキューズ'],event:'真実は嘘より奇なり',cost:[1,1],repeat:true,unlimited:true,effect:'手札の楽曲カードを好きな枚数（0枚も可）、メモリーに置く。使用するたびに秋奈1メモリーを支払い、同じターンでも何度でも使える。'},
moe:{skillName:'どうぞ、ごゆっくり。',name:'西藤萌',reading:'にしふじもえ',short:'萌',color:'#8052ab',vol:30,hand:5,skill:'声援効果を追加：声援チップ3枚で、相手の行動済みアイドル1人を選ぶ。次の相手ターン開始時、そのアイドルは未行動に戻らない。自分のターン中、回数制限なし。同じアイドルへの重複指定はできず、カード効果による未行動化は可能。',songs:['Dear Friends','In My Care','Between Us'],event:'信じてくれるなら',cost:[2,5],effect:'このターン、必要な声援チップが3枚以下の声援効果を、コストを支払わずに合計3回まで使ってもよい。'},
nina:{skillName:'大げさじゃない、この幸せ',name:'街角仁奈',reading:'まちかどにな',short:'仁奈',color:'#c12e73',vol:30,hand:5,skill:'自分がライトファンを1枚獲得するたび、声援チップを1つ得る。',songs:['等身大リアル','今イズマイ頂点','世界は私のお気に入り'],event:'枕の横のテディベア',cost:[2,4],effect:'手札のアイテム「くまのぬいぐるみ」1つにつき、ファンチップを1つ得る（最大3つ）。ぬいぐるみは消費しない。'},
fukurou:{skillName:'お静かに、患者様',name:'月田フクロウ',reading:'つきたふくろう',short:'フクロウ',color:'#92b6ce',vol:30,hand:5,skill:'相手が観客カードを獲得したとき、そのターン終了時まで、相手の声援効果を封印する。',songs:['執刀開始','魔神改造','人間卒業記念日'],event:'摘出カーテンコール',cost:[2,6],effect:'相手の声援チップを最大6枚奪う。'},
ayame:{skillName:'退屈以外は大歓迎！',name:'美澄あやめ',reading:'みすみあやめ',short:'あやめ',color:'#70a787',vol:30,hand:5,skill:'自分のターン終了時、声援チップ2枚を捨ててもよい。そうしたら、くじ引き券を1枚得る。',songs:["C'mon！",'王冠だって遊び道具','筋書きどおりはつまんない！'],event:'Freeeeeedom!!',cost:[4,7],effect:'アイテム「くじ引き券」を5枚得る。'},
mimizuku:{skillName:'任務を遂行します！',name:'月田ミミズク',reading:'つきたみみずく',short:'ミミズク',color:'#a58ac5',vol:20,hand:5,skill:'自分のターン終了時、声援チップ1枚を捨ててもよい。そうしたら、相手は自身の手札の楽曲を1枚選んで捨てる。相手の楽曲手札がない場合は使用できない。',songs:['霧影','SHADOW CHASER','未踏前夜'],event:'ざこどもちゃれんじ！',cost:[4,6],effect:'観客山札の上から最大5枚を見て、その中にある自分にとって1ポイントの観客を全てまとめて獲得する。この獲得では観客効果は発動しない。残りを観客山札に戻し、山札全体をシャッフルする。'},
shiro:{skillName:'色が音になる時',name:'五百瀬しろ',reading:'いもせしろ',short:'しろ',color:'#e9a069',vol:30,hand:5,skill:'自分のターン開始時、相手の手札を確認する。「塗りつぶされたカード」が2枚以上あれば、ファンチップを1枚得る。',songs:['ひとしずくの音色','シナスタジア','画布の裏の月'],event:'Chroma & Crescent',cost:[2,4],effect:'相手の手札の「塗りつぶされたカード」を全て自分の手札に移し、「鳴り響く世界」に変化させる。'},
hibiki:{skillName:'鼓膜を揺らせ、夜を燃やせ',name:'足立響',reading:'あだちひびき',short:'響',color:'#d84c58',vol:30,hand:3,skill:'自分のターン開始時、VOL＋10％。響がリーダーの間、自分のVOL上限は400％になる。',songs:['爆響アンセム','フロアごと跳べ！','限界突破の大合唱'],event:'MAXIMUM!!!',cost:[4,6],effect:'自分のVOLが300％以上ならこのターン15ポイントを得る。そうでなければ声援チップ10枚を得る。VOLは消費しない。'},
misa:{skillName:'貴方に相応しい一杯',name:'大谷美沙',reading:'おおやみさ',short:'美沙',color:'#9c6bbe',vol:10,hand:4,skill:'自分のターン開始時、声援チップ1枚を支払ってもよい。そうしたら「青のドリンク」「赤のドリンク」から1つ選び、得る。',songs:['お好みは、甘め？','Twilight Blend','―完璧なる夜の過ごし方―'],event:'ヴェルベット＆ヴァイオレット',cost:[2,7],effect:'「紫のドリンク」を2本得る。ドリンクは自分のターン終了時に使用できる。'},
miyabi:{skillName:'無双の風となる',name:'不破雅',reading:'ふわみやび',short:'雅',color:'#526ba1',vol:30,hand:4,skill:'自分が楽曲をFANモードで使う際、必要VOLが20％下がる（最低0％）。',songs:['一閃','蒼龍の薙','花嵐、刃は舞う'],event:'春雷の誓い',cost:[1,3],effect:'残りのゲーム中、相手や観客の効果で自分のVOLは下がらない。自分の支払いとVOL上限の変更には適用しない。'},
kono:{skillName:'ほれ、これが商いの黄金律よ',name:'橘湖乃',reading:'たちばなこの',short:'湖乃',color:'#58a4aa',vol:30,hand:5,skill:'アイテム「現金」を2個持って始める。',songs:['千両箱','銭と縁','千客万来、夢舞台'],event:'踊子えるどらど',cost:[3,8],effect:'アイテム「現金」を6個得る。'},
chie:{skillName:'こんな私でも、変えられるなら',name:'弥生千詠',reading:'やよいちえ',short:'千詠',color:'#85828b',vol:30,hand:6,skill:'自分がイベントを使ったとき、ゲーム中に1度だけ、そのイベントを再使用可能に戻してもよい。再使用には再び支払いが必要。',songs:['ひとすじの勇気','名もなき織姫','呪いの経糸、祈りの緯糸'],event:'終わりをほどく',cost:[3,3],effect:'相手の獲得済み観客とファンチップを全てゲーム外へ置き、相手にファンチップ19枚を与え、現在のターンを終了する。相手が20点以上になったとき、敗北確定前に自動発動。自動でも支払いが必要。MCタイム・くまのぬいぐるみは有効。'},
kana:{skillName:'透明なまま流されて',name:'佐護河奈',reading:'さごかな',short:'河奈',color:'#c64d4d',vol:30,hand:6,skill:'自分の各ターン、最初に使用する河奈の楽曲は、声援チップを支払わずに漂流を使える。',songs:['ゼロ','無色透明','漂流FESTA'],event:'水にまかせてまた明日',cost:[1,3],effect:'支払い後に残った自分のメモリーの河奈の楽曲を好きな枚数捨てる。このターン、捨てた枚数分のポイントを得る。'},
tenko:{skillName:'頁をめくる仲間たち',name:'尊国天子',reading:'みくにてんこ',short:'天子',color:'#b78c5a',vol:30,hand:5,skill:'自分が2人用楽曲を使用するたび、声援チップを1枚得る。',songs:['天界追放','放課後経典探索','凸凹道中天を仰ぐ'],event:'天竺行脚録―友とめくる神話―',cost:[3,8],effect:'このターンの後、もう一度自分のターンを行う。'},
mitsuha:{skillName:'この街を愛する理由',name:'法師三葉',reading:'ほうしみつは',short:'三葉',color:'#c8a441',vol:30,hand:5,skill:'自分のターン開始時、観客席の先頭と観客山札の一番上を入れ替えてもよい。相手の独占付き観客は入れ替えられない。',songs:['風吹く交差点','夕暮れオレンジ','試練の鐘が鳴る街'],event:'この街はやさしさでできている',cost:[3,5],effect:'相手の独占付き観客を除く観客席のカードを山札の下へ置き、移動した枚数分の地元ファンを観客席に配置する。その後、fan＋1をその場で発動する。'},
mitama:{skillName:'迷いの影を振り払って',name:'十影美珠',reading:'とかげみたま',short:'美珠',color:'#9aa9c5',vol:20,hand:3,skill:'観客カードの追加効果を受けない。',songs:['積灰','袖を振る風になる','The Borrowed Light'],event:'捧ぐこの身に花束を',cost:[3,5],effect:'観客を2人獲得する。'},
riri:{skillName:'負け分までいただきます',name:'来栖梨里',reading:'くるすりり',short:'梨里',color:'#45935a',vol:30,hand:5,skill:'ゲーム中1度、相手が観客を獲得した直後、相手の獲得済みの厄介なファンが3枚以上なら、声援チップを4枚得る。観客の追加効果より先に判定する。',songs:['JOKER','罪と切り札','POISON PARADE'],event:'最後に笑うのは',cost:[2,8],effect:'自分の合計ポイントが相手より少ない場合のみ使用できる（同点は不可。一時ポイントも含め、再使用のたびに判定）。相手の獲得済み観客の枚数から3を引いた数だけ、このターンのポイントを得る（最低0、最大6ポイント）。獲得量の計算にファンチップは数えない。'},
chitose:{skillName:'勝ちどきは昼寝のあとで',name:'早乙女千登勢',reading:'さおとめちとせ',short:'千登勢',color:'#c8a646',vol:30,hand:5,skill:'自分のターン開始時、観客席の3番目に＋1チップを1枚置く。1枚につき1ポイント加算し、累積する。獲得後も残り、観客山札に戻ると取り除く。',songs:['The Gentle Fang','GOLDEN STRIDE','咆哮デッドヒート'],event:'SMILING LIONESS',cost:[3,10],effect:'相手のリーダーでないアイドル1人を選ぶ。そのアイドルは残りのゲーム中、ターン開始時に未行動に戻らない。カードや声援効果で未行動に戻すことはできる。'},
kokone:{skillName:'憧れは鳴りやまない',name:'皇狐々音',reading:'すめらぎここね',short:'狐々音',color:'#bb4689',vol:30,hand:4,skill:'自分のターン終了時、空のリハーサルに手札の2人用・3人用楽曲1枚を表向きで置いてもよい。',songs:['呼吸する都市','ネオンの脈拍','100万トンのスポットライト'],event:'レインボー・スパーク・シティ',cost:[3,9],effect:'リハーサルに楽曲があれば、そのFANをコストなしで2回発動する。なければ手札の楽曲1枚を置き、1回発動する。必要人数・指定メンバー・必要VOLを無視し、楽曲固有の追加効果は発動しない。使用後はメモリーに置く。'},
kazuna:{"name": "大地一凪", "reading": "だいちかずな", "short": "一凪", "color": "#9981dc", "vol": 30, "hand": 5, "skillName": "世界の片隅で、もう1度", "skill": "自分が目標を達成したとき、声援チップを追加で1枚得る。", "songs": ["水底のハミング", "群青の余白", "それでも、Blue Melody"], "event": "雨上がり、街はコードを奏でる", "cost": [0, 7], "effect": "次に自分が目標を達成したとき、ファンチップを追加で3枚得る。"},
mio:{"name": "青瀧澪", "reading": "あおたきみお", "short": "澪", "color": "#3987ae", "vol": 20, "hand": 5, "skillName": "舞台の光をじっと見つめて", "skill": "自分のターン終了時、経験チップを1枚得る（最大12枚）。", "songs": ["うすめた絵の具で、わたしを描く", "飛べない白鳥のワルツ", "澪 -MIO-"], "event": "ゼンマイ仕掛けのプリマドンナ", "cost": [2, 6], "effect": "経験チップを3枚得る（最大12枚）。"},
yuu:{"name": "宝槻釉", "reading": "ほうつきゆう", "short": "釉", "color": "#d74e56", "vol": 20, "hand": 6, "skillName": "計画なんていらない", "skill": "自分のターン開始時、前借りによってVOLが下がったら、カードを1枚引き、声援チップを2枚得る。", "songs": ["センス・オブ・なんとかなる", "丸投げスウィング", "おもしろ貯金、ただいま赤字"], "event": "フライング・ハッピー！", "cost": [2, 4], "effect": "次の自分のターン開始時、VOL＋30％、カードを2枚引く。前借りとリーダースキルの後に処理する。"},
chris:{"name": "クリスティアーナ・ジョンソン", "reading": "くりすてぃあーなじょんそん くりす", "short": "クリス", "color": "#bbc4db", "vol": 30, "hand": 5, "skillName": "積もる雪、白い夜", "skill": "自分のターン終了時、声援チップを2枚支払ってもよい。支払ったら財産を1枚得て、カードを1枚引く。", "songs": ["てのひらの灯", "足跡のぶんだけ、ぬくもりを", "エン・ティスト・ヴァルメ"], "event": "Hiljainen turva", "cost": [2, 6], "effect": "財産をすべて声援チップに戻す。戻した枚数2枚につき、ファンチップを1枚得る（端数切り捨て）。"},


};
const COMMON = {
request:{event:'リクエスト募集',short:'共通',color:'#5b9cb0',cost:[0,2],effect:'自分の山札の上から4枚を見る（4枚未満なら残り全部）。その中から1枚まで手札に加え、残りを戻して山札全体をシャッフルする。'},
solo:{event:'ソロスポット',short:'共通',color:'#cd8b46',cost:[0,4],effect:'このターン、次に自分が手札から使用する3人用楽曲は、指定メンバー本人1人だけで使用する。必要VOLと追加の支払いは通常どおり。3人用楽曲として扱う。指定メンバーのない特殊楽曲は対象外。'},
lastOrder:{event:'ラストオーダー',short:'共通',color:'#986da3',cost:[0,3],effect:'声援チップを3・6・9枚のいずれか支払う。3枚支払うごとにファンチップを1枚得る。声援効果ではない。'},
finale:{event:'静かなフィナーレ',short:'共通',color:'#597c8b',cost:[0,5],effect:'自分の行動済みアイドル1人につき、ファンチップを1枚得る。勝敗を判定し、決着しなければ自分のターンを終了する。通常のターン終了時効果も処理する。'},
duo:{event:'DUO',short:'共通',color:'#b76f88',cost:[0,4],effect:'リーダーではない自分のアイドル1人を選ぶ。残りのゲーム中、そのアイドルもリーダー扱いとなり、リーダースキルを使える。リーダーは最大2人。初期VOL・初期手札は再適用しない。同時に発動する能力は自分が順番を選ぶ。'},
scene:{event:'場面転換',short:'共通',color:'#5878a1',cost:[0,6],effect:'相手の非リーダーからランダムに1人を選び、そのアイドルに相手のリーダーを変更する。相手のリーダーが2人以上なら失敗する。失敗してもメモリーを支払い、使用済みになる。'},

collection:{event:'プライベートコレクション',short:'共通',color:'#a96a83',cost:[0,3],effect:'アイテム「くまのぬいぐるみ」を2つ得る。'},
rampage:{event:'暴走舞台',short:'共通',color:'#b95e9b',cost:[0,2],effect:'相手はファンチップを5つ得る。その後、自分のVOLを100％上げる（通常上限200％、響リーダー中400％）。'},
scandal:{event:'炎上商法',short:'共通',color:'#c06649',cost:[0,5],effect:'自分の獲得済みファンを全て観客山札の下に戻し、実際に戻した枚数＋3枚の観客を先頭からまとめて獲得する。観客効果も全て発動する。ファンチップは戻さない。'},
buzz:{event:'唐突バズ',short:'共通',color:'#a96cb3',cost:[0,3],effect:'観客山札のインフルエンサー1枚と、観客席の先頭を入れ替える。山札に対象がある場合のみ使用可能。相手の独占チップ付きの先頭は交換できない。'},
redo:{event:'やり直し',short:'共通',color:'#73878b',cost:[0,3],effect:'観客ゾーンの観客をすべて観客デッキに戻してシャッフルし、空きを補充する。相手の独占チップ付き観客は移動しない。'},
switch:{event:'センタースイッチ',short:'共通',color:'#73878b',cost:[0,3],effect:'別のメンバーをリーダーにする。前のリーダー能力で得た独占チップなどは取り除く。初期vol・手札は変更しない。自分のリーダーが2人以上なら失敗する。失敗してもメモリーを支払い、使用済みになる。'},
trouble:{event:'会場トラブル',short:'共通',color:'#73878b',cost:[0,4],effect:'自分の獲得観客をランダムに1枚戻し、その後、相手の獲得観客をランダムに2枚観客デッキの下に戻す。'},
wit:{event:'機転',short:'共通',color:'#73878b',cost:[0,4],repeat:true,effect:'手札1枚を選んでメモリーに置き、1枚ドロー。再使用可能。自分の各ターン1回まで。'},
overcome:{event:'乗り越える力',short:'共通',color:'#73878b',cost:[0,3],effect:'自分のボルテージが100％以上なら、カードを2枚引く。'},
viewing:{event:'ライブビューイング',short:'共通',color:'#73878b',cost:[0,5],effect:'残りのゲーム中、自分のファンサービスでは声援チップの代わりにファンチップ1つを得る。'},
mc:{event:'MCタイム',short:'共通',color:'#73878b',cost:[0,1],effect:'次の自分のターン開始時まで、自分の獲得ファンエリアは相手のカードの影響を受けない。'}
};
const DUETS={
tempest:{event:'TEMPEST',short:'佳代＆麻智',color:'#8f7eb2',members:['kayo','machi'],cost:[0,7],costMembers:{kayo:2,machi:2},effect:'観客席から好きな観客を2人同時に獲得し、カードを3枚引く。相手の独占付き観客は選べない。獲得枚数の増加は適用しない。'},
nightmare:{event:'からふる☆まじかる☆ないとめあ',short:'春＆仁奈',color:'#cf7bae',members:['haru','nina'],cost:[0,6],costMembers:{haru:2,nina:2},effect:'ファンチップを3枚、くまのぬいぐるみを3つ得る。'},
detatoko:{event:'デタトコ勝負!!',short:'光＆あやめ',color:'#b89241',members:['hikari','ayame'],cost:[0,8],costMembers:{hikari:2,ayame:2},effect:'カードを3枚引き、くじ引き券を5枚得る。'},
vengeance:{event:'Crystalline Vengeance',short:'恵美＆彩',color:'#9d4168',members:['emi','aya'],cost:[0,8],costMembers:{emi:2,aya:2},effect:'恵美と彩を未行動にし、ファンチップを4枚得る。'}
};
const EVENTS={...CHAR,...COMMON,...DUETS};
const FAN = {
local:{name:'地元ファン',points:1,count:0,text:'持ち主のターン開始時、メンバーに三葉がいれば声援チップを1枚与える。',icon:'⌂'},
light:{name:'ライトファン',points:1,count:14,text:'効果なし',icon:'♡'},
cheer:{name:'応援するファン',points:1,count:14,text:'声援チップ＋1',icon:'✦'},
trouble:{name:'厄介なファン',points:1,count:12,text:'自身以外の同時獲得観客から最高得点の1枚を観客デッキの下へ戻す。',icon:'！'},
heavy:{name:'愛が重いファン',points:2,count:8,text:'ボルテージ－10％',icon:'♥'},
core:{name:'コアファン',points:3,count:4,text:'効果なし',icon:'★'},
reporter:{name:'記者',points:1,count:1,text:'観客席に出た時、ゲーム外からインフルエンサー1枚を観客山札に加え、シャッフルする。獲得時には発動しない。',icon:'▣'},
influencer:{name:'インフルエンサー',points:5,count:0,text:'効果なし。初期観客山札には含まれない。',icon:'☆'},
believer:{name:'信者',points:3,count:0,text:'効果なし。交換時にゲーム外から登場する。',icon:'✧'},
anti:{name:'アンチ',points:-3,count:0,text:'効果なし。交換時にゲーム外から登場する。',icon:'×'},
dream:{name:'ゆめかわファン',points:0,count:0,text:'獲得側のメンバーに春がいるなら1ポイント。初期山札には含まれない。',icon:'☁'}
};
function song(c){if(c.special==='painted')return {name:'塗りつぶされたカード',owner:'shiro',n:3,vol:0,fan:0,need:0};if(c.special==='world')return {name:'鳴り響く世界',owner:'shiro',n:1,vol:50,fan:5,need:100};return {name:CHAR[c.owner].songs[c.n-1],owner:c.owner,n:c.n,vol:c.n*10+(c.owner==='hibiki'?10:0)+(c.owner==='shio'||c.owner==='aya'&&c.n===1?10:0),fan:c.owner==='mitama'?(c.n===1?1:c.n+1):c.owner==='natsume'&&c.n===3?4:c.n,need:[60,80,100][c.n-1]};}
function detail(c,p){const d=song(c);if(c.special){d.volText=d.fanText=c.special==='painted'?'指定メンバーなし・任意の3人。選んで捨てる・メモリーへ置くことはできない。山札・手札以外ではゲーム外へ移動する。':'しろ1人で使用。山札・手札以外ではゲーム外へ移動する。';return d;}d.volText=c.owner==='kayo'?'カードを1枚引く。':c.owner==='hana'?'声援チップを1枚得る。':'';d.fanText=c.owner==='machi'&&c.n>1?(c.n===3?'相手の獲得済み観客をランダムに1枚戻す。':'相手は自身の獲得済み観客1枚を選んで戻す。'):c.owner==='natsume'&&c.n<3?'使用時のVOLが130％以上なら、VOLを下げずに獲得枚数＋1を選べる。130％未満ならVOLを追加で10％下げて獲得枚数＋1を選べる。':c.owner==='rai'?(c.n===1?'声援チップ1枚で通常獲得の代わりに観客ゾーンの1枚を選んで獲得。':c.n===2?'通常獲得の代わりに観客ゾーンの1枚を選んで獲得してもよい。':'通常獲得の代わりに観客デッキの上2枚を見て、観客ゾーンと合わせた最大5枚から2枚を選び、同時に獲得してもよい。'):c.owner==='hana'&&c.n===3?'声援チップを1枚得る。':'';if(c.owner==='moe'){if(c.n<3)d.fanText='このターン、次に行うファンサービス1回の効果を3倍にする。重複しない。';else d.fanText='声援チップを2枚得る。';}if(c.owner==='haru'){d.volText=c.n===3?'ゆめかわファン1枚を観客山札の一番上に置く。':'';d.fanText=c.n<3?'ゆめかわファン1枚を観客山札の一番上に置く。':'獲得済みのゆめかわファンが2枚以上なら、獲得枚数＋1。';}
if(c.owner==='kana')d.volText=d.fanText='漂流：声援チップ1枚を支払ってもよい。自分または相手のメモリー・捨て札にある同じ人数用楽曲1枚から、使用モードの追加効果を借りる。追加の支払い・条件も引き継ぐ。漂流自体は借りられない。';
if(c.owner==='tenko'&&c.n>1)d.volText=d.fanText='声援チップを1枚得る。';
if(c.owner==='mitsuha')d.volText='地元ファン1枚を観客山札の一番上に置く。';
if(c.owner==='riri'&&c.n>1)d.fanText='この使用で最初に獲得する厄介なファン1枚を、自分の代わりに相手に渡してもよい。そうしたらファンチップを1枚得る。';
if(c.owner==='chitose')d.fanText=(c.n===1?'自分のVOLが80％以上なら、':'')+'相手の獲得済みの、現在1ポイントの観客1枚をランダムに観客山札の下に戻す。';
if(c.owner==='kokone')d.fanText='楽曲カードを1枚引く。';
if(c.owner==='mitama')d.fanText='声援チップを1枚捨てる。';
if(c.owner==='shiro')d.volText='相手の山札に「塗りつぶされたカード」'+(c.n===1?1:2)+'枚を加え、シャッフルする。';
if(c.owner==='shio'&&c.n===3)d.fanText='自分のVOL＋10％。';
if(c.owner==='kono')d.volText='アイテム「現金」を1個得る。';
if(c.owner==='chie')d.volText='山札の上から'+(c.n===3?2:1)+'枚をメモリーに置く。';
if(c.owner==='miyabi'&&c.n>1){d.fanText='声援1枚で相手のVOL－20％（任意）。';if(c.n===3)d.volText=d.fanText;}
if(c.owner==='misa')d.volText='声援チップ'+(c.n===3?1:2)+'枚を支払ってもよい。そうしたら「紫のドリンク」を1つ得る。';
if(c.owner==='hibiki'&&c.n===3)d.fanText='声援チップを1枚得る。';
if(c.owner==='mimizuku')d.fanText='使用時、観客席の先頭が自分にとって1ポイントなら、声援チップを'+(c.n===3?2:1)+'枚得る。観客獲得前に判定する。';
if(c.owner==='fukurou')d.volText=d.fanText='相手のアイテムとファンチップを合わせ、その中からランダムに1枚を破壊する。';
if(c.owner==='ayame'){d.volText='アイテム「くじ引き券」を1枚得る。';if(c.n===3)d.fanText=d.volText;}
if(c.owner==='nina'&&c.n>1)d.volText='アイテム「くまのぬいぐるみ」を1つ得る。';
if(c.owner==='hakka'){d.volText='肉を1つ得る。';d.fanText=c.n===3?'肉を1つ得る。':'';}
if(c.owner==='akina')d.fanText='使用後、この楽曲をメモリーから手札に戻してもよい。';
if(c.owner==='emi'){d.volText='観客席のカード1枚を選び、観客山札の下に戻してもよい。戻した後、補充する。';d.fanText='ファン獲得前に、観客席のカード1枚を選び、観客山札の下に戻してもよい。戻した後、補充する。';}
if(c.owner==='aya'&&c.n>1)d.fanText='使用後、VOLを'+(c.n===2?30:40)+'％下げてもよい。そうした場合、彩以外の行動済みメンバー'+(c.n===2?'1人':'全員')+'を未行動にする。';
if(c.owner==='hikari'){const text='手札を'+(c.n===3?2:1)+'枚選んで捨ててもよい。そうした場合、'+(c.n===3?2:1)+'枚引く。';d.fanText=text;if(c.n===3)d.volText=text;}
if(c.owner==='homura')d.fanText='観客席のカードを'+(c.n===3?2:1)+'枚まで選び、ターン終了時まで効果を無効にする。';if(c.owner==='kazuna')d.volText=d.fanText='このカードで目標を達成したら声援1枚。その後、このカードを目標に置く。';if(c.owner==='mio')d.volText=d.fanText='経験チップを2枚得る（4枚ごとに本人のFAN＋1、最大＋3。今回の使用には適用しない）。';if(c.owner==='chris')d.volText=d.fanText='財産を1枚得る。';if(c.owner==='yuu')d.fanText='必要VOLに20％まで足りなくても使用可。前借りした次の自分のターン開始時VOL－10％（同ターンの前借りは合計－10％）。';if(p&&c.owner==='mio')d.fan+=Math.floor((p.experience||0)/4);if(p?.songSeal){d.volText=d.fanText='追加効果は無効です。';}return d;}
function rng(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function shuffle(s,a){for(let i=a.length-1;i>0;i--){let j=Math.floor(rng(s)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function uid(s){return 'c'+s.serial++;}
function log(s,t){s.log.push(t);}
function leaders(p){return [p.leader,...(p.extraLeaders||[])].filter((id,j,a)=>id&&a.indexOf(id)===j);}
function hasLeader(p,id){return leaders(p).includes(id);}
function songPeople(p,c){return p.soloSpot&&c.n===3&&c.special!=='painted'?1:c.n;}
function changeLeader(s,i,id){const p=s.players[i];s.row.forEach(f=>{if(f.lock===i)f.lock=null;});p.buff=0;p.leader=id;p.extraLeaders=[];voltage(p,0);log(s,'リーダー変更：'+CHAR[id].name);}
function maxVoltage(p){return hasLeader(p,'hibiki')?400:200;}
function voltage(p,n){p.vol=Math.max(0,Math.min(maxVoltage(p),p.vol+n));}
function normalVoltage(p,c){return Math.max(0,song(c).need-(hasLeader(p,'miyabi')?20:0));}
function requiredVoltage(p,c){return Math.max(0,normalVoltage(p,c)-(c.owner==='yuu'&&!p.songSeal?20:0));}
function canMiyabiDebuff(c,mode){return c.owner==='miyabi'&&!c.special&&(mode==='fan'&&[2,3].includes(c.n)||mode==='vol'&&c.n===3);}
function lowerVoltage(s,i,n){const p=s.players[i];if(p.volGuard){log(s,'春雷の誓い：VOL低下を防いだ');return;}voltage(p,-n);}
function discardable(c){return c.special!=='painted';}
function memoryable(c){return c.special!=='painted';}
function songArt(c){return c.special==='painted'?'special-painted':c.special==='world'?'special-world':'song-'+c.owner+'-'+c.n;}
function cleanSpecial(s){for(const p of s.players)for(const z of ['memory','discard']){const removed=p[z].filter(c=>c.special);if(removed.length){(s.exiledCards??=[]).push(...removed);p[z]=p[z].filter(c=>!c.special);}}}
const DRINKS={drinkBlue:{name:'青のドリンク',art:'item-drink-blue',vol:10,fan:0,color:'#428cdf'},drinkRed:{name:'赤のドリンク',art:'item-drink-red',vol:0,fan:1,color:'#dd5270'},drinkPurple:{name:'紫のドリンク',art:'item-drink-purple',vol:10,fan:1,color:'#a46dd6'}};
const SHOP={support:{name:'声援チップ2枚'},fanChip:{name:'ファンチップ1枚'},meat:{name:'肉'},teddy:{name:'くまのぬいぐるみ'},drinkPurple:{name:'紫のドリンク'}};
function cash(s,p,n=1){for(let j=0;j<n;j++)items(p).push({uid:uid(s),item:'cash'});log(s,'現金を'+n+'個獲得');}
function cashCount(p){return items(p).filter(c=>c.item==='cash').length;}
function drinkItems(p){return items(p).filter(c=>DRINKS[c.item]);}
function addDrink(s,p,type){(p.items??=[]).push({uid:uid(s),item:type});log(s,DRINKS[type].name+'を1つ獲得');}
function endDrinks(s,skip=false){s.ending=true;if(skip){next(s);return;}s.queue.push({kind:'endDrinks',p:s.active});process(s);}

function fanPoints(p,f){return (f.type==='dream'?(p?.team.includes('haru')&&!f.muted?1:0):FAN[f.type].points)+(f.plusOne||0);}
function deckFan(f){delete f.plusOne;f.lock=null;return f;}
function score(p){return p.fans.reduce((a,f)=>a+fanPoints(p,f),0)+(p.temp||0)+(p.fanChips||0);}
function items(p){return p.items||[];}
function supportSealed(s,i){return s.players[i].supportSealTurn===s.turn;}
function destroyResource(s,i){const q=s.players[1-i],pool=items(q).length+(q.fanChips||0);if(!pool)return;const at=Math.floor(rng(s)*pool);let name='ファンチップ';if(at<items(q).length){const c=q.items.splice(at,1)[0];name=DRINKS[c.item]?.name||({meat:'肉',teddy:'くまのぬいぐるみ',ticket:'くじ引き券'})[c.item]||'アイテム';}else q.fanChips--;log(s,'フクロウ：相手の'+name+'1枚を破壊');}
function paymentCards(p){return [...p.memory.filter(c=>!c.special),...items(p).filter(c=>c.item==='meat')];}
function paymentOK(p,id,paid){const d=EVENTS[id],cards=paymentCards(p);if(!d||!Array.isArray(paid)||paid.length!==d.cost[1]||new Set(paid).size!==paid.length||!paid.every(x=>cards.some(c=>c.uid===x)))return false;const chosen=cards.filter(c=>paid.includes(c.uid));if(d.costMembers)return Object.entries(d.costMembers).reduce((n,[owner,min])=>n+Math.max(0,min-chosen.filter(c=>!c.item&&c.owner===owner).length),0)<=chosen.filter(c=>c.item==='meat').length;if(d.costEach){if(!p.team.includes(id))return false;const counts=p.team.map(owner=>chosen.filter(c=>c.owner===owner&&!c.item).length);return chosen.every(c=>c.item==='meat'||p.team.includes(c.owner))&&counts.every((n,j)=>n<=(p.team[j]===id?d.costSelf||d.costEach:d.costEach))&&counts.reduce((n,c,j)=>n+(p.team[j]===id?d.costSelf||d.costEach:d.costEach)-c,0)===chosen.filter(c=>c.item==='meat').length;}return chosen.filter(c=>c.owner===id||c.item==='meat').length>=d.cost[0];}
function meat(s,p){(p.items??=[]).push({uid:uid(s),item:'meat'});log(s,'肉を1つ獲得（手札のアイテム）');}
const LOTTERY={grand:{name:'大あたり',count:1,points:5},medium:{name:'中あたり',count:2,points:2},small:{name:'小あたり',count:3,points:1},miss:{name:'ハズレ',count:8,points:0},bomb:{name:'爆弾',count:1,points:0}};
function ticketCount(p){return items(p).filter(c=>c.item==='ticket').length;}
function ticket(s,p,n=1){for(let j=0;j<n;j++)(p.items??=[]).push({uid:uid(s),item:'ticket'});log(s,'くじ引き券を'+n+'枚獲得（手札のアイテム）');}
function lotteryDeck(s){return shuffle(s,Object.entries(LOTTERY).flatMap(([id,d])=>Array(d.count).fill(id)));}
function useTicket(s,i,id){const p=s.players[i],at=items(p).findIndex(c=>c.uid===id&&c.item==='ticket');if(at<0)throw Error('使用できるくじ引き券がありません');
 p.items.splice(at,1);s.lottery??=lotteryDeck(s);const result=s.lottery.shift(),d=LOTTERY[result];let detail=d.points?'ファンチップ＋'+d.points:'効果なし';
 if(result==='bomb'){const pool=[...p.fans],results=[];for(let n=0;n<3&&pool.length;n++){const f=pool.splice(Math.floor(rng(s)*pool.length),1)[0],name=FAN[f.type].name;results.push(removeFan(s,i,f.uid,i)?name+'を観客山札の下へ戻した':name+'はぬいぐるみに守られた');}detail=results.length?results.join(' ／ '):'獲得済み観客がいないため、何も起こらなかった';}
 else p.fanChips=(p.fanChips||0)+d.points;
 s.lottery.push(result);shuffle(s,s.lottery);s.lotteryLast={uid:uid(s),p:i,result,detail};log(s,(i?'CPU':'あなた')+'のくじ：'+d.name+' / '+detail);finish(s);
}
function teddyCount(p){return items(p).filter(c=>c.item==='teddy').length;}
function teddy(s,p){(p.items??=[]).push({uid:uid(s),item:'teddy'});log(s,'くまのぬいぐるみを1つ獲得（手札のアイテム）');}
function teddyProtect(s,i,f){const p=s.players[i],at=items(p).findIndex(c=>c.item==='teddy');if(at<0)return false;p.items.splice(at,1);log(s,'くまのぬいぐるみを1つ捨て、'+FAN[f.type].name+'を獲得済みゾーンに残した');return true;}
function localFan(s){return {uid:uid(s),type:'local',lock:null};}
function canMitsuhaSwap(s,i){return !!s.audience.length&&!!s.row[0]&&(s.row[0].lock===null||s.row[0].lock===i);}
function dream(s){s.audience.unshift({uid:uid(s),type:'dream',lock:null,muted:s.deckMuteTurn===s.turn});log(s,'ゆめかわファンを観客山札の一番上に置いた');}

function draw(s,i,n=1){const p=s.players[i];let got=0;while(n-->0&&p.deck.length){p.hand.push(p.deck.shift());got++;}if(got)log(s,(i?'CPU':'あなた')+'：'+got+'枚ドロー');}
function seatEffect(s,f){if(f.type!=='reporter'||f.muted)return;const added={uid:uid(s),type:'influencer',lock:null};if(s.deckMuteTurn===s.turn)added.muted=true;s.audience.push(added);shuffle(s,s.audience);log(s,'記者が観客席に登場：インフルエンサー1枚を観客山札に加えてシャッフル');}
function fill(s){while(s.row.length<3&&s.audience.length){const f=s.audience.shift();if(s.deckMuteTurn===s.turn)f.muted=true;s.row.push(f);seatEffect(s,f);}}

function unlocked(s,i){return s.row.filter(f=>f.lock===null||f.lock===i);}
function eventOK(s,i,id){const p=s.players[i],d=EVENTS[id];return !!d&&p.events.some(e=>e.id===id&&!e.used&&(!d.repeat||d.unlimited||e.lastTurn!==s.turn))&&paymentCards(p).length>=d.cost[1]&&paymentCards(p).filter(c=>c.owner===id||c.item==='meat').length>=d.cost[0]&&(!d.costMembers&&id!=='moe'||paymentOK(p,id,autoPay(p,id)))&&(id!=='buzz'||(s.audienceHasInfluencer??s.audience.some(f=>f.type==='influencer'))&&s.row.length>0&&(s.row[0].lock===null||s.row[0].lock===i))&&(id!=='riri'||score(p)<score(s.players[1-i]))&&(id!=='lastOrder'||p.chips>=3)&&(id!=='duo'||leaders(p).length<2)&&(id!=='overcome'||p.vol>=100)&&(id!=='wit'||p.hand.some(memoryable))&&(id!=='kayo'||p.hand.some(discardable))&&(id!=='hana'||p.ready.some(x=>!x))&&(id!=='emi'||!fansProtected(s,1-i,i)&&s.players[1-i].fans.some(f=>fanPoints(s.players[1-i],f)===1))&&(id!=='kokone'||!!p.rehearsal||p.hand.some(c=>c.special!=='painted'))&&(id!=='chitose'||s.players[1-i].team.some(id=>!hasLeader(s.players[1-i],id)&&!s.players[1-i].startLocked?.includes(id)))&&(id!=='rai'||(s.audienceCoreCount??s.audience.filter(f=>f.type==='core').length)>0&&unlocked(s,i).length>0);}

function finish(s){
 cleanSpecial(s);
 if(s.queue.length||s.pending)return;
 for(let i=0;i<2;i++)if(score(s.players[1-i])>=20&&eventOK(s,i,'chie')){const p=s.players[i],options=paymentCards(p).filter(c=>c.owner==='chie'||c.item==='meat').map(c=>c.uid);choice(s,'chiePayment',i,options,'終わりをほどく：敗北判定前に本人3枚分を支払う',{selected:[],count:3});return;}
 const winners=s.players.map((p,i)=>score(p)>=20?i:-1).filter(i=>i>=0);
 if(winners.length){s.winner=winners.includes(s.active)?s.active:winners[0];log(s,s.winner?'CPUの勝利！':'あなたの勝利！');return;}
 for(let i=0;i<2;i++){const p=s.players[i];if(!p.deck.length&&!p.hand.length&&!(p.rehearsal&&p.vol>=requiredVoltage(p,p.rehearsal))&&!ticketCount(p)&&!drinkItems(p).length&&cashCount(p)<2&&!p.events.some(e=>eventOK(s,i,e.id))){s.winner=1-i;log(s,(i?'CPU':'あなた')+'は山札・手札がなく、使用可能なイベントもないため敗北。');return;}}
}
function fansProtected(s,i,source){return source!==i&&!!s.players[i].fanShield;}
function removeFan(s,i,id,source=i){if(fansProtected(s,i,source))return;const p=s.players[i],at=p.fans.findIndex(f=>f.uid===id);if(at<0||teddyProtect(s,i,p.fans[at]))return;const f=p.fans.splice(at,1)[0];f.lock=null;s.audience.push(deckFan(f));log(s,FAN[f.type].name+'を観客デッキの下へ戻した');return true;}
function exchangeFan(s,i,id,type){const p=s.players[i],at=p.fans.findIndex(f=>f.uid===id);if(at<0)throw Error('交換対象がありません');const old=p.fans[at];if(teddyProtect(s,i,old))return;(s.exiledFans??=[]).push({...old,lock:null});p.fans[at]={uid:uid(s),type,lock:null};log(s,FAN[old.type].name+'を'+FAN[type].name+'に交換（元の観客はゲーム外）');}
function moveOut(s,f){s.row=s.row.filter(x=>x.uid!==f.uid);s.audience=s.audience.filter(x=>x.uid!==f.uid);f.lock=null;}
function acquisitionCount(p,n){return Math.max(0,n);}
function gain(s,i,list,effects=true,countAdjusted=false,ririPass=false){
 const chipQueue=[];
 if(!countAdjusted)list=list.slice(0,acquisitionCount(s.players[i],list.length));
 list=list.filter(f=>!s.players.some((p,j)=>j!==i&&p.fans.some(x=>x.uid===f.uid)&&(fansProtected(s,j,i)||teddyProtect(s,j,f))));
 if(!list.length)return;
 if(ririPass&&list.some(f=>f.type==='trouble')){choice(s,'ririPass',i,['skip','pass'],'梨里：最初の厄介なファンを相手に渡しますか？',{cards:JSON.parse(JSON.stringify(list)),effects});return;}
 if(hasLeader(s.players[1-i],'fukurou')){s.players[i].supportSealTurn=s.turn;log(s,'フクロウ：このターン、獲得した側の声援効果を封印');}
 for(const f of list){if(s.audience.some(x=>x.uid===f.uid)&&s.deckMuteTurn===s.turn)f.muted=true;for(const p of s.players)p.fans=p.fans.filter(x=>x.uid!==f.uid);moveOut(s,f);s.players[i].fans.push(f);if(hasLeader(s.players[i],'nina')&&f.type==='light'){if(hasLeader(s.players[i],'shio'))chipQueue.push({kind:'chip',p:i});else s.players[i].chips++;log(s,'仁奈：ライトファン獲得で声援チップ＋1');}}
 log(s,(i?'CPU':'あなた')+'：'+list.map(f=>FAN[f.type].name).join('・')+'を獲得');
 const leader=s.players[1-i];if(hasLeader(leader,'riri')&&!leader.ririUsed&&s.players[i].fans.filter(f=>f.type==='trouble').length>=3){leader.ririUsed=true;if(hasLeader(leader,'shio'))chipQueue.push(...Array.from({length:4},()=>({kind:'chip',p:1-i})));else leader.chips+=4;log(s,'梨里：相手の厄介なファンが3枚以上、声援チップ＋4（ゲーム中1度）');}
 const ids=list.map(f=>f.uid);
 s.queue.unshift(...chipQueue,...(effects?list.map(f=>({kind:'fanEffect',p:i,f:JSON.parse(JSON.stringify(f)),batch:ids})):[]),{kind:'fill',p:i});
}
function normal(s,i,n,ririPass=false){n=acquisitionCount(s.players[i],n);const list=unlocked(s,i).slice(0,n);let left=n-list.length;for(let j=0;j<left&&j<s.audience.length;j++)list.push(s.audience[j]);gain(s,i,list,true,true,ririPass);}
function choice(s,kind,p,options,text,extra={}){s.pending={kind,p,options,text,...extra};}
function moeTargets(s,i){const q=s.players[1-i];return q.team.filter((id,j)=>!q.ready[j]&&!(q.moeHeld||[]).includes(id));}
function supportFree(p,effect){return (p.moeFreeSupport||0)>0&&['draw','lock','hold'].includes(effect);}
function service(s,i,j){const p=s.players[i];if(!Number.isInteger(j)||j<0||j>=p.team.length||p.service>=2||!p.ready[j])throw Error('ファンサービスは未行動の1人で各ターン2回までです');const count=p.moeDouble?3:1;p.moeDouble=false;p.ready[j]=false;p.service++;if(p.liveViewing){p.fanChips=(p.fanChips||0)+count;log(s,'ライブビューイング：ファンチップ＋'+count);}else for(let n=0;n<count;n++)s.queue.unshift({kind:'chip',p:i});log(s,'ファンサービス：'+CHAR[p.team[j]].short+(count===3?'（効果3倍）':''));}
function awardChips(s,i,n){if(hasLeader(s.players[i],'shio'))s.queue.push(...Array.from({length:n},()=>({kind:'chip',p:i})));else s.players[i].chips+=n;}
function chipEffect(s,p){if(hasLeader(s.players[p],'hana')){s.players[p].buff++;log(s,'華：次のファン獲得＋'+s.players[p].buff);}}
function ayaEventCount(p){return Math.min(6,[...p.memory,...p.discard].filter(c=>c.n===1).length);}
function spendEvent(s,i,id,paid){const p=s.players[i],d=EVENTS[id];if(!paymentOK(p,id,paid))throw Error('メモリーの支払い条件を確認してください');const cards=p.memory.filter(c=>paid.includes(c.uid));p.memory=p.memory.filter(c=>!paid.includes(c.uid));p.items=items(p).filter(c=>!paid.includes(c.uid));p.discard.push(...cards);const e=p.events.find(e=>e.id===id);e.used=!d.repeat;e.lastTurn=s.turn;log(s,'EVENT「'+d.event+'」');}
function resetEvent(s,i,id){const p=s.players[i];if(hasLeader(p,'chie')&&!p.chieResetUsed)s.queue.push({kind:'chieReset',p:i,id});}
function adversity(s,i){const q=s.players[1-i];if(!fansProtected(s,1-i,i)){for(const f of [...q.fans]){if(teddyProtect(s,1-i,f))continue;q.fans=q.fans.filter(x=>x.uid!==f.uid);s.exiledFans.push({...f,lock:null});}s.exiledFanChips=(s.exiledFanChips||0)+(q.fanChips||0);q.fanChips=0;}else log(s,'MCタイム：終わりをほどくによる獲得済みエリアの移動を防いだ');q.fanChips=(q.fanChips||0)+19;log(s,'終わりをほどく：相手にファンチップ19枚、現在ターン終了');s.queue.push({kind:'chieEnd',p:i});}
function process(s){
 cleanSpecial(s);
 while(s.queue.length&&!s.pending&&s.winner===null){
 const e=s.queue.shift(),p=s.players[e.p];
 if(e.kind==='startOrder'||e.kind==='endOrder'){const effects=e.effects||[];if(effects.length>1)choice(s,e.kind,e.p,effects,'同時に発動する効果：次に処理するものを選択',{effects});else if(effects.length)s.queue.unshift({kind:e.kind==='startOrder'?'startEffect':'endEffect',p:e.p,id:effects[0]},...(e.kind==='endOrder'?[{kind:'endOrder',p:e.p,effects:[]}]:[]));else if(e.kind==='endOrder'){finish(s);if(s.pending)s.queue.push(e);else if(s.winner===null)endDrinks(s);}continue;}
 if(e.kind==='funkSong'){const achieved=funkGoal(s,e.p,e.card);if(!p.songSeal&&e.owner==='mio'){p.experience=Math.min(12,(p.experience||0)+2);log(s,'澪：経験＋2（'+p.experience+'/12）');}if(!p.songSeal&&e.owner==='chris'){p.wealth=(p.wealth||0)+1;log(s,'財産＋1（'+p.wealth+'枚）');}if(!p.songSeal&&e.owner==='kazuna'){if(achieved)awardChips(s,e.p,1);if(p.goal)p.hand.push(p.goal);p.memory=p.memory.filter(c=>c.uid!==e.card.uid);p.goal=e.card;p.goalTurn=s.turn;log(s,'目標：'+song(e.card).name);}continue;}
 if(e.kind==='startEffect'){startEffect(s,e.p,e.id);continue;}
 if(e.kind==='endEffect'){endEffect(s,e.p,e.id);continue;}
 if(e.kind==='finaleEnd'){finish(s);if(s.pending)s.queue.push(e);else if(s.winner===null){if(leaders(p).length>1)beginMultiEnd(s,e.p);else dispatch(s,{type:'end'});}continue;}

 if(e.kind==='emiConvert'&&p.chips>=2){const opts=p.fans.filter(f=>f.type==='trouble').map(f=>f.uid);if(opts.length)choice(s,'emiConvert',e.p,['skip',...opts],'あなたも、救われる。：声援2枚で信者に交換しますか？');}
 if(e.kind==='emiBottom'){const opts=unlocked(s,e.p).map(f=>f.uid);if(opts.length)choice(s,'emiBottom',e.p,['skip',...opts],'恵美：観客山札の下に戻す観客を1枚選択（任意）');}
 if(e.kind==='miyabiLower'){lowerVoltage(s,1-e.p,20);log(s,'雅：声援1枚で相手のVOL－20％');continue;}
 if(e.kind==='miyabiDebuff'&&p.chips>=1)choice(s,'miyabiDebuff',e.p,['skip','use'],'雅：声援1枚で相手のVOLを20％下げますか？');
 if(e.kind==='chieReset'&&hasLeader(p,'chie')&&!p.chieResetUsed)choice(s,'chieReset',e.p,['skip','use'],'こんな私でも、変えられるなら：'+EVENTS[e.id].event+'を再使用可能にしますか？',{eventId:e.id});
 if(e.kind==='chieEnd'){s.queue=[];next(s);continue;}
 if(e.kind==='kanaMemory'){const options=p.memory.filter(c=>c.owner==='kana'&&!c.special).map(c=>c.uid);if(options.length)choice(s,'kanaMemory',e.p,['done',...options],'河奈：得点に変えるメモリーを選択（0枚から）');}
 if(e.kind==='mitamaChip'){const n=Math.min(1,p.chips);p.chips-=n;log(s,'美珠：声援チップを'+n+'枚捨てた');}
 if(e.kind==='mitsuhaStart'&&canMitsuhaSwap(s,e.p))choice(s,'mitsuhaStart',e.p,['skip','swap'],'三葉：先頭と山札の一番上を入れ替えますか？');
 if(e.kind==='chitoseRemove'){const q=s.players[1-e.p],fs=q.fans.filter(f=>fanPoints(q,f)===1);if(fs.length&&!fansProtected(s,1-e.p,e.p)){const f=fs[Math.floor(rng(s)*fs.length)];removeFan(s,1-e.p,f.uid,e.p);}}
 if(['rehearsalStart','kokoneStart'].includes(e.kind)&&p.rehearsal){const opts=rehearsalActors(p,p.rehearsal);if(p.vol>=requiredVoltage(p,p.rehearsal)&&opts.length)choice(s,'kokoneUse',e.p,['skip',...opts.map(a=>a.join(','))],'リハーサル：使用するメンバーを選ぶか、使用せず残す');else log(s,'リハーサル：必要VOLまたは未行動メンバーが不足しているため楽曲を残した');}
 if(e.kind==='kokoneEcho'){let c=e.card;if(!c){c=p.rehearsal;if(!c)continue;p.rehearsal=null;p.memory.push(c);log(s,'リハーサル：'+song(c).name+'をメモリーへ');}const n=fanCount(p,c,true,true);p.buff=0;s.queue.unshift({kind:'normal',p:e.p,n},...(e.times>1?[{kind:'kokoneEcho',p:e.p,card:c,times:e.times-1}]:[]));log(s,'狐々音イベント：'+song(c).name+'のFANを追加効果なしで発動');}
 if(e.kind==='fill')fill(s);
 if(e.kind==='shiroPeek'){const cards=JSON.parse(JSON.stringify(s.players[1-e.p].hand));if(cards.filter(c=>c.special==='painted').length>=2){p.fanChips=(p.fanChips||0)+1;log(s,'しろ：相手の手札に塗りつぶされたカードが2枚以上あるためファンチップ＋1');}choice(s,'shiroPeek',e.p,['confirm'],'色が音になる時：相手の手札を確認',{cards});}
 if(e.kind==='misaStart'&&p.chips>=1)choice(s,'misaStart',e.p,['skip','drinkBlue','drinkRed'],'貴方に相応しい一杯：声援1枚でドリンクを選択');
 if(e.kind==='misaPurple'&&p.chips>=(e.cost??2))choice(s,'misaPurple',e.p,['skip','use'],'声援'+(e.cost??2)+'枚で紫のドリンクを得ますか？',{cost:e.cost??2});
 if(e.kind==='endDrinks'){finish(s);if(s.winner!==null)continue;const ds=drinkItems(p);if(ds.length)choice(s,'endDrinks',e.p,['skip',...ds.map(c=>c.uid)],'ターン終了：ドリンクを1つずつ使用（順番自由）');else next(s);}

 if(e.kind==='mimizukuReveal')choice(s,'mimizukuReveal',e.p,['confirm'],'ざこどもちゃれんじ！：観客山札の上を確認',{cards:JSON.parse(JSON.stringify(s.audience.slice(0,5)))});
 if(e.kind==='akinaDraw'){const opts=p.deck.slice(0,3).map(c=>c.uid);if(opts.length===1)draw(s,e.p);else if(opts.length)choice(s,'akinaDraw',e.p,opts,'私なりの最適解：山札の上から1枚選択');}
 if(e.kind==='moeReady')choice(s,'moeReady',e.p,p.team.map((_,j)=>String(j)),'萌：未行動にするアイドルを選択。その後、可能ならファンサービス');
 if(e.kind==='akinaReturn'&&p.memory.some(c=>c.uid===e.card))choice(s,'akinaReturn',e.p,['skip','return'],'秋奈：使用した楽曲を手札に戻しますか？',{card:e.card});
 if(e.kind==='vol')voltage(p,e.n);
 if(e.kind==='recover'&&p.chips>=1&&p.discard.length)choice(s,'recover',e.p,['skip',...p.discard.map(c=>c.uid)],'春：声援チップ1枚を支払い、捨て札の楽曲1枚を手札に戻しますか？');
 if(e.kind==='hakkaReady'&&p.ready.some(x=>!x))choice(s,'hakkaReady',e.p,[...p.ready.flatMap((r,j)=>r?[]:[String(j)]),'skip'],'白花：未行動にするアイドルを1人選択（任意）');
 if(e.kind==='mutePick'){const opts=s.row.filter(f=>!f.muted&&!e.selected.includes(f.uid)).map(f=>f.uid);if(opts.length&&e.left>0)choice(s,'mutePick',e.p,[...opts,'skip'],'焔：効果を失わせる観客を選択（あと'+e.left+'枚まで）',{left:e.left,selected:e.selected});}
 if(e.kind==='ayaReady'&&p.vol>=e.cost){const opts=p.team.flatMap((id,j)=>id!=='aya'&&!p.ready[j]?[String(j)]:[]);if(opts.length)choice(s,'ayaReady',e.p,['skip',...(e.all?['all']:opts)],'彩：VOLを'+e.cost+'％下げ、彩以外の'+(e.all?'全員':'1人')+'を未行動にしますか？',{cost:e.cost,all:e.all});}
 if(e.kind==='hikariCycle'&&p.hand.filter(discardable).length>=e.count)choice(s,'hikariOffer',e.p,['skip','accept'],'光：手札を'+e.count+'枚捨てて'+(e.draw??e.count+1)+'枚引きますか？',{count:e.count,draw:e.draw??e.count+1});
 if(e.kind==='draw')draw(s,e.p);
 if(e.kind==='chip'){
 if(hasLeader(p,'shio'))choice(s,'shio',e.p,['chip','vol'],'時尾：声援チップ1枚か、vol＋10％を選択');
 else p.chips++;
 }
 if(e.kind==='fanEffect'){
 const f=e.f;if(f.muted||hasLeader(p,'mitama'))continue;
 if(f.type==='cheer')s.queue.unshift({kind:'chip',p:e.p});
 if(f.type==='heavy'){lowerVoltage(s,e.p,10);log(s,'愛が重いファン：vol－10％');}
 if(f.type==='trouble'){
 const candidates=p.fans.filter(x=>e.batch.includes(x.uid)&&x.uid!==f.uid);
 if(candidates.length){const max=Math.max(...candidates.map(x=>fanPoints(p,x)));const opts=candidates.filter(x=>fanPoints(p,x)===max).map(x=>x.uid);
 if(opts.length===1)removeFan(s,e.p,opts[0]);else choice(s,'trouble',e.p,opts,'厄介なファン：戻す観客を1枚選択');}
 }
 }
 if(e.kind==='machiRemove'){
 if(p.fans.length&&!fansProtected(s,e.p,1-e.p)){if(e.random)removeFan(s,e.p,p.fans[Math.floor(rng(s)*p.fans.length)].uid,1-e.p);else choice(s,'machiRemove',e.p,p.fans.map(f=>f.uid),'麻智の効果：自分の獲得済み観客から戻す1枚を選択');}
 }
 if(e.kind==='normal')normal(s,e.p,e.n,e.ririPass);
 if(e.kind==='raiPick'){
 const opts=unlocked(s,e.p).map(f=>f.uid);
 if(e.peek)opts.push(...s.audience.slice(0,2).map(f=>f.uid));
 if(opts.length){const count=Math.min(e.exact?e.count:acquisitionCount(p,e.count||1),opts.length);if(count>0)choice(s,'raiPick',e.p,opts,(e.title||'雷')+'：獲得する観客を'+count+'枚選択',{count,selected:[],...(e.exact?{rowOnly:true,title:e.title}: {})});}
 }
 }
 finish(s);
}
function create(team,leader,cpuTeam,cpuLeader,first=0,seed=Date.now(),playerEvents=team,cpuEvents=cpuTeam){
 const s={version:1,seed:seed>>>0,serial:1,players:[],row:[],audience:[],exiledFans:[],active:first,turn:1,first,winner:null,queue:[],pending:null,log:[]};
 for(const [t,l,eventIds] of [[team,leader,playerEvents],[cpuTeam,cpuLeader,cpuEvents]]){
 if(eventIds.length!==3||new Set(eventIds).size!==3||eventIds.some(id=>typeof id!=='string'||!Object.hasOwn(EVENTS,id)))throw Error('イベントを異なる3枚選んでください');
 if(t.length!==3||new Set(t).size!==3||!t.includes(l)||t.some(x=>typeof x!=='string'||!Object.hasOwn(CHAR,x)))throw Error('編成を確認してください');
 const p={team:t,leader:l,vol:CHAR[l].vol,hand:[],deck:[],memory:[],discard:[],fans:[],events:eventIds.map(id=>({id,used:false,lastTurn:null})),experience:0,wealth:0,goal:null,goalTurn:0,borrowDue:false,goalEvent:false,tomorrowEvent:false,ready:[true,true,true],chips:0,buff:0,eventBuff:0,cardBuff:0,temp:0,service:0,items:[],fanChips:0,liveViewing:false,fanShield:false,songsPlayed:0};
 if(l==='kono')cash(s,p,2);
 t.forEach(owner=>{for(let n=1;n<=3;n++)for(let k=0;k<3;k++)p.deck.push({uid:uid(s),owner,n});});shuffle(s,p.deck);s.players.push(p);
 }
 for(const type in FAN)for(let n=0;n<FAN[type].count;n++)s.audience.push({uid:uid(s),type,lock:null});
 if(s.players.some(p=>p.team.includes('ayame')))s.lottery=lotteryDeck(s);
 shuffle(s,s.audience);fill(s);for(let i=0;i<2;i++)draw(s,i,CHAR[s.players[i].leader].hand);
 log(s,(first?'CPU':'あなた')+'の先攻でライブ開始！');startSkill(s);process(s);return s;
}
function startTasks(s,i){const p=s.players[i],tasks=[];if(hasLeader(p,'chitose'))tasks.push('chitose');if(p.rehearsal)tasks.push('rehearsal');if(p.team.includes('mitsuha')&&!hasLeader(p,'mitama')&&p.fans.some(f=>f.type==='local'&&!f.muted))tasks.push('local');for(const id of ['mitsuha','hibiki','shiro','misa','emi','homura','haru','machi'])if(hasLeader(p,id))tasks.push(id);return tasks;}
function startEffect(s,i,id){const p=s.players[i];if(id==='draw'){const n=hasLeader(p,'kayo')&&p.hand.length<=4?2:1;if(hasLeader(p,'akina'))s.queue.unshift(...Array.from({length:n},()=>({kind:'akinaDraw',p:i})));else draw(s,i,n);}
 if(id==='chitose'&&s.row[2]){s.row[2].plusOne=(s.row[2].plusOne||0)+1;log(s,'千登勢：観客席の3番目に＋1チップを置いた');}
 const kinds={rehearsal:'rehearsalStart',mitsuha:'mitsuhaStart',shiro:'shiroPeek',misa:'misaStart',emi:'emiConvert',homura:'chip',haru:'recover'};if(kinds[id])s.queue.unshift({kind:kinds[id],p:i});
 if(id==='local')s.queue.unshift(...p.fans.filter(f=>f.type==='local'&&!f.muted).map(()=>({kind:'chip',p:i})));
 if(id==='hibiki'){voltage(p,10);log(s,'響：自分のターン開始時VOL＋10％');}
 if(id==='machi'&&s.players.reduce((n,x)=>n+x.memory.length,0)>=10){const opts=unlocked(s,i).map(x=>x.uid);if(opts.length)choice(s,'raiPick',i,opts,'麻智のリーダースキル：観客を1枚選んで獲得');}}
function funkStart(s,i){const p=s.players[i];if(p.borrowDue){p.borrowDue=false;const old=p.vol;lowerVoltage(s,i,10);log(s,'前借り：VOL－10％');if(p.vol<old&&hasLeader(p,'yuu')){draw(s,i);awardChips(s,i,2);log(s,'計画なんていらない：1枚ドロー、声援＋2');}}if(p.tomorrowEvent){p.tomorrowEvent=false;voltage(p,30);draw(s,i,2);log(s,'フライング・ハッピー！：VOL＋30％、2枚ドロー');}if((p.wealth||0)>=3){awardChips(s,i,1);log(s,'財産：定期収入 声援＋1');}}
function funkGoal(s,i,c){const p=s.players[i];let achieved=false;if(p.goal&&s.turn>p.goalTurn&&p.goal.n===c.n){p.hand.push(p.goal);p.goal=null;awardChips(s,i,1+(hasLeader(p,'kazuna')?1:0));achieved=true;log(s,'目標達成：楽曲を手札へ、声援＋'+(hasLeader(p,'kazuna')?2:1));if(p.goalEvent){p.goalEvent=false;p.fanChips+=3;log(s,'一凪イベント：ファンチップ＋3');}}return achieved;}
function startSkill(s,withDraw=false){const i=s.active,p=s.players[i];funkStart(s,i);p.kanaSongsPlayed=0;s.players[1-i].songSeal=false;const tasks=startTasks(s,i);if(leaders(p).length>1){s.queue.push({kind:'startOrder',p:i,effects:[...(withDraw?['draw']:[]),...tasks]});return;}
 // Legacy order: draw first, then the existing start effects.
 if(withDraw){if(hasLeader(p,'akina'))s.queue.push({kind:'akinaDraw',p:i});else draw(s,i,hasLeader(p,'kayo')&&p.hand.length<=4?2:1);}
 if(hasLeader(p,'chitose')&&s.row[2]){s.row[2].plusOne=(s.row[2].plusOne||0)+1;log(s,'千登勢：観客席の3番目に＋1チップを置いた');}
 if(p.rehearsal)s.queue.push({kind:'rehearsalStart',p:i});if(p.team.includes('mitsuha')&&!hasLeader(p,'mitama'))for(const f of p.fans.filter(f=>f.type==='local'&&!f.muted))s.queue.push({kind:'chip',p:i});
 for(const id of ['mitsuha','shiro','misa','emi','homura','haru'])if(hasLeader(p,id))s.queue.push({kind:({mitsuha:'mitsuhaStart',shiro:'shiroPeek',misa:'misaStart',emi:'emiConvert',homura:'chip',haru:'recover'})[id],p:i});if(hasLeader(p,'hibiki')){voltage(p,10);log(s,'響：自分のターン開始時VOL＋10％');}if(hasLeader(p,'machi'))startEffect(s,i,'machi');}
function beginMultiEnd(s,i,skip=false){if(skip){endDrinks(s,true);return;}const p=s.players[i];s.ending=true;const effects=skip?[]:['aya','ayame','kokone','mimizuku','chris'].filter(id=>hasLeader(p,id));s.queue.push({kind:'endOrder',p:i,effects});process(s);}
function endEffect(s,i,id){const p=s.players[i];if(id==='chris'&&p.chips>=2)choice(s,'chrisSave',i,['skip','use'],'声援2枚を支払い、財産1枚と1枚ドローを得ますか？',{continueEnd:true});if(id==='aya'){p.ayaEndDone=s.turn;if((p.songsPlayed||0)>=3){p.fanChips+=2;log(s,'彩：ファンチップ＋2');}}
 if(id==='ayame'&&p.chips>=2)choice(s,'ayameEnd',i,['skip','use'],'あやめ：声援2枚でくじ引き券を得ますか？');
 if(id==='kokone'&&!p.rehearsal){const options=p.hand.filter(c=>c.n>=2&&!c.special).map(c=>c.uid);if(options.length)choice(s,'kokoneSet',i,['skip',...options],'リハーサルに置く楽曲を選択（任意）',{continueEnd:true});}
 if(id==='mimizuku'&&p.chips>=1&&s.players[1-i].hand.some(discardable))choice(s,'mimizukuEnd',i,['skip','use'],'任務を遂行します！：声援1枚で相手の手札を捨てさせますか？',{continueEnd:true});}
function next(s){
 delete s.ending;
 const p=s.players[s.active];
 if(hasLeader(p,'mio')){p.experience=Math.min(12,(p.experience||0)+1);log(s,'澪：経験＋1（'+p.experience+'/12）');}
 if(hasLeader(p,'aya')&&p.ayaEndDone!==s.turn&&(p.songsPlayed||0)>=3){p.fanChips=(p.fanChips||0)+2;log(s,'彩：私にできること、全部 ファンチップ＋2');finish(s);if(s.winner!==null)return;}
 p.soloSpot=false;p.moeDouble=false;p.moeFreeSupport=0;p.songsPlayed=0;p.temp=0;p.buff=0;p.eventBuff=0;p.cardBuff=0;s.deckMuteTurn=null;
 for(const f of [...s.row,...s.audience,...s.players.flatMap(p=>p.fans)])delete f.muted;
 if((p.extraTurns||0)>0){p.extraTurns--;log(s,'天子：追加ターン');}else s.active=1-s.active;s.turn++;const q=s.players[s.active];q.fanShield=false;q.songsPlayed=0;q.ready=q.team.map((id,j)=>q.startLocked?.includes(id)?q.ready[j]:!(q.moeHeld||[]).includes(id));q.moeHeld=[];q.service=0;
 log(s,'── '+(s.active?'CPU':'あなた')+'のターン ──');startSkill(s,true);process(s);
}

function dispatch(s,a){
 if(s.winner!==null)throw Error('ライブは終了しています');
 if(a.type==='choose'){
 const z=s.pending;if(!z||!z.options.includes(a.value))throw Error('選択対象がありません');
 if(z.kind==='chrisSave'){s.pending=null;delete s.ending;if(a.value==='use'){const p=s.players[z.p];if(p.chips<2)throw Error('声援が足りません');p.chips-=2;p.wealth=(p.wealth||0)+1;draw(s,z.p);log(s,'クリス：声援2枚を支払い、財産＋1、1枚ドロー');}if(z.continueEnd){s.ending=true;process(s);return s;}return dispatch(s,{type:'end',ticket:z.ticket,skipEndSkill:z.skipEndSkill,chrisDone:true});}
 if(z.kind==='kanaDrift'||z.kind==='kanaDriftOption')return chooseDrift(s,z,a.value);
 if(z.kind==='mitsuhaStart'&&a.value==='swap'&&!canMitsuhaSwap(s,z.p))throw Error('先頭と山札を交換できません');
 if(z.kind==='kanaMemory'&&a.value!=='done'&&!s.players[z.p].memory.some(c=>c.uid===a.value&&c.owner==='kana'&&!c.special))throw Error('河奈のメモリーを選んでください');
 if(z.kind==='emiConvert'&&a.value!=='skip'&&s.players[z.p].chips<2)throw Error('声援チップが足りません');
 if(z.kind==='mimizukuEnd'&&a.value==='use'&&(!hasLeader(s.players[z.p],'mimizuku')||s.players[z.p].chips<1||!s.players[1-z.p].hand.some(discardable)))throw Error('声援チップ1枚と相手の楽曲手札が必要です');
 if(z.kind==='recover'&&a.value!=='skip'&&(s.players[z.p].chips<1||!s.players[z.p].discard.some(c=>c.uid===a.value)))throw Error('回収には声援チップ1枚と捨て札の楽曲が必要です');
 if((z.kind==='misaStart'||z.kind==='misaPurple')&&a.value!=='skip'&&s.players[z.p].chips<(z.kind==='misaStart'?1:(z.cost??2)))throw Error('声援チップが足りません');
 if(z.kind==='endDrinks'&&a.value!=='skip'&&!drinkItems(s.players[z.p]).some(c=>c.uid===a.value))throw Error('ドリンクがありません');
 if(z.kind==='miyabiDebuff'&&a.value==='use'&&s.players[z.p].chips<1)throw Error('声援チップが足りません');
 if(z.kind==='chieReset'&&a.value==='use'&&(!hasLeader(s.players[z.p],'chie')||s.players[z.p].chieResetUsed))throw Error('再使用権は使用済みです');
 s.pending=null;
 if(z.kind==='startOrder'||z.kind==='endOrder'){s.queue.unshift({kind:z.kind==='startOrder'?'startEffect':'endEffect',p:z.p,id:a.value},{kind:z.kind,p:z.p,effects:z.effects.filter(id=>id!==a.value)});process(s);return s;}
 if(z.kind==='ayameEnd'&&a.value==='use'){const p=s.players[z.p];if(p.chips<2)throw Error('声援チップが足りません');p.chips-=2;ticket(s,p);}
 if(z.kind==='request'){const p=s.players[z.p];if(a.value!=='skip'){const at=p.deck.findIndex(c=>c.uid===a.value);if(at<0||at>=4)throw Error('確認した楽曲を選んでください');p.hand.push(p.deck.splice(at,1)[0]);}shuffle(s,p.deck);log(s,'リクエスト募集：'+(a.value==='skip'?'手札に加えず':'1枚を手札に加えて')+'山札をシャッフル');}

 if(z.kind==='ririPass'){const list=z.cards;if(a.value==='pass'){const at=list.findIndex(f=>f.type==='trouble'),f=list.splice(at,1)[0];s.players[z.p].fanChips++;gain(s,z.p,list,z.effects,true);gain(s,1-z.p,[f],z.effects,true);log(s,'梨里：厄介なファンを相手へ渡し、ファンチップ＋1');}else gain(s,z.p,list,z.effects,true);}
 if(z.kind==='kokoneSet'){const p=s.players[z.p];if(a.value!=='skip'){const at=p.hand.findIndex(c=>c.uid===a.value);p.rehearsal=p.hand.splice(at,1)[0];log(s,'リハーサルに'+song(p.rehearsal).name+'を置いた');}if(z.continueEnd)process(s);else endDrinks(s,!!z.skipEndSkill);return s;}
 if(z.kind==='kokoneUse'&&a.value==='skip'){log(s,'リハーサル：使用せず楽曲を残した');process(s);return s;}
 if(z.kind==='kokoneUse'){const p=s.players[z.p],c=p.rehearsal,aa=a.value.split(',').map(Number);if(!c||p.vol<requiredVoltage(p,c)||!rehearsalActors(p,c).some(x=>x.join(',')===a.value))throw Error('リハーサルを使用できません');const opt=!p.songSeal&&driftOption(s,z.p,c,'fan');if(opt){choice(s,'kokoneExtra',z.p,['skip','use'],'リハーサル：'+opt.text,{actors:aa,flag:opt.flag,optionText:opt.text});return s;}return useRehearsal(s,z.p,aa,{});}
 if(z.kind==='kokoneExtra'){const p=s.players[z.p],c=p.rehearsal,opt=c&&!p.songSeal&&driftOption(s,z.p,c,'fan');if(a.value==='use'&&(!opt||opt.flag!==z.flag))throw Error('追加効果を使用できません');const flags={};if(a.value==='use'){flags[z.flag]=true;if(z.flag==='debuff')p.chips--;}return useRehearsal(s,z.p,z.actors,flags);}
 if(z.kind==='kokoneEventSet'){const p=s.players[z.p],at=p.hand.findIndex(c=>c.uid===a.value&&c.special!=='painted');if(at<0||p.rehearsal)throw Error('リハーサルに置く楽曲を選んでください');p.rehearsal=p.hand.splice(at,1)[0];s.queue.unshift({kind:'kokoneEcho',p:z.p,times:1});}
 if(z.kind==='miyabiDebuff'&&a.value==='use'){s.players[z.p].chips-=1;lowerVoltage(s,1-z.p,20);}
 if(z.kind==='chieReset'&&a.value==='use'){const p=s.players[z.p],e=p.events.find(e=>e.id===z.eventId);p.chieResetUsed=true;e.used=false;e.lastTurn=null;log(s,'千詠：'+EVENTS[e.id].event+'を再使用可能にした（支払いは必要）');}
 if(z.kind==='chiePayment'){const paid=[...(z.selected||[]),a.value],p=s.players[z.p];if(paid.length<EVENTS.chie.cost[1]){choice(s,'chiePayment',z.p,z.options.filter(x=>x!==a.value),'終わりをほどく：本人3枚分を支払う（残り'+(EVENTS.chie.cost[1]-paid.length)+'枚）',{selected:paid,count:EVENTS.chie.cost[1]});return s;}spendEvent(s,z.p,'chie',paid);resetEvent(s,z.p,'chie');adversity(s,z.p);process(s);return s;}
 if(z.kind==='misaStart'&&a.value!=='skip'){s.players[z.p].chips--;addDrink(s,s.players[z.p],a.value);}
 if(z.kind==='misaPurple'&&a.value==='use'){s.players[z.p].chips-=z.cost??2;addDrink(s,s.players[z.p],'drinkPurple');}
 if(z.kind==='endDrinks'){if(a.value==='skip'){next(s);return s;}const p=s.players[z.p],at=p.items.findIndex(c=>c.uid===a.value),c=p.items.splice(at,1)[0],d=DRINKS[c.item];log(s,d.name+'を1つ使用');if(d.vol)voltage(p,d.vol);if(d.fan){const n=d.fan+(p.buff||0)+(p.cardBuff||0);p.buff=0;s.queue.push({kind:'normal',p:z.p,n});}s.queue.push({kind:'endDrinks',p:z.p});process(s);return s;}
 if(z.kind==='mitsuhaStart'&&a.value==='swap'){const old=s.row[0],top=s.audience[0];old.lock=null;top.lock=null;s.row[0]=top;s.audience[0]=deckFan(old);if(s.deckMuteTurn===s.turn)top.muted=true;seatEffect(s,top);log(s,'三葉：観客席の先頭と山札の一番上を交換');}
 if(z.kind==='kanaMemory'&&a.value!=='done'){const p=s.players[z.p],at=p.memory.findIndex(c=>c.uid===a.value);p.discard.push(p.memory.splice(at,1)[0]);p.temp++;log(s,'河奈：メモリー1枚を捨て、このターン＋1ポイント');s.queue.unshift({kind:'kanaMemory',p:z.p});}
 if(z.kind==='mimizukuEnd'){if(a.value==='use'){s.players[z.p].chips--;log(s,'ミミズク：ターン終了時、声援チップ1枚を支払った');choice(s,'mimizukuDiscard',1-z.p,s.players[1-z.p].hand.filter(discardable).map(c=>c.uid),'ミミズク：自分の手札から捨てる楽曲を1枚選択',{endTurn:true,continueEnd:!!z.continueEnd});}else if(z.continueEnd)process(s);else endDrinks(s);return s;}
 if(z.kind==='mimizukuDiscard'){const p=s.players[z.p],at=p.hand.findIndex(c=>c.uid===a.value),c=p.hand.splice(at,1)[0];p.discard.push(c);log(s,'ミミズク：'+song(c).name+'を相手の選択で捨て札にした');if(z.endTurn){process(s);if(s.winner===null&&!z.continueEnd)endDrinks(s);return s;}}
 if(z.kind==='mimizukuReveal'){const p=s.players[z.p],ids=new Set(z.cards.map(f=>f.uid)),chosen=s.audience.filter(f=>ids.has(f.uid)&&fanPoints(p,f)===1);gain(s,z.p,chosen,false);shuffle(s,s.audience);log(s,'ざこどもちゃれんじ！：'+acquisitionCount(p,chosen.length)+'枚を観客効果なしで獲得し、残りの観客山札をシャッフル');}
 if(z.kind==='moeReady'){const p=s.players[z.p],j=Number(a.value);p.ready[j]=true;log(s,'萌：'+CHAR[p.team[j]].short+'を未行動にした');if(p.service<2)service(s,z.p,j);}
 if(z.kind==='akinaDraw'){const p=s.players[z.p],at=p.deck.findIndex(c=>c.uid===a.value);p.hand.push(p.deck.splice(at,1)[0]);shuffle(s,p.deck);log(s,'秋奈：山札の上から1枚選んでドローし、残りの山札をシャッフルした');}
 if(z.kind==='akinaReturn'&&a.value==='return'){const p=s.players[z.p],at=p.memory.findIndex(c=>c.uid===z.card);if(at>=0){p.hand.push(p.memory.splice(at,1)[0]);log(s,'秋奈：使用した楽曲をメモリーから手札へ戻した');}}
 if(z.kind==='emiConvert'&&a.value!=='skip'){s.players[z.p].chips-=2;exchangeFan(s,z.p,a.value,'believer');log(s,'恵美：声援チップ2枚を支払った');}
 if(z.kind==='emiBottom'&&a.value!=='skip'){const f=s.row.find(f=>f.uid===a.value);moveOut(s,f);s.audience.push(deckFan(f));log(s,'恵美：'+FAN[f.type].name+'を観客山札の下へ戻した');fill(s);}
 if(z.kind==='ayaReady'&&a.value!=='skip'){const p=s.players[z.p];if(p.vol<z.cost)throw Error('追加のVOLが足りません');voltage(p,-z.cost);if(z.all)p.team.forEach((id,j)=>{if(id!=='aya')p.ready[j]=true;});else p.ready[Number(a.value)]=true;log(s,'彩：VOL－'+z.cost+'％、仲間'+(z.all?'全員':'1人')+'を未行動にした');}
 if(z.kind==='hikariOffer'&&a.value==='accept'){const p=s.players[z.p];choice(s,'hikariDiscard',z.p,p.hand.filter(discardable).map(c=>c.uid),'光：捨てる手札を'+z.count+'枚選択',{count:z.count,draw:z.draw??z.count+1,selected:[]});}
 if(z.kind==='hikariDiscard'){const p=s.players[z.p],selected=[...(z.selected||[]),a.value];if(selected.length<z.count){choice(s,'hikariDiscard',z.p,z.options.filter(x=>x!==a.value),'光：捨てる手札をあと'+(z.count-selected.length)+'枚選択',{count:z.count,draw:z.draw??z.count+1,selected});}else{const cards=p.hand.filter(c=>selected.includes(c.uid));p.hand=p.hand.filter(c=>!selected.includes(c.uid));p.discard.push(...cards);draw(s,z.p,z.draw??z.count+1);log(s,'光：手札'+z.count+'枚を捨て、'+(z.draw??z.count+1)+'枚ドロー');}}
 if(z.kind==='recover'&&a.value!=='skip'){const p=s.players[z.p],at=p.discard.findIndex(c=>c.uid===a.value);p.chips--;p.hand.push(p.discard.splice(at,1)[0]);log(s,'春：声援チップ1枚を支払い、捨て札の楽曲を手札に戻した');}
 if(z.kind==='hakkaReady'&&a.value!=='skip')s.players[z.p].ready[Number(a.value)]=true;
 if(z.kind==='mutePick'&&a.value!=='skip'){const f=s.row.find(f=>f.uid===a.value);if(f){f.muted=true;log(s,FAN[f.type].name+'の効果をターン終了まで無効');s.queue.unshift({kind:'mutePick',p:z.p,left:z.left-1,selected:[...z.selected,a.value]});}}
 if(z.kind==='shio'){if(a.value==='chip')s.players[z.p].chips++;else voltage(s.players[z.p],10);}
 if(z.kind==='trouble'||z.kind==='machiRemove')removeFan(s,z.p,a.value,z.kind==='machiRemove'?1-z.p:z.p);
 if(z.kind==='raiPick'){const selected=[...(z.selected||[]),a.value],count=z.count||1;if(selected.length<count){choice(s,'raiPick',z.p,z.options.filter(id=>id!==a.value),(z.title||'雷')+'：獲得する観客をあと'+(count-selected.length)+'枚選択',{count,selected,...(z.rowOnly?{rowOnly:true,title:z.title}:{})});}else{const fs=(z.rowOnly?s.row:[...s.row,...s.audience.slice(0,2)]).filter(f=>selected.includes(f.uid));gain(s,z.p,fs,true,true);}}
 process(s);return s;
 }
 if(s.pending)throw Error('先に効果を選択してください');
 const i=s.active,p=s.players[i];
 if(s.ending)throw Error('ターン終了処理中です');
 if(a.type==='end'){if(!a.skipEndSkill&&leaders(p).length===1&&hasLeader(p,'chris')&&p.chips>=2&&!a.chrisDone){s.ending=true;choice(s,'chrisSave',i,['skip','use'],'積もる雪、白い夜：声援2枚を支払い、財産1枚と1枚ドローを得ますか？',{ticket:a.ticket,skipEndSkill:a.skipEndSkill});return s;}if(leaders(p).length>1){beginMultiEnd(s,i,!!a.skipEndSkill);return s;}if(!a.skipEndSkill&&hasLeader(p,'kokone')&&!p.rehearsal&&p.hand.some(c=>c.n>=2&&!c.special)){s.ending=true;choice(s,'kokoneSet',i,['skip',...p.hand.filter(c=>c.n>=2&&!c.special).map(c=>c.uid)],'リハーサルに置く楽曲を選択（任意）',{skipEndSkill:!!a.skipEndSkill});return s;}if(!a.skipEndSkill&&hasLeader(p,'mimizuku')&&p.chips>=1&&s.players[1-i].hand.some(discardable)){choice(s,'mimizukuEnd',i,['skip','use'],'任務を遂行します！：ターン終了時に声援1枚で手札を捨てさせますか？');return s;}if(a.ticket){if(!hasLeader(p,'ayame')||p.chips<2)throw Error('あやめの終了時能力を使用できません');p.chips-=2;ticket(s,p);}endDrinks(s,!!a.skipEndSkill);return s;}
 if(a.type==='buy'){if(!Object.hasOwn(SHOP,a.item)||cashCount(p)<2)throw Error('現金2個と交換先が必要です');let left=2;p.items=items(p).filter(c=>c.item==='cash'&&left>0?(left--,false):true);log(s,'買い物：現金2個で'+SHOP[a.item].name);if(a.item==='support'){s.queue.push({kind:'chip',p:i},{kind:'chip',p:i});}else if(a.item==='fanChip')p.fanChips++;else if(a.item==='meat')meat(s,p);else if(a.item==='teddy')teddy(s,p);else addDrink(s,p,'drinkPurple');process(s);return s;}
 if(a.type==='ticket'){useTicket(s,i,a.id);return s;}
 if(a.type==='leaderSkill'){
 if(!hasLeader(p,'hikari')||p.hikariSkillUsed)throw Error('光のリーダースキルはゲーム中1度だけです');
 if(p.vol<100)throw Error('光のリーダースキルにはVOL100％以上が必要です');
 const paid=a.discard||[];if(paid.length!==3||new Set(paid).size!==3||paid.some(x=>!p.hand.some(c=>c.uid===x&&discardable(c))))throw Error('捨てる手札を異なる3枚選んでください');
 const cards=p.hand.filter(c=>paid.includes(c.uid));p.hand=p.hand.filter(c=>!paid.includes(c.uid));p.discard.push(...cards);p.hikariSkillUsed=true;awardChips(s,i,6);log(s,'光：怖いからこそ、全速力！ 手札3枚を捨て、声援チップ＋6');process(s);return s;
 }
 if(a.type==='service'){service(s,i,a.actor);process(s);return s;
 }
 if(a.type==='wealth'){if(!Number.isInteger(a.amount)||a.amount<1||a.amount>(p.wealth||0))throw Error('財産の枚数が不正です');p.wealth-=a.amount;awardChips(s,i,a.amount);log(s,'財産を'+a.amount+'枚取り崩した');process(s);return s;}
 if(a.type==='support'){
 if(supportSealed(s,i))throw Error('このターン、声援効果は封印されています');
 const cost={draw:2,refresh:6,lock:2,hold:3}[a.effect],free=a.free===true;
 if(free&&!supportFree(p,a.effect))throw Error('無料で使用できる声援効果がありません');
 if(cost===undefined||!free&&p.chips<cost)throw Error('声援チップが足りません');
 if(a.effect==='refresh'&&p.ready.every(Boolean))throw Error('全員が未行動です');
 if(a.effect==='draw'&&!p.deck.length)throw Error('山札にカードがありません');
 if(a.effect==='lock'&&(!hasLeader(p,'rai')||s.row.some(f=>f.lock===i)||!s.row.some(f=>f.uid===a.target&&f.lock===null)))throw Error('独占チップを置けません');
 if(a.effect==='hold'&&(!hasLeader(p,'moe')||!moeTargets(s,i).includes(a.target)))throw Error('相手の行動済みで、まだ行動封じがないアイドルを選んでください');
 if(free)p.moeFreeSupport--;else p.chips-=cost;chipEffect(s,i);
 if(a.effect==='draw')draw(s,i);
 if(a.effect==='hold'){const q=s.players[1-i];q.moeHeld=[...(q.moeHeld||[]),a.target];log(s,CHAR[a.target].short+'は次のターン開始時に未行動に戻らない');}
 if(a.effect==='refresh')p.ready=[true,true,true];
 if(a.effect==='lock')s.row.find(f=>f.uid===a.target).lock=i;
 log(s,'声援チップ効果：'+({draw:'1枚ドロー',refresh:'全員を未行動に',lock:'独占チップを配置',hold:'相手の行動封じ'}[a.effect])+(free?'（無料・残り'+p.moeFreeSupport+'回）':''));finish(s);return s;
 }
 if(a.type==='play'){
 const at=p.hand.findIndex(c=>c.uid===a.card);if(at<0)throw Error('カードがありません');
 const c=p.hand[at],d=song(c),actors=a.actors||[],effects=!p.songSeal;
 if(!effects&&(a.boost||a.pick||a.debuff))throw Error('楽曲の追加効果は封印されています');
 if(!playOK(s,i,c,actors,a.mode))throw Error('必要人数と指定メンバーを選んでください');
 if(a.mode==='fan'&&p.vol<requiredVoltage(p,c))throw Error('必要ボルテージが足りません');
 if(a.boost&&!(a.mode==='fan'&&c.owner==='natsume'&&c.n<3))throw Error('追加支払いができません');
 if(a.pick&&!(a.mode==='fan'&&c.owner==='rai'))throw Error('選択獲得ができません');
 if(a.pick&&c.n===1&&p.chips<1)throw Error('声援チップが足りません');
 if(a.debuff&&!canMiyabiDebuff(c,a.mode))throw Error('この楽曲・モードでは追加効果を使えません');
 if(a.debuff&&p.chips<1)throw Error('声援チップが足りません');
 if(effects&&c.owner==='yuu'&&a.mode==='fan'&&p.vol<normalVoltage(p,c))p.borrowDue=true;
 if(a.debuff)p.chips-=1;
 if(c.n===3&&c.special!=='painted')p.soloSpot=false;p.hand.splice(at,1);p.memory.push(c);p.songsPlayed=(p.songsPlayed||0)+1;actors.forEach(j=>p.ready[j]=false);log(s,(i?'CPU':'あなた')+'「'+d.name+'」'+(a.mode==='vol'?' vol＋'+d.vol+'％':' fan'));
 return prepareSong(s,i,c,a);
 }
 if(a.type==='event'){
 const id=a.id,d=EVENTS[id];if(!d||!eventOK(s,i,id))throw Error('イベントの使用条件を満たしていません');
 const paid=a.memory||[];
 if(!paymentOK(p,id,paid))throw Error('メモリーの支払い条件を確認してください');
 if(id==='chitose'&&(!s.players[1-i].team.includes(a.target)||hasLeader(s.players[1-i],a.target)||s.players[1-i].startLocked?.includes(a.target)))throw Error('相手のリーダー以外で、まだ開始時回復を封じていないアイドルを選んでください');
 if(id==='kayo'&&(!(a.discard?.length>=1&&a.discard.length<=3)||(a.discard||[]).some(x=>!p.hand.some(c=>c.uid===x&&discardable(c)))||new Set(a.discard||[]).size!==(a.discard||[]).length))throw Error('捨てる手札を確認してください');
 if(id==='emi'&&(!s.players[1-i].fans.some(f=>f.uid===a.target&&fanPoints(s.players[1-i],f)===1)||fansProtected(s,1-i,i)))throw Error('相手の1ポイントの観客を選んでください');
 if(id==='hana'&&(!Number.isInteger(a.actor)||p.ready[a.actor]!==false))throw Error('行動済みのアイドルを選んでください');
 if(id==='machi'&&((a.targets||[]).some(x=>!unlocked(s,i).some(f=>f.uid===x))||new Set(a.targets||[]).size!==(a.targets||[]).length))throw Error('戻す観客を確認してください');
 if(id==='rai'&&(!s.row.some(f=>f.uid===a.target&&(f.lock===null||f.lock===i))||!s.audience.some(f=>f.type==='core')))throw Error('交換できるコアファンまたは観客がありません');
 if(id==='switch'&&leaders(p).length<2&&(!p.team.includes(a.leader)||a.leader===p.leader))throw Error('別のリーダーを選んでください');
 if(id==='akina'&&((a.targets||[]).some(x=>!p.hand.some(c=>c.uid===x&&memoryable(c)))||new Set(a.targets||[]).size!==(a.targets||[]).length))throw Error('メモリーに置く手札を確認してください');
 if(id==='wit'&&!p.hand.some(c=>c.uid===a.hand&&memoryable(c)))throw Error('手札を1枚選んでください');
 if(id==='duo'&&(leaders(p).length>=2||!p.team.includes(a.target)||hasLeader(p,a.target)))throw Error('追加する非リーダーを選んでください');
 if(id==='lastOrder'&&(![3,6,9].includes(a.amount)||p.chips<a.amount))throw Error('声援チップを3・6・9枚から選んでください');
 const ayaCount=ayaEventCount(p),discardBefore=p.discard.length,whiteTrigger=hasLeader(p,'hakka');const spending=p.memory.filter(c=>paid.includes(c.uid));p.items=items(p).filter(c=>!paid.includes(c.uid));p.memory=p.memory.filter(c=>!paid.includes(c.uid));if(id!=='hikari')p.discard.push(...spending);p.events.find(e=>e.id===id).used=!d.repeat;p.events.find(e=>e.id===id).lastTurn=s.turn;log(s,(i?'CPU':'あなた')+' EVENT「'+d.event+'」');
 if(id==='kazuna')p.goalEvent=true;if(id==='mio'){p.experience=Math.min(12,(p.experience||0)+3);log(s,'澪イベント：経験＋3');}if(id==='yuu')p.tomorrowEvent=true;if(id==='chris'){const n=p.wealth||0;p.wealth=0;awardChips(s,i,n);p.fanChips+=Math.floor(n/2);log(s,'クリスイベント：財産'+n+'枚を声援へ、ファンチップ＋'+Math.floor(n/2));}
 if(id==='kayo'){const cards=p.hand.filter(c=>(a.discard||[]).includes(c.uid));p.hand=p.hand.filter(c=>!(a.discard||[]).includes(c.uid));p.discard.push(...cards);s.queue.push({kind:'normal',p:i,n:Math.min(3,cards.length+p.buff+(p.cardBuff||0))});p.buff=0;}
 if(id==='machi'){const targets=s.row.filter(f=>(a.targets||[]).includes(f.uid));for(const f of targets)moveOut(s,f);s.audience.push(...shuffle(s,targets.map(deckFan)));fill(s);}
 if(id==='redo'){const cards=unlocked(s,i);for(const f of cards)moveOut(s,f);s.audience.push(...cards.map(deckFan));shuffle(s,s.audience);fill(s);}
 if(id==='switch'){if(leaders(p).length>=2)log(s,'センタースイッチ：リーダーが2人以上のため失敗');else changeLeader(s,i,a.leader);}
 if(id==='trouble'){for(const [who,n] of [[i,1],[1-i,2]]){if(fansProtected(s,who,i))continue;for(let j=0;j<n&&s.players[who].fans.length;j++){const list=s.players[who].fans;removeFan(s,who,list[Math.floor(rng(s)*list.length)].uid,i);}}}
 if(id==='mimizuku')s.queue.push({kind:'mimizukuReveal',p:i});
 if(id==='fukurou'){const q=s.players[1-i],n=Math.min(6,q.chips);q.chips-=n;awardChips(s,i,n);log(s,'摘出カーテンコール：声援チップ'+n+'枚を奪った');}
 if(id==='ayame')ticket(s,p,5);
 if(id==='tempest')s.queue.push({kind:'raiPick',p:i,count:2,exact:true,title:'TEMPEST'},...Array.from({length:3},()=>({kind:'draw',p:i})));
 if(id==='nightmare'){p.fanChips+=3;for(let j=0;j<3;j++)teddy(s,p);log(s,'からふる☆まじかる☆ないとめあ：ファンチップ＋3、くまのぬいぐるみ＋3');}
 if(id==='detatoko'){draw(s,i,3);ticket(s,p,5);}
 if(id==='vengeance'){p.team.forEach((id,j)=>{if(id==='emi'||id==='aya')p.ready[j]=true;});p.fanChips+=4;log(s,'Crystalline Vengeance：恵美と彩を未行動に、ファンチップ＋4');}
 if(id==='collection'){teddy(s,p);teddy(s,p);}
 if(id==='request'){const cards=p.deck.slice(0,4);choice(s,'request',i,['skip',...cards.map(c=>c.uid)],'リクエスト募集：手札に加える楽曲を1枚まで選択',{cards:JSON.parse(JSON.stringify(cards))});}
 if(id==='solo'){p.soloSpot=true;log(s,'ソロスポット：次の手札の3人用楽曲を本人1人で使用');}
 if(id==='lastOrder'){p.chips-=a.amount;p.fanChips+=a.amount/3;log(s,'ラストオーダー：声援'+a.amount+'枚でファンチップ＋'+a.amount/3);}
 if(id==='duo'){p.extraLeaders=[a.target];log(s,'DUO：'+CHAR[a.target].name+'もリーダーになった');}
 if(id==='scene'){const q=s.players[1-i];if(leaders(q).length>=2)log(s,'場面転換：相手のリーダーが2人以上のため失敗');else{const opts=q.team.filter(id=>!hasLeader(q,id));changeLeader(s,1-i,opts[Math.floor(rng(s)*opts.length)]);}}
 if(id==='finale'){const n=p.ready.filter(x=>!x).length;p.fanChips+=n;log(s,'静かなフィナーレ：ファンチップ＋'+n);}
 if(id==='rampage'){const q=s.players[1-i];q.fanChips=(q.fanChips||0)+5;log(s,'暴走舞台：相手のファンチップ＋5');voltage(p,100);log(s,'暴走舞台：VOL＋100％');}
 if(id==='scandal'){let returned=0;for(const f of [...p.fans])if(removeFan(s,i,f.uid))returned++;const n=returned+3+p.buff+(p.cardBuff||0);p.buff=0;log(s,'炎上商法：'+returned+'枚を戻し、観客'+n+'枚を獲得');s.queue.push({kind:'normal',p:i,n});}
 if(id==='buzz'){const at=s.audience.findIndex(f=>f.type==='influencer'),old=s.row[0],next=s.audience[at];old.lock=null;s.audience[at]=deckFan(old);s.row[0]=next;log(s,'唐突バズ：先頭をインフルエンサーと交換');}
 if(id==='overcome')draw(s,i,2);
 if(id==='moe'){p.moeFreeSupport=3;log(s,'信じてくれるなら：このターン、声援3枚以下の声援効果を無料であと3回');}
 if(id==='nina'){const n=Math.min(3,teddyCount(p));p.fanChips=(p.fanChips||0)+n;log(s,'枕の横のテディベア：ファンチップ＋'+n+'（ぬいぐるみは消費しない）');}
 if(id==='viewing')p.liveViewing=true;
 if(id==='mc')p.fanShield=true;
 if(id==='akina'){const cards=p.hand.filter(c=>(a.targets||[]).includes(c.uid));p.hand=p.hand.filter(c=>!(a.targets||[]).includes(c.uid));p.memory.push(...cards);log(s,'秋奈：手札の楽曲'+cards.length+'枚をメモリーに置いた');}
 if(id==='wit'){const at=p.hand.findIndex(c=>c.uid===a.hand);p.memory.push(p.hand.splice(at,1)[0]);draw(s,i);}
 if(id==='haru'){const list=[...unlocked(s,i),...(fansProtected(s,1-i,i)?[]:s.players[1-i].fans)].filter(f=>f.type==='dream');gain(s,i,list);}
 if(id==='hakka'){const n=3+Math.floor(p.memory.length/3);p.fanChips=(p.fanChips||0)+n;p.discard.push(...p.memory);p.memory=[];log(s,'ファンチップ＋'+n+'（1つにつき1ポイント）');}
 if(id==='homura'){s.deckMuteTurn=s.turn;s.audience.forEach(f=>f.muted=true);p.cardBuff=(p.cardBuff||0)+1;}
 if(id==='natsume')p.eventBuff++;
 if(id==='shio'){const n=p.vol>=180?7:3;p.temp+=n;log(s,'常盤戯ノ宴：このターン＋'+n+'ポイント');}
 if(id==='emi')exchangeFan(s,1-i,a.target,'anti');
 if(id==='aya'){log(s,'彩：観客1人の獲得を'+ayaCount+'回繰り返す');for(let j=0;j<ayaCount;j++)s.queue.push({kind:'normal',p:i,n:1});}
 if(id==='hikari'){const n=Math.floor(discardBefore/3);p.temp+=n;log(s,'WHITEOUT：使用前の捨て札'+discardBefore+'枚で、このターン＋'+n+'ポイント');p.discard.push(...spending);}
 if(id==='hana')p.ready[a.actor]=true;
 if(id==='rai'){const at=s.row.findIndex(f=>f.uid===a.target),old=s.row[at],core=s.audience.find(f=>f.type==='core');s.audience=s.audience.filter(f=>f.uid!==core.uid);old.lock=null;s.audience.push(deckFan(old));s.row[at]=core;shuffle(s,s.audience);}
 if(id==='shiro'){const q=s.players[1-i],cards=q.hand.filter(c=>c.special==='painted');q.hand=q.hand.filter(c=>c.special!=='painted');p.hand.push(...cards.map(c=>({...c,owner:'shiro',n:1,special:'world'})));log(s,'Chroma & Crescent：'+cards.length+'枚を奪い、鳴り響く世界に変化');}
 if(id==='hibiki'){if(p.vol>=300){p.temp+=15;log(s,'MAXIMUM!!!：このターン＋15ポイント');}else{for(let j=0;j<10;j++)s.queue.push({kind:'chip',p:i});log(s,'MAXIMUM!!!：声援チップ10枚を獲得');}}
 if(id==='miyabi'){p.volGuard=true;log(s,'春雷の誓い：残りゲーム中VOL低下を防ぐ');}
 if(id==='kana')s.queue.push({kind:'kanaMemory',p:i});
 if(id==='tenko'){p.extraTurns=(p.extraTurns||0)+1;log(s,'天子：このターンの後に追加ターン');}
 if(id==='mitsuha'){const cards=unlocked(s,i);for(const f of cards){const at=s.row.indexOf(f);f.lock=null;s.audience.push(deckFan(f));s.row[at]=localFan(s);}log(s,'三葉：観客席の'+cards.length+'枚を地元ファンに交換');s.queue.push({kind:'normal',p:i,n:1+p.buff+(p.cardBuff||0)});p.buff=0;}
 if(id==='mitama'){s.queue.push({kind:'normal',p:i,n:2+p.buff+(p.cardBuff||0)});p.buff=0;}
 if(id==='riri'){const n=Math.min(6,Math.max(0,s.players[1-i].fans.length-3));p.temp+=n;log(s,'梨里：このターン＋'+n+'ポイント');}
 if(id==='chitose'){const q=s.players[1-i];q.startLocked=[...(q.startLocked||[]),a.target];log(s,'千登勢：'+CHAR[a.target].short+'は残りのゲーム中、ターン開始時に未行動に戻らない');}
 if(id==='kokone'){if(p.rehearsal)s.queue.push({kind:'kokoneEcho',p:i,times:2});else choice(s,'kokoneEventSet',i,p.hand.filter(c=>c.special!=='painted').map(c=>c.uid),'イベント：リハーサルに置いてFANを発動する楽曲を選択');}
 if(id==='kono')cash(s,p,6);
 resetEvent(s,i,id);
 if(id==='chie')adversity(s,i);
 if(id==='misa'){addDrink(s,p,'drinkPurple');addDrink(s,p,'drinkPurple');}
 if(whiteTrigger)s.queue.push({kind:'hakkaReady',p:i});
 if(id==='finale')s.queue.push({kind:'finaleEnd',p:i});
 process(s);return s;
 }
 throw Error('不明な操作です');
}
// Drift reads both players' public memory and discard piles and borrows only printed additional effects, never base values or card ownership.
function driftSources(s,i,n,mode){return [s.players[i],s.players[1-i]].flatMap(p=>[...p.memory,...p.discard]).filter(c=>!c.special&&c.owner!=='kana'&&c.n===n&&detail(c)[mode+'Text']);}
function driftExtraCost(c,mode){if(canMiyabiDebuff(c,mode))return 1;if(c.owner==='misa'&&mode==='vol')return c.n===3?1:2;if(c.owner==='rai'&&c.n===1&&mode==='fan')return 1;return 0;}
function driftOption(s,i,source,mode){const p=s.players[i];if(mode==='fan'&&source.owner==='natsume'&&source.n<3)return {flag:'boost',text:p.vol>=130?'VOLを下げずに獲得＋1':'VOLを10％下げて獲得＋1'};if(mode==='fan'&&source.owner==='rai'&&(source.n!==1||p.chips>=1))return {flag:'pick',text:'通常獲得を'+(source.n===3?'上2枚と観客席から2枚':'観客席の1枚を選ぶ獲得')+'に変更'+(source.n===1?'（追加で声援1枚）':'')};if(canMiyabiDebuff(source,mode)&&p.chips>=1)return {flag:'debuff',text:'追加で声援1枚を支払い、相手のVOL－20％'};return null;}
function chooseDrift(s,z,value){
 const p=s.players[z.p],c=p.memory.find(c=>c.uid===z.card&&c.owner==='kana');if(!c)throw Error('使用中の河奈の楽曲がありません');
 const a={type:'play',card:c.uid,mode:z.mode};
 if(z.kind==='kanaDrift'){
 if(value==='skip'){s.pending=null;return resolveSong(s,z.p,c,a);}
 const source=driftSources(s,z.p,c.n,z.mode).find(c=>c.uid===value);if(!source)throw Error('漂流元がありません');if(!z.free&&p.chips<1)throw Error('漂流には声援チップ1枚が必要です');
 s.pending=null;if(!z.free)p.chips--;log(s,'漂流：'+song(source).name+'の'+z.mode+'追加効果を借りた'+(z.free?'（リーダー効果で無料）':'（声援1枚）'));
 const extra=driftExtraCost(source,z.mode);if(extra>p.chips)log(s,'漂流：借りた追加効果には声援'+extra+'枚が必要ですが、漂流の支払い後に不足しているため追加効果は使えません');
 const opt=driftOption(s,z.p,source,z.mode);if(opt){choice(s,'kanaDriftOption',z.p,['skip','use'],'漂流：'+opt.text,{card:c.uid,mode:z.mode,source:source.uid,flag:opt.flag,optionText:opt.text});return s;}
 return resolveSong(s,z.p,c,a,source);
 }
 const source=driftSources(s,z.p,c.n,z.mode).find(c=>c.uid===z.source);if(!source)throw Error('漂流元がありません');
 const opt=driftOption(s,z.p,source,z.mode);if(value==='use'&&(!opt||opt.flag!==z.flag))throw Error('追加の支払い条件を満たしていません');
 if(value==='use'){a[z.flag]=true;if(z.flag==='debuff')p.chips-=1;}
 s.pending=null;return resolveSong(s,z.p,c,a,source);
}
function driftValue(s,i,c,mode,cost=0){const p={...s.players[i],chips:s.players[i].chips-cost},q=s.players[1-i];if(driftExtraCost(c,mode)>p.chips)return 0;if(c.owner==='chitose')return (c.n>1||p.vol>=80)&&!fansProtected(s,1-i,i)&&q.fans.some(f=>fanPoints(q,f)===1)?1:0;if(c.owner==='mitama')return -1;if(c.owner==='kayo')return mode==='vol'&&p.deck.length?1:0;if(c.owner==='tenko'||c.owner==='hana')return .7;if(c.owner==='fukurou')return items(q).length+q.fanChips>0?1:0;if(c.owner==='ayame')return .9;if(c.owner==='shiro')return 1;if(c.owner==='chie')return p.deck.length?.8:0;if(c.owner==='akina')return mode==='fan'?.7:0;if(c.owner==='machi')return q.fans.length?1:0;if(c.owner==='hikari')return p.hand.length>0?.6:0;if(c.owner==='miyabi')return p.chips>=1&&q.vol>=40?.8:0;if(c.owner==='natsume')return mode==='fan'?.8:0;if(c.owner==='rai')return .7;if(c.owner==='aya')return p.vol>=100?1:0;if(c.owner==='moe')return 1;if(c.owner==='misa')return p.chips>=(c.n===3?1:2)?.8:0;if(c.owner==='kono'||c.owner==='hakka'||c.owner==='nina')return .8;if(c.owner==='haru')return .4;if(c.owner==='mitsuha')return p.team.includes('mitsuha')?.6:.1;return .3;}
function resolveSong(s,i,c,a,ec=c){
 const p=s.players[i],d=song(c),effects=!p.songSeal;
 if(effects&&c.owner==='yuu'&&a.mode==='fan'&&p.vol<normalVoltage(p,c))p.borrowDue=true;
 if(effects&&ec.owner==='mimizuku'&&a.mode==='fan'&&s.row[0]&&fanPoints(p,s.row[0])===1){const n=ec.n===3?2:1;log(s,'ミミズク：使用時の先頭が1ポイント、声援チップ＋'+n);for(let j=0;j<n;j++)s.queue.push({kind:'chip',p:i});}
 if(effects&&ec.owner==='kono'&&a.mode==='vol')cash(s,p);
 if(effects&&ec.owner==='fukurou'&&!ec.special)destroyResource(s,i);
 if(effects&&ec.owner==='ayame'&&(a.mode==='vol'||ec.n===3))ticket(s,p);
 if(effects&&ec.owner==='mitsuha'&&a.mode==='vol'){const f=localFan(s);if(s.deckMuteTurn===s.turn)f.muted=true;s.audience.unshift(f);log(s,'三葉：地元ファンを観客山札の一番上に配置');}
 if(effects&&ec.owner==='tenko'&&ec.n>1)s.queue.push({kind:'chip',p:i});
 if(a.mode==='vol'){
 if(effects&&ec.owner==='shiro'&&!ec.special){const q=s.players[1-i],count=ec.n===1?1:2;q.deck.push(...Array.from({length:count},()=>({uid:uid(s),owner:'shiro',n:3,special:'painted'})));shuffle(s,q.deck);log(s,'しろ：塗りつぶされたカード'+count+'枚を相手の山札に加えてシャッフル');}
 if(effects&&ec.owner==='chie'){const cards=p.deck.splice(0,ec.n===3?2:1);p.memory.push(...cards);cleanSpecial(s);log(s,'千詠：山札から'+cards.length+'枚をメモリーへ');}
 if(effects&&ec.owner==='emi')s.queue.push({kind:'emiBottom',p:i});
 if(effects&&ec.owner==='kayo')s.queue.push({kind:'draw',p:i});
 if(effects&&ec.owner==='hana')s.queue.push({kind:'chip',p:i});
 if(effects&&ec.owner==='haru'&&ec.n===3)dream(s);
 if(effects&&ec.owner==='hakka')meat(s,p);
 if(effects&&ec.owner==='nina'&&ec.n>1)teddy(s,p);
 s.queue.push({kind:'vol',p:i,n:d.vol});if(a.debuff)s.queue.push({kind:'miyabiLower',p:i});if(effects&&ec.owner==='misa')s.queue.push({kind:'misaPurple',p:i,cost:ec.n===3?1:2});
 }else{
 let n=fanCount(p,c,true)+(c.owner==='kana'&&ec.owner==='haru'&&ec.n===3&&p.fans.filter(f=>f.type==='dream').length>=2?1:0);p.buff=0;
 if(effects&&ec.owner==='shio'&&ec.n===3)s.queue.push({kind:'vol',p:i,n:10});
 if(a.debuff)s.queue.push({kind:'miyabiLower',p:i});
 if(a.boost){if(p.vol<130)voltage(p,-10);n++;}
 if(a.pick&&ec.n===1)p.chips--;
 if(effects&&ec.owner==='haru'&&ec.n<3)dream(s);
 if(effects&&ec.owner==='hakka'&&ec.n===3)meat(s,p);
 if(effects&&ec.owner==='homura')s.queue.push({kind:'mutePick',p:i,left:ec.n===3?2:1,selected:[]});
 if(effects&&ec.owner==='emi')s.queue.push({kind:'emiBottom',p:i});
 if(effects&&ec.owner==='machi'&&ec.n>1)s.queue.push({kind:'machiRemove',p:1-i,random:ec.n===3});
 if(effects&&ec.owner==='chitose'&&(ec.n>1||p.vol>=80))s.queue.push({kind:'chitoseRemove',p:i});
 if(effects&&['hana','hibiki'].includes(ec.owner)&&ec.n===3)s.queue.push({kind:'chip',p:i});
 if(a.pick)s.queue.push({kind:'raiPick',p:i,peek:ec.n===3,count:ec.n===3?2:1});else s.queue.push({kind:'normal',p:i,n,ririPass:effects&&ec.owner==='riri'&&ec.n>1});
 }
 if(effects&&ec.owner==='kokone'&&a.mode==='fan')s.queue.push({kind:'draw',p:i});
 if(effects&&ec.owner==='moe'&&a.mode==='fan'){if(ec.n<3)p.moeDouble=true;else for(let j=0;j<2;j++)s.queue.push({kind:'chip',p:i});}
 if(effects&&ec.owner==='akina'&&a.mode==='fan')s.queue.push({kind:'akinaReturn',p:i,card:c.uid});
 if(effects&&ec.owner==='aya'&&ec.n>1&&a.mode==='fan')s.queue.push({kind:'ayaReady',p:i,cost:ec.n===2?30:40,all:ec.n===3});
 if(effects&&ec.owner==='hikari'&&(a.mode==='fan'||ec.n===3))s.queue.push({kind:'hikariCycle',p:i,count:ec.n===3?2:1,draw:ec.n===3?2:1});
 if(effects&&ec.owner==='mitama'&&a.mode==='fan')s.queue.push({kind:'mitamaChip',p:i});
 s.queue.push({kind:'funkSong',p:i,card:c,owner:ec.owner});
 if(hasLeader(p,'tenko')&&ec.n===2)s.queue.push({kind:'chip',p:i});
 process(s);return s;
}
function rehearsalActors(p,c){const count=Math.max(1,c.n-1),own=p.team.indexOf(c.owner);if(own<0||!p.ready[own])return [];const ready=p.ready.flatMap((r,j)=>r?[j]:[]);return count===1?[[own]]:ready.filter(j=>j!==own).map(j=>[own,j].sort());}
function useRehearsal(s,i,aa,flags){const p=s.players[i],c=p.rehearsal;if(!c||p.vol<requiredVoltage(p,c)||!rehearsalActors(p,c).some(x=>x.join(',')===aa.join(',')))throw Error('リハーサルを使用できません');p.rehearsal=null;p.memory.push(c);aa.forEach(j=>p.ready[j]=false);log(s,'リハーサル「'+song(c).name+'」FAN（必要人数－1）');return prepareSong(s,i,c,{type:'play',card:c.uid,mode:'fan',...flags});}
function prepareSong(s,i,c,a){const p=s.players[i],effects=!p.songSeal;
 if(c.owner==='kana'){const free=hasLeader(p,'kana')&&!(p.kanaSongsPlayed||0);p.kanaSongsPlayed=(p.kanaSongsPlayed||0)+1;const sources=driftSources(s,i,c.n,a.mode);if(effects&&(free||p.chips>=1)&&sources.length){choice(s,'kanaDrift',i,['skip',...sources.map(x=>x.uid)],'漂流：双方のメモリー・捨て札から追加効果を借りますか？',{card:c.uid,mode:a.mode,free});return s;}}
 return resolveSong(s,i,c,a);
}
function playOK(s,i,c,selected,mode){const p=s.players[i],a=selected||[];return s.winner===null&&!s.pending&&s.active===i&&p.hand.some(x=>x.uid===c.uid)&&['vol','fan'].includes(mode)&&a.length===songPeople(p,c)&&new Set(a).size===songPeople(p,c)&&a.every(j=>Number.isInteger(j)&&j>=0&&j<3&&p.ready[j])&&(c.special==='painted'||a.some(j=>p.team[j]===c.owner))&&(mode!=='fan'||p.vol>=requiredVoltage(p,c));}
function actors(p,c){if(c.special==='painted')return p.ready.every(Boolean)?[0,1,2]:null;const own=p.team.indexOf(c.owner);if(!p.ready[own])return null;const a=[own];for(let j=0;j<3&&a.length<songPeople(p,c);j++)if(j!==own&&p.ready[j])a.push(j);return a.length===songPeople(p,c)?a:null;}
function estimate(s,i,n){
 const list=unlocked(s,i).slice(0,n).map(f=>({...f}));
 let bears=teddyCount(s.players[i]);let val=0;for(const f of list){val+=fanPoints(s.players[i],f);if((!f.muted&&!hasLeader(s.players[i],'mitama')&&f.type==='cheer')||(f.type==='light'&&hasLeader(s.players[i],'nina')))val+=.3;if(!f.muted&&!hasLeader(s.players[i],'mitama')&&f.type==='heavy')val-=.25;}
 for(const f of list.filter(f=>f.type==='trouble'&&!f.muted&&!hasLeader(s.players[i],'mitama'))){const other=list.filter(x=>x!==f&&!x.removed);if(other.length){other.sort((a,b)=>fanPoints(s.players[i],b)-fanPoints(s.players[i],a));if(bears>0){bears--;val-=.15;}else{other[0].removed=true;val-=fanPoints(s.players[i],other[0]);}}}
 val+=Math.max(0,n-list.length)*.95;return Math.max(0,val);
}
function autoPay(p,id){const d=EVENTS[id],cards=paymentCards(p);if(d.costMembers){const picked=Object.entries(d.costMembers).flatMap(([owner,n])=>cards.filter(c=>!c.item&&c.owner===owner).slice(0,n)),deficit=Object.values(d.costMembers).reduce((a,b)=>a+b,0)-picked.length;const meat=cards.filter(c=>c.item==='meat').slice(0,deficit);if(meat.length<deficit)return [];picked.push(...meat);return [...picked,...cards.filter(c=>!picked.includes(c)).slice(0,d.cost[1]-picked.length)].map(c=>c.uid);}if(d.costEach){const picked=p.team.flatMap(owner=>cards.filter(c=>c.owner===owner&&!c.item).slice(0,owner===id?d.costSelf||d.costEach:d.costEach));return [...picked,...cards.filter(c=>c.item==='meat').slice(0,d.cost[1]-picked.length)].map(c=>c.uid);}const req=cards.filter(c=>c.owner===id).slice(0,d.cost[0]);for(const c of cards.filter(c=>c.item==='meat'))if(req.length<d.cost[0])req.push(c);return [...req,...cards.filter(c=>!req.includes(c)).slice(0,d.cost[1]-req.length)].map(c=>c.uid);}
function fanCount(p,c,raw=false,noExtra=false){if(c.special==='painted')return 0;const n=song(c).fan+(c.owner==='mio'?Math.floor((p.experience||0)/4):0)+p.buff+p.eventBuff+(p.cardBuff||0)+(hasLeader(p,'natsume')&&c.n===3?1:0)+(!noExtra&&!p.songSeal&&c.owner==='haru'&&c.n===3&&p.fans.filter(f=>f.type==='dream').length>=2?1:0);return raw?n:acquisitionCount(p,n);}

function ai(s){
 if(s.pending?.kind==='startOrder'||s.pending?.kind==='endOrder')return {type:'choose',value:s.pending.options[0]};
 if(s.pending?.kind==='ayameEnd')return {type:'choose',value:s.players[s.pending.p].chips>=2?'use':'skip'};
 if(s.pending?.kind==='request'){const p=s.players[s.pending.p],cards=[...(s.pending.cards||[])];cards.sort((a,b)=>(actors(p,b)?3:0)+song(b).fan/b.n-((actors(p,a)?3:0)+song(a).fan/a.n));return {type:'choose',value:cards[0]?.uid||'skip'};}

 if(s.pending){const z=s.pending,p=s.players[z.p];

 if(z.kind==='ririPass'){const f=z.cards.find(f=>f.type==='trouble'),q=s.players[1-z.p];return {type:'choose',value:score(q)+fanPoints(q,f)<20?'pass':'skip'};}
 if(z.kind==='kokoneSet'){const cs=p.hand.filter(c=>z.options.includes(c.uid)).sort((a,b)=>(Number(p.vol>=requiredVoltage(p,b))-Number(p.vol>=requiredVoltage(p,a)))||song(b).fan/(b.n-1)-song(a).fan/(a.n-1));return {type:'choose',value:cs[0]?.uid||'skip'};}
 if(z.kind==='kokoneUse')return {type:'choose',value:eventOK(s,z.p,'kokone')&&p.rehearsal?'skip':z.options.find(x=>x!=='skip')||'skip'};
 if(z.kind==='kokoneExtra')return {type:'choose',value:z.flag==='debuff'&&s.players[1-z.p].vol<40?'skip':'use'};
 if(z.kind==='kokoneEventSet'){const cs=p.hand.filter(c=>z.options.includes(c.uid)).sort((a,b)=>song(b).fan-song(a).fan);return {type:'choose',value:cs[0].uid};}
 if(z.kind==='kanaDrift'){const xs=driftSources(s,z.p,s.players[z.p].memory.find(c=>c.uid===z.card)?.n,z.mode).sort((a,b)=>driftValue(s,z.p,b,z.mode,z.free?0:1)-driftValue(s,z.p,a,z.mode,z.free?0:1));return {type:'choose',value:xs.length&&driftValue(s,z.p,xs[0],z.mode,z.free?0:1)>(z.free?0:.5)?xs[0].uid:'skip'};}
 if(z.kind==='kanaDriftOption'){const source=driftSources(s,z.p,p.memory.find(c=>c.uid===z.card)?.n,z.mode).find(c=>c.uid===z.source);let use=z.flag==='boost'||z.flag==='debuff'&&s.players[1-z.p].vol>=40;if(z.flag==='pick'){const row=unlocked(s,z.p),n=source?.n===3?2:1;use=source?.n===3||Math.max(0,...row.map(f=>fanPoints(p,f)))>estimate(s,z.p,n);}return {type:'choose',value:use?'use':'skip'};}
 if(z.kind==='chrisSave')return {type:'choose',value:p.deck.length?'use':'skip'};
 if(z.kind==='miyabiDebuff')return {type:'choose',value:p.chips>=1&&!s.players[1-z.p].volGuard&&s.players[1-z.p].vol>=40?'use':'skip'};
 if(z.kind==='kanaMemory')return {type:'choose',value:score(p)>=20?'done':z.options.find(x=>x!=='done')||'done'};
 if(z.kind==='mitsuhaStart')return {type:'choose',value:s.row[0]&&['heavy','trouble'].includes(s.row[0].type)?'swap':'skip'};
 if(z.kind==='chieReset')return {type:'choose',value:'use'};
 if(z.kind==='chiePayment')return {type:'choose',value:z.options[0]};
 if(z.kind==='shiroPeek')return {type:'choose',value:'confirm'};
 if(z.kind==='misaStart')return {type:'choose',value:p.chips>=1?'drinkRed':'skip'};
 if(z.kind==='misaPurple')return {type:'choose',value:p.chips>=(z.cost??2)?'use':'skip'};
 if(z.kind==='endDrinks'){const ds=drinkItems(p).filter(c=>z.options.includes(c.uid)),c=ds.sort((a,b)=>(DRINKS[b.item].fan-DRINKS[a.item].fan))[0];return {type:'choose',value:c?.uid||'skip'};}
 if(z.kind==='mimizukuEnd')return {type:'choose',value:p.chips>=1&&s.players[1-z.p].hand.some(discardable)?'use':'skip'};
 if(z.kind==='mimizukuReveal')return {type:'choose',value:'confirm'};
 if(z.kind==='mimizukuDiscard')return {type:'choose',value:[...p.hand].filter(c=>z.options.includes(c.uid)).sort((a,b)=>(b.n*2+(p.hand.filter(x=>x.owner===b.owner&&x.n===b.n).length>1?3:0))-(a.n*2+(p.hand.filter(x=>x.owner===a.owner&&x.n===a.n).length>1?3:0)))[0].uid};
 if(z.kind==='moeReady'){const options=z.options.map(Number),j=p.service>=2?options.find(j=>p.hand.some(c=>c.owner===p.team[j]&&c.n===1)):options[0];return {type:'choose',value:String(j??options[0])};}
 if(z.kind==='akinaDraw'){const cs=p.deck.slice(0,3).filter(c=>z.options.includes(c.uid));cs.sort((a,b)=>((a.special==='painted'?100:a.n)+(p.hand.some(c=>c.owner===a.owner&&c.n===a.n)?3:0))-((b.special==='painted'?100:b.n)+(p.hand.some(c=>c.owner===b.owner&&c.n===b.n)?3:0)));return {type:'choose',value:cs[0].uid};}
 if(z.kind==='akinaReturn'){const c=p.memory.find(c=>c.uid===z.card),keepForPayment=p.events.some(e=>e.id==='akina'&&!e.used)&&p.memory.filter(c=>c.owner==='akina').length<=1,duplicate=c&&p.hand.some(h=>h.owner===c.owner&&h.n===c.n);return {type:'choose',value:c&&!keepForPayment&&!duplicate?'return':'skip'};}
 if(z.kind==='emiConvert')return {type:'choose',value:p.chips>=2?z.options.find(x=>x!=='skip')||'skip':'skip'};
 if(z.kind==='emiBottom'){const f=s.row.find(f=>z.options.includes(f.uid)&&(fanPoints(p,f)<1||f.type==='heavy'||f.type==='trouble'&&!hasLeader(p,'emi')));return {type:'choose',value:f?.uid||'skip'};}
 if(z.kind==='ayaReady'){const ready=[...p.ready];p.team.forEach((id,j)=>{if(id!=='aya')ready[j]=true;});const needed=p.hand.filter(c=>actors({...p,ready},c));const opts=z.options.filter(x=>x!=='skip');return {type:'choose',value:needed.length?(z.all?'all':opts.find(x=>needed.some(c=>c.owner===p.team[Number(x)]))||opts[0]):'skip'};}
 if(z.kind==='hikariOffer')return {type:'choose',value:p.deck.length>z.count?'accept':'skip'};
 if(z.kind==='hikariDiscard')return {type:'choose',value:p.hand.filter(c=>z.options.includes(c.uid)).sort((a,b)=>b.n-a.n)[0].uid};
 if(z.kind==='recover')return {type:'choose',value:[...p.discard].filter(c=>z.options.includes(c.uid)).sort((a,b)=>a.n-b.n)[0].uid};
 if(z.kind==='raiPick'&&(z.count||1)>1){const pool=[...s.row,...s.audience.slice(0,2)],fixed=pool.filter(f=>z.selected?.includes(f.uid)),options=pool.filter(f=>z.options.includes(f.uid));let best=null,value=-Infinity;for(let j=0;j<options.length;j++){const candidates=fixed.length?[fixed.concat(options[j])]:options.slice(j+1).map(f=>[options[j],f]);for(const pair of candidates){const v=estimate({...s,row:pair},z.p,pair.length);if(v>value){value=v;best=options[j];}}}return {type:'choose',value:(best||options[0]).uid};}
 if(z.kind==='hakkaReady')return {type:'choose',value:z.options.find(x=>x!=='skip')||'skip'};
 if(z.kind==='mutePick'){const fs=s.row.filter(f=>z.options.includes(f.uid)&&['trouble','heavy'].includes(f.type));return {type:'choose',value:fs[0]?.uid||'skip'};}
 if(z.kind==='shio')return {type:'choose',value:p.vol<90||p.vol>=150&&p.vol<180?'vol':'chip'};
 if(z.kind==='trouble'||z.kind==='machiRemove'){const fs=p.fans.filter(f=>z.options.includes(f.uid)).sort((a,b)=>fanPoints(p,a)-fanPoints(p,b));return {type:'choose',value:fs[0].uid};}
 const fs=[...s.row,...s.audience.slice(0,2)].filter(f=>z.options.includes(f.uid)).sort((a,b)=>(fanPoints(p,b)+(b.type==='cheer'?.3:0))-(fanPoints(p,a)+(a.type==='cheer'?.3:0)));
 return {type:'choose',value:fs[0].uid};
 }
 const i=s.active,p=s.players[i],ready=p.ready.filter(Boolean).length,volTarget=p.events.some(e=>e.id==='hibiki'&&!e.used)&&hasLeader(p,'hibiki')?300:p.events.some(e=>e.id==='shio'&&!e.used)&&p.vol>=140&&score(p)>=10?180:100;
 const canSupport=!supportSealed(s,i),free=(effect)=>canSupport&&supportFree(p,effect);
 if(ticketCount(p)){const t=items(p).find(c=>c.item==='ticket');return {type:'ticket',id:t.uid};}
 if(canSupport&&hasLeader(p,'hana')&&p.chips>=2&&p.deck.length&&p.hand.some(c=>actors(p,c)&&p.vol>=requiredVoltage(p,c)))return {type:'support',effect:'draw'};
 if(canSupport&&hasLeader(s.players[1-i],'fukurou')&&p.chips>=2&&p.deck.length&&p.hand.length<4&&ready)return {type:'support',effect:'draw'};
 const ev=(id,extra={})=>({type:'event',id,memory:autoPay(p,id),...extra});
 for(const id of ['kazuna','mio','yuu','chris'])if(eventOK(s,i,id)&&(id==='kazuna'?!!p.goal:id==='mio'?(p.experience||0)<12:id==='yuu'?true:(p.wealth||0)>=4))return ev(id);
 if((p.wealth||0)>3&&p.chips<2)return {type:'wealth',amount:p.wealth-3};
 if(eventOK(s,i,'shiro')&&s.players[1-i].hand.some(c=>c.special==='painted'))return ev('shiro');
 if(eventOK(s,i,'hibiki')&&(p.vol>=300?(score(p)+15>=20||!p.deck.length&&!p.hand.length):!p.deck.length))return ev('hibiki');
 if(cashCount(p)>=2)return {type:'buy',item:p.vol>=60?'drinkPurple':'support'};
 if(eventOK(s,i,'kana')&&p.memory.filter(c=>c.owner==='kana'&&!autoPay(p,'kana').includes(c.uid)).length+score(p)>=20)return ev('kana');
 if(eventOK(s,i,'riri')&&(score(p)+Math.min(6,Math.max(0,s.players[1-i].fans.length-3))>=20||s.players[1-i].fans.length>=8))return ev('riri');
 if(eventOK(s,i,'chitose')){const q=s.players[1-i],targets=q.team.filter(id=>!hasLeader(q,id)&&!q.startLocked?.includes(id));return ev('chitose',{target:targets[0]});}
 if(eventOK(s,i,'kokone')&&(p.rehearsal||p.hand.some(c=>c.n===3&&c.special!=='painted')))return ev('kokone');
 if(eventOK(s,i,'mitama'))return ev('mitama');
 if(eventOK(s,i,'tenko')&&(ready===0||p.hand.length<3))return ev('tenko');
 if(eventOK(s,i,'mitsuha')&&unlocked(s,i).some(f=>f.type!=='local'))return ev('mitsuha');
 if(eventOK(s,i,'miyabi')&&!p.volGuard)return ev('miyabi');
 if(eventOK(s,i,'kono'))return ev('kono');
 if(eventOK(s,i,'misa')){const own=score(p),drinks=drinkItems(p).reduce((n,c)=>n+DRINKS[c.item].fan,0);if(own+drinks+2>=20||ready===0)return ev('misa');}
 if(eventOK(s,i,'mimizuku'))return ev('mimizuku');
 if(eventOK(s,i,'fukurou')&&(s.players[1-i].chips>=3||!p.deck.length&&!p.hand.length))return ev('fukurou');
 if(eventOK(s,i,'tempest'))return ev('tempest');
 if(eventOK(s,i,'nightmare'))return ev('nightmare');
 if(eventOK(s,i,'detatoko'))return ev('detatoko');
 if(eventOK(s,i,'vengeance')&&(score(p)+4>=20||p.team.some((id,j)=>(id==='emi'||id==='aya')&&!p.ready[j])))return ev('vengeance');
 if(eventOK(s,i,'ayame'))return ev('ayame');
 if(eventOK(s,i,'duo'))return ev('duo',{target:p.team.filter(id=>!hasLeader(p,id)).sort((a,b)=>({natsume:5,hana:4,nina:4,kayo:4,hibiki:4,mitama:4}[b]||2)-({natsume:5,hana:4,nina:4,kayo:4,hibiki:4,mitama:4}[a]||2))[0]});
 if(eventOK(s,i,'request')&&p.hand.length<6)return ev('request');
 if(eventOK(s,i,'solo')&&!p.soloSpot&&p.hand.some(c=>c.n===3&&!c.special&&p.ready[p.team.indexOf(c.owner)]&&p.ready.filter(Boolean).length<3))return ev('solo');
 if(eventOK(s,i,'lastOrder')&&(p.chips>=9||score(p)+Math.floor(Math.min(9,p.chips)/3)>=20||!ready))return ev('lastOrder',{amount:Math.floor(Math.min(9,p.chips)/3)*3});
 if(eventOK(s,i,'finale')&&(!ready||score(p)+p.ready.filter(x=>!x).length>=20))return ev('finale');
 if(eventOK(s,i,'scene')&&leaders(s.players[1-i]).length===1)return ev('scene');
 if(eventOK(s,i,'rampage')&&ready>0){const target=Math.min(volTarget,Math.max(60,...p.hand.filter(c=>actors(p,c)).map(c=>song(c).need)));if(p.vol<target&&score(s.players[1-i])+5<20)return ev('rampage');}
 if(eventOK(s,i,'collection')&&(teddyCount(p)<2||p.events.some(e=>e.id==='nina'&&!e.used)))return ev('collection');
 if(eventOK(s,i,'buzz')&&p.hand.some(c=>actors(p,c)&&p.vol>=requiredVoltage(p,c)))return ev('buzz');
 if(eventOK(s,i,'scandal')&&(score(p)>=16||p.fans.length<=4||p.fans.some(f=>fanPoints(p,f)<1)))return ev('scandal');
 if(hasLeader(p,'hikari')&&!p.hikariSkillUsed&&p.vol>=100&&p.hand.filter(discardable).length>=4&&(ready===0||p.chips<2&&p.hand.length>=6))return {type:'leaderSkill',discard:p.hand.filter(discardable).sort((a,b)=>b.n-a.n).slice(0,3).map(c=>c.uid)};
 if(eventOK(s,i,'moe')&&(p.deck.length||hasLeader(p,'moe')&&moeTargets(s,i).length||hasLeader(p,'rai')&&!s.row.some(f=>f.lock===i)))return ev('moe');
 if(hasLeader(p,'moe')&&free('hold')&&moeTargets(s,i).length)return {type:'support',effect:'hold',target:moeTargets(s,i)[0],free:true};
 if(free('draw')&&p.deck.length&&p.hand.length<5)return {type:'support',effect:'draw',free:true};
 if(p.moeDouble&&p.service<2&&ready){const j=p.ready.findIndex((v,j)=>v&&!p.hand.some(c=>c.owner===p.team[j]&&c.n===1));return {type:'service',actor:j>=0?j:p.ready.findIndex(Boolean)};}
 if(eventOK(s,i,'akina')){const candidates=p.hand.filter(c=>memoryable(c)&&(c.n===3||p.hand.filter(h=>h.owner===c.owner&&h.n===c.n).length>1));if(candidates.length&&((hasLeader(p,'hakka')&&p.ready.some(x=>!x)&&p.hand.some(c=>p.vol>=requiredVoltage(p,c)))||p.hand.length>6&&p.events.some(e=>e.id!=='akina'&&!e.used)))return ev('akina',{targets:candidates.slice(0,3).map(c=>c.uid)});}
 if(eventOK(s,i,'nina')&&teddyCount(p)>0&&(score(p)+Math.min(3,teddyCount(p))>=20||teddyCount(p)>=2||!p.deck.length||ready===0))return ev('nina');
 if(eventOK(s,i,'emi'))return ev('emi',{target:(s.players[1-i].fans.find(f=>fanPoints(s.players[1-i],f)===1&&f.type==='trouble')||s.players[1-i].fans.find(f=>fanPoints(s.players[1-i],f)===1)).uid});
 if(eventOK(s,i,'aya')&&ayaEventCount(p)>0&&(ayaEventCount(p)>=3||score(p)+ayaEventCount(p)>=20||!p.deck.length))return ev('aya');
 if(eventOK(s,i,'hikari')&&score(p)+Math.floor(p.discard.length/3)>=20)return ev('hikari');
 if(eventOK(s,i,'viewing')&&!p.liveViewing)return ev('viewing');
 if(eventOK(s,i,'overcome')&&p.deck.length&&p.hand.length<6)return ev('overcome');
 if(eventOK(s,i,'mc')&&p.fans.length&&!p.fanShield)return ev('mc');
 if(eventOK(s,i,'haru')&&[...unlocked(s,i),...(fansProtected(s,1-i,i)?[]:s.players[1-i].fans)].some(f=>f.type==='dream'))return ev('haru');
 if(eventOK(s,i,'hakka')&&(score(p)+2+Math.floor((p.memory.length-autoPay(p,'hakka').filter(x=>p.memory.some(c=>c.uid===x)).length)/3)>=20||p.memory.length>=7||!p.deck.length))return ev('hakka');
 if(eventOK(s,i,'homura')&&p.hand.some(c=>actors(p,c)&&p.vol>=requiredVoltage(p,c)))return ev('homura');
 if(eventOK(s,i,'wit')&&p.deck.length)return ev('wit',{hand:p.hand.filter(memoryable).sort((a,b)=>b.n-a.n)[0].uid});
 if(eventOK(s,i,'trouble')&&!fansProtected(s,1-i,i)&&s.players[1-i].fans.length>=2)return ev('trouble');
 if(eventOK(s,i,'redo')&&unlocked(s,i).filter(f=>f.type==='trouble').length>=2)return ev('redo');
 if(eventOK(s,i,'switch')&&leaders(p).length===1&&hasLeader(p,'rai')&&p.team.includes('natsume')&&p.vol>=100)return ev('switch',{leader:'natsume'});
 if(eventOK(s,i,'shio')&&score(p)+(p.vol>=180?7:3)>=20)return ev('shio');
 if(eventOK(s,i,'kayo')&&p.hand.filter(discardable).length>=3&&(estimate(s,i,acquisitionCount(p,p.hand.length))>=20-score(p)||p.hand.length>=5))return ev('kayo',{discard:p.hand.filter(discardable).sort((a,b)=>b.n-a.n).slice(0,3).map(c=>c.uid)});
 if(eventOK(s,i,'natsume')&&p.hand.some(c=>actors(p,c)&&p.vol>=requiredVoltage(p,c)))return ev('natsume');
 if(eventOK(s,i,'machi')){
 const bad=unlocked(s,i).filter(f=>f.type==='trouble'||f.type==='heavy'&&p.vol<100);if(bad.length)return ev('machi',{targets:bad.map(f=>f.uid)});
 }
 if(eventOK(s,i,'rai')&&s.audience.some(f=>f.type==='core')){
 const target=unlocked(s,i).find(f=>f.type==='trouble'||f.type==='light');if(target&&p.hand.some(c=>actors(p,c)&&p.vol>=requiredVoltage(p,c)))return ev('rai',{target:target.uid});
 }
 if(canSupport&&hasLeader(p,'rai')&&(p.chips>=2||free('lock'))&&!s.row.some(f=>f.lock===i)){
 const core=unlocked(s,i).find(f=>f.type==='core'&&f.lock===null);
 if(core&&(p.vol<60||ready===0))return {type:'support',effect:'lock',target:core.uid,free:free('lock')};
 }
 let best=null,bestValue=-1;
 for(const c of p.hand){
 const aa=actors(p,c);if(!aa)continue;const d=song(c);
 if(p.vol<requiredVoltage(p,c)||volTarget>=180&&p.vol<volTarget||c.owner==='shiro'&&!c.special&&p.vol<100||c.owner==='misa'&&p.chips>=(c.n===3?1:2)&&drinkItems(p).length<3||c.owner==='nina'&&c.n>1&&teddyCount(p)<3&&p.events.some(e=>e.id==='nina'&&!e.used)){
 const value=Math.min(d.vol,Math.max(0,volTarget-p.vol))/d.n*.12+(c.owner==='shiro'&&!c.special?1.1/c.n:c.owner==='misa'&&p.chips>=(c.n===3?1:2)?.7/c.n:c.owner==='kayo'?.9:c.owner==='ayame'?1/c.n:c.owner==='hana'?.5:c.owner==='hakka'?.7:c.owner==='nina'&&c.n>1?(teddyCount(p)<3?.75:.25):0);
 const resourceBonus=c.owner==='fukurou'&&(items(s.players[1-i]).length+(s.players[1-i].fanChips||0))>0?.6/c.n:0;
 if(value+resourceBonus>bestValue){bestValue=value+resourceBonus;best={type:'play',card:c.uid,actors:aa,mode:'vol',...(canMiyabiDebuff(c,'vol')?{debuff:!p.songSeal&&p.chips>=1&&!s.players[1-i].volGuard&&s.players[1-i].vol>=40}:{})};}
 }
 if(p.vol>=requiredVoltage(p,c)&&c.special!=='painted'){
 const n=fanCount(p,c),boost=!p.songSeal&&c.owner==='natsume'&&c.n<3&&p.vol>=d.need+10;
 let value=(!p.songSeal&&c.owner==='kokone'&&p.deck.length?.8/d.n:0)+(!p.songSeal&&c.owner==='chitose'&&(c.n>1||p.vol>=80)&&!fansProtected(s,1-i,i)&&s.players[1-i].fans.some(f=>fanPoints(s.players[1-i],f)===1)?.9/d.n:0)+(c.owner==='mimizuku'&&s.row[0]&&fanPoints(p,s.row[0])===1?(c.n===3?2:1)*.3/d.n:0)+(c.owner==='fukurou'&&(items(s.players[1-i]).length+(s.players[1-i].fanChips||0))>0?.6/d.n:0)+estimate(s,i,n+(boost?1:0))/d.n+(c.owner==='ayame'&&c.n===3?1/d.n:0)+(c.owner==='machi'&&c.n>1&&s.players[1-i].fans.length?.8/d.n:0)+(c.owner==='hana'&&c.n===3?.2:0)+(c.owner==='moe'&&(c.n===3||!p.moeDouble&&p.service<2)?.4:0);
 if(estimate(s,i,n+(boost?1:0))+score(p)>=20)value+=50;
 let pick=false;
 if(!p.songSeal&&c.owner==='rai'&&(c.n!==1||p.chips>=1)){
 const row=unlocked(s,i),count=acquisitionCount(p,c.n===3?2:1);let top=count===1?Math.max(0,...row.map(f=>fanPoints(p,f))):0;if(count===2){for(let j=0;j<row.length;j++)for(let k=j+1;k<row.length;k++)top=Math.max(top,estimate({...s,row:[row[j],row[k]]},i,2));}if(count>0&&top/d.n>value){value=top/d.n;pick=true;}
 }
 if(value>bestValue){bestValue=value;best={type:'play',card:c.uid,actors:aa,mode:'fan',boost,pick,...(canMiyabiDebuff(c,'fan')?{debuff:!p.songSeal&&p.chips>=1&&!s.players[1-i].volGuard&&s.players[1-i].vol>=40}:{})};}
 }
 }
 // Avoid delaying FAN acquisition for MAXIMUM before its memory cost is nearly available.
 if(best?.type==='play'&&best.mode==='vol'&&hasLeader(p,'hibiki')&&p.vol>=100&&p.vol<300&&paymentCards(p).length<EVENTS.hibiki.cost[1]){
 const choices=p.hand.map(c=>({c,actors:actors(p,c)})).filter(x=>x.actors&&playOK(s,i,x.c,x.actors,'fan')&&x.c.special!=='painted'&&fanCount(p,x.c)>0);
 choices.sort((a,b)=>estimate(s,i,fanCount(p,b.c))/b.c.n-estimate(s,i,fanCount(p,a.c))/a.c.n);
 if(choices.length){const x=choices[0];return {type:'play',card:x.c.uid,actors:x.actors,mode:'fan'};}
 }
 if(best&&bestValue>.05)return best;
 const painted=p.hand.find(c=>c.special==='painted'&&actors(p,c));if(painted)return {type:'play',card:painted.uid,actors:[0,1,2],mode:'vol'};
 if(free('draw')&&p.deck.length)return {type:'support',effect:'draw',free:true};
 if(canSupport&&hasLeader(p,'moe')&&p.chips>=3&&ready===0&&moeTargets(s,i).length)return {type:'support',effect:'hold',target:moeTargets(s,i)[0]};
 if(canSupport&&p.chips>=6&&ready<2&&p.hand.some(c=>p.vol>=requiredVoltage(p,c)))return {type:'support',effect:'refresh'};
 if(eventOK(s,i,'hana')){
 const at=p.ready.findIndex((r,j)=>!r&&p.hand.some(c=>c.owner===p.team[j]&&c.n<=ready+1));if(at>=0)return ev('hana',{actor:at});
 }
 if(canSupport&&p.chips>=2&&p.deck.length&&(p.hand.length<4||ready>0))return {type:'support',effect:'draw'};
 if(p.service<2&&ready)return {type:'service',actor:p.ready.findIndex(Boolean)};
 return {type:'end',...(hasLeader(p,'ayame')&&p.chips>=2?{ticket:true}:{})};
}
// Deterministic timeout: finish already-triggered choices, then end this turn.
function timeout(s){if(s.winner!==null)return s;process(s);const turn=s.turn;let guard=0;while(s.pending&&s.turn===turn&&s.winner===null){if(++guard>512)throw Error('効果の自動処理が上限に達しました');dispatch(s,{type:'choose',value:s.pending.options[0]});}if(s.winner===null&&s.turn===turn){log(s,'99秒経過：未確定の操作を取り消してターン終了');dispatch(s,{type:'end',skipEndSkill:true});}return s;}
function validateAction(a){if(!a||typeof a!=='object'||Array.isArray(a))throw Error('操作が不正です');const str=x=>typeof x==='string'&&x.length>0&&x.length<=60,ids=x=>Array.isArray(x)&&x.length<=256&&x.every(str),actor=x=>Number.isInteger(x)&&x>=0&&x<3;let out={type:a.type};
 if(a.type==='end'&&(a.ticket===undefined||typeof a.ticket==='boolean')&&(a.skipEndSkill===undefined||typeof a.skipEndSkill==='boolean'))return {...out,...(a.ticket!==undefined?{ticket:a.ticket}:{}),...(a.skipEndSkill!==undefined?{skipEndSkill:a.skipEndSkill}:{})};
 if(a.type==='wealth'&&Number.isInteger(a.amount)&&a.amount>0&&Number.isSafeInteger(a.amount))return {...out,amount:a.amount};
 if(a.type==='buy'&&typeof a.item==='string'&&Object.hasOwn(SHOP,a.item))return {...out,item:a.item};
 if(a.type==='ticket'&&str(a.id))return {...out,id:a.id};
 if(a.type==='leaderSkill'&&ids(a.discard)&&a.discard.length===3)return {...out,discard:[...a.discard]};
 if(a.type==='choose'&&str(a.value))return {...out,value:a.value};
 if(a.type==='service'&&actor(a.actor))return {...out,actor:a.actor};
 if(a.type==='support'&&['draw','refresh','lock','hold'].includes(a.effect)&&(!['lock','hold'].includes(a.effect)||str(a.target))&&(a.free===undefined||typeof a.free==='boolean'))return {...out,effect:a.effect,...(a.target?{target:a.target}:{}),...(a.free!==undefined?{free:a.free}:{})};
 if(a.type==='play'&&str(a.card)&&['vol','fan'].includes(a.mode)&&Array.isArray(a.actors)&&a.actors.length<=3&&a.actors.every(actor)&&[a.boost,a.pick,a.debuff].every(x=>x===undefined||typeof x==='boolean'))return {...out,card:a.card,mode:a.mode,actors:[...a.actors],boost:!!a.boost,pick:!!a.pick,...(a.debuff!==undefined?{debuff:a.debuff}:{})};
 if(a.type==='event'&&typeof a.id==='string'&&Object.hasOwn(EVENTS,a.id)&&ids(a.memory)&&[a.discard,a.targets].every(x=>x===undefined||ids(x))&&[a.target,a.hand,a.leader].every(x=>x===undefined||x===null||str(x))&&(a.actor===undefined||a.actor===null||actor(a.actor))&&(a.amount===undefined||Number.isInteger(a.amount)&&(a.id==='lastOrder'?[3,6,9].includes(a.amount):a.amount>=1&&a.amount<=5)))return {...out,id:a.id,memory:[...a.memory],discard:a.discard||[],targets:a.targets||[],target:a.target,hand:a.hand,leader:a.leader,actor:a.actor,...(a.amount!==undefined?{amount:a.amount}:{})};
 throw Error('操作が不正です');}
function peerAction(s,a,i){if(s.winner!==null)throw Error('ライブは終了しています');if((s.pending?.p??s.active)!==i)throw Error('相手の手番です');const clean=validateAction(a),copy=JSON.parse(JSON.stringify(s));dispatch(copy,clean);return copy;}
function publicView(s,i){const v=JSON.parse(JSON.stringify(s)),remap=x=>x===null?null:x===i?0:1;delete v.seed;delete v.serial;delete v.clock;if(v.lottery)v.lottery={count:s.lottery.length};if(v.lotteryLast)v.lotteryLast.p=remap(s.lotteryLast.p);v.queue=[];v.audienceCoreCount=s.audience.filter(f=>f.type==='core').length;v.audienceHasInfluencer=s.audience.some(f=>f.type==='influencer');
 v.audience=s.audience.map((f,j)=>j<2&&s.pending?.p===i&&s.pending.kind==='raiPick'&&(s.pending.options.includes(f.uid)||s.pending.selected?.includes(f.uid))?{...f}:{uid:'hidden-a-'+j,type:null,lock:null});
 v.players=[i,1-i].map((who,j)=>{const p=JSON.parse(JSON.stringify(s.players[who]));p.deck=p.deck.map((c,k)=>j===0&&s.pending?.p===i&&s.pending.kind==='akinaDraw'&&k<3?{...c}:{uid:'hidden-d-'+j+'-'+k});if(j){p.hand=p.hand.map((_,k)=>({uid:'hidden-h-'+k}));p.events=p.events.map(e=>e.used?e:{id:null,used:false,lastTurn:null});}for(const f of p.fans)f.lock=remap(f.lock);return p;});
 v.row.forEach(f=>f.lock=remap(f.lock));v.active=remap(s.active);v.first=remap(s.first);v.winner=remap(s.winner);if(v.pending){v.pending.p=remap(s.pending.p);if(s.pending.p!==i){v.pending.options=[];if(v.pending.selected)v.pending.selected=[];if(v.pending.cards)delete v.pending.cards;v.pending.text='相手が効果を選択しています';}}
 v.log=v.log.map(t=>t.replace(/あなた|CPU/g,x=>(x==='あなた'?0:1)===i?'あなた':'相手'));return v;}
return {leaders,hasLeader,songPeople,driftExtraCost,driftSources,canMitsuhaSwap,CHAR,COMMON,DUETS,EVENTS,FAN,LOTTERY,DRINKS,SHOP,cashCount,canMiyabiDebuff,requiredVoltage,drinkItems,maxVoltage,acquisitionCount,discardable,memoryable,songArt,ticketCount,song,detail,create,dispatch,playOK,score,fanPoints,fanCount,items,teddyCount,fansProtected,ayaEventCount,moeTargets,supportFree,supportSealed,paymentCards,paymentOK,eventOK,actors,autoPay,ai,estimate,timeout,validateAction,peerAction,publicView};
})();

export {IDOL};
