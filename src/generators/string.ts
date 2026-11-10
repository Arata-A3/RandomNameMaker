/** 文字列モード */
import { Rng } from '../core/random';
import { type Charset, charPool } from '../core/charset';
import { kanaWord, latinWord, type LetterCase } from '../core/pronounce';

export interface StringOptions {
  charsets: Charset[];
  dakuon: boolean;
  handakuon: boolean;
  small: boolean;
  minLength: number;
  maxLength: number;
  count: number;
  /** 発音できる文字列だけ出す */
  pronounceable: boolean;
  /** 使われやすい文字を出やすくする */
  weighted: boolean;
  seed?: string;
}

export const DEFAULT_STRING_OPTIONS: StringOptions = {
  charsets: ['katakana'],
  dakuon: true,
  handakuon: true,
  small: true,
  minLength: 3,
  maxLength: 6,
  count: 10,
  pronounceable: true,
  weighted: true,
};

type Family = 'kana-h' | 'kana-k' | 'latin' | 'kanji' | 'digit';

function families(charsets: Charset[]): Family[] {
  const f = new Set<Family>();
  for (const c of charsets) {
    if (c === 'hiragana') f.add('kana-h');
    else if (c === 'katakana') f.add('kana-k');
    else if (c === 'upper' || c === 'lower') f.add('latin');
    else f.add(c);
  }
  return [...f];
}

function letterCase(charsets: Charset[]): LetterCase {
  const up = charsets.includes('upper');
  const low = charsets.includes('lower');
  if (up && low) return 'capital';
  return up ? 'upper' : 'lower';
}

export function generateStrings(opts: StringOptions, rng = new Rng(opts.seed)): string[] {
  if (opts.charsets.length === 0) return [];
  const min = Math.max(1, Math.floor(Math.min(opts.minLength, opts.maxLength)));
  const max = Math.max(min, Math.floor(Math.max(opts.minLength, opts.maxLength)));
  const count = Math.max(0, Math.floor(opts.count));

  const pools = opts.charsets.map((c) => charPool(c, opts));
  const fams = families(opts.charsets);
  const lc = letterCase(opts.charsets);

  const one = (): string => {
    const len = rng.int(min, max);
    if (opts.pronounceable) {
      // 発音モードでは1つの文字列につき1つの文字種
      const fam = rng.pick(fams);
      switch (fam) {
        case 'kana-h':
        case 'kana-k':
          return kanaWord(rng, len, { ...opts, katakana: fam === 'kana-k' });
        case 'latin':
          return latinWord(rng, len, opts.weighted, lc);
        case 'kanji':
          return pickChars(rng, charPool('kanji', opts), len, opts.weighted);
        case 'digit':
          return pickChars(rng, charPool('digit', opts), len, opts.weighted);
      }
    }
    // 文字種を等確率で選んでから、その中の文字を選ぶ
    let s = '';
    for (let i = 0; i < len; i++) {
      const pool = rng.pick(pools);
      s += opts.weighted ? rng.weighted(pool, (c) => c.weight).ch : rng.pick(pool).ch;
    }
    return s;
  };

  // なるべく重複しないように（試行回数に上限）
  const out: string[] = [];
  const seen = new Set<string>();
  let tries = 0;
  while (out.length < count) {
    const s = one();
    if (!seen.has(s) || tries > count * 20) {
      seen.add(s);
      out.push(s);
    }
    tries++;
  }
  return out;
}

function pickChars(rng: Rng, pool: { ch: string; weight: number }[], len: number, weighted: boolean): string {
  let s = '';
  for (let i = 0; i < len; i++) s += weighted ? rng.weighted(pool, (c) => c.weight).ch : rng.pick(pool).ch;
  return s;
}
