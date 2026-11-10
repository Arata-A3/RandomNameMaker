/** 小さなDOMヘルパー */
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

/** ラベル付きのチェックボックス */
export function checkbox(label: string, checked: boolean, onChange: (v: boolean) => void): HTMLLabelElement {
  const input = h('input', { type: 'checkbox' });
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  return h('label', { class: 'check' }, input, label);
}

/** ラジオボタン風の切り替えボタン群 */
export function segmented<T extends string>(
  options: { id: T; label: string }[],
  value: T,
  onChange: (v: T) => void,
): HTMLDivElement {
  const wrap = h('div', { class: 'segmented', role: 'radiogroup' });
  const render = (current: T) => {
    wrap.replaceChildren(
      ...options.map((o) =>
        h(
          'button',
          {
            type: 'button',
            role: 'radio',
            'aria-checked': String(o.id === current),
            class: o.id === current ? 'on' : '',
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

/** 数値入力 */
export function numberInput(value: number, min: number, onChange: (v: number) => void, max?: number): HTMLInputElement {
  const input = h('input', { type: 'number', min, max, value: String(value), inputmode: 'numeric' });
  input.addEventListener('change', () => {
    let v = Math.floor(Number(input.value));
    if (!Number.isFinite(v) || v < min) v = min;
    if (max !== undefined && v > max) v = max;
    input.value = String(v);
    onChange(v);
  });
  return input;
}

export function field(label: string, ...controls: (Node | string)[]): HTMLDivElement {
  return h('div', { class: 'field' }, h('div', { class: 'field-label' }, label), h('div', { class: 'field-body' }, ...controls));
}
