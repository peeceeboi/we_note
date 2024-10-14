import noteCategoryRepository from "./note_cat.repository.js";

const noteCategoryController = {
  
  async createNoteCategory(req, res) {
    try {
      const noteCategory = await noteCategoryRepository.createNoteCategory(req.body);
      res.status(201).json({ noteCategory });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getNoteCategoriesByNoteId(req, res) {
    try {
      const noteCategories = await noteCategoryRepository.getNoteCategoriesByNoteId(req.params.noteId);
      res.status(200).json({ noteCategories });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
  
  async getNoteCategoryByNoteIdAndCategoryId(req, res) {
    try {
      const { noteId, categoryId } = req.params;
      const noteCategory = await noteCategoryRepository.getNoteCategoryByNoteIdAndCategoryId(noteId, categoryId);
      if (!noteCategory) {
        res.status(404).json({ error: 'No note category found' });
      } else {
        res.status(200).json({ noteCategory });
      }
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  async getNoteCategoriesByCategoryId(req, res) {
    try {
      const noteCategories = await noteCategoryRepository.getNoteCategoriesByCategoryId(req.params.categoryId);
      res.status(200).json({ noteCategories });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  async deleteNoteCategory(req, res) {
    try {
      await noteCategoryRepository.deleteNoteCategory(req.params.id);
      res.status(204).json();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default noteCategoryController;