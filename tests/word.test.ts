import { describe, expect, it } from 'vitest';
import { generateWords } from '../src/generators/word';
import { WORD_CATEGORIES } from '../src/data/words';

describe('generateWords', () => {
  it('指定した数だけ作る', () => {
    expect(generateWords({ categories: ['animal'], patterns: ['adj-noun'], count: 15, seed: '1' })).toHaveLength(15);
  });

  it('選んだカテゴリの名詞だけを使う', () => {
    const animals = WORD_CATEGORIES.find((c) => c.id === 'animal')!.nouns;
    const foods = WORD_CATEGORIES.find((c) => c.id === 'food')!.nouns;
    const out = generateWords({ categories: ['animal', 'food'], patterns: ['noun-no-noun'], count: 30, seed: 'w' });
    for (const s of out) {
      const parts = s.split('の');
      if (parts.length !== 2) continue; // 単語自体に「の」を含む場合は省略
      expect([...animals, ...foods]).toContain(parts[0]);
    }
  });

  it('カテゴリかパターンが空なら空配列', () => {
    expect(generateWords({ categories: [], patterns: ['compound'], count: 5 })).toEqual([]);
    expect(generateWords({ categories: ['food'], patterns: [], count: 5 })).toEqual([]);
  });
});
