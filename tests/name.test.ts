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

  it('欧米・ファンタジーの名前にはカタカナの読みが付く', () => {
    for (const culture of ['english', 'german', 'french', 'nordic', 'fantasy'] as const) {
      for (const source of ['real', 'generated'] as const) {
        const out = generateNames({ culture, part: 'full', gender: 'any', source, count: 50, seed: culture });
        for (const r of out) expect(r.reading, r.text).toMatch(/^[ァ-ヴー]+・[ァ-ヴー]+$/);
      }
    }
  });

  it('苗字だけ', () => {
    const out = generateNames({ culture: 'english', part: 'family', gender: 'any', source: 'real', count: 5 });
    for (const r of out) expect(r.text).not.toContain(' ');
  });
});

describe('日本の名前の組み立て', () => {
  it('読みのつながりが不自然なものは避ける', async () => {
    const { joinsWell } = await import('../src/generators/name');
    expect(joinsWell('ゆき', 'き')).toBe(false);
    expect(joinsWell('ゆう', 'お')).toBe(false);
    expect(joinsWell('あき', 'いち')).toBe(false);
    expect(joinsWell('けん', 'いち')).toBe(true);
    expect(joinsWell('はる', 'と')).toBe(true);
  });

  it('作った名前は男性3〜4音・女性2〜3音', async () => {
    const { moraCount } = await import('../src/generators/name');
    for (const [gender, min, max] of [['male', 3, 4], ['female', 2, 3]] as const) {
      const out = generateNames({ culture: 'japan', part: 'given', gender, source: 'generated', count: 100, seed: gender });
      for (const r of out) {
        expect(moraCount(r.reading!)).toBeGreaterThanOrEqual(min);
        expect(moraCount(r.reading!)).toBeLessThanOrEqual(max);
      }
    }
  });
});
