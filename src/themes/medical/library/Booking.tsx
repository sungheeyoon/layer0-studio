import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../medical.module.css';
import { PhoneIcon, ChatIcon, ClockIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Booking: SectionComponent = function Booking({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = getFieldValue(data, 'label') || '';
  const title = getFieldValue(data, 'title') || '';
  const description = getFieldValue(data, 'description') || '';
  const phone = getFieldValue(data, 'phone') || '';
  const hours = getFieldValue(data, 'hours') || '';
  const image = getFieldValue(data, 'image') || '';

  return (
    <section className="relative overflow-hidden py-28 lg:py-44" id="booking">
      {image && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-[#1C1917]/82 pointer-events-none"></div>

      <div className="relative max-w-2xl mx-auto px-6 text-center">
        <div>
          <p className={`${styles.sectionLabel} justify-center mb-6`} style={{ color: '#C8A97E' }}>{label}</p>
          <h2 className={`${styles.fontDisplay} text-[clamp(2.4rem,5vw,4rem)] font-light text-[#F9F7F3] leading-[1.1] mb-6 whitespace-pre-line`}>
            {title}
          </h2>
          <p className="text-[#F9F7F3]/55 text-[15px] leading-[1.85] mb-10 max-w-lg mx-auto whitespace-pre-line">
            {description}
          </p>

          {/* Contact row */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10 text-[#F9F7F3]/70 text-[13px]">
            <span className="flex items-center gap-2">
              <PhoneIcon size={15} className="text-[#C8A97E]" />
              {phone}
            </span>
            <span className="flex items-center gap-2">
              <ClockIcon size={15} className="text-[#C8A97E]" />
              {hours}
            </span>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <a href={`tel:${phone}`}>
              <button className={`${styles.btnDark} px-8 py-4 text-[13px] tracking-widest`}>
                <PhoneIcon size={17} />
                <span>전화 예약</span>
              </button>
            </a>
            <button
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#FEE500] text-[#391D1D] font-semibold text-[13px] tracking-wide cursor-pointer hover:bg-[#F5DC00] transition-colors"
            >
              <ChatIcon size={17} />
              카카오로 상담
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

Booking.meta = {
  componentKey: 'booking',
  category: 'contact',
  label: 'Medical Booking CTA',
  dataSchema: {
    label: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀', required: true },
    description: { type: 'textarea', label: '섹션 설명' },
    phone: { type: 'text', label: '전화번호' },
    hours: { type: 'text', label: '운영 시간' },
    image: { type: 'image', label: '배경 이미지' },
  },
  previewImage: '/component-previews/medical/booking.webp',
};

export default Booking;
