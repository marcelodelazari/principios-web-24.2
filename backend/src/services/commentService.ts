import { CommentRepository } from "../repositories/commentRepository";
import { VoteType } from "@prisma/client";

export class CommentService {
  private commentRepository: CommentRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
  }

  async createComment(postId: string, userId: string, content: string) {
    if (!content) {
      throw new Error("Conteúdo do comentário é obrigatório");
    }
    return this.commentRepository.createComment(postId, userId, content);
  }

  async getCommentsByPost(postId: string, currentUserId?: number) {
    const comments = await this.commentRepository.getCommentsByPost(postId);

    return comments.map((comment) => {
      const score = comment.votes.reduce((acc, vote) => {
        return vote.voteType === "upvote" ? acc + 1 : acc - 1;
      }, 0);

      const userVote =
        currentUserId !== undefined
          ? comment.votes.find((v) => v.userId === currentUserId)?.voteType ||
            null
          : null;

      // Corrigindo a estrutura para manter authorName
      return {
        ...comment,
        id: comment.id.toString(),
        postId: comment.postId.toString(),
        authorId: comment.authorId.toString(),
        authorName: comment.author.name, // Adiciona o nome do autor aqui
        score,
        userVote,
        // Remove o objeto author se necessário
        author: undefined,
      };
    });
  }

  async updateComment(commentId: string, userId: string, content: string) {
    if (!content) {
      throw new Error("Conteúdo do comentário é obrigatório");
    }

    const updatedComment = await this.commentRepository.updateComment(
      commentId,
      userId,
      content
    );

    if (!updatedComment) {
      throw new Error("Comentário não encontrado ou usuário não autorizado");
    }

    return updatedComment;
  }

  async deleteComment(commentId: string, userId: string, isAdmin: boolean) {
    const deleted = await this.commentRepository.deleteComment(
      commentId,
      userId,
      isAdmin
    );

    if (!deleted) {
      throw new Error("Comentário não encontrado ou usuário não autorizado");
    }

    return { message: "Comentário deletado com sucesso" };
  }

  async voteComment(
    commentId: string,
    userId: string,
    voteType: string | null
  ) {
    if (voteType && !["upvote", "downvote"].includes(voteType)) {
      throw new Error("Tipo de voto inválido");
    }

    return this.commentRepository.handleVote(
      parseInt(commentId),
      parseInt(userId),
      voteType as VoteType | null
    );
  }
}
