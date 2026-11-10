/**
 * 欧米・ファンタジーの名前をカタカナにする（おおまかな変換）。
 * 1. 国ごとの綴りのルールで「ローマ字っぽい文字列」に直す
 * 2. ローマ字をカタカナにする
 * 英語の実在の名前は綴りと発音がずれるので、辞書（data/names/katakana.ts）を先に引く。
 */
import { FANTASY_PART_KANA, KATAKANA_OVERRIDES } from '../data/names/katakana';

export type Spelling = 'english' | 'german' | 'french' | 'nordic' | 'fantasy';

type Rule = [RegExp, string];

// 一時的な記号: C=ch(チ) S=sh(シ) J=j(ジ) N=ン R=ー(長音) Q=ッ
const RULES: Record<Spelling, Rule[]> = {
  english: [
    [/rh/g, 'r'],
    [/er(?=s?$)/, 'aR'],
    [/tch/g, 'C'],
    [/ch/g, 'C'],
    [/sh/g, 'S'],
    [/ph/g, 'f'],
    [/th/g, 's'],
    [/ck/g, 'kk'],
    [/qu/g, 'K'],
    [/x/g, 'ks'],
    [/wh/g, 'w'],
    [/^wr/, 'r'],
    [/gh/g, ''],
    [/c([eiy])/g, 's$1'],
    [/c/g, 'k'],
    [/g([ei])/g, 'J$1'],
    [/j/g, 'J'],
    [/(ee|ea)/g, 'ii'],
    [/oo/g, 'uu'],
    [/(ey|ie|y)$/, 'ii'],
    [/([^aeiou])e$/, '$1'],
    [/es$/, 's'],
    [/y([^aeiou]|$)/g, 'i$1'],
    [/([aeiou])r([^aeiou]|$)/g, '$1R$2'],
  ],
  german: [
    [/ä/g, 'e'],
    [/ö/g, 'e'],
    [/ü/g, 'yu'],
    [/ß/g, 's'],
    [/er$/, 'aR'],
    [/ig$/, 'iX'],
    [/dt$/, 't'],
    [/chs/g, 'ks'],
    [/tsch/g, 'C'],
    [/sch/g, 'S'],
    [/^sp/, 'Sp'],
    [/^st/, 'St'],
    [/ch/g, 'X'],
    [/c/g, 'k'],
    [/ck/g, 'kk'],
    [/ph/g, 'f'],
    [/th/g, 't'],
    [/qu/g, 'V'],
    [/x/g, 'ks'],
    [/ei/g, 'ai'],
    [/ie/g, 'ii'],
    [/(eu|äu)/g, 'oi'],
    [/tz/g, 'Qts'],
    [/z/g, 'ts'],
    [/v/g, 'f'],
    [/w/g, 'v'],
    [/j/g, 'y'],
    [/(^|[^tkS])s([aeiou])/g, '$1z$2'],
    [/([aeiou])h(?![aeiou])/g, '$1$1'],
    [/([aeiou])h/g, '$1'],
    [/y([^aeiou]|$)/g, 'yu$1'],
  ],
  french: [
    [/nn/g, 'n'],
    [/ou(?=[sxt]?$)/, 'UU'],
    [/ille$/, 'iyu'],
    [/ier$/, 'ié'],
    [/er$/, 'é'],
    [/ine$/, 'inU'],
    [/[eè]ne$/, 'enU'],
    [/ce$/, 'sU'],
    [/([aeiou])se$/, '$1zU'],
    [/(es|e|s|t|d|x|z|c)$/, ''],
    [/[éèêë]/g, 'e'],
    [/[àâ]/g, 'a'],
    [/[îï]/g, 'i'],
    [/ô/g, 'o'],
    [/[ûù]/g, 'u'],
    [/ç/g, 's'],
    [/œ/g, 'e'],
    [/eau/g, 'o'],
    [/au/g, 'o'],
    [/ou/g, 'U'],
    [/gu([eiy])/g, 'g$1'],
    [/eu/g, 'e'],
    [/oi/g, 'wa'],
    [/(ai|ei)/g, 'e'],
    [/ch/g, 'S'],
    [/qu/g, 'k'],
    [/gn/g, 'ny'],
    [/ph/g, 'f'],
    [/th/g, 't'],
    [/h/g, ''],
    [/g([eiy])/g, 'J$1'],
    [/j/g, 'J'],
    [/c([eiy])/g, 's$1'],
    [/c/g, 'k'],
    [/x/g, 'ks'],
    [/(on|om)(?=[^aeiouyU]|$)/g, 'oN'],
    [/(an|en|am|em|in|ain|un)(?=[^aeiouyU]|$)/g, 'aN'],
    [/y/g, 'i'],
    // フランス語の u は「ユ」
    [/u/g, 'yu'],
    [/U/g, 'u'],
  ],
  nordic: [
    [/c/g, 'k'],
    [/å/g, 'o'],
    [/[äæ]/g, 'e'],
    [/[öø]/g, 'e'],
    [/ck/g, 'kk'],
    [/ph/g, 'f'],
    [/th/g, 't'],
    [/dt$/, 't'],
    [/([aeiou])h(?![aeiou])/g, '$1$1'],
    [/qv/g, 'V'],
    [/x/g, 'ks'],
    [/z/g, 'ts'],
    [/w/g, 'v'],
    [/j/g, 'y'],
    [/^hj/, 'y'],
    [/y([^aeiou]|$)/g, 'yu$1'],
  ],
  fantasy: [
    [/rh/g, 'r'],
    [/^wr/, 'r'],
    [/^x/, 'z'],
    [/aye$/, 'ei'],
    [/er(?=s?$)/, 'aR'],
    [/([aeiou])r(?![aeiour])/g, '$1R'],
    [/([^aeiouy])e$/, '$1'],
    [/ch/g, 'C'],
    [/sh/g, 'S'],
    [/ph/g, 'f'],
    [/th/g, 's'],
    [/ck/g, 'kk'],
    [/qu/g, 'K'],
    [/x/g, 'ks'],
    [/c([eiy])/g, 's$1'],
    [/c/g, 'k'],
    [/j/g, 'J'],
    [/ae/g, 'e'],
    [/ee/g, 'ii'],
    [/y([^aeiou]|$)/g, 'i$1'],
  ],
};

