import { describe, expect, it } from 'vitest';
import { Rng } from '../src/core/random';
import { MarkovModel } from '../src/core/markov';
import { CULTURES, generateNames } from '../src/generators/name';
import { ENGLISH } from '../src/data/names/western';

describe('MarkovModel', () => {
  it('学習元にない名前を指定の長さで作る', () => {
    const m = new MarkovModel(ENGLISH.female);
    const rng = new Rng(1);
    const known = new Set(ENGLISH.female.map((s) => s.toLowerCase()));
    for (let i = 0; i < 100; i++) {
      const n = m.generate(rng, 3, 9);
      if (!n) continue;
      expect(n.length).toBeGreaterThanOrEqual(3);
      expect(n.length).toBeLessThanOrEqual(9);
      expect(known.has(n.toLowerCase())).toBe(false);
    }
  });
});

describe('generateNames', () => {
  for (const { id } of CULTURES) {
    for (const source of ['real', 'generated'] as const) {
      it(`${id} / ${source} で生成できる`, () => {
        const out = generateNames({ culture: id, part: 'full', gender: 'any', source, count: 20, seed: id });
        expect(out).toHaveLength(20);
        for (const r of out) expect(r.text.split(' ')).toHaveLength(2);
      });
    }
  }

  it('日本の名前には読みが付く', () => {
    const out = generateNames({ culture: 'japan', part: 'given', gender: 'female', source: 'generated', count: 10 });
    for (const r of out) {
      expect(r.reading).toMatch(/^[ぁ-ゖ]+$/);
      expect(r.gender).toBe('female');
    }
  });

  it('苗字だけ', () => {
    const out = generateNames({ culture: 'english', part: 'family', gender: 'any', source: 'real', count: 5 });
    for (const r of out) expect(r.text).not.toContain(' ');
  });
});
