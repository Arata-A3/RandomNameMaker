/** 単語モード用の辞書 */
import { words } from './names/parse';

export type WordCategory =
  | 'nature'
  | 'animal'
  | 'food'
  | 'tool'
  | 'place'
  | 'job'
  | 'vehicle'
  | 'time'
  | 'abstract'
  | 'fantasy';

export const WORD_CATEGORIES: { id: WordCategory; label: string; nouns: string[] }[] = [
  {
    id: 'nature',
    label: '自然',
    nouns: words(`空 海 山 森 川 湖 星 月 太陽 雲 雨 雪 風 虹 花 桜 草原 砂漠 火山 滝 岩 波 嵐 霧 氷 炎 雷 夜明け 夕焼け 銀河`),
  },
  {
    id: 'animal',
    label: '動物',
    nouns: words(`猫 犬 うさぎ たぬき きつね くま ペンギン カラス フクロウ ネズミ ハムスター カメ カエル クジラ イルカ
金魚 ヤギ ひつじ パンダ ゴリラ キリン ハト スズメ カブトムシ クラゲ タコ ワニ ライオン オオカミ ナマケモノ`),
  },
  {
    id: 'food',
    label: '食べ物',
    nouns: words(`おにぎり カレー ラーメン 味噌汁 たこ焼き プリン ドーナツ メロンパン 目玉焼き 餃子 寿司 そば うどん
ケーキ クッキー アイス 大福 せんべい 焼き芋 コロッケ ハンバーグ オムライス パフェ 納豆 たまご 梅干し 唐揚げ 肉まん`),
  },
  {
    id: 'tool',
    label: '道具',
    nouns: words(`傘 鍵 時計 鏡 眼鏡 鉛筆 消しゴム ハサミ 地図 手紙 カメラ ラジオ 望遠鏡 ランプ 箒 ノート 辞書 財布
リモコン 扇風機 やかん 掃除機 スマホ 目覚まし時計 風鈴 じょうろ 虫眼鏡 ホチキス 救急箱 宝箱`),
  },
  {
    id: 'place',
    label: '場所',
    nouns: words(`学校 図書館 駅 公園 病院 商店街 屋上 教室 体育館 喫茶店 銭湯 遊園地 動物園 水族館 神社 港 灯台
コンビニ 交番 美術館 屋台 団地 旅館 映画館 空港 田んぼ 路地裏 地下室 屋根裏 温泉`),
  },
  {
    id: 'job',
    label: '職業',
    nouns: words(`先生 医者 警察官 消防士 パン屋 花屋 郵便屋 探偵 魔法使い 宇宙飛行士 料理人 漁師 農家 大工 画家
作家 歌手 庭師 司書 駅員 店長 社長 執事 忍者 発明家 占い師 用務員 運転手 記者 教授`),
  },
  {
    id: 'vehicle',
    label: '乗り物',
    nouns: words(`電車 バス 自転車 船 飛行機 ロケット 気球 タクシー 三輪車 新幹線 潜水艦 ヘリコプター トラック
一輪車 ボート 馬車 ロープウェイ 観覧車 スケボー 路面電車`),
  },
  {
    id: 'time',
    label: '時・季節',
    nouns: words(`朝 昼 夕方 真夜中 春 夏 秋 冬 月曜日 金曜日 誕生日 元日 夏休み 放課後 締め切り 昼休み 満月 新月
年末 七夕`),
  },
  {
    id: 'abstract',
    label: '気持ち・概念',
    nouns: words(`夢 希望 秘密 約束 記憶 勇気 孤独 友情 初恋 嘘 奇跡 運命 自由 未来 過去 迷子 ため息 本音 冒険
内緒 正義 ひらめき 退屈 憂鬱 平和 偶然 後悔 縁 魔法 伝説`),
  },
  {
    id: 'fantasy',
    label: 'ファンタジー',
    nouns: words(`竜 妖精 魔王 勇者 精霊 古城 迷宮 聖剣 魔導書 呪文 巨人 小人 不死鳥 ユニコーン 水晶 王冠 塔 遺跡
天空都市 地底国 時計塔 月の民 星詠み 鍛冶屋 錬金術`),
  },
];

/** 名詞を修飾する形容詞・形容動詞（連体形） */
export const ADJECTIVES = words(`
赤い 青い 白い 黒い 小さな 大きな 古い 新しい 静かな うるさい 眠い 明るい 暗い 優しい 冷たい 熱い 甘い 苦い
しょっぱい 不思議な 透明な 秘密の 最後の 最初の 伝説の 幻の 迷子の 空飛ぶ 歌う 踊る 眠れる 怒れる 笑う 泣き虫の
はらぺこの 気まぐれな 真夜中の 週末の 正直な 嘘つきの 退屈な 無敵の 臆病な 勇敢な ひとりぼっちの おしゃべりな
ねぼすけの 金色の 銀色の さかさまの 半分の 永遠の 一日だけの 誰も知らない 雨降りの 透き通った
`);

/** 「〜する名詞」になる動詞（連体形） */
export const VERBS = words(`
走る 泳ぐ 飛ぶ 歌う 踊る 眠る 笑う 泣く 怒る 待つ 探す 拾う 落とす 隠す 盗む 溶ける 光る 消える 増える 喋る
転がる 浮かぶ 迷う 届ける 数える 忘れる 覚えている 逃げる 追いかける 夢見る
`);

export type WordPattern = 'adj-noun' | 'noun-no-noun' | 'compound' | 'verb-noun' | 'noun-to-noun';

export const WORD_PATTERNS: { id: WordPattern; label: string; example: string }[] = [
  { id: 'adj-noun', label: '形容詞＋名詞', example: '眠れる図書館' },
  { id: 'noun-no-noun', label: '名詞の名詞', example: '猫の約束' },
  { id: 'compound', label: '名詞＋名詞', example: '銀河プリン' },
  { id: 'verb-noun', label: '動詞＋名詞', example: '泳ぐ時計' },
  { id: 'noun-to-noun', label: '名詞と名詞', example: '魔王とおにぎり' },
];
