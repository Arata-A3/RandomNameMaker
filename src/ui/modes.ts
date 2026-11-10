/** 文字列・名前・単語モードの画面 */
import { checkbox, field, h, numberInput, segmented } from './dom';
import { icon } from './icons';
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

interface LayoutOptions {
  /** 主ボタンの文字 */
  submitLabel: string;
  /** 「くわしい設定」にしまう項目 */
  advanced?: HTMLElement[];
  /** 条件を閉じているときに見せる、いまの条件の要約 */
  summary: () => string;
}

let formSeq = 0;
const isPhone = () => window.matchMedia('(max-width: 720px)').matches;

/** 選んだもののラベルを「・」でつなぐ（多いときは数だけ） */
export function labelsOf<T extends string>(all: { id: T; label: string }[], picked: T[], max = 3): string {
  const labels = all.filter((x) => picked.includes(x.id)).map((x) => x.label);
  if (labels.length === 0) return 'なし';
  if (labels.length === all.length) return 'すべて';
  return labels.length > max ? `${labels.length}種類` : labels.join('・');
}

export function labelOf<T extends string>(all: { id: T; label: string }[], id: T): string {
  return all.find((x) => x.id === id)?.label ?? '';
}

/**
 * 共通の枠: 左に和紙の条件、右に結果。
 * スマホでは条件を畳める（畳むと要約の1行だけ）。主ボタンは画面下（タブの上）に固定して、
 * 押したら条件を畳んで結果まで送る。
 */
export function layout(form: HTMLElement[], onGenerate: () => void, results: HTMLElement, o: LayoutOptions): HTMLElement {
  const formId = `options-${++formSeq}`;
  const bodyId = `${formId}-body`;
  const output = h('section', { class: 'output', 'aria-live': 'polite' }, results);
  const summary = h('span', { class: 'options-summary' });
  const toggleLabel = h('span', {});
  const toggle = h(
    'button',
    { type: 'button', class: 'options-toggle', 'aria-controls': bodyId, onclick: () => setOpen(!formEl.classList.contains('open')) },
    h('span', { class: 'options-title' }, '条件'),
    summary,
    h('span', { class: 'options-toggle-label' }, toggleLabel, icon('chevron', 16)),
  );
  const formEl = h(
    'form',
    {
      id: formId,
      class: 'options washi',
      onsubmit: (e: Event) => {
        e.preventDefault();
        onGenerate();
        if (isPhone()) {
          setOpen(false);
          output.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
    },
    h('h2', { class: 'options-head' }, toggle),
    h(
      'div',
      { class: 'options-body', id: bodyId },
      form,
      o.advanced?.length
        ? h('details', { class: 'advanced' }, h('summary', {}, icon('chevron', 16), 'くわしい設定'), h('div', { class: 'advanced-body' }, o.advanced))
        : null,
      h(
        'button',
        { type: 'submit', class: 'primary wood-walnut in-form' },
        icon('dice', 22),
        o.submitLabel,
        h('kbd', {}, 'Enter'),
      ),
    ),
  );
  function setOpen(open: boolean) {
    formEl.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.textContent = open ? '閉じる' : '変える';
    summary.textContent = o.summary();
    save('optionsOpen', open);
  }
  setOpen(load('optionsOpen', false));
  return h(
    'div',
    { class: 'mode' },
    formEl,
    output,
    // スマホ用: 親指の届く位置に固定した主ボタン
    h('div', { class: 'cta-bar' }, h('button', { type: 'submit', form: formId, class: 'primary wood-walnut' }, icon('dice', 22), o.submitLabel)),
  );
}

export function seedField(value: string | undefined, onChange: (v: string) => void): HTMLDivElement {
  const input = h('input', { type: 'text', class: 'text-input', placeholder: '空欄ならランダム', value: value ?? '', 'aria-label': 'シード値' });
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
      '作った文字列',
    );
  };
  const form = [
    field(
      '文字種',
      h(
        'div',
        { class: 'pieces grid3' },
        CHARSETS.map((c) => checkbox(c.label, o.charsets.includes(c.id), (v) => (o.charsets = toggleList<Charset>(o.charsets, c.id, v)))),
      ),
    ),
    field(
      'かなの文字',
      h(
        'div',
        { class: 'pieces grid3' },
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
        h('div', { class: 'range-row' }, numberInput(o.minLength, 1, (v) => (o.minLength = v), undefined, '最小の文字数'), '文字から'),
        h('div', { class: 'range-row' }, numberInput(o.maxLength, 1, (v) => (o.maxLength = v), undefined, '最大の文字数'), '文字まで'),
      ),
    ),
    field('いくつ作るか', numberInput(o.count, 1, (v) => (o.count = v), MAX_COUNT, '作る数')),
    field(
      'ルール',
      h(
        'div',
        { class: 'pieces col' },
        checkbox('発音できる文字列だけ', o.pronounceable, (v) => (o.pronounceable = v)),
        checkbox('使われやすい文字を出やすく', o.weighted, (v) => (o.weighted = v)),
      ),
      h('div', { class: 'hint' }, '発音できる文字列では、1つの文字列に使う文字種は1種類です'),
    ),
  ];
  run();
  return layout(form, run, results, {
    submitLabel: '文字列を作る',
    advanced: [seedField(o.seed, (v) => (o.seed = v))],
    summary: () =>
      `${labelsOf(CHARSETS, o.charsets)}・${o.minLength === o.maxLength ? o.minLength : `${o.minLength}〜${o.maxLength}`}文字・${o.count}個`,
  });
}

