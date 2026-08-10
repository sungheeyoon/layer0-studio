import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseUserSiteRepositoryImpl } from '@/data/repositories/supabase-user-site.repository.impl';
import { SiteWriteUseCase } from '@/domain/usecases/user-site/site-write.usecase';
import { LibraryAwareSiteContentValidator } from '@/lib/template/site-content-validator';
import { ContentAssetUsageCollector } from '@/lib/template/asset-usages';

const siteContentValidator = new LibraryAwareSiteContentValidator();
// The other half of the content-write pass. Both collaborators read the content
// against its Template library, and this module is one of the two the ADR-0008
// registry-isolation rule allows to know that — see the port docs.
const assetUsageCollector = new ContentAssetUsageCollector();

export const createSiteWriteUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseUserSiteRepositoryImpl(supabase);
  return new SiteWriteUseCase(repository, siteContentValidator, assetUsageCollector);
};
