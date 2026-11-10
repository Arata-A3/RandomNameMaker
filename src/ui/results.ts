/** 結果（木の名札）・コピー・保存ボタン */
import { h } from './dom';
import { icon } from './icons';
import { favorites, type Mode } from './store';
import { drawPlates, shareButtons } from './share';

let toastTimer: number | undefined;

export function toast(msg: string): void {
  let el = document.getElementById('toast');
  if (!el) {
    el = h('div', { id: 'toast', role: 'status', 'aria-live': 'polite' });
    document.body.append(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el!.classList.remove('show'), 1400);
}

export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // clipboard API が使えないとき
    const ta = h('textarea', {});
    ta.value = text;
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  toast('コピーしました');
}

export function copyButton(getText: () => string, label = 'コピー', cls = 'tool'): HTMLButtonElement {
  return h('button', { type: 'button', class: cls, onclick: () => copyText(getText()) }, icon('copy', 14), label);
}

export function favButton(item: { text: string; sub?: string; mode: Mode }, cls = 'tool'): HTMLButtonElement {
  const btn = h('button', { type: 'button', class: `${cls} fav` });
  const render = () => {
    const on = favorites.has(item.text);
    btn.replaceChildren(icon('star', 14, on), on ? '保存済み' : '保存');
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', String(on));
  };
  btn.addEventListener('click', () => {
    favorites.toggle(item);
    render();
  });
  render();
  return btn;
}

export interface ResultItem {
  text: string;
  /** 読みなどの補足 */
  sub?: string;
}

/** 結果を木の名札として並べる。上に胡桃の帯（件数・すべてコピー） */
export function renderResults(container: HTMLElement, items: ResultItem[], mode: Mode, title: string): void {
  if (items.length === 0) {
    container.replaceChildren(h('p', { class: 'empty washi' }, '条件に合うものがありません。条件を見直してください。'));
    return;
  }
  const allText = () => items.map((i) => (i.sub ? `${i.text}（${i.sub}）` : i.text)).join('\n');
  container.replaceChildren(
    resultsBar(
      title,
      `${items.length}件`,
      copyButton(allText, 'すべてコピー', 'piece small'),
      ...shareButtons(
        () => ({ mode, title, items }),
        () => drawPlates(title, items),
      ),
    ),
    h(
      'ul',
      { class: 'plates' },
      items.map((it) =>
        h(
          'li',
          { class: 'plate-wrap' },
          h('span', { class: 'nail', 'aria-hidden': 'true' }),
          h('span', { class: 'cord', 'aria-hidden': 'true' }),
          h(
            'div',
            { class: 'plate wood-hinoki' },
            it.sub ? h('span', { class: 'reading' }, it.sub) : null,
            h('span', { class: `name${[...it.text].length > 10 ? ' long' : ''}` }, it.text),
            h('div', { class: 'plate-actions' }, copyButton(() => it.text), favButton({ ...it, mode })),
          ),
        ),
      ),
    ),
  );
}

/** 胡桃の帯（見出し・件数・右側のボタン） */
export function resultsBar(title: string, count: string, ...actions: Node[]): HTMLDivElement {
  return h(
    'div',
    { class: 'results-bar wood-walnut' },
    h('h2', {}, title, ' ', h('span', { class: 'count' }, count)),
    h('div', { class: 'bar-actions' }, ...actions),
  );
}
