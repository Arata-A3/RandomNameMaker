/** 名前モード */
import { Rng } from '../core/random';
import { MarkovModel } from '../core/markov';
import { toKatakanaName, type Spelling } from '../core/katakana';
import type { Entry } from '../data/names/parse';
import * as JP from '../data/names/japan';
import * as CN from '../data/names/chinese';
import * as W from '../data/names/western';

export type Culture = 'japan' | 'english' | 'chinese' | 'german' | 'french' | 'nordic' | 'fantasy';
export type NamePart = 'family' | 'given' | 'full';
export type NameGender = 'male' | 'female' | 'any';
/** real: 実在の名前から選ぶ / generated: それっぽく作る / mixed: 半々 */
export type NameSource = 'real' | 'generated' | 'mixed';

export const CULTURES: { id: Culture; label: string }[] = [
  { id: 'japan', label: '日本' },
  { id: 'english', label: '英米' },
  { id: 'chinese', label: '中華' },
  { id: 'german', label: '独' },
  { id: 'french', label: '仏' },
  { id: 'nordic', label: '北欧' },
  { id: 'fantasy', label: 'ファンタジー' },
];

export interface NameOptions {
  culture: Culture;
  part: NamePart;
  gender: NameGender;
  source: NameSource;
  count: number;
  seed?: string;
}

export const DEFAULT_NAME_OPTIONS: NameOptions = {
  culture: 'japan',
  part: 'full',
  gender: 'any',
  source: 'mixed',
  count: 10,
};

export interface NameResult {
  text: string;
  /** 読み（日本: ひらがな、中華: ピンイン） */
  reading?: string;
  gender: 'male' | 'female';
}

interface Piece {
  text: string;
  reading?: string;
}

const WESTERN: Record<string, W.NameLists> = {
  english: W.ENGLISH,
  german: W.GERMAN,
  french: W.FRENCH,
  nordic: W.NORDIC,
  fantasy: W.FANTASY,
};

const modelCache = new Map<string, MarkovModel>();
function model(culture: string, kind: 'male' | 'female' | 'family'): MarkovModel {
  const key = `${culture}:${kind}`;
  let m = modelCache.get(key);
  if (!m) modelCache.set(key, (m = new MarkovModel(WESTERN[culture][kind])));
  return m;
}

const useReal = (rng: Rng, source: NameSource) => source === 'real' || (source === 'mixed' && rng.chance(0.5));

/**
 * "た/だ" のような読みから、連濁したほうを確率で選ぶ。
 * 前半が「ん」で終わるときは濁りやすい（近藤 こんどう、本田 ほんだ）。
 */
function tailReading(rng: Rng, head: Entry, tail: Entry): string {
  const [plain, voiced] = tail.reading.split('/');
  if (!voiced) return plain;
  const p = head.reading.endsWith('ん') ? Math.min(1, tail.voicing + 0.3) : tail.voicing;
  return rng.chance(p) ? voiced : plain;
}

/** モーラ数（小さい ゃゅょ は前の音とまとめて数える） */
export function moraCount(kana: string): number {
  return [...kana.replace(/[ゃゅょぁぃぅぇぉ]/g, '')].length;
}

const byWeight = (e: Entry) => e.weight;

function japanFamily(rng: Rng, source: NameSource): Piece {
  if (useReal(rng, source)) {
    const e = rng.pick(JP.JP_FAMILY_REAL);
    return { text: e.text, reading: e.reading };
  }
  const head = rng.weighted(JP.JP_FAMILY_HEAD, byWeight);
  const tail = rng.weighted(
    JP.JP_FAMILY_TAIL.filter((t) => t.text !== head.text),
    byWeight,
  );
  return { text: head.text + tail.text, reading: head.reading + tailReading(rng, head, tail) };
}

/** 名前の前半と後半の読みが自然につながるか */
export function joinsWell(head: string, tail: string): boolean {
  const last = head[head.length - 1];
  // 同じ音が続く（ゆきき、かなな）
  if (last === tail[0]) return false;
  // 「いち」は ん・う の後だけ（けんいち、ゆういち）
  if (tail === 'いち') return last === 'ん' || last === 'う';
  // 母音で始まる後半は、伸ばす音の後に付けない（ゆうお、こうあ）
  if (/^[あいうえお]/.test(tail) && /[うい]$/.test(head)) return false;
  return true;
}

/** 下の名前のモーラ数の範囲（男性: 3〜4、女性: 2〜3） */
const GIVEN_MORA: Record<'male' | 'female', [number, number]> = { male: [3, 4], female: [2, 3] };

