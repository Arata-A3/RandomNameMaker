import './style.css';
import { h } from './ui/dom';
import { load, save } from './ui/store';
import { nameMode, stringMode, wordMode } from './ui/modes';
import { yonkomaMode } from './ui/yonkomaMode';
import { favoritesView } from './ui/favoritesView';

type Tab = 'string' | 'name' | 'word' | 'yonkoma' | 'favorites';

const TABS: { id: Tab; label: string; make: () => HTMLElement }[] = [
  { id: 'string', label: '文字列', make: stringMode },
  { id: 'name', label: '名前', make: nameMode },
  { id: 'word', label: '単語', make: wordMode },
  { id: 'yonkoma', label: '4コマネタ', make: yonkomaMode },
  { id: 'favorites', label: '★ お気に入り', make: favoritesView },
];

const app = document.getElementById('app')!;
const views = new Map<Tab, HTMLElement>();
const main = h('main');
const nav = h('nav', { class: 'tabs', role: 'tablist' });

function show(tab: Tab) {
  save('tab', tab);
  let view = views.get(tab);
  if (!view) {
    view = TABS.find((t) => t.id === tab)!.make();
    views.set(tab, view);
  }
  main.replaceChildren(view);
  for (const btn of nav.querySelectorAll('button')) {
    const on = btn.dataset.tab === tab;
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-selected', String(on));
  }
}

nav.append(
  ...TABS.map((t) =>
    h('button', { type: 'button', role: 'tab', 'data-tab': t.id, onclick: () => show(t.id) }, t.label),
  ),
);

app.append(
  h(
    'header',
    {},
    h('h1', {}, 'RandomNameMaker'),
    h('p', { class: 'muted' }, '名前・文字列・言葉・4コマのネタをランダムに作ります'),
  ),
  nav,
  main,
);

const saved = load<Tab>('tab', 'string');
show(TABS.some((t) => t.id === saved) ? saved : 'string');
