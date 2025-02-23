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
      res.status(201).json({ message: 'O comentário foi criado com sucesso', comment });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ message: error.message || 'Erro interno do servidor' });
    }
  };
  
  getCommentsByPost = async (req: Request, res: Response) => {
    try {
      const postId = req.params.postId;
      const comments = await this.commentService.getCommentsByPost(postId);
      res.status(200).json(comments);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro interno do servidor' });
    }
  };

  updateComment = async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      const commentId = req.params.commentId;
      const userId = (req as any).userId;

      const updatedComment = await this.commentService.updateComment(commentId, userId, content);
      res.status(200).json({ message: 'Comentário atualizado com sucesso', updatedComment });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro interno do servidor' });
    }
  };

  deleteComment = async (req: Request, res: Response) => {
    try {
      const commentId = req.params.commentId;
      const userId = (req as any).userId;

      const result = await this.commentService.deleteComment(commentId, userId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro interno do servidor' });
    }
  };
}
