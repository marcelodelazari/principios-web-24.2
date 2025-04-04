import { pool } from "../config/db";

export class CommentRepository {
  async createComment(postId: string, userId: string, content: string) {
    const result = await pool.query(
      `INSERT INTO "Comment" ("postId", "authorId", content, "createdAt")
       VALUES ($1, $2, $3, NOW())
       RETURNING 
         id,
         content,
         "createdAt",
         "authorId",
         (SELECT name FROM "User" WHERE id = $2) as "authorName"`,
      [postId, userId, content]
    );
    return result.rows[0];
  }

  async getCommentsByPost(postId: string) {
    const result = await pool.query(
      `SELECT c.*, u.name as "authorName" 
       FROM "Comment" c
       JOIN "User" u ON c."authorId" = u.id
       WHERE c."postId" = $1 
       ORDER BY c."createdAt" DESC`,
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

  async deleteComment(commentId: string, userId: string, isAdmin: boolean) {
    let query = 'DELETE FROM "Comment" WHERE id = $1';
    const params: any[] = [commentId];
    
    // Só verifica autor se não for admin
    if (!isAdmin) {
      query += ' AND "authorId" = $2';
      params.push(userId);
    }
  
    const result = await pool.query(query + ' RETURNING *', params);
    return result.rowCount !== null && result.rowCount > 0;
  }