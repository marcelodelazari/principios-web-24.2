import { Request, Response } from "express";
import { PostService } from "../services/postService";

export class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  // Método para criar post
  createPost = async (req: Request, res: Response) => {
    try {
      const { title, content } = req.body;
      const authorId = (req as any).userId;

      const post = await this.postService.createPost(title, content, authorId);
      res.status(201).json({ message: "Post criado com sucesso", post });
    } catch (error: any) {
      console.error(error);
      res
        .status(400)
        .json({ message: error.message || "Erro interno do servidor" });
    }
  };

  // Método para listar todos os posts
  // backend/src/controllers/postController.ts
  getPosts = async (req: Request, res: Response) => {
    try {
      const currentUserId = (req as any).userId;
      const posts = await this.postService.getPosts(currentUserId);
      res.status(200).json(posts);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Erro interno do servidor" });
    }
  };

  // Método para obter post por ID
  getPostById = async (req: Request, res: Response) => {
    try {
      const postId = req.params.postId;
      const currentUserId = (req as any).userId; // Novo
      const post = await this.postService.getPostById(postId, currentUserId); // Alterado
      res.status(200).json(post);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Erro interno do servidor" });
    }
  };

  // Método para atualizar post
  updatePost = async (req: Request, res: Response) => {
    try {
      const { title, content } = req.body;
      const postId = req.params.postId;
      const authorId = (req as any).userId;

      const updatedPost = await this.postService.updatePost(
        postId,
        authorId,
        title,
        content
      );
      res
        .status(200)
        .json({ message: "Post atualizado com sucesso", updatedPost });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Erro interno do servidor" });
    }
  };

  // Método para deletar post
  deletePost = async (req: Request, res: Response) => {
    try {
      const postId = req.params.postId;
      const authorId = (req as any).userId;
      const isAdmin = (req as any).isAdmin || false;

      const result = await this.postService.deletePost(
        postId,
        authorId,
        isAdmin
      );
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Erro ao deletar post:", error); // Log detalhado
      res.status(400).json({
        message: error.message || "Erro interno do servidor",
        code: error.code, // Adicione isso para depuração
      });
    }
  };

  // Método para votar em post
  votePost = async (req: Request, res: Response) => {
    try {
      const { voteType } = req.body;
      const userId = (req as any).userId; // Do middleware JWT
      const postId = req.params.postId;

      const result = await this.postService.votePost(postId, userId, voteType);

      res.status(200).json({
        success: true,
        newScore: result.newScore,
        userVote: result.userVote,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
}
