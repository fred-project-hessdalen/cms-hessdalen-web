'use client';

import { useEffect, useState } from 'react';
import Tooltip from './Tooltip';

type Theme = 'light' | 'dark' | 'auto';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>('auto');
    const [mounted, setMounted] = useState(false);

    // Get effective theme (resolves 'auto' to actual theme)
    const getEffectiveTheme = (currentTheme: Theme): 'light' | 'dark' => {
        if (currentTheme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return currentTheme;
    };

    // Initialize theme on mount
    useEffect(() => {
        // Apply theme to document
        const applyTheme = (newTheme: Theme) => {
            const effectiveTheme = getEffectiveTheme(newTheme);
            const root = document.documentElement;

            if (effectiveTheme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        setMounted(true);

        // Get saved theme from localStorage or default to 'auto'
        const savedTheme = (localStorage.getItem('theme') as Theme) || 'auto';
        setTheme(savedTheme);
        applyTheme(savedTheme);

        // Listen for system theme changes when in auto mode
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const currentTheme = (localStorage.getItem('theme') as Theme) || 'auto';
            if (currentTheme === 'auto') {
                applyTheme('auto');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Handle theme change
    const handleThemeChange = (newTheme: Theme) => {
        const effectiveTheme = getEffectiveTheme(newTheme);
        const root = document.documentElement;

        if (effectiveTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        // Debug: Log the current state
        console.log('Theme changed to:', newTheme);
        console.log('Effective theme:', effectiveTheme);
        console.log('HTML classList:', root.classList.toString());
        console.log('CSS Variable --background:', getComputedStyle(root).getPropertyValue('--background'));
    };

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-full border border-gray-300 dark:border-gray-600">
                <div className="w-8 h-8" />
                <div className="w-8 h-8" />
                <div className="w-8 h-8" />
            </div>
        );
    }

    const buttonClass = (isActive: boolean) =>
        `p-2 rounded-full transition-all ${isActive
            ? 'bg-white dark:bg-gray-700 shadow-md text-gray-900 dark:text-gray-100'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
        }`;

    return (
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-full border border-gray-300 dark:border-gray-600">
            {/* Light Mode */}
            <Tooltip content="Light" position="top">
                <button
                    onClick={() => handleThemeChange('light')}
                    className={buttonClass(theme === 'light')}
                    aria-label="Light theme"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                    >
                        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                    </svg>
                </button>
            </Tooltip>

            {/* Auto Mode */}
            <Tooltip content="Auto" position="top">
                <button
                    onClick={() => handleThemeChange('auto')}
                    className={buttonClass(theme === 'auto')}
                    aria-label="Auto theme (system)"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                    >
                        {/* Half sun, half moon - represents auto switching */}
                        <path d="M12 2.25a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM12 18a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 0112 18z" />
                        <path d="M19.424 4.576a.75.75 0 010 1.061l-.354.354a.75.75 0 11-1.06-1.061l.353-.354a.75.75 0 011.061 0zM5.991 18.01a.75.75 0 010 1.06l-.354.354a.75.75 0 11-1.06-1.06l.353-.354a.75.75 0 011.061 0z" />
                        <path fillRule="evenodd" d="M12 7a5 5 0 100 10V7z" clipRule="evenodd" />
                        <path d="M21.75 12a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5a.75.75 0 01.75.75zM3.75 12a.75.75 0 01-.75.75H2.5a.75.75 0 010-1.5H3a.75.75 0 01.75.75z" />
                        <path d="M19.424 19.424a.75.75 0 01-1.061 0l-.354-.354a.75.75 0 111.061-1.06l.354.353a.75.75 0 010 1.061zM5.991 5.991a.75.75 0 01-1.061 0l-.354-.354a.75.75 0 111.061-1.06l.354.353a.75.75 0 010 1.061z" />
                    </svg>
                </button>
            </Tooltip>

            {/* Dark Mode */}
            <Tooltip content="Dark" position="top">
                <button
                    onClick={() => handleThemeChange('dark')}
                    className={buttonClass(theme === 'dark')}
                    aria-label="Dark theme"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                    >
                        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                    </svg>
                </button>
            </Tooltip>
        </div>
    );
}
