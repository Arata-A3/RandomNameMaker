/**
 * 綴りのルールではうまく読めない実在の名前のカタカナ表記。
 * 主に英語の名前（綴りと発音のずれが大きいため）。
 */
const RAW = `
James:ジェームズ John:ジョン Robert:ロバート Michael:マイケル William:ウィリアム David:デイヴィッド Richard:リチャード
Joseph:ジョセフ Thomas:トーマス Charles:チャールズ Christopher:クリストファー Daniel:ダニエル Matthew:マシュー
Anthony:アンソニー Mark:マーク Paul:ポール Steven:スティーヴン Andrew:アンドリュー Joshua:ジョシュア Kevin:ケヴィン
Brian:ブライアン George:ジョージ Edward:エドワード Ronald:ロナルド Timothy:ティモシー Jason:ジェイソン
Jeffrey:ジェフリー Ryan:ライアン Jacob:ジェイコブ Gary:ゲイリー Nicholas:ニコラス Eric:エリック Jonathan:ジョナサン
Stephen:スティーヴン Larry:ラリー Justin:ジャスティン Scott:スコット Benjamin:ベンジャミン Samuel:サミュエル
Gregory:グレゴリー Alexander:アレクサンダー Patrick:パトリック Jack:ジャック Henry:ヘンリー Oliver:オリヴァー
Harry:ハリー Charlie:チャーリー Oscar:オスカー Arthur:アーサー Leo:レオ Ethan:イーサン Liam:リアム Noah:ノア
Lucas:ルーカス Mason:メイソン Logan:ローガン Owen:オーウェン Nathan:ネイサン Dylan:ディラン Isaac:アイザック
Adam:アダム Luke:ルーク Elliot:エリオット Theodore:セオドア Frederick:フレデリック
Mary:メアリー Patricia:パトリシア Jennifer:ジェニファー Linda:リンダ Elizabeth:エリザベス Barbara:バーバラ
Susan:スーザン Jessica:ジェシカ Sarah:サラ Karen:カレン Nancy:ナンシー Lisa:リサ Margaret:マーガレット Betty:ベティ
Sandra:サンドラ Ashley:アシュリー Emily:エミリー Donna:ドナ Michelle:ミシェル Carol:キャロル Amanda:アマンダ
Melissa:メリッサ Deborah:デボラ Stephanie:ステファニー Rebecca:レベッカ Laura:ローラ Sharon:シャロン
Cynthia:シンシア Kathleen:キャスリーン Amy:エイミー Shirley:シャーリー Angela:アンジェラ Helen:ヘレン Anna:アンナ
Brenda:ブレンダ Emma:エマ Olivia:オリヴィア Ava:エヴァ Sophia:ソフィア Isabella:イザベラ Charlotte:シャーロット
Amelia:アメリア Harper:ハーパー Evelyn:エヴリン Abigail:アビゲイル Ella:エラ Grace:グレイス Chloe:クロエ Lily:リリー
Hannah:ハンナ Alice:アリス Ruby:ルビー Florence:フローレンス Isla:アイラ Poppy:ポピー Rosie:ロージー Holly:ホリー
Lucy:ルーシー Eleanor:エレノア Victoria:ヴィクトリア
Smith:スミス Johnson:ジョンソン Williams:ウィリアムズ Brown:ブラウン Jones:ジョーンズ Miller:ミラー Davis:デイヴィス
Wilson:ウィルソン Anderson:アンダーソン Taylor:テイラー Moore:ムーア Martin:マーティン Jackson:ジャクソン
Thompson:トンプソン White:ホワイト Harris:ハリス Clark:クラーク Lewis:ルイス Robinson:ロビンソン Walker:ウォーカー
Young:ヤング Allen:アレン King:キング Wright:ライト Hill:ヒル Green:グリーン Adams:アダムズ Baker:ベイカー
Nelson:ネルソン Carter:カーター Mitchell:ミッチェル Roberts:ロバーツ Turner:ターナー Phillips:フィリップス
Campbell:キャンベル Parker:パーカー Evans:エヴァンズ Edwards:エドワーズ Collins:コリンズ Stewart:スチュワート
Morris:モリス Murphy:マーフィー Cook:クック Rogers:ロジャーズ Morgan:モーガン Cooper:クーパー Peterson:ピーターソン
Bailey:ベイリー Reed:リード Kelly:ケリー Howard:ハワード Ward:ウォード Cox:コックス Richardson:リチャードソン
Wood:ウッド Watson:ワトソン Brooks:ブルックス Bennett:ベネット Gray:グレイ Hughes:ヒューズ Price:プライス
Sanders:サンダース Fisher:フィッシャー Ellis:エリス Hunt:ハント Palmer:パーマー Wells:ウェルズ Webb:ウェッブ
Hawkins:ホーキンス Fletcher:フレッチャー Chapman:チャップマン
Müller:ミュラー Schmidt:シュミット Schneider:シュナイダー Fischer:フィッシャー Weber:ヴェーバー Meyer:マイヤー
Wagner:ヴァーグナー Becker:ベッカー german:Michael:ミヒャエル french:Martin:マルタン german:Martin:マルティン french:Thomas:トマ french:Simon:シモン german:Simon:ジーモン Jürgen:ユルゲン Günter:ギュンター Ludwig:ルートヴィヒ
Heinrich:ハインリヒ Friedrich:フリードリヒ Matthias:マティアス Hoffmann:ホフマン Koch:コッホ Bauer:バウアー
Jean:ジャン Pierre:ピエール François:フランソワ Jacques:ジャック Louis:ルイ Michel:ミシェル Laurent:ローラン
Vincent:ヴァンサン Guillaume:ギヨーム Raphaël:ラファエル Jules:ジュール Hugo:ユーゴ Théo:テオ Noé:ノエ
Sébastien:セバスティアン Julien:ジュリアン Philippe:フィリップ Christophe:クリストフ Olivier:オリヴィエ
Juliette:ジュリエット Camille:カミーユ Chloé:クロエ Léa:レア Inès:イネス Céline:セリーヌ Isabelle:イザベル
Françoise:フランソワーズ Sophie:ソフィー Amélie:アメリ Geneviève:ジュヌヴィエーヴ Marguerite:マルグリット
Dubois:デュボワ Durand:デュラン Moreau:モロー Dupont:デュポン Rousseau:ルソー Fontaine:フォンテーヌ Lefebvre:ルフェーヴル
french:Robert:ロベール french:Richard:リシャール french:David:ダヴィド french:Maxime:マキシム french:Rose:ローズ french:Louise:ルイーズ french:Mathis:マティス german:Sven:スヴェン french:Guérin:ゲラン french:Mathieu:マチュー french:Gaillard:ガイヤール french:Héloïse:エロイーズ french:Étienne:エティエンヌ
Björn:ビョルン Søren:セーレン Håkan:ホーカン Kjell:シェル Torbjörn:トールビョルン Sjöberg:ショーベリ
`;

