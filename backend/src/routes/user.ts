import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const userRouter = Router();
const userController = new UserController();

userRouter.get("/users/me", authenticateJWT, userController.getCurrentUser);

// Obter usuário por ID (precisa estar autenticado)
userRouter.get("/users/:userId", authenticateJWT, userController.getUserById);

// Atualizar usuário (precisa estar autenticado)
userRouter.put("/users/:userId", authenticateJWT, userController.updateUser);

// Deletar usuário (precisa estar autenticado)
userRouter.delete("/users/:userId", authenticateJWT, userController.deleteUser);

export default userRouter;
