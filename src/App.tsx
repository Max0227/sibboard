import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

// Определяем basename в зависимости от окружения
const getBasename = () => {
  // Для GitHub Pages
  if (import.meta.env.PROD && import.meta.env.BASE_URL) {
    return import.meta.env.BASE_URL;
  }
  // Для локальной разработки
  return "/";
};

export default function App() {
  return (
    <BrowserRouter basename={getBasename()}>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}