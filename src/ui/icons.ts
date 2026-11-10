/** 画面で使うアイコン（線のアイコンは currentColor で文字色に合わせる） */

const PATHS = {
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" stroke-linejoin="round"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.4" fill="currentColor"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
  reroll: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  share: '<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  // モードのタブ
  text: '<path d="M4 7V5h16v2M9 19h6M12 5v14"/>',
  tag: '<path d="M4 9h16v11H4z" stroke-linejoin="round"/><path d="M12 9V5M9 5h6M8 14h8"/>',
  words: '<path d="M4 6h10M4 12h16M4 18h7"/>',
  koma: '<path d="M6 2h12v20H6zM6 7h12M6 12h12M6 17h12" stroke-linejoin="round"/>',
} as const;

export type IconName = keyof typeof PATHS;

export function icon(name: IconName, size = 16, filled = false): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'icon';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">${PATHS[name]}</svg>`;
  return span;
}

/**
 * ロゴ（木のサイコロ）。
 * 目と文字は、各面の傾きに合わせた座標（0〜100 の正方形をその面に写す変換）の上に置く。
 *   天面: matrix(0.54 -0.27 0.54 0.27 26 47)
 *   左面: matrix(0.54 0.27 0 0.6 26 47)
 *   右面: matrix(0.54 -0.27 0 0.6 80 74)
 */
export function logo(size = 44): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'logo';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 160 160">
<defs>
<linearGradient id="logo-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6DCAE"/><stop offset="1" stop-color="#E4BC84"/></linearGradient>
<linearGradient id="logo-left" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D19C5F"/><stop offset="1" stop-color="#B9854B"/></linearGradient>
<linearGradient id="logo-right" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9733D"/><stop offset="1" stop-color="#875628"/></linearGradient>
</defs>
<path d="M26 47 L80 20 L134 47 L80 74 Z" fill="url(#logo-top)"/>
<path d="M26 47 L80 74 L80 134 L26 107 Z" fill="url(#logo-left)"/>
<path d="M80 74 L134 47 L134 107 L80 134 Z" fill="url(#logo-right)"/>
<path d="M26 47 L80 74 L134 47" fill="none" stroke="#FFEACB" stroke-width="2.5" stroke-linejoin="round" opacity="0.8"/>
<g transform="matrix(0.54 -0.27 0.54 0.27 26 47)"><circle cx="50" cy="50" r="17" fill="#8E2A18"/><circle cx="50" cy="50" r="14.5" fill="#C2452D"/></g>
<g transform="matrix(0.54 0.27 0 0.6 26 47)"><text x="50" y="69" text-anchor="middle" font-family="'Zen Kaku Gothic New', 'Yu Gothic', sans-serif" font-weight="700" font-size="54" fill="#3B2414">あ</text></g>
<g transform="matrix(0.54 -0.27 0 0.6 80 74)" fill="#2B1A0C"><circle cx="28" cy="28" r="11"/><circle cx="72" cy="28" r="11"/><circle cx="28" cy="72" r="11"/><circle cx="72" cy="72" r="11"/></g>
</svg>`;
  return span;
}
