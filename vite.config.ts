import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import AutoImport from "unplugin-auto-import/vite";

const isProduction = process.env.NODE_ENV === "production";
const base = isProduction ? "/sibboard/" : "/";

export default defineConfig({
  define: {
    __BASE_PATH__: JSON.stringify(base),
  },
  plugins: [
    react(),
    AutoImport({
      imports: [
        {
          react: [
            ["default", "React"],
            "useState", "useEffect", "useContext", "useCallback",
            "useMemo", "useRef", "lazy", "memo",
          ],
        },
        {
          "react-router-dom": [
            "useNavigate", "useLocation", "useParams", "Link", "NavLink",
          ],
        },
      ],
      dts: true,
    }),
  ],
  base,
  build: {
    sourcemap: true,
    outDir: 'dist',
    assetsDir: 'assets',
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
});