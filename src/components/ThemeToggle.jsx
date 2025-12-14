import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-8 w-14 items-center rounded-full 
        transition-all duration-300 ease-in-out focus:outline-none 
        focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        focus:ring-offset-white dark:focus:ring-offset-dark-900
        hover:scale-105 active:scale-95
        ${className}
      `}
      style={{
        backgroundColor: isDark ? 'var(--color-surface)' : 'var(--color-background-tertiary)',
        border: `1px solid ${isDark ? 'var(--color-border)' : 'var(--color-border)'}`
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background gradient */}
      <div 
        className={`
          absolute inset-0 rounded-full transition-all duration-300
          ${isDark 
            ? 'bg-gradient-to-r from-dark-700 to-dark-800' 
            : 'bg-gradient-to-r from-primary-400 to-primary-500'
          }
        `}
      />
       
      {/* Toggle circle */}
      <div
        className={`
          relative z-10 flex h-6 w-6 items-center justify-center
          transform transition-all duration-300 ease-in-out rounded-full
          shadow-lg ${isDark ? 'translate-x-7' : 'translate-x-1'}
          ${isDark ? 'bg-dark-600' : 'bg-white'}
        `}
      >
        {/* Sun Icon */}
        <svg
          className={`
            h-4 w-4 transition-all duration-300 ease-in-out
            ${isDark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}
          `}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 100 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 000-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>

        {/* Moon Icon */}
        <svg
          className={`
            absolute h-4 w-4 transition-all duration-300 ease-in-out
            ${isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}
          `}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </div>

      {/* Animated sparkles for dark mode */}
      {isDark && (
        <>
          <div className="absolute top-1 left-2 w-1 h-1 bg-yellow-300 rounded-full animate-pulse" />
          <div className="absolute top-3 right-3 w-0.5 h-0.5 bg-blue-300 rounded-full animate-pulse delay-75" />
          <div className="absolute bottom-2 left-4 w-0.5 h-0.5 bg-purple-300 rounded-full animate-pulse delay-150" />
        </>
      )}

      {/* Animated clouds for light mode */}
      {!isDark && (
        <>
          <div className="absolute top-2 left-3 w-2 h-1 bg-white/60 rounded-full animate-pulse delay-100" />
          <div className="absolute bottom-3 right-2 w-1.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-200" />
        </>
      )}
    </button>
  );
};

export default ThemeToggle;