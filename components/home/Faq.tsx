'use client';

import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { cls } from '@/lib/cls';
import { GradientButton } from './GradientButton';
import s from './faq.module.scss';

const PANELS = [1, 2, 3].map((n) => ({ title: `home_page.faq_question_${n}`, content: `home_page.faq_answer_${n}` }));

export function Faq() {
  const { t } = useI18n();
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <div className={s['faq-container']}>
      <div className={s['faq-content']}>
        <h1 className={cls(s, 'title flex-item')}>{t('home_page.faq_title')}</h1>
        {PANELS.map((panel, i) => (
          <div key={panel.title} className={cls(s, 'flex-item faq-item')} onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => ({ ...o, [i]: !o[i] }))}>
            <div className={s.index}>
              <p>{i + 1}</p>
            </div>
            <div className={s['question-and-answer']}>
              <div className={cls(s, 'question', open[i] && 'open')}>
                <p>{t(panel.title)}</p>
              </div>
              {open[i] && (
                <div className={s.answer}>
                  <p style={{ whiteSpace: 'pre-line' }}>{t(panel.content)}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        <div className={s['faq-button']}>
          <GradientButton href="/about-us" width="300px">
            Hiểu thêm về chúng tôi
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
