import { TemplateLibrary, libEntry } from '../../../types';
import Navigation from './Navigation';
import Content from './Content';
import Footer from './Footer';

export const corporateMultipageLibrary: TemplateLibrary = {
  nav: libEntry(Navigation),
  content: libEntry(Content),
  footer: libEntry(Footer),
};
