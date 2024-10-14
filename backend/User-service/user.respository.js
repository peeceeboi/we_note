import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


const userRepository = {
  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, created_at')
      .eq('id', id);

    if (error) throw error;
    return data[0];
  },

  async updateUser(id, user) {
    const { data, error } = await supabase
      .from('users')
      .update([{username: user.username, email: user.email }])
      .eq('id', id);

    if (error) throw error;
    return data;
  },

  async deleteUser(id) {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return data;
  },

  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getUsersByIds(userIds) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username') // Only select the id and username
      .in('id', userIds);

    if (error) throw new Error(error.message);
    return data;
  },

};

export default userRepository;