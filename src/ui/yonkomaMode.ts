/** 4コマネタモードの画面 */
import { field, h, numberInput, segmented } from './dom';
import { load, save } from './store';
import { copyText, favButton } from './results';
import { layout, seedField } from './modes';
import { Rng } from '../core/random';
import { CULTURES } from '../generators/name';
import {
  CHAR_FIELDS,
  DEFAULT_YONKOMA_OPTIONS,
  fillTemplate,
  ideaToText,
  rerollField,
  rollIdea,
  SCENE_FIELDS,
  type FieldKey,
  type YonkomaIdea,
  type YonkomaOptions,
} from '../generators/yonkoma';

export function yonkomaMode(): HTMLElement {
  const o: YonkomaOptions = load('opt:yonkoma', DEFAULT_YONKOMA_OPTIONS);
  const locked = new Set<FieldKey>();
  let idea: YonkomaIdea = rollIdea(o);
  const results = h('div');

  const row = (key: FieldKey, label: string, value: string, sub?: string) => {
    const isLocked = locked.has(key);
    return h(
      'div',
      { class: `idea-row${isLocked ? ' locked' : ''}` },
      h('div', { class: 'idea-label' }, label),
      h('div', { class: 'idea-value' }, value, sub ? h('span', { class: 'sub' }, sub) : null),
      h(
        'div',
        { class: 'idea-actions' },
        h(
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
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'icon-btn',
            title: '引き直す',
            'aria-label': `${label}を引き直す`,
            disabled: isLocked,
            onclick: () => {
              idea = rerollField(idea, key, o.culture);
              render();
            },
          },
          '↻',
        ),
      ),
    );
  };

  const render = () => {
    const text = ideaToText(idea);
    results.replaceChildren(
      h(
        'div',
        { class: 'results-head' },
        h('span', { class: 'muted' }, '🔒で固定した項目は「生成する」でも変わりません'),
        h(
          'div',
          { class: 'result-actions' },
          h('button', { type: 'button', class: 'ghost', onclick: () => copyText(text) }, 'まとめてコピー'),
          favButton({ text, mode: 'yonkoma' }),
        ),
      ),
      h(
        'div',
        { class: 'idea' },
        idea.characters.map((c, i) =>
          h(
            'div',
            { class: 'idea-card' },
            h('h3', {}, `登場人物 ${String.fromCharCode(65 + i)}`),
            CHAR_FIELDS.map(({ key, label }) =>
              key === 'name' ? row(`c${i}.name`, label, c.name.text, c.name.reading) : row(`c${i}.${key}`, label, c[key]),
            ),
          ),
        ),
        h(
          'div',
          { class: 'idea-card wide' },
          h('h3', {}, '設定とお題'),
          SCENE_FIELDS.filter((f) => !(f.key === 'relation' && idea.characters.length < 2)).map(({ key, label }) =>
            row(key, label, fillTemplate(idea[key], idea)),
          ),
        ),
      ),
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
    field('登場人物の数', numberInput(o.characterCount, 1, (v) => (o.characterCount = v), 4)),
    field('名前の国風', segmented(CULTURES, o.culture, (v) => (o.culture = v))),
    seedField(o.seed, (v) => (o.seed = v)),
  ];
  render();
  return layout(form, run, results);
}
