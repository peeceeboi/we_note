import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { registerUser, loginUser, logoutUser, verifyToken } from './auth.js'; // Import auth functions
import userRouter from './User-service/user.routes.js';
import noteRouter from './Note-service/note.routes.js'; // Import the notes router
import path from 'path';
import { fileURLToPath } from 'url';
import categoryRouter from './Category-service/category.routes.js';
import noteCategoryRouter from './Note_Category-service/note_cat.routes.js';
import { registerValidation, loginValidation } from './validation.js'; // Import validation schemas
import {Server} from 'socket.io';
import { createServer } from "http";
import bcrypt from 'bcrypt';

dotenv.config();
const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors:{
    origin: 'http://localhost:5173', 
    credentials: true, // Allows cookies to be sent to/from the front-end
  },
})

// Supabase setup for other routes
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, // Allows cookies to be sent to/from the front-end
}));
app.use(express.json());
app.use(cookieParser());

// Define __dirname using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const disconnectUser = (socket, username) => {
  for(const room of socket.rooms){
    if (rooms.has(room)) {
      //...
      let inRoom = rooms.get(room);
      let remainingInRoom = [];
      for (const user of inRoom) {
        if (user != username) {
          //...
          remainingInRoom.push(user);
        }
      }
      rooms.set(room, remainingInRoom);
      io.in(room).emit('Online', remainingInRoom);
      socket.leave(room);
    } 
  };
};

const rooms = new Map();
const users = new Map();

io.on("connection", (socket) => {
  socket.on("OpenNote", (noteId, username) => {
    if (!users.has(socket.id)) {
      users.set(socket.id, username);
    }

    if (!socket.rooms.has(noteId)) {
      if (rooms.has(noteId)) {
          let inRoom = rooms.get(noteId);
          if (!inRoom.includes(username)){
            inRoom.push(username);
            rooms.set(noteId, inRoom);
          }
      } else {
        rooms.set(noteId, [username]);
      }

      disconnectUser(socket, username);
      
      socket.join(noteId);
      io.in(noteId).emit('Online', rooms.get(noteId));
    }
  });

  socket.on("ContentChange", (note) => {
    socket.in(note.id).emit("ContentChange", note);
  });
  
  socket.on('disconnect', (reason) => {
    disconnectUser(socket, users.get(socket.id));
  })

  socket.on('logout', () => {
    disconnectUser(socket, users.get(socket.id));
  })
});

// API route: Health check
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// --------------------- Auth Routes ---------------------

// User registration
app.post('/signup', async (req, res) => {
  try {
    const validatedData = registerValidation.parse(req.body);
    const { email, password, username } = validatedData;
    const result = await registerUser(email, password, username);
    if (result.success) {
      res.status(201).json({ message: result.message, user: result.user });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (e) {
    res.status(400).json({ error: e.errors });
  }
});

// User login
app.post('/login', async (req, res) => {
  try {
    const validatedData = loginValidation.parse(req.body);
    const { email, password, rememberMe } = validatedData;
    const result = await loginUser(email, password, rememberMe);
    if (result.success) {
      if (rememberMe) {
        res.cookie('access_token', result.token, {maxAge: 60 * 60 * 24 * 30 * 1000, httpOnly: true}); //cookie persists for 30 days
      } else {
        res.cookie('access_token', result.token, {httpOnly: true}); //session cookie
      }

      res.status(200).json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (e) {
    res.status(400).json({ error: e.errors });
  }
});

// User logout
app.post('/logout', (req, res) => {
  const result = logoutUser(res);
  res.status(200).json({ message: result.message });
});

// --------------------- Protected Routes (with JWT Verification) ---------------------

// Dynamic import for multer since usual imports are not supported 
const { default: multer } = await import('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', verifyToken, upload.single('avatar'), async (req, res) => {
  const { userId } = req.user;
  const filePath = `/uploads/${req.file.filename}`;

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ avatar: filePath })
      .eq('id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'File uploaded successfully', filePath });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add notes routes
app.use('/notes', verifyToken, noteRouter);

// Add category routes
app.use('/categories', verifyToken, categoryRouter);

// Add note_category routes
app.use('/notecat', verifyToken, noteCategoryRouter);

// Fetch authenticated user's profile
app.get('/users/me', verifyToken, async (req, res) => {
  const { userId } = req.user; // Assuming verifyToken sets req.user
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, avatar')
      .eq('id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ user: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Now, attach the userRouter for other user-related routes
app.use('/users', verifyToken, userRouter);

// API route: Refresh Token (if needed)
app.post('/refresh', async (req, res) => {
  try {
    const { session, error } = await supabase.auth.refreshSession();
    if (error) return res.status(400).json({ error: error.message });

    res.cookie('access_token', session.access_token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
    });

    res.status(200).json({ session });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE route for deleting user profile
app.delete('/users/:id', verifyToken, async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;

  if (userId !== id) {
    // Ensure users can only delete their own profile
    return res.status(403).json({ error: 'Unauthorized action' });
  }

  try {
    // Delete user from Supabase
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId); // Only delete the logged-in user's profile

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Clear access_token cookie after deletion
    res.clearCookie('access_token');
    
    res.status(200).json({ message: 'User profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/hash-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in Supabase
    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email);
      
    if (error) {
      console.error('Error updating password:', error);
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});