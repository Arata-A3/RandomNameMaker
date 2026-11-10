/** 単語モード: 意味のある言葉を組み合わせる */
import { Rng } from '../core/random';
import {
  ADJECTIVES,
  VERBS,
  WORD_CATEGORIES,
  type WordCategory,
  type WordPattern,
} from '../data/words';

export interface WordOptions {
  categories: WordCategory[];
  patterns: WordPattern[];
  count: number;
  seed?: string;
}

export const DEFAULT_WORD_OPTIONS: WordOptions = {
  categories: WORD_CATEGORIES.map((c) => c.id),
  patterns: ['adj-noun', 'noun-no-noun', 'compound', 'verb-noun'],
  count: 10,
};

export function generateWords(opts: WordOptions, rng = new Rng(opts.seed)): string[] {
  const cats = WORD_CATEGORIES.filter((c) => opts.categories.includes(c.id));
  if (cats.length === 0 || opts.patterns.length === 0) return [];
  // カテゴリを等確率で選んでから名詞を選ぶ（カテゴリの大きさに左右されないように）
  const noun = () => rng.pick(rng.pick(cats).nouns);
  const twoNouns = (): [string, string] => {
    const a = noun();
    let b = noun();
    for (let i = 0; i < 10 && b === a; i++) b = noun();
    return [a, b];
  };

  const one = (): string => {
    switch (rng.pick(opts.patterns)) {
      case 'adj-noun':
        return rng.pick(ADJECTIVES) + noun();
      case 'verb-noun':
        return rng.pick(VERBS) + noun();
      case 'noun-no-noun': {
        const [a, b] = twoNouns();
        return `${a}の${b}`;
      }
      case 'noun-to-noun': {
        const [a, b] = twoNouns();
        return `${a}と${b}`;
      }
      case 'compound': {
        const [a, b] = twoNouns();
        return a + b;
      }
    }
  };

  const out: string[] = [];
  const seen = new Set<string>();
  const count = Math.max(0, Math.floor(opts.count));
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
