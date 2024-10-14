import express from 'express';
import noteController from './note.controller.js';

const noteRouter = express.Router();

// Fetch all notes for the logged-in user
noteRouter.get('/', noteController.getNotesForUser);

// Create a new note
noteRouter.post('/', noteController.createNote);

// Update an existing note by ID
noteRouter.put('/:noteId', noteController.updateNote);

// Share a note with another user
noteRouter.post('/:noteId/share', noteController.shareNoteWithUser);

noteRouter.get('/:noteId/collaborators', noteController.getCollaborators);

noteRouter.delete('/:noteId', noteController.deleteNote);
export default noteRouter;
