// src/providers/themeProvider.jsx (or wherever it lives)

import React, { useContext, useEffect } from "react";
import { ThemeContext } from "../context/themeContext"; // Adjust path if needed

// *** IMPORTANT: Define your theme colors here ***
// *** Make sure the keys (e.g., "--softBg") MATCH EXACTLY what your SCSS uses ***
const lightTheme = {
  "--bg": "#ffffff",
  "--softBg": "#f1f5f9",
  "--bg-light": "#ffffff",
  "--textColor": "#1e293b",
  "--text-secondary": "#64748b",
  "--border-color": "#e2e8f0",
  // Add other variables like footer colors if needed
};

const darkTheme = {
  "--bg": "#111827",
  "--softBg": "#1f2937",
  "--bg-light": "#374151",
  "--textColor": "#f3f4f6",
  "--text-secondary": "#9ca3af",
  "--border-color": "#4b5563",
   // Add other variables like footer colors if needed
};


const ThemeProvider = ({ children }) => {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    // Select the correct theme object based on the context value
    const currentTheme = theme === "dark" ? darkTheme : lightTheme;

    // Get the root element (<html>)
    const root = document.documentElement;

    // Apply the theme variables to the root element
    for (const key in currentTheme) {
      root.style.setProperty(key, currentTheme[key]);
    }

    // Optional: Add class to body (useful for specific overrides)
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);

  }, [theme]); // This effect runs whenever the theme variable changes

  // This component now just returns its children, as the effect handles the styling
  return <>{children}</>;
};

export default ThemeProvider; // It uses default export