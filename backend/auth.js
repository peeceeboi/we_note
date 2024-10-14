import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Supabase setup
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// JWT secret for signing tokens
const JWT_SECRET = process.env.JWT_SECRET;

// Register a new user
export async function registerUser(email, password, username) {
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return { success: false, message: 'User already exists' };
    }

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email,
        username,
        password: hashedPassword
      }])
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'User created successfully', user: newUser };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// Login user
export async function loginUser(email, password, rememberMe) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return { success: false, message: 'Invalid login credentials' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, message: 'Invalid login credentials' };
    }
    
    //always set the JWT to expire in 30 days, since the user can choose to remember the login. 
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    return { success: true, token, message: 'Login successful' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// Logout user (clear cookie)
export function logoutUser(res) {
  res.clearCookie('access_token', {
    httpOnly: true,
  });
  return { success: true, message: 'Logged out successfully' };
}

// Verify JWT token middleware
export function verifyToken(req, res, next) {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. No access token found.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // This will give access to the `userId` in future requests
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
}
