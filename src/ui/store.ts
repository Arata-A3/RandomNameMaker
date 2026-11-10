/** localStorage まわり（読めない環境でも動くように try/catch で包む） */

const PREFIX = 'rnm:';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    // 保存後に項目が増えても動くように、既定値に上書きする
    return typeof fallback === 'object' && fallback !== null && !Array.isArray(fallback) ? { ...fallback, ...v } : v;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* 保存できなくても動作は続ける */
  }
}

export type Mode = 'string' | 'name' | 'word' | 'yonkoma';

export interface Favorite {
  text: string;
  sub?: string;
  mode: Mode;
  savedAt: number;
}

type Listener = () => void;
const listeners = new Set<Listener>();

export const favorites = {
  list(): Favorite[] {
    return load<Favorite[]>('favorites', []);
  },
  has(text: string): boolean {
    return this.list().some((f) => f.text === text);
  },
  toggle(item: Omit<Favorite, 'savedAt'>): boolean {
    const list = this.list();
    const i = list.findIndex((f) => f.text === item.text);
    if (i >= 0) list.splice(i, 1);
    else list.unshift({ ...item, savedAt: Date.now() });
    save('favorites', list);
    listeners.forEach((l) => l());
    return i < 0;
  },
  remove(text: string): void {
    save(
      'favorites',
      this.list().filter((f) => f.text !== text),
    );
    listeners.forEach((l) => l());
  },
  clear(): void {
    save('favorites', []);
    listeners.forEach((l) => l());
  },
  subscribe(l: Listener): void {
    listeners.add(l);
  },
};
