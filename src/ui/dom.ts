/** 小さなDOMヘルパーと、木の部品（駒・ステッパーなど） */
import { icon } from './icons';

type Child = Node | string | null | undefined | false;
type Attrs = Record<string, string | number | boolean | EventListener | undefined>;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: (Child | Child[])[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = String(v);
    else if (k in el && typeof v !== 'string') (el as unknown as Record<string, unknown>)[k] = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c);
  }
  return el;
}

/** チェックボックス（檜の駒。オンのときは胡桃色にへこみ、チェックの印が付く） */
export function checkbox(label: string, checked: boolean, onChange: (v: boolean) => void): HTMLLabelElement {
  const input = h('input', { type: 'checkbox', class: 'sr-only' });
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  return h('label', { class: 'piece check' }, input, h('span', { class: 'mark' }, icon('check', 12)), label);
}

/** 1つだけ選ぶ駒の並び */
export function segmented<T extends string>(
  options: { id: T; label: string }[],
  value: T,
  onChange: (v: T) => void,
  label?: string,
): HTMLDivElement {
  const wrap = h('div', { class: 'pieces', role: 'radiogroup', 'aria-label': label });
  const render = (current: T) => {
    wrap.replaceChildren(
      ...options.map((o) =>
        h(
          'button',
          {
            type: 'button',
            role: 'radio',
            'aria-checked': String(o.id === current),
            class: `piece${o.id === current ? ' on' : ''}`,
            onclick: () => {
              render(o.id);
              onChange(o.id);
            },
          },
          o.label,
        ),
      ),
    );
  };
  render(value);
  return wrap;
}

/** 数の入力（− と ＋ のボタン付き） */
export function numberInput(
  value: number,
  min: number,
  onChange: (v: number) => void,
  max?: number,
  label = '数',
): HTMLDivElement {
  const input = h('input', { type: 'number', min, max, value: String(value), inputmode: 'numeric', 'aria-label': label });
  const set = (v: number) => {
    if (!Number.isFinite(v) || v < min) v = min;
    if (max !== undefined && v > max) v = max;
    v = Math.floor(v);
    input.value = String(v);
    onChange(v);
  };
  input.addEventListener('change', () => set(Number(input.value)));
  return h(
    'div',
    { class: 'stepper' },
    h('button', { type: 'button', class: 'piece', 'aria-label': `${label}を1つ減らす`, onclick: () => set(Number(input.value) - 1) }, '−'),
    input,
    h('button', { type: 'button', class: 'piece', 'aria-label': `${label}を1つ増やす`, onclick: () => set(Number(input.value) + 1) }, '＋'),
  );
}

export function field(label: string, ...controls: (Node | string)[]): HTMLDivElement {
  return h(
    'div',
    { class: 'field', role: 'group', 'aria-label': label },
    h('div', { class: 'field-label' }, label),
    h('div', { class: 'field-body' }, ...controls),
  );
}
