import { describe, it, expect } from 'vitest';
import { formatBytes, isBackupStale } from './storage';

describe('storage helpers', () => {
  it('formatBytes は単位付きで整形', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('isBackupStale: 未実施・古い・不正は true、最近は false', () => {
    const now = new Date('2026-06-29T00:00:00.000Z');
    expect(isBackupStale(null, now)).toBe(true);
    expect(isBackupStale('not-a-date', now)).toBe(true);
    // 20日前 → stale（既定14日）
    expect(isBackupStale('2026-06-09T00:00:00.000Z', now)).toBe(true);
    // 3日前 → not stale
    expect(isBackupStale('2026-06-26T00:00:00.000Z', now)).toBe(false);
  });
});
