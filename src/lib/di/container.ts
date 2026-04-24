import { SupabaseClient } from '@supabase/supabase-js';

// Auth
import { SupabaseAuthRepositoryImpl } from '@/data/repositories/supabase-auth.repository.impl';
import { LoginUseCase } from '@/domain/usecases/login.usecase';
import { SignupUseCase } from '@/domain/usecases/signup.usecase';
import { LogoutUseCase } from '@/domain/usecases/logout.usecase';
import { DeleteAccountUseCase } from '@/domain/usecases/delete-account.usecase';
import { ChangePasswordUseCase } from '@/domain/usecases/change-password.usecase';

// Template
import { SupabaseTemplateRepositoryImpl } from '@/data/repositories/supabase-template.repository.impl';
import { ListTemplatesUseCase } from '@/domain/usecases/template/list-templates.usecase';
import { GetTemplateUseCase } from '@/domain/usecases/template/get-template.usecase';
import { CreateTemplateUseCase } from '@/domain/usecases/template/create-template.usecase';
import { UpdateTemplateUseCase } from '@/domain/usecases/template/update-template.usecase';
import { DeleteTemplateUseCase } from '@/domain/usecases/template/delete-template.usecase';

// UserSite
import { SupabaseUserSiteRepositoryImpl } from '@/data/repositories/supabase-user-site.repository.impl';
import { ListUserSitesUseCase } from '@/domain/usecases/user-site/list-user-sites.usecase';
import { GetUserSiteUseCase } from '@/domain/usecases/user-site/get-user-site.usecase';
import { CreateSiteFromTemplateUseCase } from '@/domain/usecases/user-site/create-site-from-template.usecase';
import { UpdateSiteJsonUseCase } from '@/domain/usecases/user-site/update-site-json.usecase';
import { DeleteUserSiteUseCase } from '@/domain/usecases/user-site/delete-user-site.usecase';
import { GetPublishedSiteUseCase } from '@/domain/usecases/user-site/get-published-site.usecase';
import { PublishSiteUseCase } from '@/domain/usecases/user-site/publish-site.usecase';
import { UpdateSiteDomainUseCase } from '@/domain/usecases/user-site/update-site-domain.usecase';
import { AdminUpdateSiteUseCase } from '@/domain/usecases/user-site/admin-update-site.usecase';

// Asset
import { SupabaseAssetRepositoryImpl } from '@/data/repositories/supabase-asset.repository.impl';
import { AssetUploadUseCase } from '@/domain/usecases/asset-upload.usecase';

// --- Auth UseCases -----------------------------------------------------------

export const createLoginUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseAuthRepositoryImpl(supabase);
  return new LoginUseCase(repository);
};

export const createSignupUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseAuthRepositoryImpl(supabase);
  return new SignupUseCase(repository);
};

export const createLogoutUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseAuthRepositoryImpl(supabase);
  return new LogoutUseCase(repository);
};

export const createDeleteAccountUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseAuthRepositoryImpl(supabase);
  return new DeleteAccountUseCase(repository);
};

export const createChangePasswordUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseAuthRepositoryImpl(supabase);
  return new ChangePasswordUseCase(repository);
};

// --- Template UseCases -------------------------------------------------------

export const createListTemplatesUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseTemplateRepositoryImpl(supabase);
  return new ListTemplatesUseCase(repository);
};

export const createGetTemplateUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseTemplateRepositoryImpl(supabase);
  return new GetTemplateUseCase(repository);
};

export const createCreateTemplateUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseTemplateRepositoryImpl(supabase);
  return new CreateTemplateUseCase(repository);
};

export const createUpdateTemplateUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseTemplateRepositoryImpl(supabase);
  return new UpdateTemplateUseCase(repository);
};

export const createDeleteTemplateUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseTemplateRepositoryImpl(supabase);
  return new DeleteTemplateUseCase(repository);
};

// --- UserSite UseCases -------------------------------------------------------

export const createListUserSitesUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseUserSiteRepositoryImpl(supabase);
  return new ListUserSitesUseCase(repository);
};

export const createGetUserSiteUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseUserSiteRepositoryImpl(supabase);
  return new GetUserSiteUseCase(repository);
};

export const createCreateSiteFromTemplateUseCase = (supabase: SupabaseClient) => {
  const templateRepo = new SupabaseTemplateRepositoryImpl(supabase);
  const userSiteRepo = new SupabaseUserSiteRepositoryImpl(supabase);
  return new CreateSiteFromTemplateUseCase(templateRepo, userSiteRepo);
};

export const createUpdateSiteJsonUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseUserSiteRepositoryImpl(supabase);
  return new UpdateSiteJsonUseCase(repository);
};

export const createDeleteUserSiteUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseUserSiteRepositoryImpl(supabase);
  return new DeleteUserSiteUseCase(repository);
};

export const createGetPublishedSiteUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseUserSiteRepositoryImpl(supabase);
  return new GetPublishedSiteUseCase(repository);
};

export const createPublishSiteUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseUserSiteRepositoryImpl(supabase);
  return new PublishSiteUseCase(repository);
};

export const createUpdateSiteDomainUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseUserSiteRepositoryImpl(supabase);
  return new UpdateSiteDomainUseCase(repository);
};

export const createAdminUpdateSiteUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseUserSiteRepositoryImpl(supabase);
  return new AdminUpdateSiteUseCase(repository);
};

// --- Asset UseCases ----------------------------------------------------------

export const createAssetUploadUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseAssetRepositoryImpl(supabase);
  return new AssetUploadUseCase(repository);
};
