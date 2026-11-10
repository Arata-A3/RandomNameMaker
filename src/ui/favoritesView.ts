/** お気に入り一覧 */
import { h } from './dom';
import { favorites, type Mode } from './store';
import { copyButton, copyText } from './results';

const MODE_LABEL: Record<Mode, string> = { string: '文字列', name: '名前', word: '単語', yonkoma: '4コマ' };

export function favoritesView(): HTMLElement {
  const root = h('section', { class: 'panel output favorites' });
  const render = () => {
    const list = favorites.list();
    if (list.length === 0) {
      root.replaceChildren(h('p', { class: 'empty' }, 'まだお気に入りはありません。結果の ☆ を押すとここに保存されます。'));
      return;
    }
    root.replaceChildren(
      h(
        'div',
        { class: 'results-head' },
        h('span', { class: 'muted' }, `${list.length}件（このブラウザに保存）`),
        h(
          'div',
          { class: 'result-actions' },
          h('button', { type: 'button', class: 'ghost', onclick: () => copyText(list.map((f) => f.text).join('\n\n')) }, 'すべてコピー'),
          h(
            'button',
            {
              type: 'button',
              class: 'ghost danger',
              onclick: () => {
                if (confirm('お気に入りをすべて削除しますか？')) favorites.clear();
              },
            },
            'すべて削除',
          ),
        ),
      ),
      h(
        'ul',
        { class: 'results' },
        list.map((f) =>
          h(
            'li',
            {},
            h(
              'div',
              { class: 'result-text' },
              h('span', { class: 'tag' }, MODE_LABEL[f.mode]),
              h('span', { class: `main${f.mode === 'yonkoma' ? ' pre' : ''}` }, f.text),
              f.sub ? h('span', { class: 'sub' }, f.sub) : null,
            ),
            h(
              'div',
              { class: 'result-actions' },
              copyButton(() => f.text),
              h('button', { type: 'button', class: 'icon-btn', title: '削除', 'aria-label': '削除', onclick: () => favorites.remove(f.text) }, '✕'),
            ),
          ),
        ),
      ),
    );
  };
  favorites.subscribe(render);
  render();
  return root;
}
