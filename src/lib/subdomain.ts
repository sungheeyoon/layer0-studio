/**
 * Classify an incoming `Host` against the configured root domain.
 *
 * Pure (env-free) on purpose — `rootDomain` is injected so the rule is unit
 * testable (see ADR-0009 §6). The middleware/callsites supply
 * `NEXT_PUBLIC_ROOT_DOMAIN`; this function never reads `process.env`.
 *
 * Structural extraction only. `label` is NOT validated here — reserved-word /
 * format rules live in the domain entity (`validateDomainSlug`), and an unknown
 * or reserved label simply resolves to a 404 when `findByDomain` returns null.
 *
 * - `apex`: host is exactly the root domain — also the catch-all for any host
 *   that isn't a clean single-label subdomain of the root (multi-level
 *   `a.b.root`, or a host that doesn't belong to the root at all, e.g. a
 *   `*.vercel.app` preview). These fall through to normal session handling.
 * - `www`: the `www.<root>` host (redirected to apex at the infra layer).
 * - `site`: a single-label subdomain `<label>.<root>` — the read-only Site origin.
 */
export type SubdomainResult =
  | { kind: 'apex' }
  | { kind: 'www' }
  | { kind: 'site'; label: string };

export function subdomainFor(host: string, rootDomain: string): SubdomainResult {
  const normalizedHost = host.toLowerCase();
  const normalizedRoot = rootDomain.toLowerCase();

  // Exact apex (port is part of the host/root in dev, e.g. `localhost:3000`).
  if (normalizedHost === normalizedRoot) return { kind: 'apex' };

  const suffix = `.${normalizedRoot}`;
  // Host doesn't belong to the configured root → not a subdomain (preview, etc.).
  if (!normalizedHost.endsWith(suffix)) return { kind: 'apex' };

  const label = normalizedHost.slice(0, -suffix.length);

  // Empty or multi-level (`a.b.root`) labels are not valid single-label sites.
  if (label === '' || label.includes('.')) return { kind: 'apex' };
  if (label === 'www') return { kind: 'www' };

  return { kind: 'site', label };
}
