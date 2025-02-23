import { pool } from '../config/db';

export class CommentRepository {
  async createComment(postId: string, userId: string, content: string) {
    const result = await pool.query(
      'INSERT INTO "Comment" ("postId", "authorId", content, "createdAt") VALUES ($1, $2, $3, NOW()) RETURNING *',
      [postId, userId, content]
    );
    return result.rows[0];
  }

  async getCommentsByPost(postId: string) {
    const result = await pool.query(
      'SELECT * FROM "Comment" WHERE "postId" = $1 ORDER BY "createdAt" DESC',
      [postId]
    );
    return result.rows;
  }

  async updateComment(commentId: string, userId: string, content: string) {
    const result = await pool.query(
      'UPDATE "Comment" SET content = $1 WHERE id = $2 AND "authorId" = $3 RETURNING *',
      [content, commentId, userId]
    );
    return result.rows[0];
  }

  async deleteComment(commentId: string, userId: string) {
    const result = await pool.query(
      'DELETE FROM "Comment" WHERE id = $1 AND "authorId" = $2 RETURNING *',
      [commentId, userId]
    );
    if (result && result.rowCount !== null) {
        return result.rowCount > 0;
      } else {
        return false;
      }
  }
}