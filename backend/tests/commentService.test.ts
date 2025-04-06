import { CommentService } from '../src/services/commentService';
import { CommentRepository } from '../src/repositories/commentRepository';
import { VoteType, Comment, CommentVote } from "@prisma/client";

jest.mock('../src/repositories/commentRepository');

const mockComment: Comment & { 
  author: { name: string };
  votes: CommentVote[];
  post: { id: number };
} = {
  id: 1,
  postId: 1,
  authorId: 1,
  content: "Test Comment",
  createdAt: new Date(),
  author: {
    name: "Test Author"
  },
  votes: [],
  post: { id: 1 } // Adicionar relação post
};

describe('CommentService', () => {
  let commentService: CommentService;
  const mockRepository = CommentRepository as jest.MockedClass<typeof CommentRepository>;

  beforeEach(() => {
    mockRepository.mockClear();
    commentService = new CommentService();
    commentService['commentRepository'] = new mockRepository();
  });

  describe('createComment', () => {
    it('deve criar comentário com sucesso', async () => {
      mockRepository.prototype.createComment.mockResolvedValue(mockComment);

      const result = await commentService.createComment('1', '1', 'Content');
      
      expect(result).toEqual(mockComment);
      expect(mockRepository.prototype.createComment).toHaveBeenCalledWith(
        '1', '1', 'Content'
      );
    });
  });

  describe('getCommentsByPost', () => {
    it('deve retornar lista de comentários', async () => {
      mockRepository.prototype.getCommentsByPost.mockResolvedValue([mockComment]);

      const result = await commentService.getCommentsByPost('1');
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockComment.id.toString());
    });
  });

  describe('voteComment', () => {
    it('deve registrar voto válido', async () => {
      mockRepository.prototype.handleVote.mockResolvedValue({
        newScore: 1,
        userVote: VoteType.upvote,
      });

      const result = await commentService.voteComment('1', '1', 'upvote');
      
      expect(result.newScore).toBe(1);
      expect(mockRepository.prototype.handleVote).toHaveBeenCalledWith(
        1, 1, 'upvote'
      );
    });
  });
});