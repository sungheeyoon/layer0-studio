import { User } from '../entities/user.entity';

export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  signup(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
}
