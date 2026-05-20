import en from '../locales/en.json';
import es from '../locales/es.json';

const resources = { en, es };

let current = localStorage.getItem('language') || 'en';

export const t = (key) => {
  return resources[current]?.[key] ?? key;
};

export const changeLanguage = (lng) => {
  current = lng;
  localStorage.setItem('language', lng);
};

export const getLanguage = () => current;

export default { t, changeLanguage, getLanguage };
