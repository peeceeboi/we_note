import express from 'express';
import noteCategoryController from './note_cat.controller.js';

const noteCategoryRouter = express.Router();

noteCategoryRouter.post('/', noteCategoryController.createNoteCategory);
noteCategoryRouter.get('/note/:noteId/category/:categoryId', noteCategoryController.getNoteCategoryByNoteIdAndCategoryId);
noteCategoryRouter.get('/note/:noteId', noteCategoryController.getNoteCategoriesByNoteId);
noteCategoryRouter.get('/category/:categoryId', noteCategoryController.getNoteCategoriesByCategoryId);
noteCategoryRouter.delete('/:id', noteCategoryController.deleteNoteCategory);

export default noteCategoryRouter;