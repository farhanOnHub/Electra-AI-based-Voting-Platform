import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  // Check for system preferences
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setReducedMotion(true);
    }
  }, []);

  const toggleHighContrast = () => setHighContrast(!highContrast);
  const toggleLargeText = () => setLargeText(!largeText);
  const toggleReducedMotion = () => setReducedMotion(!reducedMotion);
  const toggleScreenReaderMode = () => setScreenReaderMode(!screenReaderMode);

  return (
    <AccessibilityContext.Provider value={{
      highContrast,
      largeText,
      reducedMotion,
      screenReaderMode,
      toggleHighContrast,
      toggleLargeText,
      toggleReducedMotion,
      toggleScreenReaderMode
    }}>
      <div className={`
        ${highContrast ? 'high-contrast' : ''}
        ${largeText ? 'large-text' : ''}
        ${reducedMotion ? 'reduced-motion' : ''}
      `}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
