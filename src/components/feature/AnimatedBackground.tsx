import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

// ============================================
// ТИПЫ
// ============================================

interface AnimatedBackgroundProps {
  activeDistrict?: string | null;
  onDistrictClick?: (id: string) => void;
}

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function AnimatedBackground({ activeDistrict }: AnimatedBackgroundProps) {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ============================================
  // АНИМИРОВАННЫЙ ГРАДИЕНТ НА CANVAS
  // ============================================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      time += 0.005;
      
      // Создаём переливающийся градиент
      const gradient1 = ctx.createLinearGradient(
        canvas.width * (0.3 + Math.sin(time * 0.3) * 0.2),
        canvas.height * (0.2 + Math.cos(time * 0.2) * 0.15),
        canvas.width * (0.7 + Math.cos(time * 0.4) * 0.2),
        canvas.height * (0.8 + Math.sin(time * 0.3) * 0.2)
      );
      
      const gradient2 = ctx.createRadialGradient(
        canvas.width * (0.5 + Math.sin(time * 0.2) * 0.3),
        canvas.height * (0.4 + Math.cos(time * 0.25) * 0.2),
        50,
        canvas.width * (0.6 + Math.cos(time * 0.15) * 0.2),
        canvas.height * (0.5 + Math.sin(time * 0.2) * 0.2),
        canvas.width * 0.8
      );

      if (isDark) {
        // Тёмная тема — глубокие синие и фиолетовые оттенки
        gradient1.addColorStop(0, `hsl(${220 + Math.sin(time) * 20}, 70%, 8%)`);
        gradient1.addColorStop(0.3, `hsl(${240 + Math.cos(time * 0.7) * 15}, 60%, 12%)`);
        gradient1.addColorStop(0.6, `hsl(${260 + Math.sin(time * 0.5) * 20}, 50%, 15%)`);
        gradient1.addColorStop(1, `hsl(${200 + Math.cos(time * 0.6) * 25}, 65%, 6%)`);
        
        gradient2.addColorStop(0, `hsla(${280 + Math.sin(time * 0.4) * 30}, 70%, 15%, 0.3)`);
        gradient2.addColorStop(0.5, `hsla(${230 + Math.cos(time * 0.5) * 20}, 60%, 10%, 0.2)`);
        gradient2.addColorStop(1, `hsla(${200 + Math.sin(time * 0.3) * 25}, 50%, 5%, 0.4)`);
      } else {
        // Светлая тема — небесные и зелёные оттенки
        gradient1.addColorStop(0, `hsl(${200 + Math.sin(time) * 15}, 70%, 85%)`);
        gradient1.addColorStop(0.3, `hsl(${180 + Math.cos(time * 0.7) * 10}, 65%, 80%)`);
        gradient1.addColorStop(0.6, `hsl(${160 + Math.sin(time * 0.5) * 15}, 60%, 88%)`);
        gradient1.addColorStop(1, `hsl(${210 + Math.cos(time * 0.6) * 20}, 75%, 82%)`);
        
        gradient2.addColorStop(0, `hsla(${190 + Math.sin(time * 0.4) * 20}, 60%, 90%, 0.25)`);
        gradient2.addColorStop(0.5, `hsla(${170 + Math.cos(time * 0.5) * 15}, 55%, 85%, 0.2)`);
        gradient2.addColorStop(1, `hsla(${220 + Math.sin(time * 0.3) * 20}, 70%, 80%, 0.3)`);
      }

      // Рисуем фон
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Накладываем второй градиент
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Добавляем "звёзды" или "блики"
      ctx.fillStyle = isDark 
        ? `rgba(230, 179, 30, ${0.03 + Math.sin(time * 2) * 0.02})`
        : `rgba(255, 255, 255, ${0.1 + Math.sin(time * 1.5) * 0.05})`;
      
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(
          canvas.width * (0.2 + i * 0.15 + Math.sin(time + i) * 0.05),
          canvas.height * (0.3 + i * 0.1 + Math.cos(time * 0.8 + i) * 0.05),
          canvas.width * (0.15 + Math.sin(time * 0.5 + i) * 0.02),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [isDark]);

  // ============================================
  // ПАРАЛЛАКС-СЛОИ (CSS)
  // ============================================

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Canvas с анимированным градиентом */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: "blur(40px)" }}
      />

      {/* Декоративные параллакс-элементы */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        style={{
          background: isDark
            ? "radial-gradient(circle at 30% 40%, rgba(230,179,30,0.08) 0%, transparent 50%)"
            : "radial-gradient(circle at 30% 40%, rgba(37,99,235,0.06) 0%, transparent 50%)",
          backgroundSize: "200% 200%",
        }}
      />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          backgroundPosition: ["100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        style={{
          background: isDark
            ? "radial-gradient(circle at 70% 60%, rgba(74,158,191,0.06) 0%, transparent 50%)"
            : "radial-gradient(circle at 70% 60%, rgba(124,58,237,0.05) 0%, transparent 50%)",
          backgroundSize: "200% 200%",
        }}
      />

      {/* Анимированные частицы */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: isDark 
                ? `hsla(${200 + i * 20}, 70%, 60%, 0.3)`
                : `hsla(${200 + i * 15}, 60%, 70%, 0.25)`,
              left: `${(i * 7) % 100}%`,
              top: `${(i * 13) % 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, i % 2 === 0 ? 20 : -20, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Индикатор активного района */}
      {activeDistrict && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-xl text-white text-sm font-medium border border-white/20 shadow-xl">
            <span>
              {activeDistrict === "center" && "🏛️ Центральный район"}
              {activeDistrict === "akadem" && "🔬 Академгородок"}
              {activeDistrict === "leviy" && "🌊 Левый берег"}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}