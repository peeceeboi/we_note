import express from 'express';
import userController from './user.controller.js';

const userRouter = express.Router();

userRouter.get('/:userId', userController.getUserById);
userRouter.put('/:userId', userController.updateUser);
userRouter.delete('/:userId', userController.deleteUser);
userRouter.get('/email/:email', userController.getUserByEmail);

export default userRouter;