import { TemplateLibrary, libEntry } from '../../../types';
import Navigation from './Navigation';
import { navigationMeta } from './Navigation.meta';
import HeroSplit from './HeroSplit';
import Story from './Story';
import Visit from './Visit';
import Footer from './Footer';

export const cafeCozyLibrary: TemplateLibrary = {
  nav: libEntry(Navigation, navigationMeta),
  'hero-split': libEntry(HeroSplit),
  story: libEntry(Story),
  visit: libEntry(Visit),
  footer: libEntry(Footer),
};
