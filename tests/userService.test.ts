import { UserService } from '../src/services/userService';
import { UserRepository } from '../src/repositories/userRepository';

jest.mock('../src/repositories/userRepository');

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService();
    (userService as any).userRepository = userRepository;
  });

  it('deve criar um usuário com sucesso', async () => {
    const mockUser = {
      id: 1,
      name: 'Teste',
      email: 'teste@email.com',
      passwordHash: 'hash123',
      createdAt: new Date()
    };
    userRepository.createUser.mockResolvedValue(mockUser);
    userRepository.getUserByEmail.mockResolvedValue(null);

    const result = await userService.createUser('Teste', 'teste@email.com', 'senha123');

    expect(result).toEqual(expect.objectContaining({
      id: expect.any(Number),
      name: 'Teste',
      email: 'teste@email.com',
      passwordHash: expect.any(String),
      createdAt: expect.any(Date)
    }));
    expect(userRepository.createUser).toHaveBeenCalled();
  });
});