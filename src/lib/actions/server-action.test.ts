import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toActionError } from './server-action';
import { TemplateError } from '@/domain/errors/template.error';
import { AuthError } from '@/domain/errors/auth.error';
import { AssetValidationError } from '@/domain/entities/asset.entity';

describe('toActionError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps a TemplateError to its stable code', () => {
    expect(toActionError(new TemplateError('DOMAIN_TAKEN'))).toEqual({ error: 'DOMAIN_TAKEN' });
  });

  it('logs validation issues but still returns only the code', () => {
    const err = new TemplateError('INVALID_TEMPLATE_JSON', [
      { code: 'required', path: 'sections[0].title', message: 'Title is required' },
    ]);
    expect(toActionError(err)).toEqual({ error: 'INVALID_TEMPLATE_JSON' });
    expect(console.warn).toHaveBeenCalled();
  });

  it('maps an AuthError to its code', () => {
    expect(toActionError(new AuthError('WRONG_CREDENTIALS'))).toEqual({ error: 'WRONG_CREDENTIALS' });
  });

  it('passes an AssetValidationError message through', () => {
    const err = new AssetValidationError('File too big');
    expect(toActionError(err)).toEqual({ error: 'File too big' });
  });

  it('collapses unknown errors to UNKNOWN and logs them', () => {
    expect(toActionError(new Error('boom'))).toEqual({ error: 'UNKNOWN' });
    expect(console.error).toHaveBeenCalled();
  });
});
