import { Router } from 'express';
import authRouter from './auth';
import postsRouter from './posts';
import userRouter from './user';

const router = Router();

router.use(authRouter);
router.use(postsRouter);
router.use(userRouter);

export default router;
