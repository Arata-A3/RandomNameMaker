import './style.css';
import { h } from './ui/dom';
import { icon, logo, type IconName } from './ui/icons';
import { load, save } from './ui/store';
import { nameMode, stringMode, wordMode } from './ui/modes';
import { yonkomaMode } from './ui/yonkomaMode';
import { favoritesView } from './ui/favoritesView';
import { readShare, showSharedDialog } from './ui/share';

type Tab = 'string' | 'name' | 'word' | 'yonkoma' | 'favorites';

const TABS: { id: Tab; label: string; icon: IconName; make: () => HTMLElement }[] = [
  { id: 'string', label: '文字列', icon: 'text', make: stringMode },
  { id: 'name', label: '名前', icon: 'tag', make: nameMode },
  { id: 'word', label: '単語', icon: 'words', make: wordMode },
  { id: 'yonkoma', label: '4コマネタ', icon: 'koma', make: yonkomaMode },
  { id: 'favorites', label: '保存', icon: 'star', make: favoritesView },
];

const app = document.getElementById('app')!;
const views = new Map<Tab, HTMLElement>();
const main = h('main', { class: 'page' });
const nav = h('nav', { class: 'tabs', role: 'tablist', 'aria-label': 'モード' });

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
    btn.classList.toggle('wood-hinoki', on);
    btn.setAttribute('aria-selected', String(on));
  }
}

nav.append(
  ...TABS.map((t) =>
    h('button', { type: 'button', role: 'tab', 'data-tab': t.id, onclick: () => show(t.id) }, icon(t.icon, 20), h('span', {}, t.label)),
  ),
);

app.append(
  h(
    'header',
    { class: 'site-header wood-walnut' },
    h(
      'div',
      { class: 'header-inner' },
      h('div', { class: 'brand' }, logo(44), h('div', {}, h('h1', {}, 'RandomNameMaker'), h('p', {}, '名前・文字列・言葉・4コマのネタを作る'))),
      nav,
    ),
  ),
  main,
);

// 公開版だけ、オフライン用のサービスワーカーを登録する
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* 登録できなくても普通に使える */
    });
  });
}

// 共有リンクで開かれたら、共有された名札を先に見せる
const shared = readShare(location.hash);
if (shared) {
  showSharedDialog(shared, () => history.replaceState(null, '', location.pathname + location.search));
}

const saved = load<Tab>('tab', 'name');
show(TABS.some((t) => t.id === saved) ? saved : 'name');
