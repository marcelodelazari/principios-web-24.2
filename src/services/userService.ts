import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';

export class UserService {
    private userRepository: UserRepository;

    constructor() {
    this.userRepository = new UserRepository();
    }

    async register(name: string, email: string, password: string) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) throw new Error('Usuário já existe');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        return await this.userRepository.createUser(name, email, passwordHash);
    }

    async login(email: string, password: string) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) throw new Error('Usuário não encontrado');

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) throw new Error('Senha incorreta');

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '1h',
        });

        return { token, user };
    }

    async getUserById(id: number) {
        return await this.userRepository.findById(id) || null;
    }

    async updateUser(id: number, name: string, email: string) {
        return await this.userRepository.updateUser(id, name, email);
    }

    async deleteUser(id: number) {
        await this.userRepository.deleteUser(id);
    }
    }