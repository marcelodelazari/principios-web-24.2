import { CommentService } from '../src/services/commentService';
import { CommentRepository } from '../src/repositories/commentRepository';
import { pool } from '../src/config/db';

jest.mock('../src/repositories/commentRepository');

describe('CommentService', () => {
  let commentService: CommentService;
  let commentRepository: jest.Mocked<CommentRepository>;

  beforeEach(() => {
    commentRepository = new CommentRepository() as jest.Mocked<CommentRepository>;
    commentService = new CommentService();
    // Injeta o mock do repositório para que o serviço utilize o mock
    (commentService as any).commentRepository = commentRepository;
  });

  describe('createComment', () => {
    it('deve criar um comentário com sucesso', async () => {
      const mockComment = {
        id: 1,
        postId: '1',
        authorId: '1',
        content: 'Comentário de teste',
        createdAt: new Date()
      };

      commentRepository.createComment.mockResolvedValue(mockComment);

      const result = await commentService.createComment('1', '1', 'Comentário de teste');

      expect(result).toEqual(expect.objectContaining({
        id: expect.any(Number),
        postId: '1',
        authorId: '1',
        content: 'Comentário de teste',
        createdAt: expect.any(Date)
      }));
      expect(commentRepository.createComment).toHaveBeenCalledWith('1', '1', 'Comentário de teste');
    });

    it('deve lançar erro se o conteúdo do comentário não for informado', async () => {
      await expect(commentService.createComment('1', '1', ''))
        .rejects
        .toThrow('Conteúdo do comentário é obrigatório');
    });
  });

  describe('getCommentsByPost', () => {
    it('deve retornar uma lista de comentários para um post', async () => {
      const mockComments = [
        {
          id: 1,
          postId: '1',
          authorId: '1',
          content: 'Comentário 1',
          createdAt: new Date()
        },
        {
          id: 2,
          postId: '1',
          authorId: '2',
          content: 'Comentário 2',
          createdAt: new Date()
        }
      ];

      commentRepository.getCommentsByPost.mockResolvedValue(mockComments);

      const result = await commentService.getCommentsByPost('1');

      expect(result).toEqual(mockComments);
      expect(commentRepository.getCommentsByPost).toHaveBeenCalledWith('1');
    });
  });

  describe('updateComment', () => {
    it('deve atualizar um comentário com sucesso', async () => {
      const mockUpdatedComment = {
        id: 1,
        postId: '1',
        authorId: '1',
        content: 'Comentário atualizado',
        createdAt: new Date()
      };

      commentRepository.updateComment.mockResolvedValue(mockUpdatedComment);

      const result = await commentService.updateComment('1', '1', 'Comentário atualizado');

      expect(result).toEqual(mockUpdatedComment);
      expect(commentRepository.updateComment).toHaveBeenCalledWith('1', '1', 'Comentário atualizado');
    });

    it('deve lançar erro se o conteúdo do comentário estiver vazio ao atualizar', async () => {
      await expect(commentService.updateComment('1', '1', ''))
        .rejects
        .toThrow('Conteúdo do comentário é obrigatório');
    });

    it('deve lançar erro se o comentário não for encontrado ou o usuário não estiver autorizado', async () => {
      commentRepository.updateComment.mockResolvedValue(null);

      await expect(commentService.updateComment('1', '1', 'Comentário atualizado'))
        .rejects
        .toThrow('Comentário não encontrado ou usuário não autorizado');
    });
  });

  describe('deleteComment', () => {
    it('deve deletar um comentário com sucesso', async () => {
      commentRepository.deleteComment.mockResolvedValue(true);

      const result = await commentService.deleteComment('1', '1');

      expect(result).toEqual({ message: 'Comentário deletado com sucesso' });
      expect(commentRepository.deleteComment).toHaveBeenCalledWith('1', '1');
    });

    it('deve lançar erro se não for possível deletar o comentário', async () => {
      commentRepository.deleteComment.mockResolvedValue(false);

      await expect(commentService.deleteComment('1', '1'))
        .rejects
        .toThrow('Comentário não encontrado ou usuário não autorizado');
    });
  });
});

afterAll(async () => {
  await pool.end();
});
