import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, Home, Vote } from 'lucide-react';
import { t, changeLanguage, getLanguage } from '../utils/i18nSimple';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-gray-900">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Vote className="text-white" size={24} />
            </div>
            Electra
          </Link>

          {/* Desktop Menu - Public */}
          <div className="hidden md:flex items-center gap-8">
            {!isAuthenticated ? (
              <>
                <div className="flex items-center gap-4">
                  <Link to="/login" className="px-6 py-2.5 border-2 border-green-500 text-green-600 rounded-full font-semibold hover:bg-green-50 transition">
                    Log in
                  </Link>
                  <Link to="/register" className="px-6 py-2.5 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition">
                    Register
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-green-600 transition flex items-center gap-2 font-medium">
                  <Home size={18} />
                  {t('dashboard')}
                </Link>
                <Link to="/notifications" className="text-gray-600 hover:text-green-600 transition font-medium">
                  {t('notifications')}
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-green-600 transition font-medium">{t('adminPanel')}</Link>
                )}
                {user?.role === 'superAdmin' && (
                  <Link to="/admin/super" className="text-gray-600 hover:text-green-600 transition font-medium">{t('platformAdmin')}</Link>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <select
                      aria-label="Language"
                      defaultValue={getLanguage()}
                      onChange={(e) => changeLanguage(e.target.value)}
                      className="bg-transparent border border-gray-300 text-gray-700 px-2 py-1 rounded"
                    >
                      <option value="en">EN</option>
                      <option value="es">ES</option>
                    </select>
                  </div>

                  <Link to="/profile" className="text-gray-600 hover:text-green-600 transition">
                    <User size={20} />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-500 transition"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4 bg-white">
            <div className="flex items-center gap-3 px-2">
              <select
                aria-label="Language"
                defaultValue={localStorage.getItem('language') || 'en'}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent border border-gray-300 text-gray-700 px-2 py-1 rounded"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
              </select>
            </div>

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="block text-gray-600 hover:text-green-600 px-2">Log in</Link>
                <Link to="/register" className="block px-4 py-2 bg-green-500 text-white text-center rounded-full font-semibold">Register</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="block text-gray-600 hover:text-green-600 px-2">{t('dashboard')}</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block text-gray-600 hover:text-green-600 px-2">{t('adminPanel')}</Link>
                )}
                {user?.role === 'superAdmin' && (
                  <Link to="/admin/super" className="block text-gray-600 hover:text-green-600 px-2">{t('platformAdmin')}</Link>
                )}
                <Link to="/profile" className="block text-gray-600 hover:text-green-600 px-2">{t('profile')}</Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-500 hover:text-red-600 px-2"
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
