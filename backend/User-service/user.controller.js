import userRepository from "./user.respository.js";

const userController = {
  
  async getUserById(req, res) {
    try {
      const user = await userRepository.getUserById(req.params.userId);
      res.status(200).json({ user });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      const user = await userRepository.updateUser(req.params.userId, req.body);
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteUser(req, res) {
    try {
      const user = await userRepository.deleteUser(req.params.userId);
      res.status(204).json();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getUserByEmail(req, res) {
    const { email } = req.params;
    try {
      const user = await userRepository.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  

};

export default userController;