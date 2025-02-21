import { Request, Response } from 'express';
import { CommentService } from '../services/commentService';

export class CommentController {
  private commentService: CommentService;

  constructor() {
    this.commentService = new CommentService();
  }

  createComment = async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      const postId = req.params.postId;
      const userId = (req as any).userId;

      const comment = await this.commentService.createComment(postId, userId, content);
      res.status(201).json({ message: 'Comentário criado com sucesso', comment });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ message: error.message || 'Erro interno do servidor' });
    }
  };
}
