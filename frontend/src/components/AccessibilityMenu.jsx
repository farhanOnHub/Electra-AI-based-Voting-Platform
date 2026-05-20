import React from 'react';
import { useAccessibility } from './AccessibilityWrapper';
import { Eye, Type, Zap, Volume2, X } from 'lucide-react';

export const AccessibilityMenu = ({ onClose }) => {
  const {
    highContrast,
    largeText,
    reducedMotion,
    screenReaderMode,
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion,
    toggleScreenReaderMode
  } = useAccessibility();

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl w-72">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Accessibility</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={toggleHighContrast}
          className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
            highContrast ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span>High Contrast</span>
        </button>

        <button
          onClick={toggleLargeText}
          className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
            largeText ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Type className="w-5 h-5" />
          <span>Large Text</span>
        </button>

        <button
          onClick={toggleReducedMotion}
          className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
            reducedMotion ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span>Reduced Motion</span>
        </button>

        <button
          onClick={toggleScreenReaderMode}
          className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
            screenReaderMode ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Volume2 className="w-5 h-5" />
          <span>Screen Reader Mode</span>
        </button>
      </div>
    </div>
  );
};
