import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";
import { googleClient, GOOGLE_CLIENT_ID } from "../config/googleAuth";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma"; // ajusta o caminho conforme a pasta

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
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
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
      throw new Error(error.message);
    } else {
      throw new Error("Erro interno do servidor");
    }
  }
};

// Gera a URL para autenticação com Google
export const getGoogleAuthURL = () => {
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
  });

  return url;
};

// Processa o retorno da autenticação do Google
export const processGoogleCallback = async (code: string) => {
  try {
    console.log("[DEBUG] Iniciando processamento do callback do Google...");

    // Troca o código por tokens
    const { tokens } = await googleClient.getToken(code);
    console.log("[DEBUG] Tokens recebidos:", tokens);

    googleClient.setCredentials(tokens);

    // Obtém informações do usuário
    const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);
    oauth2Client.setCredentials({ access_token: tokens.access_token });

    const url = "https://www.googleapis.com/oauth2/v2/userinfo";
    const res = await oauth2Client.request({ url });
    const userInfo = res.data as {
      id: string;
      email: string;
      name: string;
      picture: string;
    };

    console.log("[DEBUG] Informações do usuário recebidas:", userInfo);

    // Verifica se o usuário já existe
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      console.log("[DEBUG] Usuário não encontrado, criando novo usuário...");

      // Se não existir, cria um novo usuário com uma senha aleatória
      const passwordHash = await bcrypt.hash(
        Math.random().toString(36).slice(-8),
        10
      );

      user = await prisma.user.create({
        data: {
          name: userInfo.name,
          email: userInfo.email,
          passwordHash,
          avatarUrl: userInfo.picture,
        },
      });

      console.log("[DEBUG] Novo usuário criado:", user);
    } else {
      console.log("[DEBUG] Usuário já existe:", user);
    }

    // Gera um token JWT para o usuário
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    console.log("[DEBUG] Token JWT gerado:", token);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        avatarUrl: user.avatarUrl,
      },
    };
  } catch (error) {
    console.error("[ERROR] Erro na autenticação Google:", error);
    throw new Error("Falha na autenticação com Google");
  }
};

// Verifica e processa um token ID do Google (para login direto do frontend)
export const verifyGoogleToken = async (tokenId: string) => {
  try {
    // Verifica o token ID
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Token inválido");
    }

    // Verifica se o usuário já existe
    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      // Se não existir, cria um novo usuário
      const passwordHash = await bcrypt.hash(
        Math.random().toString(36).slice(-8),
        10
      );

      user = await prisma.user.create({
        data: {
          name: payload.name || payload.email.split("@")[0],
          email: payload.email,
          passwordHash,
          avatarUrl: payload.picture,
        },
      });
    }

    // Gera um token JWT para o usuário
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        avatarUrl: user.avatarUrl,
      },
    };
  } catch (error) {
    console.error("Erro na verificação do token Google:", error);
    throw new Error("Token do Google inválido");
  }
};
