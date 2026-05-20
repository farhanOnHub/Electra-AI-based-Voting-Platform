import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-950 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-400 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg"></div>
              Electra
            </Link>
            <p className="text-dark-400 text-sm">Secure online voting platform for organizations and events.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-dark-400">
              <li><Link to="/" className="hover:text-primary-400 transition">Home</Link></li>
              <li><Link to="/" className="hover:text-primary-400 transition">About</Link></li>
              <li><Link to="/" className="hover:text-primary-400 transition">Features</Link></li>
              <li><Link to="/" className="hover:text-primary-400 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-dark-400">
              <li><a href="#" className="hover:text-primary-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-400 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-400 transition">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-primary-400 transition">Disclaimer</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-dark-400">
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:info@electra.com" className="hover:text-primary-400 transition">info@electra.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <a href="tel:+1234567890" className="hover:text-primary-400 transition">+1 (234) 567-890</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-dark-400 text-sm">&copy; {currentYear} Electra. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-dark-400 hover:text-primary-400 transition">Facebook</a>
            <a href="#" className="text-dark-400 hover:text-primary-400 transition">Twitter</a>
            <a href="#" className="text-dark-400 hover:text-primary-400 transition">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
