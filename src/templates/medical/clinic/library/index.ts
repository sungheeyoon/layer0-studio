import { TemplateLibrary, libEntry } from '../../../types';
import Navigation from './Navigation';
import Hero from './Hero';
import PageHeader from './PageHeader';
import Pillars from './Pillars';
import Departments from './Departments';
import Doctors from './Doctors';
import FeatureSplit from './FeatureSplit';
import Gallery from './Gallery';
import Testimonials from './Testimonials';
import Timeline from './Timeline';
import Process from './Process';
import Faq from './Faq';
import Stats from './Stats';
import Contact from './Contact';
import AppointmentForm from './AppointmentForm';
import CtaBanner from './CtaBanner';
import Footer from './Footer';

export const medicalClinicLibrary: TemplateLibrary = {
  nav: libEntry(Navigation),
  hero: libEntry(Hero),
  pageHeader: libEntry(PageHeader),
  pillars: libEntry(Pillars),
  departments: libEntry(Departments),
  doctors: libEntry(Doctors),
  featureSplit: libEntry(FeatureSplit),
  gallery: libEntry(Gallery),
  testimonials: libEntry(Testimonials),
  timeline: libEntry(Timeline),
  process: libEntry(Process),
  faq: libEntry(Faq),
  stats: libEntry(Stats),
  contact: libEntry(Contact),
  appointmentForm: libEntry(AppointmentForm),
  ctaBanner: libEntry(CtaBanner),
  footer: libEntry(Footer),
};
