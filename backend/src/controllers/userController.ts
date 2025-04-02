import { Request, Response } from "express";
import { UserService } from "../services/userService";

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

  getCurrentUser = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const user = await this.userService.getUserById(userId);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };
}
