import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// 画面下に出すバージョン番号は package.json の version から取る
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string };

export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(version) },
  test: { globals: true },
});
