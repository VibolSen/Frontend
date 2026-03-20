"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

// Apply all theme classes and glass background to <html>
function applyThemeSettings(mode, glassBg, glassIntensity) {
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.classList.toggle("glass", mode === "glass");
  
  if (mode === "glass") {
    document.documentElement.setAttribute("data-glass-bg", glassBg);
    document.documentElement.setAttribute("data-glass-intensity", glassIntensity || "low");
  } else {
    document.documentElement.removeAttribute("data-glass-bg");
    document.documentElement.removeAttribute("data-glass-intensity");
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [glassBackground, setGlassBackground] = useState("minimal-white");
  const [glassIntensity, setGlassIntensity] = useState("low");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load settings from localStorage
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedGlassBg = localStorage.getItem("glassBackground") || "minimal-white";
    const savedIntensity = localStorage.getItem("glassIntensity") || "low";
    
    setTheme(savedTheme);
    setGlassBackground(savedGlassBg);
    setGlassIntensity(savedIntensity);
    applyThemeSettings(savedTheme, savedGlassBg, savedIntensity);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyThemeSettings(newTheme, glassBackground, glassIntensity);
  };

  const setThemeMode = (mode) => {
    setTheme(mode);
    localStorage.setItem("theme", mode);
    applyThemeSettings(mode, glassBackground, glassIntensity);
  };

  const updateGlassBackground = (bg) => {
    setGlassBackground(bg);
    localStorage.setItem("glassBackground", bg);
    applyThemeSettings(theme, bg, glassIntensity);
  };

  const updateGlassIntensity = (intensity) => {
    setGlassIntensity(intensity);
    localStorage.setItem("glassIntensity", intensity);
    applyThemeSettings(theme, glassBackground, intensity);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      setThemeMode, 
      glassBackground, 
      updateGlassBackground,
      glassIntensity,
      updateGlassIntensity,
      mounted 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
