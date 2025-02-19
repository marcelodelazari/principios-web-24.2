import { Request, Response, RequestHandler } from 'express';
import { pool } from '../config/db';

export const createPost: RequestHandler = async (req, res) => {
  const { title, content } = req.body;
  const userId = (req as any).userId;

  if (!title || !content) {
    res.status(400).json({ message: 'Título e conteúdo são obrigatórios' });
    return;
  }

  try {
    const result = await pool.query(
      'INSERT INTO "Post" (title, content, "authorId", "createdAt") VALUES ($1, $2, $3, NOW()) RETURNING *',
      [title, content, userId]
    );
    const post = result.rows[0];
    res.status(201).json({ message: 'Post criado com sucesso', post });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
    return;
  }
};

export const votePost: RequestHandler = async (req, res) => {
  const { voteType } = req.body;
  const userId = (req as any).userId;
  const postId = req.params.postId;

  if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
    res.status(400).json({ message: 'voteType inválido' });
    return;
  }

  try {
    const existingVote = await pool.query(
      'SELECT * FROM "PostVote" WHERE "postId" = $1 AND "userId" = $2',
      [postId, userId]
    );

    if (existingVote.rows.length > 0) {
      if (existingVote.rows[0].voteType === voteType) {
        await pool.query(
          'DELETE FROM "PostVote" WHERE "postId" = $1 AND "userId" = $2',
          [postId, userId]
        );
        res.json({ message: 'Voto removido' });
        return;
      } else {
        await pool.query(
          'UPDATE "PostVote" SET "voteType" = $1, "createdAt" = NOW() WHERE "postId" = $2 AND "userId" = $3',
          [voteType, postId, userId]
        );
        res.json({ message: 'Voto atualizado' });
        return;
      }
    } else {
      await pool.query(
        'INSERT INTO "PostVote" ("postId", "userId", "voteType", "createdAt") VALUES ($1, $2, $3, NOW())',
        [postId, userId, voteType]
      );
      res.json({ message: 'Voto registrado' });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
    return;
  }
};
