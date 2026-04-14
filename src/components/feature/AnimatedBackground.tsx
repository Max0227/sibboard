import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

// ============================================
// ТИПЫ
// ============================================

interface AnimatedBackgroundProps {
  activeDistrict?: string | null;
  onDistrictClick?: (id: string) => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function AnimatedBackground({ activeDistrict }: AnimatedBackgroundProps) {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isVisible, setIsVisible] = useState(true);

  // ============================================
  // ОТСЛЕЖИВАНИЕ МЫШИ ДЛЯ ПАРАЛЛАКСА
  // ============================================

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ============================================
  // ОПТИМИЗАЦИЯ: ПАУЗА АНИМАЦИИ ПРИ СКРЫТИИ
  // ============================================

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // ============================================
  // АНИМИРОВАННЫЙ ФОН НА CANVAS
  // ============================================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrame: number;
    let time = 0;

    // Предсоздаём частицы
    const particles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        size: 0.5 + Math.random() * 2,
        speed: 0.0005 + Math.random() * 0.001,
        opacity: 0.1 + Math.random() * 0.3,
      });
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    const draw = () => {
      if (!isVisible) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }

      time += 0.005;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Параллакс-смещение от мыши
      const offsetX = (mousePos.x - 0.5) * 100;
      const offsetY = (mousePos.y - 0.5) * 100;

      if (isDark) {
        // ===== ТЁМНАЯ ТЕМА: НОЧНАЯ СИБИРЬ =====
        
        // Основной градиент — глубокое небо
        const skyGradient = ctx.createLinearGradient(
          w * 0.3 + offsetX * 0.5,
          h * 0.2 + offsetY * 0.3,
          w * 0.7 - offsetX * 0.3,
          h * 0.9 - offsetY * 0.2
        );
        skyGradient.addColorStop(0, "#020C18");
        skyGradient.addColorStop(0.4, "#0A1A3A");
        skyGradient.addColorStop(0.7, "#0D2035");
        skyGradient.addColorStop(1, "#061220");
        
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, w, h);

        // Сияние северного сияния
        const auroraGradient = ctx.createRadialGradient(
          w * 0.6 + offsetX * 0.8,
          h * 0.3 + offsetY * 0.5,
          50,
          w * 0.7,
          h * 0.4,
          w * 0.5
        );
        auroraGradient.addColorStop(0, `hsla(${160 + Math.sin(time * 0.5) * 30}, 80%, 50%, ${0.08 + Math.sin(time * 0.8) * 0.04})`);
        auroraGradient.addColorStop(0.5, `hsla(${180 + Math.cos(time * 0.3) * 20}, 70%, 40%, 0.04)`);
        auroraGradient.addColorStop(1, "transparent");
        
        ctx.fillStyle = auroraGradient;
        ctx.fillRect(0, 0, w, h);

        // Горы на горизонте
        ctx.save();
        ctx.translate(0, h * 0.65 + offsetY * 0.2);
        
        // Дальние горы
        ctx.beginPath();
        ctx.moveTo(0, h * 0.15);
        for (let x = 0; x <= w; x += 30) {
          const nx = x / w;
          const y = 
            Math.sin(nx * 3 + time * 0.1) * 15 +
            Math.sin(nx * 7 + 1) * 8 +
            Math.cos(nx * 12) * 5 +
            30;
          ctx.lineTo(x + offsetX * 0.3, h * 0.15 - y);
        }
        ctx.lineTo(w, h * 0.3);
        ctx.lineTo(0, h * 0.3);
        ctx.closePath();
        
        const mountainGradient = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.3);
        mountainGradient.addColorStop(0, "#1A2E4A");
        mountainGradient.addColorStop(1, "#0D1A2A");
        ctx.fillStyle = mountainGradient;
        ctx.fill();

        // Снежные вершины
        ctx.beginPath();
        ctx.moveTo(0, h * 0.15);
        for (let x = 0; x <= w; x += 30) {
          const nx = x / w;
          const y = 
            Math.sin(nx * 3 + time * 0.1) * 15 +
            Math.sin(nx * 7 + 1) * 8 +
            Math.cos(nx * 12) * 5 +
            30;
          ctx.lineTo(x + offsetX * 0.3, h * 0.15 - y);
        }
        ctx.lineTo(w, h * 0.3);
        ctx.lineTo(0, h * 0.3);
        ctx.closePath();
        ctx.fillStyle = "rgba(230, 230, 250, 0.15)";
        ctx.fill();

        // Звёзды
        ctx.fillStyle = "#FFFFFF";
        for (let i = 0; i < 150; i++) {
          const starX = (i * 127) % w;
          const starY = (i * 83) % (h * 0.5);
          const brightness = 0.3 + Math.sin(time * 2 + i) * 0.3;
          ctx.globalAlpha = brightness;
          ctx.beginPath();
          ctx.arc(
            starX + Math.sin(time * 0.5 + i) * 2,
            starY + Math.cos(time * 0.3 + i) * 2,
            0.5 + (i % 3) * 0.5,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // Луна
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(w * 0.8 + offsetX * 0.2, h * 0.15 + offsetY * 0.1, 25, 0, Math.PI * 2);
        const moonGradient = ctx.createRadialGradient(w * 0.8 - 5, h * 0.15 - 5, 5, w * 0.8, h * 0.15, 25);
        moonGradient.addColorStop(0, "#FFF8DC");
        moonGradient.addColorStop(1, "#E6B31E");
        ctx.fillStyle = moonGradient;
        ctx.fill();
        
        // Свечение луны
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(w * 0.8, h * 0.15, 45, 0, Math.PI * 2);
        const glowGradient = ctx.createRadialGradient(w * 0.8, h * 0.15, 25, w * 0.8, h * 0.15, 45);
        glowGradient.addColorStop(0, "#E6B31E");
        glowGradient.addColorStop(1, "transparent");
        ctx.fillStyle = glowGradient;
        ctx.fill();
        
        ctx.restore();

        // Парящие частицы (светлячки)
        ctx.globalAlpha = 1;
        for (const p of particles) {
          p.y = (p.y - p.speed + 1) % 1;
          
          ctx.beginPath();
          ctx.arc(
            w * p.x + Math.sin(time + p.size) * 20,
            h * p.y,
            p.size,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = `rgba(230, 179, 30, ${p.opacity * (0.5 + Math.sin(time * 2 + p.size) * 0.3)})`;
          ctx.fill();
        }

      } else {
        // ===== СВЕТЛАЯ ТЕМА: СИБИРСКОЕ УТРО =====
        
        // Небо
        const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
        skyGradient.addColorStop(0, "#5BB8E8");
        skyGradient.addColorStop(0.5, "#87CEEB");
        skyGradient.addColorStop(1, "#C8DCA8");
        
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, w, h);

        // Солнце
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(w * 0.75 + offsetX * 0.3, h * 0.2 + offsetY * 0.2, 35, 0, Math.PI * 2);
        const sunGradient = ctx.createRadialGradient(w * 0.75, h * 0.2, 5, w * 0.75, h * 0.2, 35);
        sunGradient.addColorStop(0, "#FFF8DC");
        sunGradient.addColorStop(0.7, "#FFD700");
        sunGradient.addColorStop(1, "#FFA500");
        ctx.fillStyle = sunGradient;
        ctx.fill();
        
        // Солнечные лучи
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + time * 0.05;
          ctx.beginPath();
          ctx.moveTo(w * 0.75, h * 0.2);
          ctx.lineTo(w * 0.75 + Math.cos(angle) * 80, h * 0.2 + Math.sin(angle) * 80);
          ctx.lineTo(w * 0.75 + Math.cos(angle + 0.3) * 80, h * 0.2 + Math.sin(angle + 0.3) * 80);
          ctx.closePath();
          ctx.fillStyle = "#FFD700";
          ctx.fill();
        }
        ctx.restore();

        // Горы
        ctx.save();
        ctx.translate(0, h * 0.55 + offsetY * 0.2);
        
        // Дальние горы
        ctx.beginPath();
        ctx.moveTo(0, h * 0.2);
        for (let x = 0; x <= w; x += 25) {
          const nx = x / w;
          const y = 
            Math.sin(nx * 4 + 1) * 20 +
            Math.cos(nx * 8) * 10 +
            25;
          ctx.lineTo(x + offsetX * 0.2, h * 0.2 - y);
        }
        ctx.lineTo(w, h * 0.3);
        ctx.lineTo(0, h * 0.3);
        ctx.closePath();
        
        const mountainGradient = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.3);
        mountainGradient.addColorStop(0, "#5A8A6A");
        mountainGradient.addColorStop(1, "#3A6A4A");
        ctx.fillStyle = mountainGradient;
        ctx.fill();

        // Ближние горы
        ctx.beginPath();
        ctx.moveTo(0, h * 0.25);
        for (let x = 0; x <= w; x += 20) {
          const nx = x / w;
          const y = 
            Math.sin(nx * 5 + 2) * 15 +
            Math.cos(nx * 10) * 8 +
            20;
          ctx.lineTo(x + offsetX * 0.4, h * 0.25 - y);
        }
        ctx.lineTo(w, h * 0.4);
        ctx.lineTo(0, h * 0.4);
        ctx.closePath();
        
        const frontMountainGradient = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.4);
        frontMountainGradient.addColorStop(0, "#3A5A4A");
        frontMountainGradient.addColorStop(1, "#1A3A2A");
        ctx.fillStyle = frontMountainGradient;
        ctx.fill();

        // Снежные шапки
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.beginPath();
        ctx.moveTo(0, h * 0.2);
        for (let x = 0; x <= w; x += 25) {
          const nx = x / w;
          const y = 
            Math.sin(nx * 4 + 1) * 20 +
            Math.cos(nx * 8) * 10 +
            25;
          if (y > 25) {
            ctx.lineTo(x + offsetX * 0.2, h * 0.2 - y + 5);
          }
        }
        ctx.lineTo(w, h * 0.3);
        ctx.lineTo(0, h * 0.3);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();

        // Облака
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        for (let i = 0; i < 5; i++) {
          const cloudX = (i * 200 + time * 10) % (w + 200) - 100;
          const cloudY = 50 + i * 30 + Math.sin(time * 0.5 + i) * 10;
          
          ctx.beginPath();
          ctx.arc(cloudX, cloudY, 25, 0, Math.PI * 2);
          ctx.arc(cloudX + 30, cloudY - 5, 20, 0, Math.PI * 2);
          ctx.arc(cloudX - 20, cloudY + 5, 18, 0, Math.PI * 2);
          ctx.arc(cloudX + 50, cloudY, 22, 0, Math.PI * 2);
          ctx.fill();
        }
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
  }, [isDark, mousePos, isVisible]);

  // ============================================
  // РЕНДЕР
  // ============================================

  const districtNames: Record<string, string> = {
    "center": "🏛️ Центральный район",
    "akadem": "🔬 Академгородок",
    "leviy": "🌊 Левый берег",
    "zaeltsov": "🌲 Заельцовский",
    "oktyabr": "🏗️ Октябрьский",
    "kirovsky": "🏭 Кировский",
    "pervomay": "🌸 Первомайский",
    "sovetsky": "🎓 Советский",
    "dzerzh": "🌆 Дзержинский",
    "zhelezn": "🚂 Железнодорожный",
    "kalinin": "🏙️ Калининский",
    "leninsky": "🏢 Ленинский",
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10">
      {/* Canvas с анимированной графикой */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Индикатор активного района */}
      <AnimatePresence>
        {activeDistrict && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="px-5 py-2.5 rounded-full bg-black/30 backdrop-blur-xl text-white text-sm font-medium border border-white/20 shadow-xl">
              {districtNames[activeDistrict] || activeDistrict}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}