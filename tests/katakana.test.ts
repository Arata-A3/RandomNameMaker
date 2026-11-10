import { describe, expect, it } from 'vitest';
import { romajiToKatakana, toKatakanaName } from '../src/core/katakana';

describe('romajiToKatakana', () => {
  it('基本の変換・促音・長音・拗音', () => {
    expect(romajiToKatakana('sakura')).toBe('サクラ');
    expect(romajiToKatakana('matti')).toBe('マッティ');
    expect(romajiToKatakana('leena')).toBe('レーナ');
    expect(romajiToKatakana('kryuger')).toBe('クリュゲル');
  });
});

describe('toKatakanaName', () => {
  it('国ごとの綴りで読む', () => {
    expect(toKatakanaName('Zimmermann', 'german')).toBe('ツィメルマン');
    expect(toKatakanaName('Fournier', 'french')).toBe('フルニエ');
    expect(toKatakanaName('Pettersson', 'nordic')).toBe('ペッテルソン');
    expect(toKatakanaName('Stormvale', 'fantasy')).toBe('ストームヴェイル');
  });

  it('辞書の読みを優先し、国別の読みがあればそちらを使う', () => {
    expect(toKatakanaName('Michael', 'english')).toBe('マイケル');
    expect(toKatakanaName('Michael', 'german')).toBe('ミヒャエル');
  });
});
