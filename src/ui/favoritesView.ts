/** 保存した名札の一覧 */
import { h } from './dom';
import { icon } from './icons';
import { favorites, type Mode } from './store';
import { copyButton, copyText, resultsBar } from './results';

const MODE_LABEL: Record<Mode, string> = { string: '文字列', name: '名前', word: '単語', yonkoma: '4コマ' };

export function favoritesView(): HTMLElement {
  const root = h('section', { class: 'output favorites' });
  const render = () => {
    const list = favorites.list();
    if (list.length === 0) {
      root.replaceChildren(h('p', { class: 'empty washi' }, 'まだ保存した名札はありません。名札の「保存」を押すとここに残ります。'));
      return;
    }
    root.replaceChildren(
      resultsBar(
        '保存した名札',
        `${list.length}件（このブラウザに保存）`,
        h('button', { type: 'button', class: 'piece small', onclick: () => copyText(list.map((f) => f.text).join('\n\n')) }, icon('copy', 14), 'すべてコピー'),
        h(
          'button',
          {
            type: 'button',
            class: 'piece small danger',
            onclick: () => {
              if (confirm('保存した名札をすべて削除しますか？')) favorites.clear();
            },
          },
          icon('trash', 14),
          'すべて削除',
        ),
      ),
      h(
        'ul',
        { class: 'plates' },
        list.map((f) =>
          h(
            'li',
            { class: `plate-wrap${f.mode === 'yonkoma' ? ' wide' : ''}` },
            h('span', { class: 'nail', 'aria-hidden': 'true' }),
            h('span', { class: 'cord', 'aria-hidden': 'true' }),
            h(
              'div',
              { class: 'plate wood-hinoki' },
              h('span', { class: 'tag' }, MODE_LABEL[f.mode]),
              f.sub ? h('span', { class: 'reading' }, f.sub) : null,
              h('span', { class: `name${f.mode === 'yonkoma' ? ' pre' : [...f.text].length > 10 ? ' long' : ''}` }, f.text),
              h(
                'div',
                { class: 'plate-actions' },
                copyButton(() => f.text),
                h('button', { type: 'button', class: 'tool', onclick: () => favorites.remove(f.text) }, icon('trash', 14), '削除'),
              ),
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
