import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authenticateJWT } from "../middlewares/authMiddleware";
import multer from "multer";
import fs from "fs";
import path from "path";

// Configuração do multer para salvar os arquivos no diretório correto
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/avatars");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
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
  userController.uploadAvatar
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
