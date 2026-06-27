import { TemplateLibrary, libEntry } from '../../../types';
import Navigation from './Navigation';
import Hero from './Hero';
import PageHeader from './PageHeader';
import Pillars from './Pillars';
import FeatureSplit from './FeatureSplit';
import ProductGrid from './ProductGrid';
import CollectionGrid from './CollectionGrid';
import ActivityGrid from './ActivityGrid';
import JournalGrid from './JournalGrid';
import Stats from './Stats';
import CtaBanner from './CtaBanner';
import Contact from './Contact';
import Footer from './Footer';

export const outdoorDefaultLibrary: TemplateLibrary = {
  nav: libEntry(Navigation),
  hero: libEntry(Hero),
  pageHeader: libEntry(PageHeader),
  pillars: libEntry(Pillars),
  featureSplit: libEntry(FeatureSplit),
  productGrid: libEntry(ProductGrid),
  collectionGrid: libEntry(CollectionGrid),
  activityGrid: libEntry(ActivityGrid),
  journalGrid: libEntry(JournalGrid),
  stats: libEntry(Stats),
  ctaBanner: libEntry(CtaBanner),
  contact: libEntry(Contact),
  footer: libEntry(Footer),
};
