import { TemplateLibrary, libEntry } from '../../../types';
import Navigation from './Navigation';
import { navigationMeta } from './Navigation.meta';
import Hero from './Hero';
import Features from './Features';
import Curriculum from './Curriculum';
import Teachers from './Teachers';
import Tuition from './Tuition';
import Results from './Results';
import Contact from './Contact';
import { contactMeta } from './Contact.meta';
import Location from './Location';
import Footer from './Footer';

export const academyDefaultLibrary: TemplateLibrary = {
  nav: libEntry(Navigation, navigationMeta),
  hero: libEntry(Hero),
  features: libEntry(Features),
  curriculum: libEntry(Curriculum),
  teachers: libEntry(Teachers),
  tuition: libEntry(Tuition),
  results: libEntry(Results),
  contact: libEntry(Contact, contactMeta),
  location: libEntry(Location),
  footer: libEntry(Footer),
};
