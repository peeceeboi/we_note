import { useNavigate } from 'react-router-dom';
interface HeaderProps {
    scrollToTarget: (target: 'editor' | 'settings') => void;
  }
  
  function Header({ scrollToTarget }: HeaderProps) {
    const navigate = useNavigate();
    return (
      <header
        className="absolute top-0 w-full py-4 flex justify-between items-center bg-gradient-to-r from-slate-500 to-slate-200 bg-opacity-80"
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="logo">
            <h1 className="text-2xl font-bold text-white">
              <span className="text-accent">App</span>Logo
            </h1>
          </div>
          <nav>
            <ul className="flex space-x-4 text-white">
              <li>
                <a onClick={() => scrollToTarget('editor')} className="hover:text-accent-700 transition duration-300">
                  Editor
                </a>
              </li>
              <li>
                <a onClick={() => scrollToTarget('settings')} className="hover:text-accent-700 transition duration-300">
                  Settings
                </a>
              </li>
            </ul>
          </nav>
          <div className="flex items-center">
          <div className="flex items-center">
            <button onClick={() => navigate('/login')}>Sign In</button>
          </div>
          </div>
        </div>
      </header>
    );
  }
  
  export default Header;