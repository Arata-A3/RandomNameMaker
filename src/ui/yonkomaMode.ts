/** 4コマネタモードの画面 */
import { field, h, numberInput, segmented } from './dom';
import { icon } from './icons';
import { load, save } from './store';
import { copyButton, favButton, resultsBar } from './results';
import { layout, seedField } from './modes';
import { Rng } from '../core/random';
import { CULTURES } from '../generators/name';
import { GENRES } from '../data/yonkoma';
import {
  CHAR_FIELDS,
  DEFAULT_YONKOMA_OPTIONS,
  fillTemplate,
  ideaToText,
  PANELS,
  rerollField,
  rollIdea,
  SCENE_FIELDS,
  type FieldKey,
  type YonkomaIdea,
  type YonkomaOptions,
} from '../generators/yonkoma';

type View = 'panels' | 'list';

export function yonkomaMode(): HTMLElement {
  const o: YonkomaOptions = load('opt:yonkoma', DEFAULT_YONKOMA_OPTIONS);
  let view: View = load<View>('yonkoma:view', 'panels');
  const locked = new Set<FieldKey>();
  let idea: YonkomaIdea = rollIdea(o);
  const results = h('div');

  /** 固定ボタン（押すと胡桃色にへこみ「固定中」になる） */
  const lockButton = (key: FieldKey, label: string) => {
    const on = locked.has(key);
    return h(
      'button',
      {
        type: 'button',
        class: `piece lock${on ? ' on' : ''}`,
        'aria-pressed': String(on),
        'aria-label': `${label}を${on ? '固定から外す' : '固定する'}`,
        onclick: () => {
          if (on) locked.delete(key);
          else locked.add(key);
          render();
        },
      },
      icon(on ? 'lock' : 'unlock', 15),
      on ? '固定中' : '固定',
    );
  };

  const rerollButton = (key: FieldKey, label: string) =>
    h(
      'button',
      {
        type: 'button',
        class: 'piece',
        'aria-label': `${label}を引き直す`,
        disabled: locked.has(key),
        onclick: () => {
          idea = rerollField(idea, key, o);
          render();
        },
      },
      icon('reroll', 15),
      '引き直す',
    );

  const row = (key: FieldKey, label: string, value: string, sub?: string) =>
    h(
      'div',
      { class: `idea-row${locked.has(key) ? ' locked' : ''}` },
      h('div', { class: 'idea-label' }, label),
      h('div', { class: 'idea-value' }, value, sub ? h('span', { class: 'sub' }, sub) : null),
      h('div', { class: 'idea-actions' }, lockButton(key, label), rerollButton(key, label)),
    );

  const characterCards = () =>
    idea.characters.map((c, i) =>
      h(
        'div',
        { class: 'idea-card washi' },
        h('h3', {}, `登場人物 ${String.fromCharCode(65 + i)}`),
        CHAR_FIELDS.map(({ key, label }) =>
          key === 'name' ? row(`c${i}.name`, label, c.name.text, c.name.reading) : row(`c${i}.${key}`, label, c[key]),
        ),
      ),
    );

  /** 一覧: 全項目を並べる */
  const listView = () =>
    h(
      'div',
      { class: 'idea' },
      h(
        'div',
        { class: 'idea-card washi wide' },
        h('h3', {}, '設定とお題'),
        SCENE_FIELDS.filter((f) => !(f.key === 'relation' && idea.characters.length < 2)).map(({ key, label }) =>
          row(key, label, fillTemplate(idea[key], idea)),
        ),
      ),
      characterCards(),
    );

  /** 4コマ: 起承転結を和紙に貼ったコマとして並べる */
  const panelView = () => {
    const setting = SCENE_FIELDS.filter((f) => ['theme', 'place', 'season', 'prop'].includes(f.key));
    return h(
      'div',
      { class: 'idea' },
      h(
        'div',
        { class: 'idea-card washi wide' },
        h(
          'dl',
          { class: 'setting' },
          setting.map(({ key, label }) => h('div', {}, h('dt', {}, label), h('dd', {}, idea[key]))),
        ),
        h(
          'ol',
          { class: 'strip' },
          PANELS.map(({ key, label }, i) =>
            h(
              'li',
              { class: `koma${locked.has(key) ? ' locked' : ''}` },
              h('div', { class: 'koma-num' }, `${i + 1}`, h('span', {}, label)),
              h('div', { class: 'koma-text' }, fillTemplate(idea[key], idea)),
              h('div', { class: 'idea-actions' }, lockButton(key, label), rerollButton(key, label)),
            ),
          ),
        ),
        row('ochi', 'オチのタイプ', idea.ochi),
      ),
      characterCards(),
    );
  };

  const render = () => {
    const text = ideaToText(idea);
    results.replaceChildren(
      resultsBar(
        '4コマのネタ',
        '',
        segmented<View>(
          [
            { id: 'panels', label: '4コマ' },
            { id: 'list', label: '一覧' },
          ],
          view,
          (v) => {
            view = v;
            save('yonkoma:view', v);
            render();
          },
          '表示',
        ),
        copyButton(() => text, 'まとめてコピー', 'piece small'),
        favButton({ text, mode: 'yonkoma' }, 'piece small'),
      ),
      h('p', { class: 'hint-line' }, '「固定」した項目は、もう一度作っても変わりません'),
      view === 'panels' ? panelView() : listView(),
    );
  };

  const run = () => {
    save('opt:yonkoma', o);
    // 人数を減らしたら、いなくなった人の固定は外す
    for (const k of [...locked]) {
      const m = /^c(\d+)\./.exec(k);
      if (m && Number(m[1]) >= o.characterCount) locked.delete(k);
    }
    idea = rollIdea(o, new Rng(o.seed), idea, locked);
    render();
  };

  const form = [
    field('ジャンル', segmented(GENRES, o.genre ?? 'any', (v) => (o.genre = v), 'ジャンル')),
    field('登場人物の数', numberInput(o.characterCount, 1, (v) => (o.characterCount = v), 4, '登場人物の数')),
    field('名前の国風', segmented(CULTURES, o.culture, (v) => (o.culture = v), '名前の国風')),
  ];
  render();
  return layout(form, run, results, { submitLabel: 'ネタを引く', advanced: [seedField(o.seed, (v) => (o.seed = v))] });
}
