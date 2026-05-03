import { ThemeSectionProps, SectionComponent } from '../../types';

const Footer: SectionComponent = function Footer({ section }: ThemeSectionProps) {
  const { data } = section;
  const copyright = data['copyright']?.value || `© ${new Date().getFullYear()} Layer0 Studio`;
  const companyName = data['companyName']?.value || 'LAYER0';

  return (
    <footer className="py-20 px-8 border-t border-outline-variant bg-surface">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
        <div>
          <span className="text-xl font-light tracking-[0.3em] uppercase text-primary mb-4 block">
            {companyName}
          </span>
          <p className="text-[10px] uppercase tracking-widest opacity-50 font-medium">
            Architectural Digital Experiences
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-12 md:gap-24">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-primary block">Platform</span>
            <ul className="space-y-2">
              {['Editor', 'Themes', 'Infrastructure'].map(item => (
                <li key={item} className="text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-primary block">Social</span>
            <ul className="space-y-2">
              {['LinkedIn', 'Instagram', 'X (Twitter)'].map(item => (
                <li key={item} className="text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-outline-variant flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-widest opacity-40 font-light">
          {copyright}
        </span>
        <div className="flex gap-8">
          <a href="/legal/privacy" className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity font-light">Privacy</a>
          <a href="/legal/terms" className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity font-light">Terms</a>
        </div>
      </div>
    </footer>
  );
};

Footer.meta = {
  componentKey: 'footer',
  category: 'footer',
  label: 'Corporate Footer',
  dataSchema: {
    companyName: { type: 'text', label: 'Company Name' },
    copyright: { type: 'text', label: 'Copyright Text' }
  },
  previewImage: '/component-previews/corporate/footer.webp',
};

export default Footer;
