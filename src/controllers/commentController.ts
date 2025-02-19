import { Request, Response, RequestHandler } from 'express';
import { pool } from '../config/db';

export const createComment: RequestHandler = async (req, res) => {
  const { content } = req.body;
  const postId = req.params.postId;
  const userId = (req as any).userId;

  if (!content) {
    res.status(400).json({ message: 'Conteúdo do comentário é obrigatório' });
    return;
  }

  try {
    const result = await pool.query(
      'INSERT INTO "Comment" ("postId", "authorId", content, "createdAt") VALUES ($1, $2, $3, NOW()) RETURNING *',
      [postId, userId, content]
    );
    const comment = result.rows[0];
    res.status(201).json({ message: 'Comentário criado com sucesso', comment });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
    return;
  }
};
