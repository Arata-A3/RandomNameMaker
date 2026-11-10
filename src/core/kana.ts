/**
 * かなのモーラ（音のまとまり）表。ひらがなで持ち、カタカナは変換して使う。
 * weight はおおよその出現しやすさ（日本語の文章・名前での体感頻度）。
 */
export type MoraKind =
  | 'seion' // 清音
  | 'dakuon' // 濁音
  | 'handakuon' // 半濁音
  | 'youon' // 拗音（きゃ など）
  | 'gairai' // 外来音（ファ・ティ など。カタカナのみ）
  | 'n' // ん
  | 'sokuon' // っ
  | 'chouon'; // ー（カタカナのみ）

export interface Mora {
  kana: string;
  kind: MoraKind;
  /** 子音の行（'' は母音行）。っ の次に来られるかの判定に使う */
  row: string;
  weight: number;
  /** 濁点・半濁点を含むか */
  voiced: 'none' | 'daku' | 'handaku';
  /** 小文字を含むか */
  small: boolean;
  katakanaOnly: boolean;
}

function m(
  kana: string,
  kind: MoraKind,
  row: string,
  weight: number,
  opts: Partial<Pick<Mora, 'voiced' | 'small' | 'katakanaOnly'>> = {},
): Mora {
  const voiced = opts.voiced ?? (kind === 'dakuon' ? 'daku' : kind === 'handakuon' ? 'handaku' : 'none');
  const small = opts.small ?? (kind === 'youon' || kind === 'gairai' || kind === 'sokuon');
  return { kana, kind, row, weight, voiced, small, katakanaOnly: opts.katakanaOnly ?? false };
}

const seion: [string, string, number[]][] = [
  ['あいうえお', '', [18, 50, 40, 8, 15]],
  ['かきくけこ', 'k', [35, 20, 20, 12, 22]],
  ['さしすせそ', 's', [15, 35, 20, 10, 10]],
  ['たちつてと', 't', [30, 10, 15, 30, 30]],
  ['なにぬねの', 'n', [28, 30, 2, 6, 40]],
  ['はひふへほ', 'h', [25, 8, 6, 3, 7]],
  ['まみむめも', 'm', [18, 10, 4, 7, 18]],
  ['やゆよ', 'y', [8, 4, 10]],
  ['らりるれろ', 'r', [18, 15, 30, 15, 6]],
  ['わを', 'w', [8, 0.5]],
];
const dakuon: [string, string, number[]][] = [
  ['がぎぐげご', 'g', [18, 3, 3, 3, 5]],
  ['ざじずぜぞ', 'z', [3, 8, 4, 2, 2]],
  ['だぢづでど', 'd', [10, 0.3, 0.5, 15, 6]],
  ['ばびぶべぼ', 'b', [4, 3, 3, 3, 2]],
];
const handakuon: [string, string, number[]][] = [['ぱぴぷぺぽ', 'p', [1, 0.5, 0.7, 0.4, 0.6]]];

const youonBase: [string, string, 'none' | 'daku' | 'handaku', number][] = [
  ['き', 'k', 'none', 2.5],
  ['し', 's', 'none', 3],
  ['ち', 't', 'none', 2],
  ['に', 'n', 'none', 0.5],
  ['ひ', 'h', 'none', 0.6],
  ['み', 'm', 'none', 0.4],
  ['り', 'r', 'none', 1],
  ['ぎ', 'g', 'daku', 0.8],
  ['じ', 'z', 'daku', 2.5],
  ['び', 'b', 'daku', 0.4],
  ['ぴ', 'p', 'handaku', 0.3],
];

const gairai: [string, string, number, 'none' | 'daku'][] = [
  ['ふぁ', 'h', 0.8, 'none'],
  ['ふぃ', 'h', 0.5, 'none'],
  ['ふぇ', 'h', 0.5, 'none'],
  ['ふぉ', 'h', 0.6, 'none'],
  ['てぃ', 't', 0.7, 'none'],
  ['でぃ', 'd', 0.6, 'daku'],
  ['うぃ', 'w', 0.5, 'none'],
  ['うぇ', 'w', 0.5, 'none'],
  ['うぉ', 'w', 0.4, 'none'],
  ['ちぇ', 't', 0.4, 'none'],
  ['しぇ', 's', 0.4, 'none'],
  ['じぇ', 'z', 0.4, 'daku'],
  ['ゔぁ', 'b', 0.2, 'daku'],
];

export const MORAS: Mora[] = [
  ...seion.flatMap(([chars, row, ws]) => [...chars].map((c, i) => m(c, 'seion', row, ws[i]))),
  ...dakuon.flatMap(([chars, row, ws]) => [...chars].map((c, i) => m(c, 'dakuon', row, ws[i]))),
  ...handakuon.flatMap(([chars, row, ws]) => [...chars].map((c, i) => m(c, 'handakuon', row, ws[i]))),
  ...youonBase.flatMap(([base, row, voiced, w]) =>
    ['ゃ', 'ゅ', 'ょ'].map((s, i) => m(base + s, 'youon', row, w * [0.8, 0.7, 1.2][i], { voiced })),
  ),
  ...gairai.map(([kana, row, w, voiced]) => m(kana, 'gairai', row, w, { voiced, katakanaOnly: true })),
  m('ん', 'n', 'N', 35),
  m('っ', 'sokuon', 'Q', 12),
  m('ー', 'chouon', 'L', 6, { katakanaOnly: true }),
];

/** 1文字単位（発音を気にしないモード用）のかな。小文字は単独の文字として扱う */
export const SMALL_KANA = 'ぁぃぅぇぉゃゅょっゎ';

/** ひらがな→カタカナ */
export function toKatakana(s: string): string {
  return s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
}

/** カタカナ→ひらがな */
export function toHiragana(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}
