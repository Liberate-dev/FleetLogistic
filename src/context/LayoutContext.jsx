import { createContext, useContext, useState, useEffect } from 'react';

const LayoutContext = createContext(null);

export function LayoutProvider({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Lock scroll when nav open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  const value = { mobileNavOpen, setMobileNavOpen };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    // Return safe defaults when used outside provider (e.g., during development)
    return { mobileNavOpen: false, setMobileNavOpen: () => {} };
  }
  return context;
}
