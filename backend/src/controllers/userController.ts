import { Request, Response } from "express";
import { UserService } from "../services/userService";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const user = await this.userService.createUser(name, email, password);
      res.status(201).json({ message: "Usuário criado com sucesso.", user });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Erro interno do servidor." });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await this.userService.getUserById(userId);
      res.status(200).json(user);
    } catch (error: any) {
      res
        .status(404)
        .json({ message: error.message || "Erro interno do servidor." });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const updatedUser = await this.userService.updateUser(userId, req.body);
      res
        .status(200)
        .json({ message: "Usuário atualizado com sucesso.", updatedUser });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Erro interno do servidor." });
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      await this.userService.deleteUser(userId);
      res.status(200).json({ message: "Usuário deletado com sucesso." });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Erro interno do servidor." });
    }
  };
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ message: "Não autenticado" });
        return;
      }

      const user = await this.userService.getUserById(req.userId);

      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      });
    } catch (error: any) {
      console.error("Erro no getCurrentUser:", error);
      res.status(500).json({
        message: error.message || "Erro ao obter usuário atual",
      });
    }
  };
}
