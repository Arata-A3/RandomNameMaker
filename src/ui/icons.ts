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
} as const;

export type IconName = keyof typeof PATHS;

export function icon(name: IconName, size = 16, filled = false): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'icon';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">${PATHS[name]}</svg>`;
  return span;
}

/** ロゴ（名前の木札） */
export function logo(size = 44): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'logo';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 160 160">
<defs>
<linearGradient id="logo-face" x1="0" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#F5DDB3"/><stop offset="0.55" stop-color="#E8C48F"/><stop offset="1" stop-color="#D6A86E"/></linearGradient>
<linearGradient id="logo-edge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B98650"/><stop offset="1" stop-color="#8E6033"/></linearGradient>
</defs>
<path d="M80 30 L62 8 Q80 0 98 8 Z" fill="none" stroke="#E9D3A6" stroke-width="5" stroke-linejoin="round"/>
<path d="M44 34 H116 L128 46 V146 Q128 156 116 156 H44 Q32 156 32 146 V46 Z" fill="url(#logo-edge)"/>
<path d="M44 28 H116 L128 40 V140 Q128 150 116 150 H44 Q32 150 32 140 V40 Z" fill="url(#logo-face)"/>
<path d="M44 60 Q58 70 52 100 Q48 126 58 148" fill="none" stroke="#B88449" stroke-opacity="0.45" stroke-width="2"/>
<path d="M110 46 Q102 72 108 98 Q114 122 106 148" fill="none" stroke="#B88449" stroke-opacity="0.4" stroke-width="2"/>
<circle cx="80" cy="42" r="6" fill="#3B2414"/>
<text x="80" y="128" text-anchor="middle" font-family="'Shippori Mincho B1', serif" font-weight="800" font-size="64" fill="#3B2414">名</text>
</svg>`;
  return span;
}
