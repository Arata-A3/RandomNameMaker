/** 4コマネタモードの画面 */
import { field, h, numberInput, segmented } from './dom';
import { load, save } from './store';
import { copyText, favButton } from './results';
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

type View = 'list' | 'panels';

export function yonkomaMode(): HTMLElement {
  const o: YonkomaOptions = load('opt:yonkoma', DEFAULT_YONKOMA_OPTIONS);
  let view: View = load<View>('yonkoma:view', 'list');
  const locked = new Set<FieldKey>();
  let idea: YonkomaIdea = rollIdea(o);
  const results = h('div');

  const lockButton = (key: FieldKey, label: string) => {
    const isLocked = locked.has(key);
    return h(
      'button',
      {
        type: 'button',
        class: `icon-btn lock${isLocked ? ' on' : ''}`,
        title: isLocked ? '固定を外す' : '固定する',
        'aria-label': `${label}を${isLocked ? '固定から外す' : '固定する'}`,
        'aria-pressed': String(isLocked),
        onclick: () => {
          if (isLocked) locked.delete(key);
          else locked.add(key);
          render();
        },
      },
      isLocked ? '🔒' : '🔓',
    );
  };

  const rerollButton = (key: FieldKey, label: string) =>
    h(
      'button',
      {
        type: 'button',
        class: 'icon-btn',
        title: '引き直す',
        'aria-label': `${label}を引き直す`,
        disabled: locked.has(key),
        onclick: () => {
          idea = rerollField(idea, key, o);
          render();
        },
      },
      '↻',
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
        { class: 'idea-card' },
        h('h3', {}, `登場人物 ${String.fromCharCode(65 + i)}`),
        CHAR_FIELDS.map(({ key, label }) =>
          key === 'name' ? row(`c${i}.name`, label, c.name.text, c.name.reading) : row(`c${i}.${key}`, label, c[key]),
        ),
      ),
    );

  /** 一覧表示: 全項目を並べる */
  const listView = () =>
    h(
      'div',
      { class: 'idea' },
      characterCards(),
      h(
        'div',
        { class: 'idea-card wide' },
        h('h3', {}, '設定とお題'),
        SCENE_FIELDS.filter((f) => !(f.key === 'relation' && idea.characters.length < 2)).map(({ key, label }) =>
          row(key, label, fillTemplate(idea[key], idea)),
        ),
      ),
    );

  /** 4コマ表示: 起承転結をコマに見立てて縦に並べる */
  const panelView = () => {
    const setting = [idea.theme, idea.place, idea.season, idea.prop].join(' ／ ');
    return h(
      'div',
      { class: 'idea' },
      h(
        'div',
        { class: 'idea-card wide' },
        h('div', { class: 'panel-setting' }, h('span', { class: 'idea-label' }, '設定'), setting),
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
        h('div', { class: 'panel-setting' }, h('span', { class: 'idea-label' }, 'オチ'), idea.ochi),
      ),
      characterCards(),
    );
  };

  const render = () => {
    const text = ideaToText(idea);
    results.replaceChildren(
      h(
        'div',
        { class: 'results-head' },
        segmented<View>(
          [
            { id: 'list', label: '一覧' },
            { id: 'panels', label: '4コマ' },
          ],
          view,
          (v) => {
            view = v;
            save('yonkoma:view', v);
            render();
          },
        ),
        h(
          'div',
          { class: 'result-actions' },
          h('button', { type: 'button', class: 'ghost', onclick: () => copyText(text) }, 'まとめてコピー'),
          favButton({ text, mode: 'yonkoma' }),
        ),
      ),
      h('p', { class: 'muted hint-line' }, '🔒で固定した項目は「生成する」でも変わりません'),
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
    field('ジャンル', segmented(GENRES, o.genre ?? 'any', (v) => (o.genre = v))),
    field('登場人物の数', numberInput(o.characterCount, 1, (v) => (o.characterCount = v), 4)),
    field('名前の国風', segmented(CULTURES, o.culture, (v) => (o.culture = v))),
    seedField(o.seed, (v) => (o.seed = v)),
  ];
  render();
  return layout(form, run, results);
}
