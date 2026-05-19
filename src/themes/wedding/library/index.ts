import { TemplateLibrary, libEntry } from '../../types';
import Nav from './Nav';
import Hero from './Hero';
import Philosophy from './Philosophy';
import Services from './Services';
import Gallery from './Gallery';
import Process from './Process';
import Pricing from './Pricing';
import Testimonials from './Testimonials';
import Faq from './Faq';
import { faqMeta } from './Faq.meta';
import Contact from './Contact';
import { contactMeta } from './Contact.meta';
import Footer from './Footer';

export const weddingLibrary: TemplateLibrary = {
  nav: libEntry(Nav),
  hero: libEntry(Hero),
  philosophy: libEntry(Philosophy),
  services: libEntry(Services),
  gallery: libEntry(Gallery),
  process: libEntry(Process),
  pricing: libEntry(Pricing),
  testimonials: libEntry(Testimonials),
  faq: libEntry(Faq, faqMeta),
  contact: libEntry(Contact, contactMeta),
  footer: libEntry(Footer),
};
