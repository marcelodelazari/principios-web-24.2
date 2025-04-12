import { Router } from "express";
import authRouter from "./auth";
import postsRouter from "./posts";
import userRouter from "./user";
import friendshipRouter from "./friendship";

const router = Router();

router.use(authRouter);
router.use(postsRouter);
router.use(userRouter);
router.use(friendshipRouter);

export default router;
