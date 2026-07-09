import { ContentModel } from '@/domain/entities/template.entity';
import {
  SiteContentValidator,
  SiteContentValidationResult,
} from '@/domain/usecases/ports/site-content-validator.port';
import { getAvailableTemplateKeys, loadTemplate } from '@/templates/registry';
import { validateContent } from './validate';

/**
 * Concrete {@link SiteContentValidator}: loads the Template library for the
 * site's `templateKey` and delegates to the deep, library-aware
 * `validateContent` — the same rules Sync runs. This is the seam that lets
 * the Editor save path (a domain use case) reach library-aware validation
 * without the domain layer importing template/infra code directly.
 *
 * An unknown `templateKey` yields a null module; `validateContent` then
 * reports `UNKNOWN_TEMPLATE_KEY` because `availableTemplateKeys` is supplied.
 */
export class LibraryAwareSiteContentValidator implements SiteContentValidator {
  async validate(json: ContentModel): Promise<SiteContentValidationResult> {
    const mod = await loadTemplate(json.templateKey);
    return validateContent(json, {
      availableTemplateKeys: getAvailableTemplateKeys(),
      templateLibrary: mod?.library,
    });
  }
}
