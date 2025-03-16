import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';

export const login: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Validação do email
  if (!email || !email.includes('@') || !/^[\w-.]+@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
    res.status(400).json({ message: 'Email inválido. Deve conter "@" e estar no formato correto.' });
    return;
  }

  // Validação da senha
  if (!password || password.length < 6) {
    res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
    return;
  }

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const register: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  // Validação do nome
  if (!name || name.length < 3 || name.length > 30) {
    res.status(400).json({ message: 'O nome deve ter entre 3 e 30 caracteres' });
    return;
  }

  // Validação do email
  if (!email || !email.includes('@') || !/^[\w-.]+@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
    res.status(400).json({ message: 'Email inválido. Deve conter "@" e estar no formato correto.' });
    return;
  }

  // Validação da senha
  if (!password || password.length < 6) {
    res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
    return;
  }

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
