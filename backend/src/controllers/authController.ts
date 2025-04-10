import { Request, Response } from "express";
import {
  loginService,
  registerService,
  getGoogleAuthURL,
  processGoogleCallback,
  verifyGoogleToken,
} from "../services/authService";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const result = await loginService(email, password);
    res.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Erro desconhecido" });
    }
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  try {
    const result = await registerService(name, email, password);
    res.status(201).json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Erro desconhecido" });
    }
  }
};

// Redireciona para a página de autenticação do Google
export const googleAuth = (req: Request, res: Response): void => {
  try {
    const url = getGoogleAuthURL();
    res.redirect(url);
  } catch (error) {
    console.error("Erro ao redirecionar para Google:", error);
    res
      .status(500)
      .json({ message: "Erro ao iniciar autenticação com Google" });
  }
};

// Processa o callback do Google após autenticação
export const googleCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.query;
    console.log("Código recebido:", code); // Log do código

    if (!code || typeof code !== "string") {
      console.error("Código ausente ou inválido"); // Log de erro
      res.status(400).json({ message: "Código de autorização ausente" });
      return;
    }

    const result = await processGoogleCallback(code);
    console.log("Resultado do processamento:", result); // Log do resultado

    const redirectUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3001"
    }/google/callback?token=${result.token}`;
    console.log("Redirecionando para:", redirectUrl); // Log do redirecionamento
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Erro detalhado no callback do Google:", error);
    res.status(500).json({ message: "Erro na autenticação com Google" });
  }
};

// Endpoint para login direto com Google (usando token ID)
export const googleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      res.status(400).json({ message: "Token ID do Google não fornecido" });
      return;
    }

    const result = await verifyGoogleToken(tokenId);
    res.json(result);
  } catch (error) {
    console.error("Erro no login com Google:", error);
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(401).json({ message: "Falha na autenticação com Google" });
    }
  }
};
