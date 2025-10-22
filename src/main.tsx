import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// RTL Language Support
const RTLWrapper = () => {
  useEffect(() => {
    // Get language from localStorage or default to Arabic
    const savedLanguage = localStorage.getItem('language') || 'ar';
    
    // Set document attributes for RTL support
    document.documentElement.lang = savedLanguage;
    document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    
    // Add/remove RTL class for styling
    if (savedLanguage === 'ar') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, []);

  return <App />;
};

// Force cache clear for theme rebuild  
const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <RTLWrapper />
  </StrictMode>
);
