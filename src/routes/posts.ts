import { Router } from 'express';
import { createPost, votePost } from '../controllers/postController';
import { CommentController } from '../controllers/commentController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const postsRouter = Router();
const commentController = new CommentController();

// Criação de post (usuário autenticado)
postsRouter.post('/posts', authenticateJWT, createPost);

// Votação em post (usuário autenticado)
postsRouter.post('/posts/:postId/vote', authenticateJWT, votePost);

// Criação de comentário em um post (usuário autenticado)
postsRouter.post('/posts/:postId/comments', authenticateJWT, commentController.createComment);

export default postsRouter;
