import { prisma } from "../lib/prisma";
import { FriendshipStatus } from "@prisma/client";

export class FriendshipRepository {
  async createFriendship(requesterId: number, receiverId: number) {
    return prisma.friendship.create({
      data: {
        requesterId,
        receiverId,
        status: FriendshipStatus.pending,
      },
    });
  }

  async updateFriendshipStatus(
    requesterId: number,
    receiverId: number,
    status: FriendshipStatus
  ) {
    return prisma.friendship.update({
      where: {
        requesterId_receiverId: {
          requesterId,
          receiverId,
        },
      },
      data: {
        status,
      },
    });
  }

  async deleteFriendship(requesterId: number, receiverId: number) {
    return prisma.friendship.delete({
      where: {
        requesterId_receiverId: {
          requesterId,
          receiverId,
        },
      },
    });
  }

  async getFriendshipByUsers(userId1: number, userId2: number) {
    return prisma.friendship.findFirst({
      where: {
        OR: [
          {
            requesterId: userId1,
            receiverId: userId2,
          },
          {
            requesterId: userId2,
            receiverId: userId1,
          },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getFriendsByUserId(userId: number) {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, status: FriendshipStatus.accepted },
          { receiverId: userId, status: FriendshipStatus.accepted },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return friendships.map((friendship) => ({
      id: friendship.id,
      status: friendship.status,
      otherUser:
        friendship.requesterId === userId
          ? friendship.receiver
          : friendship.requester,
    }));
  }

  async getPendingRequestsByUserId(userId: number) {
    const friendships = await prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: FriendshipStatus.pending,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    return friendships.map((friendship) => ({
      id: friendship.id,
      status: friendship.status,
      createdAt: friendship.createdAt,
      updatedAt: friendship.updatedAt,
      otherUser: friendship.requester,
    }));
  }
}
