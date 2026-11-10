/** "表記:読み 表記:読み" 形式の文字列を配列にする */
export interface Entry {
  text: string;
  reading: string;
}

export function entries(src: string): Entry[] {
  return src
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const [text, reading = ''] = tok.split(':');
      return { text, reading };
    });
}

/** 空白区切りの単語リスト */
export function words(src: string): string[] {
  return src.trim().split(/\s+/);
}