function japanGiven(rng: Rng, source: NameSource, g: 'male' | 'female'): Piece {
  if (useReal(rng, source)) {
    const e = rng.pick(g === 'male' ? JP.JP_GIVEN_REAL_MALE : JP.JP_GIVEN_REAL_FEMALE);
    return { text: e.text, reading: e.reading };
  }
  const want = g === 'male' ? 'm' : 'f';
  const heads = JP.JP_GIVEN_HEAD.filter((h) => h.g === want || h.g === 'u');
  const tails = g === 'male' ? JP.JP_GIVEN_TAIL_MALE : JP.JP_GIVEN_TAIL_FEMALE;
  const [min, max] = GIVEN_MORA[g];
  let piece: Piece = { text: '', reading: '' };
  // 短すぎる・長すぎる読みや、同じ漢字の重なりは引き直す
  for (let t = 0; t < 30; t++) {
    const head = rng.pick(heads);
    const tail = rng.pick(tails);
    const reading = head.reading + tail.reading;
    piece = { text: head.text + tail.text, reading };
    const n = moraCount(reading);
    if (head.text !== tail.text && n >= min && n <= max && joinsWell(head.reading, tail.reading)) break;
  }
  return piece;
}

function chineseFamily(rng: Rng): Piece {
  const e = rng.pick(CN.CN_FAMILY);
  return { text: e.text, reading: e.reading };
}

function chineseGiven(rng: Rng, source: NameSource, g: 'male' | 'female'): Piece {
  if (useReal(rng, source)) {
    const e = rng.pick(g === 'male' ? CN.CN_GIVEN_REAL_MALE : CN.CN_GIVEN_REAL_FEMALE);
    return { text: e.text, reading: e.reading };
  }
  const chars = g === 'male' ? CN.CN_CHAR_MALE : CN.CN_CHAR_FEMALE;
  const picked = rng.chance(0.25) ? rng.sample(chars, 1) : rng.sample(chars, 2);
  return { text: picked.map((c) => c.text).join(''), reading: picked.map((c) => c.reading).join('') };
}

function westernFamily(rng: Rng, culture: string, source: NameSource): Piece {
  if (useReal(rng, source)) return { text: rng.pick(WESTERN[culture].family) };
  if (culture === 'fantasy') {
    return { text: rng.pick(W.FANTASY_FAMILY_HEAD) + rng.pick(W.FANTASY_FAMILY_TAIL) };
  }
  return { text: model(culture, 'family').generate(rng, 4, 11) ?? rng.pick(WESTERN[culture].family) };
}

function westernGiven(rng: Rng, culture: string, source: NameSource, g: 'male' | 'female'): Piece {
  const list = WESTERN[culture][g];
  if (useReal(rng, source)) return { text: rng.pick(list) };
  return { text: model(culture, g).generate(rng, 3, 9) ?? rng.pick(list) };
}

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function generateName(rng: Rng, opts: Omit<NameOptions, 'count' | 'seed'>): NameResult {
  const gender: 'male' | 'female' =
    opts.gender === 'any' ? (rng.chance(0.5) ? 'male' : 'female') : opts.gender;
  const { culture, source, part } = opts;
  const wantFamily = part !== 'given';
  const wantGiven = part !== 'family';

  let family: Piece | undefined;
  let given: Piece | undefined;
  if (culture === 'japan') {
    if (wantFamily) family = japanFamily(rng, source);
    if (wantGiven) given = japanGiven(rng, source, gender);
  } else if (culture === 'chinese') {
    if (wantFamily) family = chineseFamily(rng);
    if (wantGiven) given = chineseGiven(rng, source, gender);
  } else {
    if (wantFamily) family = westernFamily(rng, culture, source);
    if (wantGiven) given = westernGiven(rng, culture, source, gender);
  }

  // 日本・中華は「姓 名」、それ以外は「名 姓」
  const eastern = culture === 'japan' || culture === 'chinese';
  const ordered = (eastern ? [family, given] : [given, family]).filter((p): p is Piece => !!p);
  const text = ordered.map((p) => p.text).join(' ');
  let reading: string | undefined;
  if (culture === 'japan') reading = ordered.map((p) => p.reading).join(' ');
  if (culture === 'chinese') reading = ordered.map((p) => capital(p.reading ?? '')).join(' ');
  if (!eastern) reading = ordered.map((p) => toKatakanaName(p.text, culture as Spelling)).join('・');
  return { text, reading, gender };
}

export function generateNames(opts: NameOptions, rng = new Rng(opts.seed)): NameResult[] {
  const out: NameResult[] = [];
  const seen = new Set<string>();
  const count = Math.max(0, Math.floor(opts.count));
  let tries = 0;
  while (out.length < count) {
    const r = generateName(rng, opts);
    if (!seen.has(r.text) || tries > count * 20) {
      seen.add(r.text);
      out.push(r);
    }
    tries++;
  }
  return out;
}
