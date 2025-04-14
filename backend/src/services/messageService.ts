import { MessageRepository } from "../repositories/messageRepository";
import { FriendshipRepository } from "../repositories/friendshipRepository";
import { FriendshipStatus } from "@prisma/client";

export class MessageService {
  private messageRepository: MessageRepository;
  private friendshipRepository: FriendshipRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
    this.friendshipRepository = new FriendshipRepository();
  }

  async sendMessage(senderId: number, receiverId: number, content: string) {
    const friendship = await this.friendshipRepository.getFriendshipByUsers(
      senderId,
      receiverId
    );

    if (!friendship || friendship.status !== FriendshipStatus.accepted) {
      throw new Error("Você só pode enviar mensagens para amigos");
    }

    return this.messageRepository.createMessage(senderId, receiverId, content);
  }

  async getConversation(userId1: number, userId2: number) {
    const friendship = await this.friendshipRepository.getFriendshipByUsers(
      userId1,
      userId2
    );

    if (!friendship || friendship.status !== FriendshipStatus.accepted) {
      throw new Error("Você só pode ver mensagens de amigos");
    }

    return this.messageRepository.getMessagesBetweenUsers(userId1, userId2);
  }

  async markMessagesAsRead(receiverId: number, senderId: number) {
    return this.messageRepository.markMessagesAsRead(receiverId, senderId);
  }

  async getUnreadMessagesCount(userId: number) {
    return this.messageRepository.getUnreadMessagesCount(userId);
  }
}
