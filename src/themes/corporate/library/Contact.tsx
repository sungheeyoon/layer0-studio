'use client';

import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../corporate.module.css';
import { getFieldValue } from '@/domain/entities/template.entity';

const Contact: SectionComponent = function Contact({ section }: ThemeSectionProps) {
  const { data } = section;
  const title = getFieldValue(data, 'title') || 'Get in Touch';
  const email = getFieldValue(data, 'email') || '';
  const phone = getFieldValue(data, 'phone') || '';
  const address = getFieldValue(data, 'address') || '';

  return (
    <div className={`${styles.section} ${styles.genericSection}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-medium block mb-4">Inquiry</span>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <div className="space-y-12 mt-12">
            {email && (
              <div>
                <label className="text-[10px] uppercase tracking-widest text-outline block mb-2">Email Address</label>
                <a href={`mailto:${email}`} className="text-lg font-light hover:text-primary transition-colors underline underline-offset-8 decoration-outline-variant hover:decoration-primary">
                  {email}
                </a>
              </div>
            )}
            {phone && (
              <div>
                <label className="text-[10px] uppercase tracking-widest text-outline block mb-2">Phone Number</label>
                <span className="text-lg font-light tracking-wider">{phone}</span>
              </div>
            )}
            {address && (
              <div>
                <label className="text-[10px] uppercase tracking-widest text-outline block mb-2">Office</label>
                <address className="text-sm font-light not-italic opacity-70 leading-loose uppercase tracking-wide">
                  {address}
                </address>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-surface-container-low p-12 border border-outline-variant">
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="group">
              <label className="text-[10px] uppercase tracking-widest text-outline block mb-3 group-focus-within:text-primary transition-colors">Name</label>
              <input type="text" className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 pb-2 text-sm font-light transition-all" placeholder="Enter your full name" />
            </div>
            <div className="group">
              <label className="text-[10px] uppercase tracking-widest text-outline block mb-3 group-focus-within:text-primary transition-colors">Message</label>
              <textarea rows={4} className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 pb-2 text-sm font-light transition-all resize-none" placeholder="How can we help?" />
            </div>
            <button className="w-full mt-4 bg-primary text-on-primary py-4 text-[10px] font-medium uppercase tracking-[0.3em] hover:brightness-110 transition-all">
              Send Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
