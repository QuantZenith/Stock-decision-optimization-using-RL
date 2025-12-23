import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { authApi } = await import('../api/authApi.js');
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logout());
      navigate('/');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-6">
      <nav className="glass-panel w-full max-w-6xl rounded-full border border-white/40 dark:border-white/5 shadow-card px-4 py-3 pl-6 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="size-10 flex items-center justify-center bg-gradient-to-br from-landing-primary to-landing-primary-dark text-white rounded-full shadow-lg shadow-landing-primary/20">
            <span className="material-symbols-outlined text-xl">query_stats</span>
          </div>
          <h2 className="text-xl font-display font-bold tracking-tight text-landing-text dark:text-white hidden sm:block">
            Nifty 50 Trader
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <a href="#" className="text-sm font-medium text-landing-muted hover:text-landing-primary transition-colors">Features</a>
          <a href="#" className="text-sm font-medium text-landing-muted hover:text-landing-primary transition-colors">Performance</a>
          <a href="#" className="text-sm font-medium text-landing-muted hover:text-landing-primary transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-landing-surface dark:bg-[#211A1A] rounded-full">
                <div className="size-8 rounded-full bg-gradient-to-br from-landing-primary to-landing-primary-dark text-white flex items-center justify-center text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-semibold text-landing-text dark:text-white">
                  {user?.name || 'User'}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-11 px-7 bg-landing-text dark:bg-landing-surface text-white dark:text-landing-text text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-lg mr-1">logout</span>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block text-sm font-semibold text-landing-text dark:text-white px-5 py-2 hover:text-landing-primary transition-colors">
                Login
              </Link>
              <Link to="/signup" className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-11 px-7 bg-landing-text dark:bg-landing-surface text-white dark:text-landing-text text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 hover:bg-white hover:text-landing-text dark:hover:bg-landing-text dark:hover:text-white border-2 border-transparent hover:border-landing-text dark:hover:border-landing-surface transition-all duration-300">
                <span>Get Started</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;