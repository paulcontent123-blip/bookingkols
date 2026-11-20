import { cdnImage } from '@/lib/cdn';
import s from './platform-tag.module.scss';

export function PlatformTag({ platform, numberOfSubscribers }: { platform: 'tiktok' | 'youtube' | 'facebook' | 'instagram'; numberOfSubscribers: string }) {
  const icon = platform === 'tiktok' ? cdnImage('assets/icon/tiktok-circle.svg') : cdnImage(`assets/icon/${platform}.svg`);
  return (
    <div className={s.tag}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt={platform} />
      <p>
        <strong>{numberOfSubscribers}</strong>
      </p>
    </div>
  );
}
