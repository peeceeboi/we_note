import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const noteCategoryRepository = {
  async createNoteCategory({ noteId, categoryId }) {
    const { data, error } = await supabase
      .from('note_categories')
      .insert([{ note_id: noteId, category_id: categoryId }])
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getNoteCategoriesByNoteId(noteId) {
    const { data, error } = await supabase
      .from('note_categories')
      .select('id, note_id, category_id')
      .eq('note_id', noteId);

    if (error) throw error;
    return data;
  },
  
  async getNoteCategoryByNoteIdAndCategoryId(noteId, categoryId) {
    const { data, error } = await supabase
      .from('note_categories')
      .select('id, note_id, category_id')
      .eq('note_id', noteId)
      .eq('category_id', categoryId)
      .maybeSingle();
  
    if (error) throw new Error(error.message);
    return data;
  },


  async getNoteCategoriesByCategoryId(categoryId) {
    const { data, error } = await supabase
      .from('note_categories')
      .select('id, note_id, category_id')
      .eq('category_id', categoryId);

    if (error) throw error;
    return data;
  },

  async deleteNoteCategory(id) {
    const { data, error } = await supabase
      .from('note_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return data;
  },
};

export default noteCategoryRepository;