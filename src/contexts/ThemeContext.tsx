import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

// ============================================
// ТИПЫ
// ============================================

type Theme = "dark" | "light";
type ThemeMode = "system" | "manual";

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  isLight: boolean;
  isTransitioning: boolean;
}

// ============================================
// КОНСТАНТЫ
// ============================================

const STORAGE_THEME_KEY = "sibboard-theme";
const STORAGE_MODE_KEY = "sibboard-theme-mode";
const DARK_CLASS = "dark";
const DATA_THEME_ATTR = "data-theme";
const TRANSITION_DURATION = 300;

// ============================================
// КОНТЕКСТ
// ============================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================
// УТИЛИТЫ
// ============================================

const getSystemTheme = (): Theme => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

// ============================================
// ПРОВАЙДЕР
// ============================================

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_MODE_KEY);
    return saved === "system" || saved === "manual" ? saved : "system";
  });
  
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    return getSystemTheme();
  });
  
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ============================================
  // ПРИМЕНЕНИЕ ТЕМЫ К DOM (С АНИМАЦИЕЙ)
  // ============================================

  const applyTheme = useCallback(async (newTheme: Theme) => {
    setIsTransitioning(true);
    
    const root = document.documentElement;
    
    // Добавляем класс для анимации перехода
    root.classList.add("theme-transitioning");
    
    // Небольшая задержка для плавности
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Сохраняем в localStorage
    localStorage.setItem(STORAGE_THEME_KEY, newTheme);
    
    // Устанавливаем data-атрибут
    root.setAttribute(DATA_THEME_ATTR, newTheme);
    
    // Применяем класс для Tailwind
    if (newTheme === "dark") {
      root.classList.add(DARK_CLASS);
    } else {
      root.classList.remove(DARK_CLASS);
    }
    
    // Устанавливаем color-scheme
    root.style.colorScheme = newTheme;
    
    // Обновляем meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", newTheme === "dark" ? "#0A1828" : "#F0F6FF");
    }
    
    // Убираем класс анимации
    setTimeout(() => {
      root.classList.remove("theme-transitioning");
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
    
    console.log(`🎨 Theme changed to: ${newTheme} (${mode} mode)`);
  }, [mode]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // ============================================
  // СЛУШАЕМ СИСТЕМНУЮ ТЕМУ
  // ============================================

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (mode === "system") {
        const newTheme = e.matches ? "dark" : "light";
        setThemeState(newTheme);
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mode]);

  // ============================================
  // ЭКШЕНЫ
  // ============================================

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setThemeState(newTheme);
    setModeState("manual");
    localStorage.setItem(STORAGE_MODE_KEY, "manual");
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    setModeState("manual");
    localStorage.setItem(STORAGE_MODE_KEY, "manual");
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_MODE_KEY, newMode);
    
    if (newMode === "system") {
      const systemTheme = getSystemTheme();
      setThemeState(systemTheme);
      localStorage.removeItem(STORAGE_THEME_KEY);
    }
  }, []);

  // ============================================
  // ДОБАВЛЯЕМ CSS ДЛЯ АНИМАЦИИ ПЕРЕХОДА
  // ============================================

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .theme-transitioning,
      .theme-transitioning *,
      .theme-transitioning *::before,
      .theme-transitioning *::after {
        transition: background-color ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1),
                    border-color ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1),
                    color ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1),
                    fill ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1),
                    stroke ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ============================================
  // МЕМОИЗИРОВАННЫЕ ЗНАЧЕНИЯ
  // ============================================

  const value = useMemo((): ThemeContextType => ({
    theme,
    mode,
    toggleTheme,
    setTheme,
    setMode,
    isDark: theme === "dark",
    isLight: theme === "light",
    isTransitioning,
  }), [theme, mode, toggleTheme, setTheme, setMode, isTransitioning]);

  // ============================================
  // РЕНДЕР
  // ============================================

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================
// ХУК
// ============================================

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}

// ============================================
// ЭКСПОРТЫ
// ============================================

export { ThemeContext };