import { pool } from '../config/db';

export class UserRepository {
  async findByEmail(email: string) {
    const result = await pool.query('SELECT * FROM "User" WHERE "email" = $1', [email]);
    return result.rows[0] || null;
  }

  async createUser(name: string, email: string, passwordHash: string) {
    const result = await pool.query(
      'INSERT INTO "User" (name, email, "passwordHash", "createdAt") VALUES ($1, $2, $3, NOW()) RETURNING *',
      [name, email, passwordHash]
    );
    return result.rows[0];
  }

  async findById(id: number) {
    const result = await pool.query('SELECT id, name, email FROM "User" WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async updateUser(id: number, name: string, email: string) {
    const result = await pool.query(
      'UPDATE "User" SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );
    return result.rows[0];
  }

  async deleteUser(id: number) {
    await pool.query('DELETE FROM "User" WHERE id = $1', [id]);
  }
}