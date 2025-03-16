import { PostService } from '../src/services/postService';
import { PostRepository } from '../src/repositories/postRepository';
import { UserService } from '../src/services/userService';

jest.mock('../src/repositories/postRepository');
jest.mock('../src/repositories/userRepository');

describe('PostService', () => {
  let postService: PostService;
  let postRepository: jest.Mocked<PostRepository>;
  let userService: UserService;

  let mockUser: { id: number; name: string; email: string };

  beforeEach(() => {
    postRepository = new PostRepository() as jest.Mocked<PostRepository>;
    postService = new PostService();
    userService = new UserService();
    
    (postService as any).postRepository = postRepository;

    // Criando um usuário simulado para testar a postagem
    mockUser = {
      id: 1,
      name: 'Teste',
      email: 'teste@email.com'
    };
  });

  it('deve criar uma postagem com sucesso', async () => {
    const mockPost = {
      id: 1,
      title: 'Post de Teste',
      content: 'Conteúdo do post',
      authorId: mockUser.id,
      createdAt: new Date(),
    };

    postRepository.createPost.mockResolvedValue(mockPost);

    const result = await postService.createPost('Post de Teste', 'Conteúdo do post', mockUser.id.toString());

    expect(result).toEqual(expect.objectContaining({
      id: expect.any(Number),
      title: 'Post de Teste',
      content: 'Conteúdo do post',
      authorId: mockUser.id,
      createdAt: expect.any(Date),
    }));
    expect(postRepository.createPost).toHaveBeenCalledWith('Post de Teste', 'Conteúdo do post', mockUser.id.toString());
  });
  
  it('não deve criar uma postagem sem título', async () => {
    await expect(postService.createPost('', 'Conteúdo do post', mockUser.id.toString()))
      .rejects
      .toThrowError('Título e conteúdo são obrigatórios');
  });

  it('não deve criar uma postagem sem conteúdo', async () => {
    await expect(postService.createPost('Post de Teste', '', mockUser.id.toString()))
      .rejects
      .toThrowError('Título e conteúdo são obrigatórios');
  });
});
