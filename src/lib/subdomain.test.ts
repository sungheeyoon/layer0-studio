import { describe, it, expect } from 'vitest';
import { subdomainFor } from './subdomain';

describe('subdomainFor', () => {
  const ROOT = 'layer0.studio';

  it('classifies the exact root as apex', () => {
    expect(subdomainFor('layer0.studio', ROOT)).toEqual({ kind: 'apex' });
  });

  it('classifies www as www (not a site)', () => {
    expect(subdomainFor('www.layer0.studio', ROOT)).toEqual({ kind: 'www' });
  });

  it('extracts a single-label subdomain as a site', () => {
    expect(subdomainFor('myshop.layer0.studio', ROOT)).toEqual({
      kind: 'site',
      label: 'myshop',
    });
  });

  it('handles a root domain that carries a port (local dev)', () => {
    const root = 'localhost:3000';
    expect(subdomainFor('localhost:3000', root)).toEqual({ kind: 'apex' });
    expect(subdomainFor('www.localhost:3000', root)).toEqual({ kind: 'www' });
    expect(subdomainFor('myshop.localhost:3000', root)).toEqual({
      kind: 'site',
      label: 'myshop',
    });
  });

  it('rejects multi-level hosts (a.b.root) — falls back to apex', () => {
    expect(subdomainFor('a.b.layer0.studio', ROOT)).toEqual({ kind: 'apex' });
  });

  it('lowercases the host before classifying', () => {
    expect(subdomainFor('MyShop.Layer0.Studio', ROOT)).toEqual({
      kind: 'site',
      label: 'myshop',
    });
  });

  it('treats a host outside the configured root as apex (preview, unknown root)', () => {
    expect(subdomainFor('layer0-studio.vercel.app', ROOT)).toEqual({ kind: 'apex' });
    expect(subdomainFor('myshop.example.com', ROOT)).toEqual({ kind: 'apex' });
  });

  it('does not mistake a root-suffixed host for a subdomain', () => {
    // `notlayer0.studio` ends with `studio` but not with `.layer0.studio`.
    expect(subdomainFor('notlayer0.studio', ROOT)).toEqual({ kind: 'apex' });
  });
});
