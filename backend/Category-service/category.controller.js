import categoryRepository from "./category.repository.js";

const categoryController = {
  
  async getCategoryById(req, res) {
    try {
      const category = await categoryRepository.getCategoryById(req.params.categoryId);
      res.status(200).json({ category });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  async getAllCategories(req, res) {
    try {
      const categories = await categoryRepository.getAllCategories();
      res.status(200).json({ categories });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createCategory(req, res) {
    try {
      const category = await categoryRepository.createCategory(req.body);
      res.status(201).json({ category });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateCategory(req, res) {
    try {
      const category = await categoryRepository.updateCategory(req.params.categoryId, req.body);
      res.status(200).json({ category });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteCategory(req, res) {
    try {
      await categoryRepository.deleteCategory(req.params.categoryId);
      res.status(204).json();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default categoryController;