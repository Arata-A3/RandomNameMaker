import { describe, expect, it } from 'vitest';
import { Rng } from '../src/core/random';
import { kanaWord, latinWord } from '../src/core/pronounce';
import { generateStrings, DEFAULT_STRING_OPTIONS } from '../src/generators/string';

const allOn = { dakuon: true, handakuon: true, small: true, weighted: true };

describe('Rng', () => {
  it('同じシードなら同じ結果', () => {
    const a = new Rng('abc');
    const b = new Rng('abc');
    expect([a.next(), a.next()]).toEqual([b.next(), b.next()]);
  });
});

describe('kanaWord', () => {
  it('指定した文字数ちょうどになる', () => {
    const rng = new Rng(1);
    for (let len = 1; len <= 12; len++) {
      for (let i = 0; i < 50; i++) expect([...kanaWord(rng, len, { ...allOn, katakana: true })].length).toBe(len);
    }
  });

  it('語頭に ん・っ・ー、語末に っ が来ない', () => {
    const rng = new Rng(2);
    for (let i = 0; i < 2000; i++) {
      const w = kanaWord(rng, rng.int(1, 8), { ...allOn, katakana: true });
      expect(w).not.toMatch(/^[ンッー]/);
      expect(w).not.toMatch(/ッ$/);
      expect(w).not.toMatch(/[ンッー][ッー]|[ンッ]ン/);
    }
  });

  it('濁音・半濁音・小文字をOFFにすると出ない', () => {
    const rng = new Rng(3);
    for (let i = 0; i < 1000; i++) {
      const w = kanaWord(rng, 6, { katakana: false, dakuon: false, handakuon: false, small: false, weighted: true });
      expect(w).not.toMatch(/[がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽぁぃぅぇぉゃゅょっ]/);
    }
  });
});

describe('latinWord', () => {
  it('文字数ちょうど・3つ以上の子音や母音が続きにくい', () => {
    const rng = new Rng(4);
    for (let i = 0; i < 1000; i++) {
      const len = rng.int(1, 10);
      const w = latinWord(rng, len, true, 'lower');
      expect(w.length).toBe(len);
      expect(w).toMatch(/^[a-z]+$/);
      expect(w).not.toMatch(/[aeiou]{3}/);
    }
  });
});

describe('generateStrings', () => {
  it('生成数と文字数の範囲を守る', () => {
    const out = generateStrings({ ...DEFAULT_STRING_OPTIONS, count: 30, minLength: 2, maxLength: 5, seed: 'x' });
    expect(out).toHaveLength(30);
    for (const s of out) expect([...s].length).toBeGreaterThanOrEqual(2);
    for (const s of out) expect([...s].length).toBeLessThanOrEqual(5);
  });

  it('長い文字列も作れる', () => {
    const [s] = generateStrings({ ...DEFAULT_STRING_OPTIONS, count: 1, minLength: 500, maxLength: 500 });
    expect([...s].length).toBe(500);
  });

  it('発音を気にしないモードで数字だけ', () => {
    const out = generateStrings({ ...DEFAULT_STRING_OPTIONS, charsets: ['digit'], pronounceable: false, count: 5 });
    for (const s of out) expect(s).toMatch(/^\d+$/);
  });
});
