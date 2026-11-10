/**
 * 4コマネタモード。項目ごとに固定（lock）と引き直し（reroll）ができる。
 * お題の {A} {B} などは表示するときに今の名前で埋めるので、名前を引き直しても整合する。
 */
import { Rng } from '../core/random';
import { generateName, type Culture, type NameResult } from './name';
import * as D from '../data/yonkoma';
import type { Genre, GenreKey } from '../data/yonkoma';

export interface YonkomaCharacter {
  name: NameResult;
  personality: string;
  role: string;
  catchphrase: string;
}

export interface YonkomaIdea {
  characters: YonkomaCharacter[];
  relation: string;
  theme: string;
  place: string;
  season: string;
  prop: string;
  ki: string;
  sho: string;
  ten: string;
  ketsu: string;
  ochi: string;
}

export type SceneField = 'relation' | 'theme' | 'place' | 'season' | 'prop' | 'ki' | 'sho' | 'ten' | 'ketsu' | 'ochi';
export type CharField = 'name' | 'personality' | 'role' | 'catchphrase';
/** 'place' や 'c0.name' のような項目キー */
export type FieldKey = SceneField | `c${number}.${CharField}`;

export const SCENE_FIELDS: { key: SceneField; label: string }[] = [
  { key: 'relation', label: '関係性' },
  { key: 'theme', label: 'テーマ' },
  { key: 'place', label: '舞台' },
  { key: 'season', label: '季節・時期' },
  { key: 'prop', label: '小道具' },
  { key: 'ki', label: '起' },
  { key: 'sho', label: '承' },
  { key: 'ten', label: '転' },
  { key: 'ketsu', label: '結' },
  { key: 'ochi', label: 'オチのタイプ' },
];

/** 起承転結（4コマ表示で使う） */
export const PANELS: { key: SceneField; label: string }[] = SCENE_FIELDS.filter((f) =>
  ['ki', 'sho', 'ten', 'ketsu'].includes(f.key),
);

export const CHAR_FIELDS: { key: CharField; label: string }[] = [
  { key: 'name', label: '名前' },
  { key: 'role', label: '立場' },
  { key: 'personality', label: '性格' },
  { key: 'catchphrase', label: '口ぐせ' },
];

export interface YonkomaOptions {
  characterCount: number;
  culture: Culture;
  genre: Genre;
  seed?: string;
}

export const DEFAULT_YONKOMA_OPTIONS: YonkomaOptions = { characterCount: 2, culture: 'japan', genre: 'any' };

const COMMON_POOLS: Record<SceneField | 'role', string[]> = {
  relation: D.RELATIONS,
  theme: D.THEMES,
  place: D.PLACES,
  season: D.SEASONS,
  prop: D.PROPS,
  ki: D.KI,
  sho: D.SHO,
  ten: D.TEN,
  ketsu: D.KETSU,
  ochi: D.OCHI,
  role: D.ROLES,
};

/** ジャンルの材料を優先して選ぶ割合 */
const GENRE_RATE = 0.65;

type Ctx = Pick<YonkomaOptions, 'culture' | 'genre'>;

/** ジャンルの材料（あれば）と共通の材料から1つ選ぶ。avoid と同じ値はなるべく避ける */
function pickFor(rng: Rng, key: SceneField | 'role', genre: Genre, avoid?: string): string {
  const special = genre === 'any' ? undefined : D.GENRE_POOLS[genre][key as GenreKey];
  const pool = special && rng.chance(GENRE_RATE) ? special : COMMON_POOLS[key];
  const choices = pool.filter((s) => s !== avoid);
  return rng.pick(choices.length ? choices : pool);
}

function rollCharField(rng: Rng, field: CharField, ctx: Ctx): string | NameResult {
  switch (field) {
    case 'name':
      return generateName(rng, { culture: ctx.culture, part: 'full', gender: 'any', source: 'mixed' });
    case 'personality':
      return rng.pick(D.PERSONALITIES);
    case 'role':
      return pickFor(rng, 'role', ctx.genre);
    case 'catchphrase':
      return rng.pick(D.CATCHPHRASES);
  }
}

function rollCharacter(rng: Rng, ctx: Ctx): YonkomaCharacter {
  return {
    name: rollCharField(rng, 'name', ctx) as NameResult,
    personality: rollCharField(rng, 'personality', ctx) as string,
    role: rollCharField(rng, 'role', ctx) as string,
    catchphrase: rollCharField(rng, 'catchphrase', ctx) as string,
  };
}

/** 新しいネタを作る。prev と locked を渡すと、固定した項目は prev の値を引き継ぐ */
export function rollIdea(
  opts: YonkomaOptions,
  rng = new Rng(opts.seed),
  prev?: YonkomaIdea,
  locked: ReadonlySet<FieldKey> = new Set(),
): YonkomaIdea {
  const ctx: Ctx = { culture: opts.culture, genre: opts.genre ?? 'any' };
  const count = Math.min(4, Math.max(1, Math.floor(opts.characterCount)));
  const characters: YonkomaCharacter[] = [];
  for (let i = 0; i < count; i++) {
    const fresh = rollCharacter(rng, ctx);
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
    const v = pickFor(rng, key, ctx.genre);
    idea[key] = prev && locked.has(key) && prev[key] ? prev[key] : v;
  }
  return idea;
}

/** 1項目だけ引き直す（元の idea は変えずに新しいオブジェクトを返す） */
export function rerollField(idea: YonkomaIdea, key: FieldKey, ctx: Ctx, rng = new Rng()): YonkomaIdea {
  const next: YonkomaIdea = { ...idea, characters: idea.characters.map((c) => ({ ...c })) };
  const m = /^c(\d+)\.(\w+)$/.exec(key);
  if (m) {
    const i = Number(m[1]);
    const field = m[2] as CharField;
    const ch = next.characters[i];
    if (!ch) return next;
    // 同じ値が続かないように数回引き直す
    let v = rollCharField(rng, field, ctx);
    for (let t = 0; t < 5 && sameValue(v, ch[field]); t++) v = rollCharField(rng, field, ctx);
    (ch as unknown as Record<string, unknown>)[field] = v;
    return next;
  }
  const f = key as SceneField;
  next[f] = pickFor(rng, f, ctx.genre, idea[f]);
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