const VOWELS = 'aiueo';
const V = (c: string | undefined) => c !== undefined && VOWELS.includes(c);

/** 子音＋母音 → カナ。'' は母音だけ */
const ROWS: Record<string, string> = {
  '': 'アイウエオ',
  k: 'カキクケコ',
  g: 'ガギグゲゴ',
  s: 'サシスセソ',
  z: 'ザジズゼゾ',
  t: 'タティトゥテト',
  d: 'ダディドゥデド',
  n: 'ナニヌネノ',
  h: 'ハヒフヘホ',
  b: 'バビブベボ',
  p: 'パピプペポ',
  m: 'マミムメモ',
  y: 'ヤイユイェヨ',
  r: 'ラリルレロ',
  l: 'ラリルレロ',
  w: 'ワウィウウェウォ',
  f: 'ファフィフフェフォ',
  v: 'ヴァヴィヴヴェヴォ',
  C: 'チャチチュチェチョ',
  S: 'シャシシュシェショ',
  J: 'ジャジジュジェジョ',
  ts: 'ツァツィツツェツォ',
  K: 'クァクィククェクォ',
  V: 'クヴァクヴィクヴクヴェクヴォ',
  X: 'ハヒフヘホ',
};

/** ROWS の文字列を5つの音に分ける（小さいカナはまとめる） */
function splitRow(row: string): string[] {
  const out: string[] = [];
  for (const ch of row) {
    if ('ァィゥェォャュョ'.includes(ch) && out.length) out[out.length - 1] += ch;
    else if (ch === 'ヴ' && out.length && out[out.length - 1].endsWith('ク')) out[out.length - 1] += ch;
    else out.push(ch);
  }
  return out;
}
const TABLE: Record<string, string[]> = Object.fromEntries(Object.entries(ROWS).map(([k, v]) => [k, splitRow(v)]));

