import { Router } from "express";
import { PostController } from "../controllers/postController";
import { CommentController } from "../controllers/commentController";
import {
  authenticateJWT,
  optionalAuthenticateJWT,
} from "../middlewares/authMiddleware";
const postsRouter = Router();
const postController = new PostController();
const commentController = new CommentController();

// Criação de post (usuário autenticado)
postsRouter.post("/posts", authenticateJWT, postController.createPost);

// Votação em post (usuário autenticado)
postsRouter.post(
  "/posts/:postId/vote",
  authenticateJWT,
  postController.votePost
);

// Listar todos os posts (não precisa de autenticação)
postsRouter.get("/posts", optionalAuthenticateJWT, postController.getPosts);

// Obter post por ID (não precisa de autenticação)
postsRouter.get(
  "/posts/:postId",
  optionalAuthenticateJWT,
  postController.getPostById
);

// Atualizar post (usuário autenticado)
postsRouter.put("/posts/:postId", authenticateJWT, postController.updatePost);

// Deletar post (usuário autenticado)
postsRouter.delete(
  "/posts/:postId",
  authenticateJWT,
  postController.deletePost
);

// Criação de comentário em um post (usuário autenticado)
postsRouter.post(
  "/posts/:postId/comments",
  authenticateJWT,
  commentController.createComment
);

// Listar todos os comentários de um post (não precisa de autenticação)
postsRouter.get(
  "/posts/:postId/comments",
  optionalAuthenticateJWT, // Adicione este middleware
  commentController.getCommentsByPost
);

// Atualizar comentário (usuário autenticado)
postsRouter.put(
  "/posts/:postId/comments/:commentId",
  authenticateJWT,
  commentController.updateComment
);

// Deletar comentário (usuário autenticado)
postsRouter.delete(
  "/posts/:postId/comments/:commentId",
  authenticateJWT,
  commentController.deleteComment
);

postsRouter.post(
  "/posts/:postId/comments/:commentId/vote",
  authenticateJWT,
  commentController.voteComment
);

export default postsRouter;
