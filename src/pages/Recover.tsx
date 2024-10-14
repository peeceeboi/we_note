import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import * as z from 'zod';

// Initialize Supabase using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const emailSchema = z.string().email('Invalid email address'); // Ensures it's a valid email format

const Recover: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Use useEffect to log the environment variables when the component mounts
  useEffect(() => {
  }, []);

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/change-password',  
    });

    if (error) {
      setMessage('Error sending password reset email: ' + error.message);
    } else {
      setMessage('Password reset email sent successfully!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Reset error state

    // Validate email using Zod
    try {
      emailSchema.parse(email); // Throws error if email is invalid
      await handlePasswordReset();
      setEmail(''); // Clear email after successful submission
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message); // Set the first error message
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const handleCancel = () => {
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen  bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950">
       <div className="fixed top-0 left-0 right-0 h-16 bg-gray-950/70 shadow-md flex items-center justify-between px-4 z-50">
        <div className="flex-grow text-center">
            <h1 className="text-3xl text-[#5953e0] font-semibold">weNote</h1>
        </div>
      </div>
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-950/50 text-gray-100 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center">Recover Password</h2>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-2xl shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="relative block w-full px-3 py-2 text-gray-100 bg-gray-800 placeholder-gray-500 border border-gray-700 rounded-2xl focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {message && <p className="text-green-500 text-sm text-center">{message}</p>}
          <div className="flex items-center justify-between mt-4">
            <button
              type="submit"
              className="relative flex justify-center px-4 py-2 text-sm font-medium text-white bg-[#6c63ff] hover:bg-[#5953e0] border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6c63ff]"
            >
              Submit
            </button>
            <button
              type="button"
              className="relative flex justify-center px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Recover;