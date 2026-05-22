import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Palette } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, toggleTheme, colorTone, changeColorTone, colorTones } = useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const toneColors = {
    blue: '#0ea5e9',
    purple: '#8b5cf6',
    green: '#10b981',
    orange: '#f97316',
    pink: '#ec4899'
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-blue-400" />
          )}
        </button>

        {/* Color Tone Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Change Color Tone"
          >
            <Palette className="w-5 h-5" style={{ color: toneColors[colorTone] }} />
          </button>

          {/* Color Picker Dropdown */}
          {showColorPicker && (
            <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-3 shadow-xl z-50">
              <p className="text-xs text-gray-300 mb-2 font-medium">Color Tone</p>
              <div className="grid grid-cols-5 gap-2">
                {Object.keys(toneColors).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => {
                      changeColorTone(tone);
                      setShowColorPicker(false);
                    }}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                      colorTone === tone ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
                    }`}
                    style={{ backgroundColor: toneColors[tone] }}
                    title={tone.charAt(0).toUpperCase() + tone.slice(1)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
