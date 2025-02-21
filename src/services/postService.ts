import { CommentRepository } from '../repositories/commentRepository';

export class CommentService {
  private commentRepository: CommentRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
  }

  async createComment(postId: string, userId: string, content: string) {
    if (!content) {
      throw new Error('Conteúdo do comentário é obrigatório');
    }
    return this.commentRepository.createComment(postId, userId, content);
  }
}