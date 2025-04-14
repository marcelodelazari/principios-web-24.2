import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

export const configureSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3001",
      methods: ["GET", "POST"],
    },
  });

  // Middleware de autenticação
  io.use((socket, next) => {
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

  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    // Associar socket ao usuário
    socket.join(`user_${userId}`);

    // Emitir evento de "friend_online" para os amigos do usuário
    socket.broadcast.emit("friend_online", userId);

    socket.on("disconnect", () => {
      socket.leave(`user_${userId}`);
      // Emitir evento de "friend_offline" para os amigos do usuário
      socket.broadcast.emit("friend_offline", userId);
    });
  });

  return io;
};
