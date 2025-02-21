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

  async getCommentsByPost(postId: string) {
    return this.commentRepository.getCommentsByPost(postId);
  }

  async updateComment(commentId: string, userId: string, content: string) {
    if (!content) {
      throw new Error('Conteúdo do comentário é obrigatório');
    }

    const updatedComment = await this.commentRepository.updateComment(commentId, userId, content);
    if (!updatedComment) {
      throw new Error('Comentário não encontrado ou usuário não autorizado');
    }
    
    return updatedComment;
  }

  async deleteComment(commentId: string, userId: string) {
    const deleted = await this.commentRepository.deleteComment(commentId, userId);
    if (!deleted) {
      throw new Error('Comentário não encontrado ou usuário não autorizado');
    }

    return { message: 'Comentário deletado com sucesso' };
  }
}