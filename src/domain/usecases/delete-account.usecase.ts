import { IAuthRepository } from '../repositories/auth.repository';

export class DeleteAccountUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    await this.authRepository.deleteUser(userId);
  }
}
