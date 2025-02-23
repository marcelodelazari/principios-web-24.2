import { Router } from 'express';
import userRouter from './user';
import postsRouter from './posts';

const router = Router();

router.use(userRouter);
router.use(postsRouter);

export default router;
