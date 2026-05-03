import { ThemeLibrary, libEntry } from '../../types';
import Nav from './Nav';
import Hero from './Hero';
import TrustStrip from './TrustStrip';
import Services from './Services';
import About from './About';
import Team from './Team';
import Process from './Process';
import Testimonials from './Testimonials';
import Faq from './Faq';
import { faqMeta } from './Faq.meta';
import Contact from './Contact';
import { contactMeta } from './Contact.meta';
import Footer from './Footer';

export const legalLibrary: ThemeLibrary = {
  nav: libEntry(Nav),
  hero: libEntry(Hero),
  'trust-strip': libEntry(TrustStrip),
  services: libEntry(Services),
  about: libEntry(About),
  team: libEntry(Team),
  process: libEntry(Process),
  testimonials: libEntry(Testimonials),
  faq: libEntry(Faq, faqMeta),
  contact: libEntry(Contact, contactMeta),
  footer: libEntry(Footer),
};
