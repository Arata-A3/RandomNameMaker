import { describe, expect, it } from 'vitest';
import { encodeShare, readShare } from '../src/ui/share';

describe('共有リンク', () => {
  it('日本語の名前と読みをそのまま往復できる', () => {
    const p = {
      mode: 'name' as const,
      title: '作った名札',
      items: [{ text: '松野 咲寧', sub: 'まつの さね' }, { text: 'Tavish Ashford', sub: 'タヴィシュ・アッシュフォード' }],
    };
    const hash = encodeShare(p);
    expect(hash).toMatch(/^#s=[\w-]+$/);
    expect(readShare(hash)).toEqual(p);
  });

  it('件数は40件までにする', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ text: `名前${i}` }));
    expect(readShare(encodeShare({ mode: 'word', title: 't', items }))!.items).toHaveLength(40);
  });

  it('壊れたリンクは無視する', () => {
    expect(readShare('#s=@@@')).toBeUndefined();
    expect(readShare('#s=abc')).toBeUndefined();
    expect(readShare('#other')).toBeUndefined();
  });
});
