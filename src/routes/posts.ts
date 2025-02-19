import { Router } from 'express';
import { createPost, votePost } from '../controllers/postController';
import { createComment } from '../controllers/commentController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const postsRouter = Router();

// Criação de post (usuário autenticado)
postsRouter.post('/posts', authenticateJWT, createPost);

// Votação em post (usuário autenticado)
postsRouter.post('/posts/:postId/vote', authenticateJWT, votePost);

// Criação de comentário em um post (usuário autenticado)
postsRouter.post('/posts/:postId/comments', authenticateJWT, createComment);

export default postsRouter;
