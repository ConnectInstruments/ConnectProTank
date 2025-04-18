
import { createContext, useContext, useState, ReactNode } from 'react';

interface LogoContextType {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

export function LogoProvider({ children }: { children: ReactNode }) {
  const [logoUrl, setLogoUrl] = useState('/logo.svg');

  return (
    <LogoContext.Provider value={{ logoUrl, setLogoUrl }}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
}
