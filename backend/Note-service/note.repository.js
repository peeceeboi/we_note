import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const noteRepository = {
  // Get all notes for a specific user
  async getNotesForUser(userId) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .contains('user_ids', [userId]); // Check if userId exists in user_ids array

    if (error) throw new Error(error.message);
    return data;
  },

  // Create a new note
  async createNote({ userId, title, content, category }) {
    const { data, error } = await supabase
      .from('notes')
      .insert([{ title, content, category, user_ids: [userId] }])
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Update a note by its ID
  async updateNote(noteId, { title, content, category }) {
    const edited_at = new Date();
    const { data, error } = await supabase
      .from('notes')
      .update({ title, content, category, edited_at})
      .eq('id', noteId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async removeUser(noteId, userId) {

  },

  async deleteNoteById(noteId, userId) {
    const userdata = await this.getNoteById(noteId);
    const userArray = userdata.user_ids;
  
    const index = userArray.indexOf(userId);
    if (index !== -1) {
      userArray.splice(index, 1);
    }
  
    if (userArray.length === 0) {
      const { data, error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .select('*')
        .single();
  
      if (error) throw new Error(error.message);
      return data;
    } else {
      const editedAt = new Date();
      const { data, error } = await supabase
        .from('notes')
        .update({ user_ids: userArray, edited_at: editedAt })
        .eq('id', noteId)
        .single();
  
      if (error) throw new Error(error.message);
      return data;
    }
  },

  async getNoteById(noteId) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Update the user_ids of a note
  async updateNoteUserIds(noteId, userIds) {
    const { data, error } = await supabase
      .from('notes')
      .update({ user_ids: userIds })
      .eq('id', noteId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

};

export default noteRepository;
