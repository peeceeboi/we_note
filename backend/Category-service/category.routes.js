import express from 'express';
import categoryController from './category.controller.js';

const categoryRouter = express.Router();

categoryRouter.get('/', categoryController.getAllCategories);
categoryRouter.get('/:categoryId', categoryController.getCategoryById);
categoryRouter.post('/', categoryController.createCategory);
categoryRouter.put('/:categoryId', categoryController.updateCategory);
categoryRouter.delete('/:categoryId', categoryController.deleteCategory);

export default categoryRouter;