'use client';

import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { cdnImage } from '@/lib/cdn';
import s from './policy.module.scss';

const FAQ = [1, 2, 3, 4].map((n) => ({ question: `home_page.faq_question_${n}`, answer: `home_page.faq_answer_${n}` }));

/** Các câu hỏi thường gặp ở cuối trang Chính sách: bấm câu hỏi để xem câu trả lời bên phải. */
export function PolicyFaq() {
  const { t } = useI18n();
  const [reading, setReading] = useState(FAQ[0].answer);
  return (
    <div className={s.faq}>
      <h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cdnImage('assets/icon/star.svg')} alt="" width={24} height={24} /> Các câu hỏi thường gặp
      </h1>
      <div className={s['faq-content']}>
        {FAQ.map((item, idx) => (
          <div key={item.question} className={s[`question-${idx + 1}`]} onClick={() => setReading(item.answer)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setReading(item.answer)}>
            {t(item.question)}
          </div>
        ))}
        <div className={s.answer}>
          <div style={{ whiteSpace: 'pre-line' }}>{t(reading)}</div>
        </div>
      </div>
    </div>
  );
}
