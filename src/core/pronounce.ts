/**
 * 発音できる文字列を組み立てる。
 * かな: モーラ単位で、ん・っ・ー の置き場所のルールを守る。
 * 英字: 子音（頭子音）＋母音＋（末子音）の音節を組み合わせる。
 */
import type { Rng } from './random';
import { MORAS, type Mora, toKatakana } from './kana';

export interface KanaWordOptions {
  katakana: boolean;
  dakuon: boolean;
  handakuon: boolean;
  small: boolean;
  weighted: boolean;
}

/** っ の後に来られる行 */
const AFTER_SOKUON_HIRA = new Set(['k', 's', 't', 'p']);
const AFTER_SOKUON_KATA = new Set(['k', 's', 't', 'p', 'g', 'd', 'b', 'z', 'h']);

function moraAllowed(mo: Mora, o: KanaWordOptions): boolean {
  if (mo.katakanaOnly && !o.katakana) return false;
  if (mo.voiced === 'daku' && !o.dakuon) return false;
  if (mo.voiced === 'handaku' && !o.handakuon) return false;
  if (mo.small && !o.small) return false;
  return true;
}

/** 前のモーラ・残り文字数から、次に置けるか */
function fitsContext(mo: Mora, prev: Mora | undefined, remaining: number, o: KanaWordOptions): boolean {
  const len = mo.kana.length;
  if (len > remaining) return false;
  const isLast = len === remaining;
  if (!prev) {
    // 語頭に ん・っ・ー は置かない
    if (mo.kind === 'n' || mo.kind === 'sokuon' || mo.kind === 'chouon') return false;
  } else {
    if (prev.kind === 'sokuon') {
      const ok = o.katakana ? AFTER_SOKUON_KATA : AFTER_SOKUON_HIRA;
      if (!ok.has(mo.row)) return false;
    }
    if (mo.kind === 'n' && (prev.kind === 'n' || prev.kind === 'sokuon')) return false;
    if (mo.kind === 'sokuon' && (prev.kind === 'n' || prev.kind === 'sokuon' || prev.kind === 'chouon')) return false;
    if (mo.kind === 'chouon' && (prev.kind === 'n' || prev.kind === 'sokuon' || prev.kind === 'chouon')) return false;
  }
  // 語末に っ は置かない
  if (mo.kind === 'sokuon' && isLast) return false;
  return true;
}

/** ちょうど length 文字の、発音できるかな文字列 */
export function kanaWord(rng: Rng, length: number, o: KanaWordOptions): string {
  const pool = MORAS.filter((mo) => moraAllowed(mo, o));
  let out = '';
  let prev: Mora | undefined;
  let remaining = length;
  while (remaining > 0) {
    let cands = pool.filter((mo) => fitsContext(mo, prev, remaining, o));
    if (cands.length === 0) cands = pool.filter((mo) => mo.kind === 'seion' && mo.kana.length <= remaining);
    const mo = o.weighted ? rng.weighted(cands, (x) => x.weight) : rng.pick(cands);
    out += mo.kana;
    remaining -= mo.kana.length;
    prev = mo;
  }
  return o.katakana ? toKatakana(out) : out;
}

type Unit = [string, number];

const ONSETS: Unit[] = [
  ['b', 2], ['c', 3], ['d', 4], ['f', 2], ['g', 2], ['h', 4], ['j', 0.5], ['k', 1.5], ['l', 4], ['m', 3],
  ['n', 4], ['p', 2], ['r', 4], ['s', 5], ['t', 6], ['v', 1], ['w', 2], ['y', 1], ['z', 0.3], ['qu', 0.3],
  ['ch', 1.5], ['sh', 1.5], ['th', 2.5], ['br', 0.8], ['bl', 0.6], ['cr', 0.7], ['cl', 0.6], ['dr', 0.6],
  ['fr', 0.6], ['fl', 0.5], ['gr', 0.7], ['gl', 0.4], ['pr', 0.8], ['pl', 0.5], ['tr', 0.9], ['st', 1],
  ['sp', 0.5], ['sl', 0.4], ['sm', 0.3], ['sn', 0.3], ['sk', 0.3], ['str', 0.3], ['wh', 0.4], ['ph', 0.3],
];
const VOWELS: Unit[] = [
  ['a', 8], ['e', 10], ['i', 7], ['o', 7], ['u', 3], ['y', 0.5], ['ai', 0.6], ['ea', 0.8], ['ee', 0.6],
  ['ou', 0.7], ['oo', 0.5], ['ie', 0.4], ['io', 0.4], ['au', 0.3], ['ia', 0.3],
];
const CODAS: Unit[] = [
  ['n', 6], ['r', 5], ['s', 5], ['t', 5], ['l', 4], ['d', 3], ['m', 2], ['k', 1], ['p', 1], ['b', 0.5],
  ['g', 0.5], ['f', 0.5], ['x', 0.3], ['ck', 0.6], ['ng', 0.8], ['nd', 0.8], ['nt', 0.8], ['st', 0.7],
  ['rt', 0.4], ['rd', 0.3], ['rn', 0.3], ['ll', 0.6], ['ss', 0.4], ['th', 0.5], ['sh', 0.3], ['ch', 0.3],
  ['lt', 0.2], ['rk', 0.2], ['ft', 0.2],
];

export type LetterCase = 'lower' | 'upper' | 'capital';

/** ちょうど length 文字の、発音できる英字列 */
export function latinWord(rng: Rng, length: number, weighted: boolean, letterCase: LetterCase): string {
  const choose = (units: Unit[], maxLen: number): string | undefined => {
    const c = units.filter(([s]) => s.length <= maxLen);
    if (c.length === 0) return undefined;
    return (weighted ? rng.weighted(c, (u) => u[1]) : rng.pick(c))[0];
  };
  let out = '';
  // state: start / onset（次は母音）/ vowel / coda
  let state: 'start' | 'onset' | 'vowel' | 'coda' = 'start';
  while (out.length < length) {
    const rem = length - out.length;
    let piece: string | undefined;
    if (state === 'onset') {
      piece = choose(VOWELS, rem);
      state = 'vowel';
    } else if (state === 'vowel') {
      // 母音の後: 末子音か、次の音節の頭子音（母音の分を1文字残す）
      const useOnset = rem >= 2 && rng.chance(0.55);
      piece = useOnset ? choose(ONSETS, rem - 1) : undefined;
      if (piece) state = 'onset';
      else {
        piece = choose(CODAS, rem);
        state = 'coda';
      }
    } else {
      // 語頭・末子音の後: 頭子音か母音
      const useOnset = rem >= 2 && (state === 'coda' ? rng.chance(0.5) : rng.chance(0.75));
      piece = useOnset ? choose(ONSETS, rem - 1) : undefined;
      if (piece) state = 'onset';
      else {
        piece = choose(VOWELS, rem);
        state = 'vowel';
      }
    }
    out += piece ?? 'a';
  }
  if (letterCase === 'upper') return out.toUpperCase();
  if (letterCase === 'capital') return out.charAt(0).toUpperCase() + out.slice(1);
  return out;
}
