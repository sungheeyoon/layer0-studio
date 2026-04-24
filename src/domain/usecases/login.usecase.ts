import { IAuthRepository } from '../repositories/auth.repository';
import { AuthError } from '../errors/auth.error';

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string, password: string) {
    // validation (email format)
    if (!email.includes('@')) {
      throw new AuthError('INVALID_EMAIL');
    }

    if (password.length < 6) {
      throw new AuthError('WEAK_PASSWORD');
    }

    const user = await this.authRepository.login(email, password);

    // After login logic
    // ex) audit log, analytics

    return user;
  }
}

