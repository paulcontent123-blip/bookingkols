import { InboxIcon } from './icons';

/** Khung "Không có dữ liệu" (thay cho nz-empty). */
export function Empty({ text = 'Không có dữ liệu', className }: { text?: string; className?: string }) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%', padding: '32px 0', opacity: 0.65 }}>
      <InboxIcon style={{ fontSize: 40 }} />
      <span style={{ fontSize: 14 }}>{text}</span>
    </div>
  );
}
