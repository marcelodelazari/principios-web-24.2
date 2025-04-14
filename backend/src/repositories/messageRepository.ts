import { prisma } from "../lib/prisma";

export class MessageRepository {
  async createMessage(senderId: number, receiverId: number, content: string) {
    return prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        read: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number) {
    return prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async markMessagesAsRead(receiverId: number, senderId: number) {
    return prisma.message.updateMany({
      where: {
        receiverId,
        senderId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }

  async getUnreadMessagesCount(userId: number) {
    return prisma.message.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });
  }
}
