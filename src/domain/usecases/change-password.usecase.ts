import { IAuthRepository } from '../repositories/auth.repository';
import { AuthError } from '../errors/auth.error';

export class ChangePasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(password: string) {
    if (password.length < 6) {
      throw new AuthError('WEAK_PASSWORD');
    }

    await this.authRepository.updatePassword(password);
  }
}
