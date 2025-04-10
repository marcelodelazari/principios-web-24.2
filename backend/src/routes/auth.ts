import { Router } from "express";
import {
  login,
  register,
  googleAuth,
  googleCallback,
  googleLogin,
} from "../controllers/authController";
import { validateLogin, validateRegister } from "../middlewares/authMiddleware";

const authRouter = Router();

// Rotas de autenticação tradicionais
authRouter.post("/register", validateRegister, register);
authRouter.post("/login", validateLogin, login);

// Rotas de autenticação com Google
authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleCallback);
authRouter.post("/google/login", googleLogin);

export default authRouter;
