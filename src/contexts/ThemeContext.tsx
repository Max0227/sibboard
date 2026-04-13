import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

// ============================================
// ТИПЫ
// ============================================

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  isLight: boolean;
}

// ============================================
// КОНСТАНТЫ
// ============================================

const STORAGE_KEY = "sibboard-theme";
const DARK_CLASS = "dark";
const DATA_THEME_ATTR = "data-theme";

// ============================================
// КОНТЕКСТ
// ============================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================
// ПРОВАЙДЕР
// ============================================

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Проверяем сохранённую тему
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    
    // Проверяем системные предпочтения
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  // ============================================
  // ПРИМЕНЕНИЕ ТЕМЫ К DOM
  // ============================================

  useEffect(() => {
    const root = document.documentElement;
    
    // Сохраняем в localStorage
    localStorage.setItem(STORAGE_KEY, theme);
    
    // Устанавливаем data-атрибут
    root.setAttribute(DATA_THEME_ATTR, theme);
    
    // Применяем класс для Tailwind
    if (theme === "dark") {
      root.classList.add(DARK_CLASS);
    } else {
      root.classList.remove(DARK_CLASS);
    }
    
    // Устанавливаем color-scheme для нативных элементов
    root.style.colorScheme = theme;
    
    // Устанавливаем meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", theme === "dark" ? "#0A1828" : "#F0F6FF");
    }
    
    // Логируем смену темы
    console.log(`🎨 Theme changed to: ${theme}`);
  }, [theme]);

  // ============================================
  // СЛУШАЕМ СИСТЕМНУЮ ТЕМУ
  // ============================================

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const saved = localStorage.getItem(STORAGE_KEY);
      // Меняем тему только если пользователь не выбрал явно
      if (!saved) {
        setThemeState(e.matches ? "dark" : "light");
      }
    };
    
    // Начальная проверка (на случай если localStorage был очищен)
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      handleChange(mediaQuery);
    }
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // ============================================
  // ЭКШЕНЫ
  // ============================================

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  // ============================================
  // МЕМОИЗИРОВАННЫЕ ЗНАЧЕНИЯ
  // ============================================

  const value = useMemo((): ThemeContextType => ({
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
  }), [theme, toggleTheme, setTheme]);

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