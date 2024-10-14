import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../header";

const HomePage = ({ scrollToTarget }: { scrollToTarget: (target: 'editor' | 'settings') => void }) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const settingsRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3001/logout', {
        method: 'POST',
        credentials: 'include', // Send the cookies
      });

      if (response.ok) {
        // Clear localStorage or session data
        localStorage.removeItem('isAuthenticated');
        // Redirect to login page
        navigate('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  return (
    <>
      <div className="relative w-full min-h-screen bg-gradient-to-r from-slate-300 to-white items-center justify-center flex flex-col p-20">
        <Header scrollToTarget={scrollToTarget} />
        {/* Add Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-red-500 text-white font-bold rounded-md"
        >
          Logout
        </button>
      </div>
      <div ref={editorRef} className="relative w-full min-h-screen bg-gradient-to-r from-purple-300 to-white items-center justify-center flex flex-col p-20">
        Editor Page
      </div>
      <div ref={settingsRef} className="relative w-full min-h-screen bg-gradient-to-r from-green-300 to-white items-center justify-center flex flex-col p-20">
        Settings Page
      </div>
    </>
  );
};

export default HomePage;
