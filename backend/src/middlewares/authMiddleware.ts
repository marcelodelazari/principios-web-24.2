import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../config/db";

// Middleware para autenticação JWT
export const authenticateJWT = (
  req: Request & { userId?: number; isAdmin?: boolean },
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  console.log("[AUTH] Headers:", req.headers); // Log 1

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    console.log("[AUTH] Token:", token); // Log 2

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, decoded: any) => {
        console.log("[AUTH] Decoded Token:", decoded); // Log 3

        if (err) {
          console.error("[AUTH] Token verification error:", err); // Log 4
          return next(new Error("Token inválido"));
        }

        console.log(
          "[AUTH] UserID from token:",
          decoded?.userId,
          "Type:",
          typeof decoded?.userId
        ); // Log 5

        if (!decoded?.userId) {
          console.error("[AUTH] No userId in token"); // Log 6
          return next(new Error("Token inválido"));
        }

        // Conversão explícita para número
        req.userId = Number(decoded.userId);
        req.isAdmin = Boolean(decoded.isAdmin); // Define isAdmin
        console.log(
          "[AUTH] Processed UserID:",
          req.userId,
          "Type:",
          typeof req.userId
        ); // Log 7

        next();
      }
    );
  } else {
    console.error("[AUTH] No authorization header"); // Log 8
    return next(new Error("Token não fornecido"));
  }
};

// backend/src/middlewares/authMiddleware.ts
export const optionalAuthenticateJWT = (
  req: Request & { userId?: number; isAdmin?: boolean },
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, decoded: any) => {
        if (!err && decoded?.userId) {
          req.userId = Number(decoded.userId);
          req.isAdmin = Boolean(decoded.isAdmin);
        }
        next();
      }
    );
  } else {
    next();
  }
};

// Middleware para validação do registro de usuário
export const validateRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name, email, password } = req.body;

  // Validação do nome
  if (!name || name.length < 3 || name.length > 30) {
    res
      .status(400)
      .json({ message: "O nome deve ter entre 3 e 30 caracteres" });
    return;
  }

  // Validação do email
  if (!email || !/^[\w-.]+@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
    res.status(400).json({
      message: 'Email inválido. Deve conter "@" e estar no formato correto.',
    });
    return;
  }

  // Validação da senha (agora antes da consulta ao banco)
  if (!password || password.length < 6) {
    res
      .status(400)
      .json({ message: "A senha deve ter pelo menos 6 caracteres" });
    return;
  }

  // Verificação do banco de dados
  try {
    const result = await pool.query('SELECT * FROM "User" WHERE "email" = $1', [
      email,
    ]);
    if (result.rows.length > 0) {
      res.status(400).json({ message: "Usuário já existe" });
      return;
    }
  } catch (error) {
    next(new Error("Erro ao verificar o usuário"));
    return;
  }

  next();
};

// Middleware para validação de login
export const validateLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  // Validação do email
  if (
    !email ||
    !email.includes("@") ||
    !/^[\w-.]+@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)
  ) {
    res.status(400).json({
      message: 'Email inválido. Deve conter "@" e estar no formato correto.',
    });
    return;
  }

  // Validação da senha
  if (!password || password.length < 6) {
    res
      .status(400)
      .json({ message: "A senha deve ter pelo menos 6 caracteres" });
    return;
  }

  try {
    const result = await pool.query('SELECT * FROM "User" WHERE "email" = $1', [
      email,
    ]);
    if (result.rows.length === 0) {
      res.status(400).json({ message: "Usuário não encontrado" });
      return;
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Senha incorreta" });
      return;
    }

    next();
  } catch (error) {
    next(new Error("Erro ao verificar o usuário"));
  }
};
