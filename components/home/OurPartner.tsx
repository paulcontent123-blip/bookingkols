import { OurPartnerShowCase } from './OurPartnerShowCase';
import s from './our-partner.module.scss';

export function OurPartner() {
  return (
    <div className={s.container}>
      <h1>CÁC CHIẾN DỊCH CỦA CHÚNG TÔI</h1>
      <OurPartnerShowCase />
    </div>
  );
}
