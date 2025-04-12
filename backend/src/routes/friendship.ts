import { Router } from "express";
import { FriendshipController } from "../controllers/friendshipController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const friendshipRouter = Router();
const friendshipController = new FriendshipController();

// Todas as rotas requerem autenticação
friendshipRouter.use(authenticateJWT);

// Enviar solicitação de amizade
friendshipRouter.post(
  "/friendship/request/:receiverId",
  friendshipController.sendFriendRequest
);

// Aceitar solicitação de amizade
friendshipRouter.post(
  "/friendship/accept/:requesterId",
  friendshipController.acceptFriendRequest
);

// Rejeitar solicitação de amizade
friendshipRouter.post(
  "/friendship/reject/:requesterId",
  friendshipController.rejectFriendRequest
);

// Bloquear usuário
friendshipRouter.post(
  "/friendship/block/:blockedId",
  friendshipController.blockUser
);

// Cancelar solicitação de amizade
friendshipRouter.delete(
  "/friendship/cancel/:receiverId",
  friendshipController.cancelFriendRequest
);

// Listar amigos
friendshipRouter.get("/friendship/friends", friendshipController.getFriends);

// Listar solicitações pendentes
friendshipRouter.get(
  "/friendship/pending",
  friendshipController.getPendingRequests
);

// Ver status de amizade
friendshipRouter.get(
  "/friendship/status/:otherUserId",
  friendshipController.getFriendshipStatus
);

export default friendshipRouter;
