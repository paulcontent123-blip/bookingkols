/**
 * Ghép tên lớp CSS Modules theo cách viết quen thuộc của template cũ:
 *   className={cls(s, 'bk-top active', isOpen && 'open')}
 * Tên có trong module thì đổi thành tên đã băm; tên không có (lớp dùng chung toàn cục) giữ nguyên.
 */
export function cls(styles: Record<string, string>, names: string, ...extra: (string | false | null | undefined)[]): string {
  return [names, ...extra]
    .filter((n): n is string => Boolean(n))
    .flatMap((n) => n.split(/\s+/).filter(Boolean))
    .map((n) => styles[n] ?? n)
    .join(' ');
}