export const KATAKANA_OVERRIDES: Record<string, string> = Object.fromEntries(
  RAW.trim()
    .split(/\s+/)
    // "german:Michael:ミヒャエル" のように国を付けたものはその国だけの読み
    .map((tok) => {
      const parts = tok.split(':');
      return parts.length === 3 ? [`${parts[0]}:${parts[1]}`, parts[2]] : parts;
    }),
);

/** ファンタジー風の苗字（英単語の組み合わせ）を読むためのパーツ */
const PARTS = `
ash:アッシュ ashen:アッシェン black:ブラック bright:ブライト storm:ストーム iron:アイアン silver:シルヴァー
raven:レイヴン ravens:レイヴンズ thorn:ソーン dusk:ダスク frost:フロスト gold:ゴールド hawk:ホーク moon:ムーン
night:ナイト star:スター stone:ストーン sun:サン wind:ウィンド wolf:ウルフ ember:エンバー mist:ミスト
dragon:ドラゴン grey:グレイ swift:スウィフト light:ライト deep:ディープ red:レッド white:ホワイト oak:オーク
elder:エルダー winter:ウィンター shadow:シャドウ fire:ファイア river:リヴァー glen:グレン copper:カッパー
rose:ローズ lark:ラーク crow:クロウ fox:フォックス fair:フェア quick:クイック north:ノース kings:キングス
whit:ホイット holl:ホル
ford:フォード wood:ウッド water:ウォーター hart:ハート leaf:リーフ croft:クロフト field:フィールド
mantle:マントル bane:ベイン mane:メイン shade:シェイド mere:ミア fall:フォール brook:ブルック vale:ヴェイル
moor:ムーア arrow:アロー helm:ヘルム forge:フォージ crest:クレスト ridge:リッジ holt:ホルト wick:ウィック
ton:トン ward:ワード wright:ライト hollow:ホロウ gate:ゲイト song:ソング heart:ハート bringer:ブリンガー
lock:ロック ley:リー spur:スパー cott:コット fern:ファーン oway:ウェイ
`;

export const FANTASY_PART_KANA: Record<string, string> = Object.fromEntries(
  PARTS.trim()
    .split(/\s+/)
    .map((tok) => tok.split(':')),
);
