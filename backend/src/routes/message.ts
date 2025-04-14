import { Router } from "express";
import { MessageController } from "../controllers/messageController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const messageRouter = Router();
const messageController = new MessageController();

messageRouter.use(authenticateJWT);

messageRouter.post("/messages", messageController.sendMessage);
messageRouter.get("/messages/:userId", messageController.getConversation);
messageRouter.get("/messages/unread/count", messageController.getUnreadCount);

export default messageRouter;
