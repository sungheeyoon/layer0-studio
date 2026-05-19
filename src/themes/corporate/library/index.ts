import { TemplateLibrary, libEntry } from '../../types';
import Hero from './Hero';
import About from './About';
import Features from './Features';
import Contact from './Contact';
import { contactMeta } from './Contact.meta';
import Footer from './Footer';

export const corporateLibrary: TemplateLibrary = {
  hero: libEntry(Hero),
  about: libEntry(About),
  features: libEntry(Features),
  contact: libEntry(Contact, contactMeta),
  footer: libEntry(Footer),
};
