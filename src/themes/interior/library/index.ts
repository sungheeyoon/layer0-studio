import { ThemeLibrary, libEntry } from '../../types';
import Nav from './Nav';
import { navMeta } from './Nav.meta';
import Hero from './Hero';
import Stats from './Stats';
import About from './About';
import Services from './Services';
import Portfolio from './Portfolio';
import Process from './Process';
import Testimonials from './Testimonials';
import Contact from './Contact';
import { contactMeta } from './Contact.meta';
import Footer from './Footer';

export const interiorLibrary: ThemeLibrary = {
  nav: libEntry(Nav, navMeta),
  hero: libEntry(Hero),
  stats: libEntry(Stats),
  about: libEntry(About),
  services: libEntry(Services),
  portfolio: libEntry(Portfolio),
  process: libEntry(Process),
  testimonials: libEntry(Testimonials),
  contact: libEntry(Contact, contactMeta),
  footer: libEntry(Footer),
};
