import { FriendshipRepository } from "../repositories/friendshipRepository";
import { FriendshipStatus } from "@prisma/client";

export class FriendshipService {
  private friendshipRepository: FriendshipRepository;

  constructor() {
    this.friendshipRepository = new FriendshipRepository();
  }

  async sendFriendRequest(requesterId: number, receiverId: number) {
    if (requesterId === receiverId) {
      throw new Error(
        "Você não pode enviar solicitação de amizade para si mesmo"
      );
    }

    const existingFriendship =
      await this.friendshipRepository.getFriendshipByUsers(
        requesterId,
        receiverId
      );

    if (existingFriendship) {
      throw new Error(
        "Já existe uma solicitação de amizade entre estes usuários"
      );
    }

    return this.friendshipRepository.createFriendship(requesterId, receiverId);
  }

  async acceptFriendRequest(requesterId: number, receiverId: number) {
    const friendship = await this.friendshipRepository.getFriendshipByUsers(
      requesterId,
      receiverId
    );

    if (!friendship) {
      throw new Error("Solicitação de amizade não encontrada");
    }

    if (friendship.status !== FriendshipStatus.pending) {
      throw new Error("Esta solicitação não está pendente");
    }

    if (friendship.receiverId !== receiverId) {
      throw new Error("Você não pode aceitar esta solicitação");
    }

    return this.friendshipRepository.updateFriendshipStatus(
      requesterId,
      receiverId,
      FriendshipStatus.accepted
    );
  }

  async rejectFriendRequest(requesterId: number, receiverId: number) {
    const friendship = await this.friendshipRepository.getFriendshipByUsers(
      requesterId,
      receiverId
    );

    if (!friendship) {
      throw new Error("Solicitação de amizade não encontrada");
    }

    return this.friendshipRepository.updateFriendshipStatus(
      requesterId,
      receiverId,
      FriendshipStatus.declined
    );
  }

  async blockUser(requesterId: number, receiverId: number) {
    const friendship = await this.friendshipRepository.getFriendshipByUsers(
      requesterId,
      receiverId
    );

    if (friendship) {
      return this.friendshipRepository.updateFriendshipStatus(
        requesterId,
        receiverId,
        FriendshipStatus.blocked
      );
    }

    return this.friendshipRepository.createFriendship(requesterId, receiverId);
  }

  async cancelFriendRequest(requesterId: number, receiverId: number) {
    const friendship = await this.friendshipRepository.getFriendshipByUsers(
      requesterId,
      receiverId
    );

    if (!friendship) {
      throw new Error("Solicitação de amizade não encontrada");
    }

    return this.friendshipRepository.deleteFriendship(requesterId, receiverId);
  }

  async getFriends(userId: number) {
    return this.friendshipRepository.getFriendsByUserId(userId);
  }

  async getPendingRequests(userId: number) {
    return this.friendshipRepository.getPendingRequestsByUserId(userId);
  }

  async getFriendshipStatus(userId1: number, userId2: number) {
    const friendship = await this.friendshipRepository.getFriendshipByUsers(
      userId1,
      userId2
    );

    if (!friendship) {
      return null;
    }

    return friendship.status;
  }
}
