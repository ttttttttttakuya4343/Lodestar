import { useEffect, useMemo, useRef } from 'react';

// 自動保存用の debounce フック。最後の呼び出しから delayMs 後に実行する。
// アンマウント時は保留中の呼び出しを flush して、直前の編集を取りこぼさない。
export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delayMs: number,
): (...args: A) => void {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<A | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
      if (pending.current) {
        const args = pending.current;
        pending.current = null;
        fnRef.current(...args);
      }
    };
  }, []);

  return useMemo(() => {
    return (...args: A) => {
      pending.current = args;
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        const next = pending.current;
        pending.current = null;
        if (next) fnRef.current(...next);
      }, delayMs);
    };
  }, [delayMs]);
}
