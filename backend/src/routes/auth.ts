import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { validateLogin, validateRegister } from '../middlewares/authMiddleware';

const authRouter = Router();

// Aplica o middleware de validação no registro
authRouter.post('/register', validateRegister, register);

// Aplica o middleware de validação no login
authRouter.post('/login', validateLogin, login);

export default authRouter;
