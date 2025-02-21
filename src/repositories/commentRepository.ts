import { pool } from '../config/db';

export class CommentRepository {
  async createComment(postId: string, userId: string, content: string) {
    const result = await pool.query(
      'INSERT INTO "Comment" ("postId", "authorId", content, "createdAt") VALUES ($1, $2, $3, NOW()) RETURNING *',
      [postId, userId, content]
    );
    return result.rows[0];
  }
}