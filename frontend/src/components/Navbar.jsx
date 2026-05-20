import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, Home, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { t, changeLanguage, getLanguage } from '../utils/i18nSimple';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-400">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg"></div>
            Electra
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-white hover:text-primary-400 transition">{t('login')}</Link>
                <Link to="/register" className="btn-primary">{t('register')}</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-white hover:text-primary-400 transition flex items-center gap-2">
                  <Home size={18} />
                  {t('dashboard')}
                </Link>
                <Link to="/notifications" className="text-white hover:text-primary-400 transition">
                  {t('notifications')}
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-white hover:text-primary-400 transition">{t('adminPanel')}</Link>
                )}
                {user?.role === 'superAdmin' && (
                  <Link to="/admin/super" className="text-white hover:text-primary-400 transition">{t('platformAdmin')}</Link>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <select
                      aria-label="Language"
                      defaultValue={getLanguage()}
                      onChange={(e) => changeLanguage(e.target.value)}
                      className="bg-transparent border border-white/10 text-white px-2 py-1 rounded"
                    >
                      <option value="en">EN</option>
                      <option value="es">ES</option>
                    </select>

                    <button onClick={toggleTheme} className="text-white">
                      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                  </div>

                  <Link to="/profile" className="text-white hover:text-primary-400 transition">
                    <User size={20} />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-red-400 transition"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-4">
            <div className="flex items-center gap-3 px-2">
              <select
                aria-label="Language"
                defaultValue={localStorage.getItem('language') || 'en'}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent border border-white/10 text-white px-2 py-1 rounded"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
              </select>
              <button onClick={toggleTheme} className="text-white">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="block text-white hover:text-primary-400">{t('login')}</Link>
                <Link to="/register" className="block btn-primary text-center">{t('register')}</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="block text-white hover:text-primary-400">{t('dashboard')}</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block text-white hover:text-primary-400">{t('adminPanel')}</Link>
                )}
                {user?.role === 'superAdmin' && (
                  <Link to="/admin/super" className="block text-white hover:text-primary-400">{t('platformAdmin')}</Link>
                )}
                <Link to="/profile" className="block text-white hover:text-primary-400">{t('profile')}</Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-400 hover:text-red-300"
                >
                  {t('logout')}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
