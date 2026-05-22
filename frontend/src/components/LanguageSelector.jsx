import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' }
  ];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition">
        <Globe size={18} className="text-primary-400" />
        <span className="text-sm text-dark-300">
          {languages.find(lang => lang.code === i18n.language)?.nativeName || 'English'}
        </span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-dark-700 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full text-left px-4 py-3 text-sm hover:bg-dark-700 transition first:rounded-t-lg last:rounded-b-lg ${
              i18n.language === lang.code ? 'bg-primary-500/20 text-primary-400' : 'text-dark-300'
            }`}
          >
            <span className="font-medium">{lang.nativeName}</span>
            <span className="ml-2 text-dark-500 text-xs">({lang.name})</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
