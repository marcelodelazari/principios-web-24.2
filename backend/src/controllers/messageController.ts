import { Request, Response } from "express";
import { MessageService } from "../services/messageService";
import SocketManager from "../lib/socketManager";

export class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  sendMessage = async (req: Request, res: Response) => {
    try {
      const { receiverId, content } = req.body;
      const senderId = req.userId!;

      const message = await this.messageService.sendMessage(
        senderId,
        receiverId,
        content
      );

      // Usar o SocketManager ao invés de req.app.get("io")
      SocketManager.getInstance()
        .to(`user_${receiverId}`)
        .emit("new_message", message);

      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getConversation = async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const otherUserId = parseInt(req.params.userId);

      const messages = await this.messageService.getConversation(
        userId,
        otherUserId
      );

      // Marcar mensagens como lidas
      await this.messageService.markMessagesAsRead(userId, otherUserId);

      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getUnreadCount = async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const count = await this.messageService.getUnreadMessagesCount(userId);
      res.json({ count });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}
