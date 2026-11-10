/** 文字列・名前・単語モードの画面 */
import { checkbox, field, h, numberInput, segmented } from './dom';
import { load, save } from './store';
import { renderResults } from './results';
import { CHARSETS, type Charset } from '../core/charset';
import { DEFAULT_STRING_OPTIONS, generateStrings, type StringOptions } from '../generators/string';
import {
  CULTURES,
  DEFAULT_NAME_OPTIONS,
  generateNames,
  type NameGender,
  type NameOptions,
  type NamePart,
  type NameSource,
} from '../generators/name';
import { DEFAULT_WORD_OPTIONS, generateWords, type WordOptions } from '../generators/word';
import { WORD_CATEGORIES, WORD_PATTERNS } from '../data/words';

const MAX_COUNT = 1000;

/** 共通の枠: 左に設定、右に結果 */
export function layout(form: HTMLElement[], onGenerate: () => void, results: HTMLElement): HTMLElement {
  return h(
    'div',
    { class: 'mode' },
    h(
      'form',
      {
        class: 'panel options',
        onsubmit: (e: Event) => {
          e.preventDefault();
          onGenerate();
        },
      },
      form,
      h('button', { type: 'submit', class: 'primary' }, '生成する'),
    ),
    h('section', { class: 'panel output', 'aria-live': 'polite' }, results),
  );
}

export function seedField(value: string | undefined, onChange: (v: string) => void): HTMLDivElement {
  const input = h('input', { type: 'text', placeholder: '空欄ならランダム', value: value ?? '' });
  input.addEventListener('input', () => onChange(input.value));
  return field('シード値', input, h('div', { class: 'hint' }, '同じシードなら同じ結果になります'));
}

function toggleList<T>(list: T[], item: T, on: boolean): T[] {
  return on ? [...new Set([...list, item])] : list.filter((x) => x !== item);
}

export function stringMode(): HTMLElement {
  const o: StringOptions = load('opt:string', DEFAULT_STRING_OPTIONS);
  const results = h('div');
  const run = () => {
    save('opt:string', o);
    renderResults(
      results,
      generateStrings(o).map((text) => ({ text })),
      'string',
    );
  };
  const form = [
    field(
      '文字種',
      h(
        'div',
        { class: 'checks' },
        CHARSETS.map((c) => checkbox(c.label, o.charsets.includes(c.id), (v) => (o.charsets = toggleList<Charset>(o.charsets, c.id, v)))),
      ),
    ),
    field(
      'かなの文字',
      h(
        'div',
        { class: 'checks' },
        checkbox('濁音', o.dakuon, (v) => (o.dakuon = v)),
        checkbox('半濁音', o.handakuon, (v) => (o.handakuon = v)),
        checkbox('小文字', o.small, (v) => (o.small = v)),
      ),
    ),
    field(
      '文字数',
      h(
        'div',
        { class: 'range' },
        numberInput(o.minLength, 1, (v) => (o.minLength = v)),
        '〜',
        numberInput(o.maxLength, 1, (v) => (o.maxLength = v)),
        '文字',
      ),
    ),
    field('生成数', numberInput(o.count, 1, (v) => (o.count = v), MAX_COUNT)),
    field(
      'ルール',
      h(
        'div',
        { class: 'checks col' },
        checkbox('発音できる文字列だけ', o.pronounceable, (v) => (o.pronounceable = v)),
        checkbox('使われやすい文字を出やすくする', o.weighted, (v) => (o.weighted = v)),
      ),
      h('div', { class: 'hint' }, '発音モードでは、1つの文字列に使う文字種は1種類です'),
    ),
    seedField(o.seed, (v) => (o.seed = v)),
  ];
  run();
  return layout(form, run, results);
}

export function nameMode(): HTMLElement {
  const o: NameOptions = load('opt:name', DEFAULT_NAME_OPTIONS);
  const results = h('div');
  const run = () => {
    save('opt:name', o);
    renderResults(
      results,
      generateNames(o).map((r) => ({ text: r.text, sub: r.reading })),
      'name',
    );
  };
  const form = [
    field('国風', segmented(CULTURES, o.culture, (v) => (o.culture = v))),
    field(
      '部分',
      segmented<NamePart>(
        [
          { id: 'full', label: '苗字＋名前' },
          { id: 'family', label: '苗字' },
          { id: 'given', label: '名前' },
        ],
        o.part,
        (v) => (o.part = v),
      ),
    ),
    field(
      '性別',
      segmented<NameGender>(
        [
          { id: 'any', label: 'どちらも' },
          { id: 'male', label: '男性' },
          { id: 'female', label: '女性' },
        ],
        o.gender,
        (v) => (o.gender = v),
      ),
    ),
    field(
      '作り方',
      segmented<NameSource>(
        [
          { id: 'mixed', label: '混ぜる' },
          { id: 'real', label: '実在の名前から' },
          { id: 'generated', label: 'それっぽく作る' },
        ],
        o.source,
        (v) => (o.source = v),
      ),
      h('div', { class: 'hint' }, '中華風の姓はいつも実在の姓から選びます'),
    ),
    field('生成数', numberInput(o.count, 1, (v) => (o.count = v), MAX_COUNT)),
    seedField(o.seed, (v) => (o.seed = v)),
  ];
  run();
  return layout(form, run, results);
}

export function wordMode(): HTMLElement {
  const o: WordOptions = load('opt:word', DEFAULT_WORD_OPTIONS);
  const results = h('div');
  const run = () => {
    save('opt:word', o);
    renderResults(
      results,
      generateWords(o).map((text) => ({ text })),
      'word',
    );
  };
  const form = [
    field(
      'カテゴリ',
      h(
        'div',
        { class: 'checks' },
        WORD_CATEGORIES.map((c) => checkbox(c.label, o.categories.includes(c.id), (v) => (o.categories = toggleList(o.categories, c.id, v)))),
      ),
    ),
    field(
      '組み合わせ方',
      h(
        'div',
        { class: 'checks col' },
        WORD_PATTERNS.map((p) =>
          checkbox(`${p.label}（例: ${p.example}）`, o.patterns.includes(p.id), (v) => (o.patterns = toggleList(o.patterns, p.id, v))),
        ),
      ),
    ),
    field('生成数', numberInput(o.count, 1, (v) => (o.count = v), MAX_COUNT)),
    seedField(o.seed, (v) => (o.seed = v)),
  ];
  run();
  return layout(form, run, results);
}
