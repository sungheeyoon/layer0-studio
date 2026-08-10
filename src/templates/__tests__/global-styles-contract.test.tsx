import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';

const templatesRoot = path.join(process.cwd(), 'src', 'templates');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const absolute = path.join(dir, name);
    if (statSync(absolute).isDirectory()) return sourceFiles(absolute);
    return /\.(css|ts|tsx)$/.test(name) ? [absolute] : [];
  });
}

const templateDirs = readdirSync(templatesRoot).flatMap((category) => {
  const categoryDir = path.join(templatesRoot, category);
  if (!statSync(categoryDir).isDirectory()) return [];

  return readdirSync(categoryDir)
    .map((leaf) => path.join(categoryDir, leaf))
    .filter((dir) => statSync(dir).isDirectory() && existsSync(path.join(dir, 'template.ts')));
});

describe('GlobalStyles contract', () => {
  for (const templateDir of templateDirs) {
    const templateKey = path.relative(templatesRoot, templateDir).replaceAll(path.sep, '-');

    it(`${templateKey} consumes secondaryColor in its renderer styles`, () => {
      const source = sourceFiles(templateDir)
        .map((file) => readFileSync(file, 'utf8'))
        .join('\n');

      expect(source).toMatch(/var\(--(?:theme|color)-secondary(?:[,)]|\s)/);
    });
  }
});
