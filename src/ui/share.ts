/**
 * 結果の共有
 * - リンク: 結果を URL の # 以降に入れる（サーバーには送られない）。開いた人には共有された名札を見せる
 * - 画像: 木の板に名札を並べた PNG を作る（スマホは共有メニュー、PCはダウンロード）
 */
import { h } from './dom';
import { icon } from './icons';
import { copyText, favButton, toast, type ResultItem } from './results';
import type { Mode } from './store';
import { fillTemplate, PANELS, type YonkomaIdea } from '../generators/yonkoma';

export interface SharePayload {
  mode: Mode;
  title: string;
  items: ResultItem[];
}

/** 共有メニューを使うのはスマホなど指で操作する端末だけ（PCはコピー・ダウンロード） */
const useShareSheet = () => window.matchMedia('(pointer: coarse)').matches;

/** リンクに入れる件数の上限（URL が長くなりすぎないように） */
const LINK_LIMIT = 40;

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** 共有内容を URL の # 以降の形にする */
export function encodeShare(p: SharePayload): string {
  const data = { m: p.mode, t: p.title, i: p.items.slice(0, LINK_LIMIT).map((it) => (it.sub ? [it.text, it.sub] : [it.text])) };
  return `#s=${toBase64Url(JSON.stringify(data))}`;
}

export function shareUrl(p: SharePayload): string {
  return `${location.origin}${location.pathname}${encodeShare(p)}`;
}

export function readShare(hash: string): SharePayload | undefined {
  const m = /^#s=([\w-]+)$/.exec(hash);
  if (!m) return undefined;
  try {
    const d = JSON.parse(fromBase64Url(m[1]));
    if (!Array.isArray(d.i)) return undefined;
    return {
      mode: (['string', 'name', 'word', 'yonkoma'].includes(d.m) ? d.m : 'name') as Mode,
      title: String(d.t ?? '共有された名札').slice(0, 40),
      items: d.i.slice(0, LINK_LIMIT).map((x: unknown[]) => ({ text: String(x[0] ?? '').slice(0, 2000), sub: x[1] ? String(x[1]).slice(0, 200) : undefined })),
    };
  } catch {
    return undefined;
  }
}

/** 共有メニュー（スマホ）か、リンクのコピー（PC） */
export async function shareLink(p: SharePayload): Promise<void> {
  const url = shareUrl(p);
  const text = p.items.map((i) => (i.sub ? `${i.text}（${i.sub}）` : i.text)).join('\n');
  if (navigator.share && useShareSheet()) {
    try {
      await navigator.share({ title: `RandomNameMaker - ${p.title}`, text, url });
      return;
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return;
    }
  }
  await copyText(url);
  toast(p.items.length > LINK_LIMIT ? `共有リンクをコピーしました（先頭${LINK_LIMIT}件）` : '共有リンクをコピーしました');
}

/** 画像を共有メニューで渡す。できなければダウンロード */
export async function shareImage(canvas: HTMLCanvasElement, name: string): Promise<void> {
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
  if (!blob) return;
  const file = new File([blob], `${name}.png`, { type: 'image/png' });
  if (useShareSheet() && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'RandomNameMaker' });
      return;
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return;
    }
  }
  const a = h('a', { href: URL.createObjectURL(blob), download: file.name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('画像を保存しました');
}

export function shareButtons(get: () => SharePayload, image: () => HTMLCanvasElement): HTMLElement[] {
  return [
    h('button', { type: 'button', class: 'piece small', onclick: () => shareLink(get()) }, icon('share', 14), '共有'),
    h('button', { type: 'button', class: 'piece small', onclick: () => shareImage(image(), 'randomnamemaker') }, icon('image', 14), '画像'),
  ];
}

/* ---------- 画像を描く ---------- */

const FONT_NAME = "'Shippori Mincho B1', 'Yu Mincho', serif";
const FONT_BODY = "'Zen Kaku Gothic New', 'Yu Gothic', sans-serif";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, hh: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, hh, r);
}

/** 楢の机（木目の線を決まった並びで引く） */
function drawDesk(ctx: CanvasRenderingContext2D, w: number, hh: number) {
  const g = ctx.createLinearGradient(0, 0, 0, hh);
  g.addColorStop(0, '#C28C5A');
  g.addColorStop(1, '#AD774A');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, hh);
  ctx.strokeStyle = 'rgba(70, 40, 15, 0.10)';
  ctx.lineWidth = 2;
  for (let y = 7, i = 0; y < hh; y += 11 + ((i * 7) % 19), i++) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(w * 0.3, y + 3, w * 0.6, y - 3, w, y + 1);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(50, 28, 10, 0.35)';
  for (let y = 178; y < hh; y += 180) ctx.fillRect(0, y, w, 2);
}

