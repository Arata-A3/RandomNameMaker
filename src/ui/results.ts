/** 結果リスト・コピー・お気に入りボタン */
import { h } from './dom';
import { favorites, type Mode } from './store';

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
    const ta = h('textarea', { value: text });
    ta.value = text;
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  toast('コピーしました');
}

export function copyButton(getText: () => string, label = 'コピー'): HTMLButtonElement {
  return h('button', { type: 'button', class: 'icon-btn', title: label, 'aria-label': label, onclick: () => copyText(getText()) }, '⧉');
}

export function favButton(item: { text: string; sub?: string; mode: Mode }): HTMLButtonElement {
  const btn = h('button', { type: 'button', class: 'icon-btn fav' });
  const render = () => {
    const on = favorites.has(item.text);
    btn.textContent = on ? '★' : '☆';
    btn.classList.toggle('on', on);
    btn.title = on ? 'お気に入りから外す' : 'お気に入りに追加';
    btn.setAttribute('aria-label', btn.title);
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

/** 結果を並べる。上に「すべてコピー」 */
export function renderResults(container: HTMLElement, items: ResultItem[], mode: Mode): void {
  if (items.length === 0) {
    container.replaceChildren(h('p', { class: 'empty' }, '条件に合うものがありません。設定を見直してください。'));
    return;
  }
  const allText = () => items.map((i) => (i.sub ? `${i.text}（${i.sub}）` : i.text)).join('\n');
  container.replaceChildren(
    h(
      'div',
      { class: 'results-head' },
      h('span', { class: 'muted' }, `${items.length}件`),
      h('button', { type: 'button', class: 'ghost', onclick: () => copyText(allText()) }, 'すべてコピー'),
    ),
    h(
      'ul',
      { class: 'results' },
      items.map((it) =>
        h(
          'li',
          {},
          h('div', { class: 'result-text' }, h('span', { class: 'main' }, it.text), it.sub ? h('span', { class: 'sub' }, it.sub) : null),
          h('div', { class: 'result-actions' }, copyButton(() => it.text), favButton({ ...it, mode })),
        ),
      ),
    ),
  );
}
