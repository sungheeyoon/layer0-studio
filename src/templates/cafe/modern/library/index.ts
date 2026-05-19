import { TemplateLibrary, libEntry } from '../../../types';
import Navigation from './Navigation';
import { navigationMeta } from './Navigation.meta';
import HeroVideo from './HeroVideo';
import Marquee from './Marquee';
import MenuBento from './MenuBento';
import Footer from './Footer';

export const cafeModernLibrary: TemplateLibrary = {
  nav: libEntry(Navigation, navigationMeta),
  'hero-video': libEntry(HeroVideo),
  marquee: libEntry(Marquee),
  menu: libEntry(MenuBento),
  footer: libEntry(Footer),
};