/** 母音が続かない子音だけのとき */
const LONE: Record<string, string> = {
  k: 'ク', g: 'グ', s: 'ス', z: 'ズ', t: 'ト', d: 'ド', n: 'ン', N: 'ン', h: '', b: 'ブ', p: 'プ', m: 'ム',
  y: 'イ', r: 'ル', l: 'ル', w: 'ウ', f: 'フ', v: 'ヴ', C: 'チ', S: 'シュ', J: 'ジ', ts: 'ツ', K: 'ク', V: 'クヴ', X: 'ヒ',
};

const ONSETS = Object.keys(ROWS)
  .filter((k) => k !== '')
  .sort((a, b) => b.length - a.length);

/** ローマ字っぽい文字列 → カタカナ */
export function romajiToKatakana(src: string): string {
  // k t p f の重なりは ッ（Matti → マッティ）、ほかの子音の重なりはまとめる（Anna → アナ）
  const s = src
    .replace(/([ktpf])\1+/g, 'Q$1')
    .replace(/tz/g, 'Qts')
    .replace(/([^aeiouQ])\1+/g, '$1');
  let out = '';
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === 'R' || c === 'Q') {
      out += c === 'R' ? 'ー' : out ? 'ッ' : '';
      i++;
      continue;
    }
    if (V(c)) {
      // 同じ母音が続けば長音
      out += TABLE[''][VOWELS.indexOf(c)];
      i++;
      if (s[i] === c) {
        out += 'ー';
        i++;
      }
      continue;
    }
    const onset = ONSETS.find((o) => s.startsWith(o, i)) ?? c;
    const next = s[i + onset.length];
    const after = s[i + onset.length + 1];
    // 子音＋y＋母音 は拗音（Krüger → クリューガー、Nyström → ニュストレム）
    if (next === 'y' && onset !== 'y' && after && 'auo'.includes(after) && TABLE[onset]) {
      const small = 'ャュョ'['auo'.indexOf(after)];
      const iCol = TABLE[onset][1];
      // ティ → テュ のように、小さいィを入れ替える
      out += iCol.endsWith('ィ') ? iCol.slice(0, -1) + small : iCol + small;
      i += onset.length + 2;
      continue;
    }
    if (V(next) && TABLE[onset]) {
      out += TABLE[onset][VOWELS.indexOf(next!)];
      i += onset.length + 1;
      if (s[i] === next) {
        out += 'ー';
        i++;
      }
    } else {
      // m の後ろが b/p なら ン
      if (onset === 'm' && (next === 'b' || next === 'p')) out += 'ン';
      else out += LONE[onset] ?? '';
      i += onset.length;
    }
  }
  return out;
}

export function toKatakanaName(name: string, spelling: Spelling): string {
  const override = KATAKANA_OVERRIDES[`${spelling}:${name}`] ?? KATAKANA_OVERRIDES[name];
  if (override) return override;
  if (spelling === 'fantasy') {
    const compound = splitCompound(name);
    if (compound) return compound;
  }
  let s = name.toLowerCase();
  for (const [re, rep] of RULES[spelling]) s = s.replace(re, rep);
  // ルールで扱わなかったアクセント付き文字を素の文字に
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return romajiToKatakana(s);
}

/** Stormvale → ストーム＋ヴェイル のように、英単語2つの組み合わせなら単語ごとに読む */
function splitCompound(name: string): string | undefined {
  const lower = name.toLowerCase();
  for (let cut = 2; cut < lower.length - 1; cut++) {
    const head = FANTASY_PART_KANA[lower.slice(0, cut)];
    const tail = FANTASY_PART_KANA[lower.slice(cut)];
    if (head && tail) return head + tail;
  }
  return undefined;
}
