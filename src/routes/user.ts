import { Router } from 'express';
import { UserController } from '../controllers/userController';

const userRouter = Router();
const userController = new UserController();

userRouter.post('/register', userController.register);

userRouter.post('/login', userController.login);

userRouter.get('/:id', userController.getUser);

userRouter.put('/:id', userController.updateUser);

userRouter.delete('/:id', userController.deleteUser);

export default userRouter;