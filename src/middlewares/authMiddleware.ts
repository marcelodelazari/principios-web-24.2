import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db';

// Middleware para autenticação JWT
export const authenticateJWT = (
  req: Request & { userId?: number },
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded: any) => {
      if (err) {
        return next(new Error('Token inválido'));
      }
      req.userId = decoded.userId;
      next();
    });
  } else {
    return next(new Error('Token não fornecido'));
  }
};

// Middleware para validação do registro de usuário
export const validateRegister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { name, email, password } = req.body;

  // Validação do nome
  if (!name || name.length < 3 || name.length > 30) {
    res.status(400).json({ message: 'O nome deve ter entre 3 e 30 caracteres' });
    return; // Remove o 'return' da resposta e adiciona 'return;' para sair da função
  }

  // Validação do email
  if (!email || !email.includes('@') || !/^[\w-.]+@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
    res.status(400).json({ message: 'Email inválido. Deve conter "@" e estar no formato correto.' });
    return;
  }

  // Verifica se o usuário já existe no banco
  try {
    const result = await pool.query('SELECT * FROM "User" WHERE "email" = $1', [email]);
    if (result.rows.length > 0) {
      res.status(400).json({ message: 'Usuário já existe' });
      return;
    }
  } catch (error) {
    next(new Error('Erro ao verificar o usuário'));
    return;
  }

  // Validação da senha
  if (!password || password.length < 6) {
    res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
    return;
  }

  next();
};

// Middleware para validação de login
export const validateLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      res.status(400).json({ message: 'Usuário não encontrado' });
      return;
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Senha incorreta' });
      return;
    }

    next();
  } catch (error) {
    next(new Error('Erro ao verificar o usuário'));
  }
};
