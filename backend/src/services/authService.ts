import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";

export const loginService = async (email: string, password: string) => {
  try {
    const result = await pool.query('SELECT * FROM "User" WHERE "email" = $1', [
      email,
    ]);
    if (result.rows.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Senha incorreta");
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error: unknown) {
    throw new Error("Credenciais inválidas");
  }
};

export const registerService = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    // Cria o hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insere o novo usuário no banco de dados
    const result = await pool.query(
      'INSERT INTO "User" (name, email, "passwordHash", "createdAt") VALUES ($1, $2, $3, NOW()) RETURNING *',
      [name, email, passwordHash]
    );

    return { message: "Usuário criado com sucesso", user: result.rows[0] };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message); // Trate o erro de forma adequada
    } else {
      throw new Error("Erro interno do servidor");
    }
  }
};
