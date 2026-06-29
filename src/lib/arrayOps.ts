// 文字列配列の非破壊操作（週/月の各種リスト編集で共用）。

/** 末尾に trim 済みの値を追加（空文字は無視）。 */
export function pushTrimmed(list: string[], text: string): string[] {
  const t = text.trim();
  return t ? [...list, t] : list;
}

/** index の値を置き換え。 */
export function setAt(list: string[], index: number, value: string): string[] {
  if (index < 0 || index >= list.length) return list;
  return list.map((v, i) => (i === index ? value : v));
}

/** index の要素を削除。 */
export function removeAt<T>(list: T[], index: number): T[] {
  if (index < 0 || index >= list.length) return list;
  return list.filter((_, i) => i !== index);
}
