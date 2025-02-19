import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM "User" WHERE "email" = $1', [email]);
    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Usuário não encontrado' });
      return;
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Senha incorreta' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login bem-sucedido', token });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
    return;
  }
};

export const register: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Verifica se o usuário já existe
    const userCheck = await pool.query('SELECT * FROM "User" WHERE "email" = $1', [email]);
    if (userCheck.rows.length > 0) {
      res.status(400).json({ message: 'Usuário já existe' });
      return;
    }

    // Cria o hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insere o novo usuário no banco de dados
    const result = await pool.query(
      'INSERT INTO "User" (name, email, "passwordHash", "createdAt") VALUES ($1, $2, $3, NOW()) RETURNING *',
      [name, email, passwordHash]
    );
    const newUser = result.rows[0];

    res.status(201).json({ message: 'Usuário criado com sucesso', user: newUser });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
    return;
  }
};
