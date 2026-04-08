import { IAuthRepository } from '../repositories/auth.repository';
import { AuthError } from '../errors/auth.error';

export class SignupUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string, password: string) {
    if (!email.includes('@')) {
      throw new AuthError('INVALID_EMAIL');
    }

    if (password.length < 6) {
      throw new AuthError('WEAK_PASSWORD');
    }

    const user = await this.authRepository.signup(email, password);
    return user;
  }
}
