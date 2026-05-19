import { TemplateLibrary, libEntry } from '../../types';
import Nav from './Nav';
import { navMeta } from './Nav.meta';
import Hero from './Hero';
import Marquee from './Marquee';
import Programs from './Programs';
import Facility from './Facility';
import Trainers from './Trainers';
import Testimonials from './Testimonials';
import Join from './Join';
import Footer from './Footer';

export const fitnessLibrary: TemplateLibrary = {
  nav: libEntry(Nav, navMeta),
  hero: libEntry(Hero),
  marquee: libEntry(Marquee),
  programs: libEntry(Programs),
  facility: libEntry(Facility),
  trainers: libEntry(Trainers),
  testimonials: libEntry(Testimonials),
  join: libEntry(Join),
  footer: libEntry(Footer),
};
