/**
 * 文字単位のマルコフ連鎖。名前リストから「それっぽい」新しい名前を作る。
 */
import type { Rng } from './random';

const START = '^';
const END = '$';
const VOWEL = /[aeiouyäöüåæøéèêëàâîïôûœ]/;
const CONSONANT_RUN = /[^aeiouyäöüåæøéèêëàâîïôûœ]{5,}/;

export class MarkovModel {
  private table = new Map<string, Map<string, number>>();
  private known: Set<string>;

  constructor(
    samples: string[],
    private order = 2,
  ) {
    this.known = new Set(samples.map((s) => s.toLowerCase()));
    for (const raw of samples) {
      const chars = [...START.repeat(order), ...raw.toLowerCase(), END];
      for (let i = order; i < chars.length; i++) {
        const key = chars.slice(i - order, i).join('');
        const next = chars[i];
        let row = this.table.get(key);
        if (!row) this.table.set(key, (row = new Map()));
        row.set(next, (row.get(next) ?? 0) + 1);
      }
    }
  }

  /** 新しい名前を1つ作る。条件に合うものが出なければ undefined */
  generate(rng: Rng, minLen = 3, maxLen = 10, allowKnown = false, tries = 200): string | undefined {
    for (let t = 0; t < tries; t++) {
      const out: string[] = [];
      let ctx = [...START.repeat(this.order)];
      for (;;) {
        const row = this.table.get(ctx.join(''));
        if (!row) break;
        const entries = [...row];
        const [next] = rng.weighted(entries, (e) => e[1]);
        if (next === END) break;
        out.push(next);
        if (out.length > maxLen) break;
        ctx = [...ctx.slice(1), next];
      }
      const word = out.join('');
      if (out.length < minLen || out.length > maxLen) continue;
      if (!allowKnown && this.known.has(word)) continue;
      // 母音がない・子音が5つ以上続くものは読みにくいので捨てる
      if (!VOWEL.test(word) || CONSONANT_RUN.test(word)) continue;
      return capitalize(word);
    }
    return undefined;
  }
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
