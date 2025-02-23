import { Request, RequestHandler, Response } from 'express';
import { UserService } from '../services/userService';

export class UserController {
  private userService = new UserService(); // Instanciando a classe UserService

  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const user = await this.userService.register(name, email, password); // Usando a instância
      res.status(201).json({ message: 'Usuário criado com sucesso', user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { token, user } = await this.userService.login(email, password); // Usando a instância
      res.json({ message: 'Login bem-sucedido', token, user });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  getUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const user = await this.userService.getUserById(userId);
      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };


  async updateUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const { name, email } = req.body;
      const user = await this.userService.updateUser(userId, name, email); // Usando a instância
      res.json({ message: 'Usuário atualizado com sucesso', user });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      await this.userService.deleteUser(userId); // Usando a instância
      res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao deletar usuário' });
    }
  }
}
