import { ThemeModule } from './types';
import { themeMap, getAvailableThemeKeys as getGeneratedKeys } from './_generated';

export function getAvailableThemeKeys(): string[] {
  return getGeneratedKeys();
}

export async function loadTheme(themeKey: string): Promise<ThemeModule | null> {
  const loader = themeMap[themeKey];
  if (!loader) return null;
  return loader();
}