const GENDERS: { id: NameGender; label: string }[] = [
  { id: 'any', label: 'どちらも' },
  { id: 'male', label: '男性' },
  { id: 'female', label: '女性' },
];

export function nameMode(): HTMLElement {
  const o: NameOptions = load('opt:name', DEFAULT_NAME_OPTIONS);
  const results = h('div');
  const run = () => {
    save('opt:name', o);
    renderResults(
      results,
      generateNames(o).map((r) => ({ text: r.text, sub: r.reading })),
      'name',
      '作った名札',
    );
  };
  const form = [
    field('国風', segmented(CULTURES, o.culture, (v) => (o.culture = v), '国風')),
    field(
      '性別',
      segmented<NameGender>(
        GENDERS,
        o.gender,
        (v) => (o.gender = v),
        '性別',
      ),
    ),
    field('いくつ作るか', numberInput(o.count, 1, (v) => (o.count = v), MAX_COUNT, '作る数')),
  ];
  const advanced = [
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
        '部分',
      ),
    ),
    field(
      '作り方',
      segmented<NameSource>(
        [
          { id: 'mixed', label: '混ぜる' },
          { id: 'real', label: '実在の名前' },
          { id: 'generated', label: 'それっぽく' },
        ],
        o.source,
        (v) => (o.source = v),
        '作り方',
      ),
      h('div', { class: 'hint' }, '中華風の姓はいつも実在の姓から選びます'),
    ),
    seedField(o.seed, (v) => (o.seed = v)),
  ];
  run();
  return layout(form, run, results, {
    submitLabel: '名札を作る',
    advanced,
    summary: () => `${labelOf(CULTURES, o.culture)}・${labelOf(GENDERS, o.gender)}・${o.count}個`,
  });
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
      '作った言葉',
    );
  };
  const form = [
    field(
      'カテゴリ',
      h(
        'div',
        { class: 'pieces grid3' },
        WORD_CATEGORIES.map((c) => checkbox(c.label, o.categories.includes(c.id), (v) => (o.categories = toggleList(o.categories, c.id, v)))),
      ),
    ),
    field(
      '組み合わせ方',
      h(
        'div',
        { class: 'pieces col' },
        WORD_PATTERNS.map((p) =>
          checkbox(`${p.label}（例: ${p.example}）`, o.patterns.includes(p.id), (v) => (o.patterns = toggleList(o.patterns, p.id, v))),
        ),
      ),
    ),
    field('いくつ作るか', numberInput(o.count, 1, (v) => (o.count = v), MAX_COUNT, '作る数')),
  ];
  run();
  return layout(form, run, results, {
    submitLabel: '言葉を作る',
    advanced: [seedField(o.seed, (v) => (o.seed = v))],
    summary: () => `${labelsOf(WORD_CATEGORIES, o.categories)}・${o.count}個`,
  });
}