function drawHeader(ctx: CanvasRenderingContext2D, w: number, title: string) {
  const g = ctx.createLinearGradient(0, 0, 0, 120);
  g.addColorStop(0, '#5A3A22');
  g.addColorStop(1, '#3E2716');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, 120);
  ctx.fillStyle = '#2A190C';
  ctx.fillRect(0, 120, w, 5);
  ctx.fillStyle = '#F7EBD6';
  ctx.font = `800 46px ${FONT_NAME}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(title, 48, 62);
  ctx.fillStyle = '#E2CBA5';
  ctx.font = `500 22px ${FONT_BODY}`;
  ctx.textAlign = 'right';
  ctx.fillText('RandomNameMaker', w - 48, 62);
}

/** 文字が幅に収まるまで小さくする */
function fitFont(ctx: CanvasRenderingContext2D, text: string, weightFamily: string, max: number, width: number) {
  let size = max;
  do {
    ctx.font = `${weightFamily.replace('{s}', String(size))}`;
    if (ctx.measureText(text).width <= width) break;
    size -= 2;
  } while (size > 14);
}

/** 名札を並べた画像 */
export function drawPlates(title: string, items: ResultItem[]): HTMLCanvasElement {
  const list = items.slice(0, 60);
  const w = 1080;
  const cols = list.length > 1 ? 2 : 1;
  const pw = cols === 2 ? 470 : 760;
  const ph = 160;
  const gap = 46;
  const rows = Math.ceil(list.length / cols);
  const top = 170;
  const hh = top + rows * (ph + gap) + 40;
  const canvas = h('canvas', { width: w, height: hh });
  const ctx = canvas.getContext('2d')!;
  drawDesk(ctx, w, hh);
  drawHeader(ctx, w, title);

  list.forEach((it, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = cols === 2 ? 48 + col * (pw + 44) : (w - pw) / 2;
    const y = top + row * (ph + gap);
    // 釘と紐
    ctx.strokeStyle = '#E9D6B0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + pw / 2 - 40, y + 2);
    ctx.quadraticCurveTo(x + pw / 2, y - 34, x + pw / 2 + 40, y + 2);
    ctx.stroke();
    ctx.fillStyle = '#3A2A1C';
    ctx.beginPath();
    ctx.arc(x + pw / 2, y - 20, 8, 0, Math.PI * 2);
    ctx.fill();
    // 札（厚み・影・木目）
    ctx.save();
    ctx.translate(x + pw / 2, y + ph / 2);
    ctx.rotate(((i % 4) - 1.5) * 0.006);
    ctx.translate(-pw / 2, -ph / 2);
    ctx.shadowColor = 'rgba(40, 20, 6, 0.35)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#9C6F3F';
    roundRect(ctx, 0, 6, pw, ph, 12);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    const g = ctx.createLinearGradient(0, 0, 0, ph);
    g.addColorStop(0, '#F1D9B2');
    g.addColorStop(1, '#E3C496');
    ctx.fillStyle = g;
    roundRect(ctx, 0, 0, pw, ph, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(160, 110, 55, 0.14)';
    ctx.lineWidth = 1.5;
    for (let gx = 14; gx < pw; gx += 17 + ((gx * 3) % 11)) {
      ctx.beginPath();
      ctx.moveTo(gx, 4);
      ctx.bezierCurveTo(gx + 4, ph * 0.3, gx - 4, ph * 0.7, gx + 2, ph - 4);
      ctx.stroke();
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    if (it.sub) {
      ctx.fillStyle = '#5E4A35';
      fitFont(ctx, it.sub, `500 {s}px ${FONT_BODY}`, 22, pw - 40);
      ctx.fillText(it.sub, pw / 2, 52);
    }
    ctx.fillStyle = '#2B2014';
    fitFont(ctx, it.text, `800 {s}px ${FONT_NAME}`, 56, pw - 40);
    ctx.fillText(it.text, pw / 2, it.sub ? 118 : 100);
    ctx.restore();
  });
  return canvas;
}

/** 長い文を幅で折り返す（1文字ずつ測る） */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > width && line) {
      lines.push(line);
      line = ch;
    } else line += ch;
  }
  if (line) lines.push(line);
  return lines;
}

/** 4コマのネタの画像（和紙に4つのコマ） */
export function drawYonkoma(idea: YonkomaIdea): HTMLCanvasElement {
  const w = 1080;
  const komaH = 190;
  const castH = 60 + idea.characters.length * 44;
  const hh = 170 + 70 + PANELS.length * (komaH + 18) + 50 + castH + 60;
  const canvas = h('canvas', { width: w, height: hh });
  const ctx = canvas.getContext('2d')!;
  drawDesk(ctx, w, hh);
  drawHeader(ctx, w, '4コマのネタ');

  // 和紙
  const px = 48;
  const py = 160;
  const pw = w - 96;
  const ph = hh - py - 40;
  ctx.shadowColor = 'rgba(50, 25, 8, 0.35)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#FBF6EC';
  roundRect(ctx, px, py, pw, ph, 8);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#2B2014';
  ctx.font = `700 26px ${FONT_BODY}`;
  ctx.fillText([idea.theme, idea.place, idea.season, idea.prop].join(' ／ '), px + 32, py + 56);

  let y = py + 86;
  PANELS.forEach(({ key, label }, i) => {
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(px + 32, y, pw - 64, komaH);
    ctx.strokeStyle = '#2B2014';
    ctx.lineWidth = 4;
    ctx.strokeRect(px + 32, y, pw - 64, komaH);
    ctx.fillStyle = '#2B2014';
    ctx.textAlign = 'center';
    ctx.font = `800 44px ${FONT_NAME}`;
    ctx.fillText(String(i + 1), px + 88, y + 86);
    ctx.font = `500 22px ${FONT_BODY}`;
    ctx.fillStyle = '#5E4A35';
    ctx.fillText(label, px + 88, y + 120);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#2B2014';
    ctx.font = `500 32px ${FONT_BODY}`;
    const lines = wrap(ctx, fillTemplate(idea[key], idea), pw - 220);
    const startY = y + komaH / 2 - ((lines.length - 1) * 44) / 2 + 11;
    lines.forEach((l, j) => ctx.fillText(l, px + 140, startY + j * 44));
    y += komaH + 18;
  });

  ctx.font = `500 24px ${FONT_BODY}`;
  ctx.fillStyle = '#5E4A35';
  ctx.fillText(`オチのタイプ: ${idea.ochi}`, px + 32, y + 22);
  y += 70;
  ctx.fillStyle = '#2B2014';
  ctx.font = `800 26px ${FONT_NAME}`;
  ctx.fillText('登場人物', px + 32, y);
  ctx.font = `500 22px ${FONT_BODY}`;
  idea.characters.forEach((c, i) => {
    const line = `${String.fromCharCode(65 + i)}. ${c.name.text}${c.name.reading ? `（${c.name.reading}）` : ''} ／ ${c.role} ／ ${c.personality} ／ 口ぐせ${c.catchphrase}`;
    const [first] = wrap(ctx, line, pw - 64);
    ctx.fillText(first, px + 32, y + 44 + i * 44);
  });
  return canvas;
}

/** 共有リンクで開かれたときに、共有された名札を見せる */
export function showSharedDialog(p: SharePayload, onClose: () => void): void {
  const dialog = h('dialog', { class: 'shared washi', 'aria-labelledby': 'shared-title' });
  const close = () => {
    dialog.close();
    dialog.remove();
    onClose();
  };
  dialog.append(
    h('h2', { id: 'shared-title' }, '共有された', p.title.replace(/^作った/, '')),
    h('p', { class: 'hint' }, '気に入ったものは「保存」で残せます'),
    h(
      'ul',
      { class: 'plates' },
      p.items.map((it) =>
        h(
          'li',
          { class: `plate-wrap${p.mode === 'yonkoma' ? ' wide' : ''}` },
          h('span', { class: 'nail', 'aria-hidden': 'true' }),
          h('span', { class: 'cord', 'aria-hidden': 'true' }),
          h(
            'div',
            { class: 'plate wood-hinoki' },
            it.sub ? h('span', { class: 'reading' }, it.sub) : null,
            h('span', { class: `name${p.mode === 'yonkoma' ? ' pre' : [...it.text].length > 10 ? ' long' : ''}` }, it.text),
            h(
              'div',
              { class: 'plate-actions' },
              h('button', { type: 'button', class: 'tool', onclick: () => copyText(it.text) }, icon('copy', 14), 'コピー'),
              favButton({ ...it, mode: p.mode }),
            ),
          ),
        ),
      ),
    ),
    h('button', { type: 'button', class: 'primary wood-walnut', onclick: close }, icon('dice', 22), '自分でも作ってみる'),
  );
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  document.body.append(dialog);
  dialog.showModal();
}
