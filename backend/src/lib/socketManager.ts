import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

class SocketManager {
  private static instance: SocketServer;
  private static onlineUsers: Set<number> = new Set();

  static initialize(server: HttpServer) {
    if (!this.instance) {
      this.instance = new SocketServer(server, {
        cors: {
          origin: process.env.FRONTEND_URL || "http://localhost:3001",
          methods: ["GET", "POST"],
        },
      });

      this.instance.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error("Authentication error"));
        }

        try {
          const decoded: any = jwt.verify(
            token,
            process.env.JWT_SECRET || "secret"
          );
          socket.data.userId = decoded.userId;
          next();
        } catch (error) {
          next(new Error("Authentication error"));
        }
      });

      this.instance.on("connection", (socket) => {
        const userId = socket.data.userId;
        this.onlineUsers.add(userId);
        socket.join(`user_${userId}`);
        socket.broadcast.emit("friend_online", userId);

        socket.on("disconnect", () => {
          this.onlineUsers.delete(userId);
          socket.leave(`user_${userId}`);
          socket.broadcast.emit("friend_offline", userId);
        });
      });
    }
    return this.instance;
  }

  static isUserOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }

  static getInstance(): SocketServer {
    if (!this.instance) {
      throw new Error("Socket.IO has not been initialized");
    }
    return this.instance;
  }
}

export default SocketManager;
