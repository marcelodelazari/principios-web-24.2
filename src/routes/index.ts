import { Router } from 'express';
import authRouter from './auth';
import postsRouter from './posts';

const router = Router();

router.use(authRouter);
router.use(postsRouter);

export default router;
