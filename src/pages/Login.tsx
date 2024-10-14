import { useNavigate } from 'react-router-dom';
import { useState, FormEvent } from 'react';

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/');
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950">
       <div className="fixed top-0 left-0 right-0 h-16 bg-gray-950/70 shadow-md flex items-center justify-between px-4 z-50">
        <div className="flex-grow text-center">
            <h1 className="text-3xl text-[#5953e0] font-semibold">weNote</h1>
        </div>
      </div>
     <div className="w-full max-w-md p-8 space-y-6 bg-gray-950/50 text-gray-100 rounded-3xl shadow-lg">
      <h2 className="text-3xl font-bold text-center">Sign In</h2>
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
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberMe}
              className="h-4 w-4 text-purple-500 bg-gray-900 border-gray-700 rounded focus:ring-purple-500"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-200">Remember Me</label>
          </div>
          <button
            type="submit"
            className="relative flex justify-center px-4 py-2 text-sm font-medium text-white bg-[#6c63ff] hover:bg-[#5953e0] border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6c63ff]"
          >
            Sign In
          </button>
        </div>
        <div className="flex justify-between mt-4">
          <button 
            className="text-sm text-[#6c63ff] hover:text-[#5953e0] cursor-pointer"
            onClick={() => navigate('/recover')}>
            Forgot Password?
          </button>
        </div>
        <p className="text-sm text-center text-gray-400 mt-4">
          Don't have an account? 
          <button 
            className="text-[#6c63ff] hover:text-[#5953e0] cursor-pointer ml-1"
            onClick={() => navigate('/register')}> 
            Create New Account
          </button>
        </p>
      </form>
    </div>
    </div>
  );
}
