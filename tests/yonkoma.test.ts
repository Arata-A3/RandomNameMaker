import { describe, expect, it } from 'vitest';
import { Rng } from '../src/core/random';
import { fillTemplate, ideaToText, rerollField, rollIdea, type FieldKey } from '../src/generators/yonkoma';

const opts = { characterCount: 2, culture: 'japan' as const, genre: 'any' as const };
const ctx = { culture: 'japan' as const, genre: 'any' as const };

describe('rollIdea', () => {
  it('人数分の登場人物と全項目がそろう', () => {
    const idea = rollIdea({ ...opts, characterCount: 3, seed: 'a' });
    expect(idea.characters).toHaveLength(3);
    for (const k of ['relation', 'theme', 'place', 'season', 'prop', 'ki', 'sho', 'ten', 'ketsu', 'ochi'] as const) {
      expect(idea[k]).toBeTruthy();
    }
  });

  it('固定した項目は引き継がれる', () => {
    const first = rollIdea({ ...opts, seed: 'a' });
    const locked = new Set<FieldKey>(['place', 'c0.name', 'c1.catchphrase']);
    for (let i = 0; i < 20; i++) {
      const next = rollIdea(opts, new Rng(i), first, locked);
      expect(next.place).toBe(first.place);
      expect(next.characters[0].name).toEqual(first.characters[0].name);
      expect(next.characters[1].catchphrase).toBe(first.characters[1].catchphrase);
    }
  });
});

describe('rerollField', () => {
  it('指定した項目だけ変わる', () => {
    const idea = rollIdea({ ...opts, seed: 'b' });
    const next = rerollField(idea, 'prop', ctx, new Rng(1));
    expect(next.prop).not.toBe(idea.prop);
    expect(next.place).toBe(idea.place);
    expect(next.characters).toEqual(idea.characters);
  });

  it('登場人物の項目も引き直せる', () => {
    const idea = rollIdea({ ...opts, seed: 'c' });
    const next = rerollField(idea, 'c1.role', ctx, new Rng(2));
    expect(next.characters[1].role).not.toBe(idea.characters[1].role);
    expect(next.characters[0]).toEqual(idea.characters[0]);
  });
});

describe('fillTemplate', () => {
  it('名前・小道具・舞台を埋める', () => {
    const idea = rollIdea({ ...opts, seed: 'd' });
    const s = fillTemplate('{A}と{B}が{place}で{prop}', idea);
    expect(s).not.toMatch(/[{}]/);
    expect(s).toContain(idea.place);
    expect(ideaToText(idea)).toContain('【起】');
  });

  it('1人のときの {B} は代わりの言葉になる', () => {
    const idea = rollIdea({ ...opts, characterCount: 1, seed: 'e' });
    expect(fillTemplate('{B}', idea)).toBe('通りすがりの人');
  });
});

describe('ジャンル', () => {
  it('どのジャンルでも全項目がそろい、テンプレートが埋まる', async () => {
    const { GENRES } = await import('../src/data/yonkoma');
    for (const { id } of GENRES) {
      for (let i = 0; i < 30; i++) {
        const idea = rollIdea({ ...opts, genre: id, seed: `${id}${i}` });
        expect(ideaToText(idea)).not.toMatch(/[{}]|undefined/);
      }
    }
  });

  it('ジャンルを選ぶとその材料が出やすい', async () => {
    const { GENRE_POOLS } = await import('../src/data/yonkoma');
    const fantasyPlaces = new Set(GENRE_POOLS.fantasy.place);
    let hit = 0;
    for (let i = 0; i < 200; i++) if (fantasyPlaces.has(rollIdea({ ...opts, genre: 'fantasy', seed: String(i) }).place)) hit++;
    expect(hit).toBeGreaterThan(100);
  });
});
