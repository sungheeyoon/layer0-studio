'use client';

import { useDictionary } from '@/lib/i18n/provider';

/**
 * The inline warnings under one editor input.
 *
 * These never block anything. After [ADR-0015](../../../docs/adr/0015-edit-loss-paths-exhaustive-defense.md)
 * §4 every rule a User can trigger is a Warning rule — the save goes through
 * either way — so this is the only place the feedback exists. It explains how a
 * value will come out on the published Site.
 *
 * Styled `warning`, never `destructive`: nothing here has failed, and nothing
 * here needs fixing before the User can carry on.
 */
export function FieldIssues({ codes }: { codes?: string[] }) {
  const messages = useDictionary().editor.validation as Record<string, string>;
  if (!codes?.length) return null;

  const texts = codes.map((code) => messages[code]).filter(Boolean);
  if (texts.length === 0) return null;

  return (
    <ul className="space-y-0.5">
      {texts.map((text) => (
        <li key={text} className="text-xs leading-relaxed text-warning">
          {text}
        </li>
      ))}
    </ul>
  );
}
