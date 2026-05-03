import { ThemeLibrary, libEntry } from '../../types';
import Navigation from './Navigation';
import { navigationMeta } from './Navigation.meta';
import HeroImage from './HeroImage';
import HeroVideo from './HeroVideo';
import HeroSplit from './HeroSplit';
import Marquee from './Marquee';
import MenuBento from './MenuBento';
import Story from './Story';
import Space from './Space';
import Testimonials from './Testimonials';
import Visit from './Visit';
import Footer from './Footer';

export const cafeLibrary: ThemeLibrary = {
  nav: libEntry(Navigation, navigationMeta),
  'hero-image': libEntry(HeroImage),
  'hero-video': libEntry(HeroVideo),
  'hero-split': libEntry(HeroSplit),
  marquee: libEntry(Marquee),
  menu: libEntry(MenuBento),
  story: libEntry(Story),
  space: libEntry(Space),
  testimonials: libEntry(Testimonials),
  visit: libEntry(Visit),
  footer: libEntry(Footer),
  // Legacy mapping for backward compatibility
  hero: libEntry(HeroImage),
};
