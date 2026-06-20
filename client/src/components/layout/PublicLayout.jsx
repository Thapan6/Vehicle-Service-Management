import React, { useEffect, useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  TruckIcon, 
  SunIcon, 
  MoonIcon 
} from '../../utils/Icons';

const PublicLayout = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen bg-lightbg dark:bg-darkbg text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden flex flex-col justify-between selection:bg-primary/30 selection:text-primary">
      
      {/* --- PUBLIC NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-darkbg/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform duration-300">
              <TruckIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase whitespace-nowrap">
              VSM<span className="text-primary tracking-normal ml-0.5">Platform</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform animate-all duration-300"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-indigo-500" />}
            </button>
            <div className="flex items-center gap-4">
              {userInfo ? (
                <Link to="/dashboard" className="btn-primary py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 text-sm font-bold">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 text-sm font-bold">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-grow pt-20">
        <Outlet />
      </main>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary/20 p-1.5 rounded-lg text-primary">
              <TruckIcon className="w-5 h-5" />
            </div>
            <span className="font-black text-slate-800 dark:text-white uppercase tracking-tighter">VSM</span>
          </Link>
          <div className="flex gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
             <Link to="/" className="hover:text-primary transition-colors">Home</Link>
             <Link to="/documentation" className="hover:text-primary transition-colors">Documentation</Link>
             <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
          <p className="text-xs font-bold text-slate-400">© 2026 VSM Platform. Built for the future of service.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
