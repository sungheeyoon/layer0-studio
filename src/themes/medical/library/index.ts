import { ThemeLibrary, libEntry } from '../../types';
import Nav from './Nav';
import Hero from './Hero';
import Marquee from './Marquee';
import Services from './Services';
import Space from './Space';
import Why from './Why';
import Team from './Team';
import Testimonials from './Testimonials';
import Booking from './Booking';
import Footer from './Footer';

export const medicalLibrary: ThemeLibrary = {
  nav: libEntry(Nav),
  hero: libEntry(Hero),
  marquee: libEntry(Marquee),
  services: libEntry(Services),
  space: libEntry(Space),
  why: libEntry(Why),
  team: libEntry(Team),
  testimonials: libEntry(Testimonials),
  booking: libEntry(Booking),
  footer: libEntry(Footer),
};
