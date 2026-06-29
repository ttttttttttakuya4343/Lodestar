// 画面内のセクション見出し＋本文。見出し右に任意のアクション（リンク等）を置ける。
import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Section({ title, action, children }: SectionProps) {
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-weak">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
