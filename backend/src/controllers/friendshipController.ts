import { Request, Response } from "express";
import { FriendshipService } from "../services/friendshipService";
import SocketManager from "../lib/socketManager";

export class FriendshipController {
  private friendshipService: FriendshipService;

  constructor() {
    this.friendshipService = new FriendshipService();
  }

  sendFriendRequest = async (req: Request, res: Response) => {
    try {
      const requesterId = req.userId!;
      const { receiverId } = req.params;

      const friendship = await this.friendshipService.sendFriendRequest(
        requesterId,
        parseInt(receiverId)
      );

      res.status(201).json(friendship);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  acceptFriendRequest = async (req: Request, res: Response) => {
    try {
      const receiverId = req.userId!;
      const { requesterId } = req.params;

      const friendship = await this.friendshipService.acceptFriendRequest(
        parseInt(requesterId),
        receiverId
      );

      res.json(friendship);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  rejectFriendRequest = async (req: Request, res: Response) => {
    try {
      const receiverId = req.userId!;
      const { requesterId } = req.params;

      const friendship = await this.friendshipService.rejectFriendRequest(
        parseInt(requesterId),
        receiverId
      );

      res.json(friendship);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  blockUser = async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const { blockedId } = req.params;

      const friendship = await this.friendshipService.blockUser(
        userId,
        parseInt(blockedId)
      );

      res.json(friendship);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  cancelFriendRequest = async (req: Request, res: Response) => {
    try {
      const requesterId = req.userId!;
      const { receiverId } = req.params;

      await this.friendshipService.cancelFriendRequest(
        requesterId,
        parseInt(receiverId)
      );

      res.json({ message: "Solicitação cancelada com sucesso" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getFriends = async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const friends = await this.friendshipService.getFriends(userId);
      res.json(friends);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getFriendsWithStatus = async (userId: number) => {
    const friends = await this.friendshipService.getFriends(userId);
    const io = SocketManager.getInstance();
    const connectedSockets = await io.sockets.adapter.sids;
    const onlineUsers = new Set();

    for (const [socketId, roomSet] of connectedSockets) {
      for (const room of roomSet) {
        if (room.startsWith("user_")) {
          onlineUsers.add(parseInt(room.split("_")[1]));
        }
      }
    }

    return friends.map((friend) => ({
      ...friend,
      isOnline: onlineUsers.has(friend.otherUser.id),
    }));
  };

  getPendingRequests = async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const requests = await this.friendshipService.getPendingRequests(userId);
      res.json(requests);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getFriendshipStatus = async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const { otherUserId } = req.params;

      const status = await this.friendshipService.getFriendshipStatus(
        userId,
        parseInt(otherUserId)
      );

      res.json({ status });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}
