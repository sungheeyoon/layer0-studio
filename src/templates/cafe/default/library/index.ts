import { TemplateLibrary, libEntry } from '../../../types';
import Navigation from './Navigation';
import { navigationMeta } from './Navigation.meta';
import HeroImage from './HeroImage';
import Marquee from './Marquee';
import MenuBento from './MenuBento';
import Story from './Story';
import Space from './Space';
import Testimonials from './Testimonials';
import Visit from './Visit';
import Footer from './Footer';

export const cafeDefaultLibrary: TemplateLibrary = {
  nav: libEntry(Navigation, navigationMeta),
  hero: libEntry(HeroImage),
  marquee: libEntry(Marquee),
  menu: libEntry(MenuBento),
  story: libEntry(Story),
  space: libEntry(Space),
  testimonials: libEntry(Testimonials),
  visit: libEntry(Visit),
  footer: libEntry(Footer),
};
