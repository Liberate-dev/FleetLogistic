import { createContext, useContext, useState, useEffect } from 'react';

const LayoutContext = createContext(null);

export function LayoutProvider({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const value = { mobileNavOpen, setMobileNavOpen, sidebarOpen, setSidebarOpen };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    return { 
      mobileNavOpen: false, 
      setMobileNavOpen: () => {},
      sidebarOpen: true,
      setSidebarOpen: () => {}
    };
  }
  return context;
}
