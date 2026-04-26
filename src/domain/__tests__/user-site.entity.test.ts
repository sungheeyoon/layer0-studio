import { describe, it, expect } from 'vitest';
import { validateDomainSlug, RESERVED_DOMAINS } from '../entities/user-site.entity';

describe('validateDomainSlug', () => {
  it('returns lowercased trimmed slug for valid input', () => {
    expect(validateDomainSlug('  MyShop  ')).toBe('myshop');
  });

  it('throws for slug shorter than 3 chars', () => {
    expect(() => validateDomainSlug('ab')).toThrow();
  });

  it('throws for slug longer than 50 chars', () => {
    expect(() => validateDomainSlug('a'.repeat(51))).toThrow();
  });

  it('accepts 3-char slug (min boundary)', () => {
    expect(validateDomainSlug('abc')).toBe('abc');
  });

  it('accepts 50-char slug (max boundary)', () => {
    const slug = 'a'.repeat(50);
    expect(validateDomainSlug(slug)).toBe(slug);
  });

  it('lowercases before validation so mixed-case is valid', () => {
    expect(validateDomainSlug('My-Shop')).toBe('my-shop');
  });

  it('throws for slug with spaces', () => {
    expect(() => validateDomainSlug('my shop')).toThrow();
  });

  it('throws for slug with leading hyphen', () => {
    expect(() => validateDomainSlug('-myshop')).toThrow();
  });

  it('throws for slug with trailing hyphen', () => {
    expect(() => validateDomainSlug('myshop-')).toThrow();
  });

  it('throws for slug with underscore', () => {
    expect(() => validateDomainSlug('my_shop')).toThrow();
  });

  it('throws for slug with dot', () => {
    expect(() => validateDomainSlug('my.shop')).toThrow();
  });

  it('throws for each reserved domain', () => {
    for (const reserved of RESERVED_DOMAINS) {
      expect(() => validateDomainSlug(reserved), `"${reserved}" should be rejected`).toThrow();
    }
  });

  it('accepts hyphens between words', () => {
    expect(validateDomainSlug('my-awesome-shop')).toBe('my-awesome-shop');
  });

  it('accepts numbers in slug', () => {
    expect(validateDomainSlug('shop123')).toBe('shop123');
  });

  it('accepts slug starting with a number', () => {
    expect(validateDomainSlug('123shop')).toBe('123shop');
  });
});
