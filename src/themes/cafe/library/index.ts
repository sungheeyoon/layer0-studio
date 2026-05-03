import { ThemeLibrary } from '../../types';
import Navigation from './Navigation';
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
  nav: Navigation,
  'hero-image': HeroImage,
  'hero-video': HeroVideo,
  'hero-split': HeroSplit,
  marquee: Marquee,
  menu: MenuBento,
  story: Story,
  space: Space,
  testimonials: Testimonials,
  visit: Visit,
  footer: Footer,
  // Legacy mappings for backward compatibility during transition
  hero: HeroImage,
};
