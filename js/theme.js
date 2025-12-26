/* =========================================
   🌙 THEME MANAGER
   Handles Dark/Light Mode Toggle
   ========================================= */

(function() {
  'use strict';

  // =========================================
  // CONFIGURATION
  // =========================================
  const CONFIG = {
    storageKey: 'theme',
    defaultTheme: 'light',
    darkClass: 'dark-mode',
    attribute: 'data-theme',
    toggleButtonId: 'themeToggle',
    icons: {
      light: '☀️',
      dark: '🌙'
    },
    transitions: true
  };

  // =========================================
  // THEME MANAGER CLASS
  // =========================================
  class ThemeManager {
    constructor() {
      this.currentTheme = this.getSavedTheme();
      this.toggleButton = null;
      this.init();
    }

    // Initialize theme system
    init() {
      // Apply saved theme immediately (before DOM loads to prevent flash)
      this.applyTheme(this.currentTheme);

      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupToggle());
      } else {
        this.setupToggle();
      }

      // Listen for system theme changes
      this.watchSystemTheme();
    }

    // Get saved theme from localStorage or system preference
    getSavedTheme() {
      const savedTheme = localStorage.getItem(CONFIG.storageKey);
      
      if (savedTheme) {
        return savedTheme;
      }

      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }

      return CONFIG.defaultTheme;
    }

    // Apply theme to document
    applyTheme(theme) {
      this.currentTheme = theme;
      
      // Set data attribute on HTML element
      document.documentElement.setAttribute(CONFIG.attribute, theme);
      
      // Also add/remove class for compatibility
      if (theme === 'dark') {
        document.documentElement.classList.add(CONFIG.darkClass);
        document.body?.classList.add(CONFIG.darkClass);
      } else {
        document.documentElement.classList.remove(CONFIG.darkClass);
        document.body?.classList.remove(CONFIG.darkClass);
      }

      // Save preference
      localStorage.setItem(CONFIG.storageKey, theme);

      // Update toggle button icon
      this.updateToggleIcon();

      // Dispatch custom event for other scripts to listen
      window.dispatchEvent(new CustomEvent('themechange', { 
        detail: { theme } 
      }));
    }

    // Setup toggle button
    setupToggle() {
      this.toggleButton = document.getElementById(CONFIG.toggleButtonId);

      if (this.toggleButton) {
        // Set initial icon
        this.updateToggleIcon();

        // Add click listener
        this.toggleButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggle();
        });

        // Add keyboard support
        this.toggleButton.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggle();
          }
        });

        // Add accessibility attributes
        this.toggleButton.setAttribute('role', 'button');
        this.toggleButton.setAttribute('aria-label', 'Toggle dark mode');
        this.toggleButton.setAttribute('tabindex', '0');
      }

      // Add smooth transition after initial load
      if (CONFIG.transitions) {
        setTimeout(() => {
          document.documentElement.style.setProperty(
            '--theme-transition', 
            'background 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
          );
          document.body?.classList.add('theme-transition-ready');
        }, 100);
      }
    }

    // Toggle between themes
    toggle() {
      const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      
      // Add animation class
      if (this.toggleButton) {
        this.toggleButton.classList.add('theme-toggle-spin');
        setTimeout(() => {
          this.toggleButton.classList.remove('theme-toggle-spin');
        }, 300);
      }

      this.applyTheme(newTheme);
    }

    // Update toggle button icon
    updateToggleIcon() {
      if (this.toggleButton) {
        const icon = this.currentTheme === 'dark' ? CONFIG.icons.light : CONFIG.icons.dark;
        this.toggleButton.innerHTML = icon;
        this.toggleButton.setAttribute(
          'aria-label', 
          `Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} mode`
        );
      }
    }

    // Watch for system theme changes
    watchSystemTheme() {
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
          // Only auto-switch if user hasn't manually set a preference
          const savedTheme = localStorage.getItem(CONFIG.storageKey);
          if (!savedTheme) {
            this.applyTheme(e.matches ? 'dark' : 'light');
          }
        });
      }
    }

    // Get current theme
    getTheme() {
      return this.currentTheme;
    }

    // Check if dark mode is active
    isDark() {
      return this.currentTheme === 'dark';
    }
  }

  // =========================================
  // INITIALIZE & EXPOSE GLOBALLY
  // =========================================
  const themeManager = new ThemeManager();

  // Expose to global scope for other scripts
  window.ThemeManager = themeManager;
  window.toggleTheme = () => themeManager.toggle();
  window.getTheme = () => themeManager.getTheme();
  window.isDarkMode = () => themeManager.isDark();

})();