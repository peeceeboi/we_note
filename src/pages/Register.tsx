import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Registration request failed. Please try again.');
    }
  };

  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950">
      <div className="fixed top-0 left-0 right-0 h-16 bg-gray-950/70 shadow-md flex items-center justify-between px-4 z-50">
         <button
          onClick={() => navigate('/login')}
          className="text-white bg-[#5953e0]/90 hover:bg-[#5953e0] py-2 px-4 rounded-2xl"
        > Login
        </button>
        <div className="flex-grow text-center">
            <h1 className="text-3xl text-[#5953e0] font-semibold" style={{ marginLeft: '-71px' }}>weNote</h1>
        </div>
      </div>
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-950/50 text-gray-100 rounded-3xl shadow-lg">
        <h2 className="text-3xl font-bold text-center">Register</h2>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-2xl shadow-sm">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="relative block w-full px-3 py-2 text-gray-100 bg-gray-800 placeholder-gray-500 border border-gray-700 rounded-2xl focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Username"
              />
            </div>
            <div className="mt-3">
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
            <div className="mt-3">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="relative block w-full px-3 py-2 text-gray-100 bg-gray-800 placeholder-gray-500 border border-gray-700 rounded-2xl focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
            <div className="mt-3">
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
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
          <div className="flex justify-end">
            <button
              type="submit"
              className="relative flex justify-center px-4 py-2 text-sm font-medium text-white bg-[#6c63ff] hover:bg-[#5953e0] border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6c63ff]"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
