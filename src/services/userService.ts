import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/userRepository';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(name: string, email: string, password: string) {
    const existingUser = await this.userRepository.getUserByEmail(email);
    if (existingUser) {
      throw new Error('E-mail já cadastrado.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    return this.userRepository.createUser(name, email, passwordHash);
  }

  async getUserById(userId: number) {
    const user = await this.userRepository.getUserById(userId);
    if (!user) throw new Error('Usuário não encontrado.');
    return user;
  }

  async updateUser(userId: number, data: { name?: string; email?: string }) {
    return this.userRepository.updateUser(userId, data);
  }

  async deleteUser(userId: number) {
    return this.userRepository.deleteUser(userId);
  }
}
