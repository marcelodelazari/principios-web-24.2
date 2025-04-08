import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authenticateJWT } from "../middlewares/authMiddleware";
import multer from "multer";
import fs from "fs";
import path from "path";

// Configuração do multer para salvar os arquivos no diretório correto
const storage = multer.memoryStorage(); // Armazena os arquivos em memória
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Apenas imagens são permitidas
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Apenas arquivos de imagem são permitidos"));
    }
    cb(null, true);
  },
});

const userRouter = Router();
const userController = new UserController();

// Rotas existentes
userRouter.get("/users/me", authenticateJWT, userController.getCurrentUser);
userRouter.get("/users/:userId", authenticateJWT, userController.getUserById);

// Rota para atualizar o avatar do usuário
userRouter.post(
  "/users/:userId/avatar",
  authenticateJWT,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      await userController.uploadAvatar(req, res);
      next();
    } catch (error) {
      next(error);
    }
  }
);

// Atualizar perfil do usuário
userRouter.put(
  "/users/:userId/profile",
  authenticateJWT,
  userController.updateProfile
);

// Atualizar usuário (precisa estar autenticado)
userRouter.put("/users/:userId", authenticateJWT, userController.updateUser);

// Deletar usuário (precisa estar autenticado)
userRouter.delete("/users/:userId", authenticateJWT, userController.deleteUser);

export default userRouter;
