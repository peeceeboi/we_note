import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Profile() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Custom toast options to match your theme
  const customToastOptions: ToastOptions = {
    className: 'bg-gray-900 text-white',
    bodyClassName: 'text-sm font-medium',
    progressClassName: 'bg-purple-600',
    position: 'top-center',
    autoClose: 2000, // 2 seconds duration
  };

  const updateAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch(`http://localhost:3001/api/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAvatar(data.filePath); // Update avatar state with the new file path
        toast.success('Avatar updated successfully!', customToastOptions);
      } else {
        toast.error('Failed to update avatar', customToastOptions);
      }
    } catch (error) {
      toast.error('Error updating avatar', customToastOptions);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:3001/users/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const { user } = await response.json();
          setUsername(user.username);
          setEmail(user.email);
          setAvatar(user.avatar); // Set avatar state with the user's avatar URL
          setUserId(user.id);
        } else {
          console.error('Failed to fetch profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:3001/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, email }),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!', customToastOptions);
        setTimeout(() => {
          navigate('/');
        }, 2500);
      } else {
        const { error } = await response.json();
        toast.error(`Failed to update profile: ${error}`, customToastOptions);
      }
    } catch (error) {
      toast.error('Error updating profile', customToastOptions);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (confirmation) {
      try {
        const response = await fetch(`http://localhost:3001/users/${userId}`, {
          method: 'DELETE',
          credentials: 'include', // Send credentials to include the JWT token
        });

        if (response.ok) {
          toast.success('Account deleted successfully!', customToastOptions);
          setTimeout(() => {
            navigate('/login');
          }, 2500);
        } else {
          const { error } = await response.json();
          toast.error(`Failed to delete account: ${error}`, customToastOptions);
        }
      } catch (error) {
        toast.error('Error deleting account', customToastOptions);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950">
        <div className="flex items-center justify-center space-x-2 text-white">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-[#5953e0]"></div>
          <div className="text-lg font-medium">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950">
      <ToastContainer />
      <div className="fixed top-0 left-0 right-0 h-16 bg-gray-950/70 shadow-md flex items-center justify-between px-4 z-50">
        <button
          onClick={() => navigate('/')}
          className="text-white bg-[#5953e0]/90 hover:bg-[#5953e0] py-2 px-4 rounded-2xl"
        >
          Dashboard
        </button>
        <div className="flex-grow text-center">
            <h1 className="text-3xl text-[#5953e0] font-semibold" style={{ marginLeft: '31px' }}>weNote</h1>
        </div>
         <button
              type="button" // Make it a button to trigger handleDeleteAccount
              onClick={handleDeleteAccount} // Trigger delete account function on click
              className="relative px-4 py-2 text-white font-medium text-white bg-red-500 hover:bg-red-600 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6c63ff]">
              Delete Account
            </button> 
      </div>
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-950/50 text-gray-100 rounded-2xl shadow-lg mt-20">
        <h2 className="text-3xl font-bold text-center">Profile</h2>

        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {avatar ? (
              <img
                src={`http://localhost:3001${avatar}`}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-800"
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 text-3xl font-semibold">
                {username ? username.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setAvatar(URL.createObjectURL(e.target.files[0]));
                  updateAvatar(e.target.files[0]); // Call updateAvatar to upload the file
                }
              }}
            />
            <button
              onClick={() => document.getElementById('avatar-upload')?.click()}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-[#5953e0]/90 text-white py-1 px-3 rounded-2xl hover:bg-[#5953e0]"
            >
              Change
            </button>
          </div>
        </div>

        {/* Form for updating username and email */}
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
                className="relative block w-full px-3 py-2 text-gray-100 bg-gray-800 placeholder-gray-500 border border-gray-700 rounded-2xl focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Username"
              />
            </div>
            <div className="mt-3">
              <label htmlFor="email" className="sr-only">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-3 py-2 text-gray-100 bg-gray-800 placeholder-gray-500 border border-gray-700 rounded-2xl focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Email Address"
              />
            </div>
          </div>

          <div className="flex flex-row mt-4 space-x-3 justify-center">
            <button
              type="submit"
              className="relative px-4 py-2 text-sm font-semibold text-white bg-green-500/90 hover:bg-green-500 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Update Profile
            </button>
           
          </div>
        </form>
      </div>
    </div>
  );
}