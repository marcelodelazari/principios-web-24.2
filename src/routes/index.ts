import { Router } from 'express';
import authRouter from './auth';

const router = Router();

// Monta as rotas de autenticação sem prefixo
router.use(authRouter);

export default router;
