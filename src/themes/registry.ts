import { ThemeModule } from './types';

const themeMap: Record<string, () => Promise<ThemeModule>> = {
  corporate: () => import('./corporate'),
  wedding: () => import('./wedding'),
  legal: () => import('./legal'),
  medical: () => import('./medical'),
  fitness: () => import('./fitness'),
};

export function getAvailableThemeKeys(): string[] {
  return Object.keys(themeMap);
}

export async function loadTheme(themeKey: string): Promise<ThemeModule | null> {
  const loader = themeMap[themeKey];
  if (!loader) return null;
  return loader();
}
