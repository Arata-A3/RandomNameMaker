/**
 * 文字種ごとの文字プールと重み。
 * 「発音を気にしない」モードで1文字ずつ選ぶときに使う。
 */
import { MORAS, SMALL_KANA, toKatakana } from './kana';
import { KANJI, kanjiWeight } from '../data/kanji';

export type Charset = 'hiragana' | 'katakana' | 'kanji' | 'upper' | 'lower' | 'digit';

export const CHARSETS: { id: Charset; label: string }[] = [
  { id: 'hiragana', label: 'ひらがな' },
  { id: 'katakana', label: 'カタカナ' },
  { id: 'kanji', label: '漢字' },
  { id: 'upper', label: '英大文字' },
  { id: 'lower', label: '英小文字' },
  { id: 'digit', label: '数字' },
];

export interface KanaFilter {
  dakuon: boolean;
  handakuon: boolean;
  small: boolean;
}

export interface WeightedChar {
  ch: string;
  weight: number;
}

/** 英語での文字の出現頻度（%） */
export const LETTER_FREQ: Record<string, number> = {
  e: 12.7, t: 9.1, a: 8.2, o: 7.5, i: 7.0, n: 6.7, s: 6.3, h: 6.1, r: 6.0, d: 4.3, l: 4.0, c: 2.8, u: 2.8,
  m: 2.4, w: 2.4, f: 2.2, g: 2.0, y: 2.0, p: 1.9, b: 1.5, v: 1.0, k: 0.8, j: 0.15, x: 0.15, q: 0.1, z: 0.07,
};

/** 数字はベンフォードの法則っぽく小さい数をやや出やすくする */
const DIGIT_WEIGHT = [8, 10, 9, 8, 7, 7, 6, 6, 6, 6];

const DAKU = 'がぎぐげござじずぜぞだぢづでどばびぶべぼゔ';
const HANDAKU = 'ぱぴぷぺぽ';

/** かな1文字ごとの重み（モーラ表の重みを文字ごとに集計） */
function kanaCharWeights(): Map<string, number> {
  const w = new Map<string, number>();
  for (const mo of MORAS) {
    if (mo.katakanaOnly) continue;
    const first = mo.kana[0];
    w.set(first, (w.get(first) ?? 0) + mo.weight);
    for (const c of mo.kana.slice(1)) w.set(c, (w.get(c) ?? 0) + mo.weight * 0.5);
  }
  for (const c of SMALL_KANA) if (!w.has(c)) w.set(c, 0.3);
  return w;
}

const KANA_WEIGHTS = kanaCharWeights();

/** 文字種のプール（フィルタ適用済み） */
export function charPool(charset: Charset, filter: KanaFilter): WeightedChar[] {
  switch (charset) {
    case 'hiragana':
    case 'katakana': {
      const out: WeightedChar[] = [];
      for (const [ch, weight] of KANA_WEIGHTS) {
        if (!filter.dakuon && DAKU.includes(ch)) continue;
        if (!filter.handakuon && HANDAKU.includes(ch)) continue;
        if (!filter.small && SMALL_KANA.includes(ch)) continue;
        out.push({ ch: charset === 'katakana' ? toKatakana(ch) : ch, weight });
      }
      if (charset === 'katakana') out.push({ ch: 'ー', weight: 6 });
      return out;
    }
    case 'kanji':
      return KANJI.map((ch, i) => ({ ch, weight: kanjiWeight(i) }));
    case 'upper':
    case 'lower':
      return Object.entries(LETTER_FREQ).map(([ch, weight]) => ({
        ch: charset === 'upper' ? ch.toUpperCase() : ch,
        weight,
      }));
    case 'digit':
      return DIGIT_WEIGHT.map((weight, i) => ({ ch: String(i), weight }));
  }
}
