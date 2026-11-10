/**
 * 4コマネタモード。項目ごとに固定（lock）と引き直し（reroll）ができる。
 * お題の {A} {B} などは表示するときに今の名前で埋めるので、名前を引き直しても整合する。
 */
import { Rng } from '../core/random';
import { generateName, type Culture, type NameResult } from './name';
import * as D from '../data/yonkoma';

export interface YonkomaCharacter {
  name: NameResult;
  personality: string;
  role: string;
  catchphrase: string;
}

export interface YonkomaIdea {
  characters: YonkomaCharacter[];
  relation: string;
  place: string;
  season: string;
  prop: string;
  ki: string;
  sho: string;
  ten: string;
  ketsu: string;
  ochi: string;
}

export type SceneField = 'relation' | 'place' | 'season' | 'prop' | 'ki' | 'sho' | 'ten' | 'ketsu' | 'ochi';
export type CharField = 'name' | 'personality' | 'role' | 'catchphrase';
/** 'place' や 'c0.name' のような項目キー */
export type FieldKey = SceneField | `c${number}.${CharField}`;

export const SCENE_FIELDS: { key: SceneField; label: string }[] = [
  { key: 'relation', label: '関係性' },
  { key: 'place', label: '舞台' },
  { key: 'season', label: '季節・時期' },
  { key: 'prop', label: '小道具' },
  { key: 'ki', label: '起' },
  { key: 'sho', label: '承' },
  { key: 'ten', label: '転' },
  { key: 'ketsu', label: '結' },
  { key: 'ochi', label: 'オチのタイプ' },
];

export const CHAR_FIELDS: { key: CharField; label: string }[] = [
  { key: 'name', label: '名前' },
  { key: 'role', label: '立場' },
  { key: 'personality', label: '性格' },
  { key: 'catchphrase', label: '口ぐせ' },
];

export interface YonkomaOptions {
  characterCount: number;
  culture: Culture;
  seed?: string;
}

export const DEFAULT_YONKOMA_OPTIONS: YonkomaOptions = { characterCount: 2, culture: 'japan' };

const SCENE_POOLS: Record<SceneField, string[]> = {
  relation: D.RELATIONS,
  place: D.PLACES,
  season: D.SEASONS,
  prop: D.PROPS,
  ki: D.KI,
  sho: D.SHO,
  ten: D.TEN,
  ketsu: D.KETSU,
  ochi: D.OCHI,
};

function rollCharField(rng: Rng, field: CharField, culture: Culture): string | NameResult {
  switch (field) {
    case 'name':
      return generateName(rng, { culture, part: 'full', gender: 'any', source: 'mixed' });
    case 'personality':
      return rng.pick(D.PERSONALITIES);
    case 'role':
      return rng.pick(D.ROLES);
    case 'catchphrase':
      return rng.pick(D.CATCHPHRASES);
  }
}

function rollCharacter(rng: Rng, culture: Culture): YonkomaCharacter {
  return {
    name: rollCharField(rng, 'name', culture) as NameResult,
    personality: rollCharField(rng, 'personality', culture) as string,
    role: rollCharField(rng, 'role', culture) as string,
    catchphrase: rollCharField(rng, 'catchphrase', culture) as string,
  };
}

/** 新しいネタを作る。prev と locked を渡すと、固定した項目は prev の値を引き継ぐ */
export function rollIdea(
  opts: YonkomaOptions,
  rng = new Rng(opts.seed),
  prev?: YonkomaIdea,
  locked: ReadonlySet<FieldKey> = new Set(),
): YonkomaIdea {
  const count = Math.min(4, Math.max(1, Math.floor(opts.characterCount)));
  const characters: YonkomaCharacter[] = [];
  for (let i = 0; i < count; i++) {
    const fresh = rollCharacter(rng, opts.culture);
    const old = prev?.characters[i];
    if (old) {
      for (const { key } of CHAR_FIELDS) {
        if (locked.has(`c${i}.${key}`)) (fresh as unknown as Record<string, unknown>)[key] = old[key];
      }
    }
    characters.push(fresh);
  }
  const idea = { characters } as YonkomaIdea;
  for (const { key } of SCENE_FIELDS) {
    const v = rng.pick(SCENE_POOLS[key]);
    idea[key] = prev && locked.has(key) ? prev[key] : v;
  }
  return idea;
}

/** 1項目だけ引き直す（元の idea は変えずに新しいオブジェクトを返す） */
export function rerollField(idea: YonkomaIdea, key: FieldKey, culture: Culture, rng = new Rng()): YonkomaIdea {
  const next: YonkomaIdea = { ...idea, characters: idea.characters.map((c) => ({ ...c })) };
  const m = /^c(\d+)\.(\w+)$/.exec(key);
  if (m) {
    const i = Number(m[1]);
    const field = m[2] as CharField;
    const ch = next.characters[i];
    if (!ch) return next;
    // 同じ値が続かないように数回引き直す
    let v = rollCharField(rng, field, culture);
    for (let t = 0; t < 5 && sameValue(v, ch[field]); t++) v = rollCharField(rng, field, culture);
    (ch as unknown as Record<string, unknown>)[field] = v;
    return next;
  }
  const f = key as SceneField;
  const pool = SCENE_POOLS[f].filter((s) => s !== idea[f]);
  next[f] = rng.pick(pool.length ? pool : SCENE_POOLS[f]);
  return next;
}

function sameValue(a: string | NameResult, b: string | NameResult): boolean {
  return typeof a === 'string' ? a === b : a.text === (b as NameResult).text;
}

/** 呼び名（日本・中華は下の名前、欧米は名） */
export function shortName(n: NameResult): string {
  const parts = n.text.split(' ');
  const eastern = /[぀-ヿ一-鿿]/.test(n.text);
  return eastern ? parts[parts.length - 1] : parts[0];
}

/** お題の {A} {B} {prop} {place} を埋める */
export function fillTemplate(template: string, idea: YonkomaIdea): string {
  const names = idea.characters.map((c) => shortName(c.name));
  const letter = (i: number) => names[i] ?? (i === 1 ? '通りすがりの人' : '誰か');
  return template
    .replace(/\{A\}/g, letter(0))
    .replace(/\{B\}/g, letter(1))
    .replace(/\{C\}/g, letter(2))
    .replace(/\{D\}/g, letter(3))
    .replace(/\{prop\}/g, idea.prop)
    .replace(/\{place\}/g, idea.place);
}

/** コピー用にテキストへまとめる */
export function ideaToText(idea: YonkomaIdea): string {
  const out: string[] = ['【登場人物】'];
  idea.characters.forEach((c) => {
    const reading = c.name.reading ? `（${c.name.reading}）` : '';
    out.push(`・${c.name.text}${reading}／${c.role}／${c.personality}／口ぐせ${c.catchphrase}`);
  });
  for (const { key, label } of SCENE_FIELDS) {
    if (key === 'relation' && idea.characters.length < 2) continue;
    out.push(`【${label}】${fillTemplate(idea[key], idea)}`);
  }
  return out.join('\n');
}
