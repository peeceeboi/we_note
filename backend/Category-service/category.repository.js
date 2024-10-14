import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


const categoryRepository = {
  async createCategory({ name, description}) {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, description }])
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getCategoryById(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description, created_at')
      .eq('id', id);

    if (error) throw error;
    return data[0];
  },

  async getAllCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description, created_at');
  
    if (error) throw error;
    return data;
  },
  
  async updateCategory(id, category) {
    const { data, error } = await supabase
      .from('categories')
      .update([{ name: category.name, description: category.description }])
      .eq('id', id);

    if (error) throw error;
    return data;
  },

  async deleteCategory(id) {
    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return data;
  },
};

export default categoryRepository;