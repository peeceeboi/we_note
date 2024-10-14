import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import * as z from 'zod';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

const ChangePassword: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  
  const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long');

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setEmail(data?.user?.email || null);
      }
    };

    checkUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      passwordSchema.parse(newPassword);

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!email) {
        setError('User email is missing');
        return;
      }

      // Hash the new password using the backend endpoint
      const hashResponse = await fetch('http://localhost:3001/hash-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const hashData = await hashResponse.json();

      if (!hashResponse.ok) {
        setError(hashData.error || 'Failed to hash password');
        return;
      }

      setNewPassword('');
      setConfirmPassword('');
      setMessage('Password updated successfully!');
      setTimeout(() => navigate('/login'), 1500); // Redirect to login after 1.5 seconds
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('Failed to update password');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950">
       <div className="fixed top-0 left-0 right-0 h-16 bg-gray-950/70 shadow-md flex items-center justify-between px-4 z-50">
        <div className="flex-grow text-center">
            <h1 className="text-3xl text-[#5953e0] font-semibold">weNote</h1>
        </div>
      </div>
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 text-gray-100 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center">Change Password</h2>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-2xl shadow-sm">
            <div className="mt-3">
              <label htmlFor="new-password" className="sr-only">New Password</label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="relative block w-full px-3 py-2 text-gray-100 bg-gray-800 placeholder-gray-500 border border-gray-700 rounded-2xl focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="New Password"
              />
            </div>
            <div className="mt-3">
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="relative block w-full px-3 py-2 text-gray-100 bg-gray-800 placeholder-gray-500 border border-gray-700 rounded-2xl focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
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
              onClick={() => navigate('/login')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;