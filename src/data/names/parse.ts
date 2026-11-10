/** "表記:読み:重み:確率" 形式の文字列を配列にする（重み以降は省略可） */
export interface Entry {
  text: string;
  reading: string;
  /** 出やすさ（省略時 1） */
  weight: number;
  /** 苗字の後半パーツで、連濁した読みになる確率 */
  voicing: number;
}

export function entries(src: string): Entry[] {
  return src
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const [text, reading = '', weight = '1', voicing = '0'] = tok.split(':');
      return { text, reading, weight: Number(weight), voicing: Number(voicing) };
    });
}

/** 空白区切りの単語リスト */
export function words(src: string): string[] {
  return src.trim().split(/\s+/);
}
