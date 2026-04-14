import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

// ============================================
// ТИПЫ
// ============================================

interface AnimatedBackgroundProps {
  activeDistrict?: string | null;
  onDistrictClick?: (id: string) => void;
}

type TimeOfDay = "dawn" | "morning" | "day" | "evening" | "night";

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function AnimatedBackground({ activeDistrict }: AnimatedBackgroundProps) {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getTimeOfDay());

  // ============================================
  // ОПРЕДЕЛЕНИЕ ВРЕМЕНИ СУТОК
  // ============================================

  function getTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 7) return "dawn";      // Рассвет
    if (hour >= 7 && hour < 11) return "morning";  // Утро
    if (hour >= 11 && hour < 17) return "day";     // День
    if (hour >= 17 && hour < 21) return "evening"; // Вечер
    return "night";                                 // Ночь
  }

  // Обновляем время суток каждую минуту
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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
  // АНИМИРОВАННЫЙ ФОН НА CANVAS
  // ============================================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrame: number;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    const draw = () => {
      time += 0.005;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Параллакс-смещение от мыши
      const offsetX = (mousePos.x - 0.5) * 80;
      const offsetY = (mousePos.y - 0.5) * 50;

      // ============================================
      // НОЧЬ (21:00 - 05:00)
      // ============================================
      if (timeOfDay === "night") {
        // Глубокое ночное небо
        const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
        skyGradient.addColorStop(0, "#020C18");
        skyGradient.addColorStop(0.4, "#0A1A3A");
        skyGradient.addColorStop(0.8, "#0D2035");
        skyGradient.addColorStop(1, "#061220");
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, w, h);

        // Млечный путь
        ctx.save();
        ctx.globalAlpha = 0.15;
        const gradient = ctx.createLinearGradient(w * 0.2, h * 0.1, w * 0.8, h * 0.5);
        gradient.addColorStop(0, "#4A6A9A");
        gradient.addColorStop(0.5, "#2A3A6A");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.1);
        ctx.lineTo(w * 0.4, h * 0.25);
        ctx.lineTo(w, h * 0.1);
        ctx.fill();
        ctx.restore();

        // Звёзды (много!)
        for (let i = 0; i < 300; i++) {
          const starX = (i * 127) % w;
          const starY = (i * 83) % (h * 0.7);
          const size = 0.5 + (i % 4) * 0.5;
          const twinkle = 0.4 + Math.sin(time * 3 + i) * 0.3;
          
          // Только яркие звёзды мерцают
          ctx.globalAlpha = size > 1 ? twinkle : 0.6;
          ctx.fillStyle = i % 10 === 0 ? "#FFE4B5" : "#FFFFFF";
          
          ctx.beginPath();
          ctx.arc(
            starX + Math.sin(time * 0.2 + i) * 1.5,
            starY + Math.cos(time * 0.15 + i) * 1.5,
            size,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // Луна
        ctx.save();
        const moonX = w * 0.75 + offsetX * 0.2;
        const moonY = h * 0.18 + offsetY * 0.1;
        
        // Свечение луны
        ctx.globalAlpha = 0.2;
        const glowGradient = ctx.createRadialGradient(moonX, moonY, 20, moonX, moonY, 60);
        glowGradient.addColorStop(0, "#FFF8DC");
        glowGradient.addColorStop(0.5, "#E6B31E");
        glowGradient.addColorStop(1, "transparent");
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 60, 0, Math.PI * 2);
        ctx.fill();

        // Луна
        ctx.globalAlpha = 0.95;
        const moonGradient = ctx.createRadialGradient(moonX - 8, moonY - 8, 5, moonX, moonY, 30);
        moonGradient.addColorStop(0, "#FFF8DC");
        moonGradient.addColorStop(0.6, "#F5DEB3");
        moonGradient.addColorStop(1, "#E6B31E");
        ctx.fillStyle = moonGradient;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 28, 0, Math.PI * 2);
        ctx.fill();
        
        // Кратеры на луне
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "#8B7355";
        ctx.beginPath();
        ctx.arc(moonX - 8, moonY - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(moonX + 10, moonY + 8, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(moonX - 5, moonY + 15, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Горы
        ctx.save();
        ctx.translate(0, h * 0.7);
        ctx.fillStyle = "#0D1A2A";
        ctx.beginPath();
        ctx.moveTo(0, h * 0.15);
        for (let x = 0; x <= w; x += 30) {
          const nx = x / w;
          const y = Math.sin(nx * 3.5) * 20 + Math.cos(nx * 5) * 10 + 35;
          ctx.lineTo(x + offsetX * 0.2, h * 0.15 - y);
        }
        ctx.lineTo(w, h * 0.3);
        ctx.lineTo(0, h * 0.3);
        ctx.fill();
        ctx.restore();

        // Падающие звёзды
        ctx.save();
        ctx.globalAlpha = 0.8;
        for (let i = 0; i < 3; i++) {
          const shootingStarX = (time * 50 + i * 300) % (w + 200) - 100;
          const shootingStarY = 50 + i * 40;
          if (shootingStarX > 0 && shootingStarX < w) {
            const gradient = ctx.createLinearGradient(
              shootingStarX, shootingStarY,
              shootingStarX - 40, shootingStarY + 20
            );
            gradient.addColorStop(0, "#FFFFFF");
            gradient.addColorStop(1, "transparent");
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(shootingStarX, shootingStarY);
            ctx.lineTo(shootingStarX - 40, shootingStarY + 20);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // ============================================
      // РАССВЕТ (05:00 - 07:00)
      // ============================================
      else if (timeOfDay === "dawn") {
        const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
        skyGradient.addColorStop(0, "#1A1A4A");
        skyGradient.addColorStop(0.4, "#4A2A5A");
        skyGradient.addColorStop(0.7, "#E87A5A");
        skyGradient.addColorStop(1, "#FFD4A0");
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, w, h);

        // Утренние облака
        ctx.fillStyle = "rgba(255, 200, 150, 0.3)";
        for (let i = 0; i < 4; i++) {
          const cloudX = (i * 250 + time * 8) % (w + 200) - 100;
          ctx.beginPath();
          ctx.arc(cloudX, h * 0.6, 40, 0, Math.PI * 2);
          ctx.arc(cloudX + 50, h * 0.55, 35, 0, Math.PI * 2);
          ctx.arc(cloudX - 30, h * 0.58, 30, 0, Math.PI * 2);
          ctx.fill();
        }

        // Восходящее солнце
        ctx.save();
        const sunY = h * 0.7 - (timeOfDay === "dawn" ? time * 20 : 0);
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(w * 0.5 + offsetX * 0.1, Math.min(h * 0.65, sunY), 40, 0, Math.PI * 2);
        const sunGradient = ctx.createRadialGradient(w * 0.5, sunY, 5, w * 0.5, sunY, 40);
        sunGradient.addColorStop(0, "#FFD700");
        sunGradient.addColorStop(0.8, "#FF6347");
        sunGradient.addColorStop(1, "#FF4500");
        ctx.fillStyle = sunGradient;
        ctx.fill();
        ctx.restore();

        // Звёзды (исчезают)
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "#FFFFFF";
        for (let i = 0; i < 30; i++) {
          ctx.beginPath();
          ctx.arc((i * 173) % w, (i * 97) % (h * 0.4), 1, 0, Math.PI * 2);
          ctx.fill();
        }

        // Горы
        ctx.save();
        ctx.translate(0, h * 0.65);
        ctx.fillStyle = "#3A2A4A";
        ctx.beginPath();
        ctx.moveTo(0, h * 0.2);
        for (let x = 0; x <= w; x += 25) {
          const nx = x / w;
          const y = Math.sin(nx * 4) * 18 + Math.cos(nx * 6) * 8 + 25;
          ctx.lineTo(x + offsetX * 0.2, h * 0.2 - y);
        }
        ctx.lineTo(w, h * 0.3);
        ctx.lineTo(0, h * 0.3);
        ctx.fill();
        ctx.restore();
      }

      // ============================================
      // УТРО (07:00 - 11:00)
      // ============================================
      else if (timeOfDay === "morning") {
        const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
        skyGradient.addColorStop(0, "#4A90D9");
        skyGradient.addColorStop(0.5, "#87CEEB");
        skyGradient.addColorStop(1, "#B8E4A0");
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, w, h);

        // Солнце
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(w * 0.3 + offsetX * 0.2, h * 0.25 + offsetY * 0.1, 35, 0, Math.PI * 2);
        const sunGradient = ctx.createRadialGradient(w * 0.3, h * 0.25, 5, w * 0.3, h * 0.25, 35);
        sunGradient.addColorStop(0, "#FFF8DC");
        sunGradient.addColorStop(1, "#FFD700");
        ctx.fillStyle = sunGradient;
        ctx.fill();
        ctx.restore();

        // Лёгкие облака
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        for (let i = 0; i < 5; i++) {
          const cloudX = (i * 200 + time * 12) % (w + 200) - 100;
          ctx.beginPath();
          ctx.arc(cloudX, h * 0.4 + i * 15, 30, 0, Math.PI * 2);
          ctx.arc(cloudX + 40, h * 0.38 + i * 15, 25, 0, Math.PI * 2);
          ctx.arc(cloudX - 25, h * 0.42 + i * 15, 20, 0, Math.PI * 2);
          ctx.fill();
        }

        // Горы
        ctx.save();
        ctx.translate(0, h * 0.6);
        ctx.fillStyle = "#4A7A5A";
        ctx.beginPath();
        ctx.moveTo(0, h * 0.2);
        for (let x = 0; x <= w; x += 25) {
          const nx = x / w;
          const y = Math.sin(nx * 3.5) * 15 + Math.cos(nx * 5) * 10 + 20;
          ctx.lineTo(x + offsetX * 0.3, h * 0.2 - y);
        }
        ctx.lineTo(w, h * 0.3);
        ctx.lineTo(0, h * 0.3);
        ctx.fill();
        
        // Снежные шапки
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.moveTo(0, h * 0.2);
        for (let x = 0; x <= w; x += 25) {
          const nx = x / w;
          const y = Math.sin(nx * 3.5) * 15 + Math.cos(nx * 5) * 10 + 20;
          if (y > 25) ctx.lineTo(x + offsetX * 0.3, h * 0.2 - y + 5);
        }
        ctx.fill();
        ctx.restore();
      }

      // ============================================
      // ДЕНЬ (11:00 - 17:00)
      // ============================================
      else if (timeOfDay === "day") {
        const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
        skyGradient.addColorStop(0, "#1E90FF");
        skyGradient.addColorStop(0.6, "#87CEEB");
        skyGradient.addColorStop(1, "#C8E6A0");
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, w, h);

        // Солнце в зените
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(w * 0.5 + offsetX * 0.1, h * 0.15 + offsetY * 0.05, 30, 0, Math.PI * 2);
        const sunGradient = ctx.createRadialGradient(w * 0.5, h * 0.15, 5, w * 0.5, h * 0.15, 30);
        sunGradient.addColorStop(0, "#FFF8DC");
        sunGradient.addColorStop(1, "#FFD700");
        ctx.fillStyle = sunGradient;
        ctx.fill();
        
        // Солнечные лучи
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + time * 0.02;
          ctx.beginPath();
          ctx.moveTo(w * 0.5, h * 0.15);
          ctx.lineTo(w * 0.5 + Math.cos(angle) * 100, h * 0.15 + Math.sin(angle) * 100);
          ctx.lineTo(w * 0.5 + Math.cos(angle + 0.2) * 100, h * 0.15 + Math.sin(angle + 0.2) * 100);
          ctx.closePath();
          ctx.fillStyle = "#FFD700";
          ctx.fill();
        }
        ctx.restore();

        // Пушистые облака
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        for (let i = 0; i < 6; i++) {
          const cloudX = (i * 180 + time * 15) % (w + 200) - 100;
          const cloudY = h * 0.3 + i * 20;
          ctx.beginPath();
          ctx.arc(cloudX, cloudY, 35, 0, Math.PI * 2);
          ctx.arc(cloudX + 45, cloudY - 5, 30, 0, Math.PI * 2);
          ctx.arc(cloudX - 30, cloudY + 3, 25, 0, Math.PI * 2);
          ctx.arc(cloudX + 70, cloudY + 5, 22, 0, Math.PI * 2);
          ctx.fill();
        }

        // Горы
        ctx.save();
        ctx.translate(0, h * 0.55);
        
        // Дальние горы
        ctx.fillStyle = "#5A8A6A";
        ctx.beginPath();
        ctx.moveTo(0, h * 0.25);
        for (let x = 0; x <= w; x += 20) {
          const nx = x / w;
          const y = Math.sin(nx * 4) * 18 + Math.cos(nx * 7) * 8 + 25;
          ctx.lineTo(x + offsetX * 0.3, h * 0.25 - y);
        }
        ctx.lineTo(w, h * 0.35);
        ctx.lineTo(0, h * 0.35);
        ctx.fill();

        // Ближние горы
        ctx.fillStyle = "#3A6A4A";
        ctx.beginPath();
        ctx.moveTo(0, h * 0.3);
        for (let x = 0; x <= w; x += 15) {
          const nx = x / w;
          const y = Math.sin(nx * 5 + 1) * 12 + Math.cos(nx * 9) * 6 + 18;
          ctx.lineTo(x + offsetX * 0.5, h * 0.3 - y);
        }
        ctx.lineTo(w, h * 0.4);
        ctx.lineTo(0, h * 0.4);
        ctx.fill();
        
        // Снежные вершины
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.moveTo(0, h * 0.25);
        for (let x = 0; x <= w; x += 20) {
          const nx = x / w;
          const y = Math.sin(nx * 4) * 18 + Math.cos(nx * 7) * 8 + 25;
          if (y > 28) ctx.lineTo(x + offsetX * 0.3, h * 0.25 - y + 6);
        }
        ctx.fill();
        ctx.restore();

        // Птицы
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) {
          const birdX = (i * 200 + time * 30) % (w + 100) - 50;
          const birdY = h * 0.2 + Math.sin(time * 2 + i) * 10;
          ctx.beginPath();
          ctx.moveTo(birdX, birdY);
          ctx.quadraticCurveTo(birdX + 8, birdY - 5, birdX + 16, birdY);
          ctx.moveTo(birdX + 16, birdY);
          ctx.quadraticCurveTo(birdX + 24, birdY - 5, birdX + 32, birdY);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ============================================
      // ВЕЧЕР (17:00 - 21:00)
      // ============================================
      else if (timeOfDay === "evening") {
        const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
        skyGradient.addColorStop(0, "#1A1A4A");
        skyGradient.addColorStop(0.3, "#8B3A5A");
        skyGradient.addColorStop(0.6, "#E87A5A");
        skyGradient.addColorStop(1, "#FFB46A");
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, w, h);

        // Закатное солнце
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(w * 0.7 + offsetX * 0.1, h * 0.55 + offsetY * 0.05, 40, 0, Math.PI * 2);
        const sunGradient = ctx.createRadialGradient(w * 0.7, h * 0.55, 5, w * 0.7, h * 0.55, 40);
        sunGradient.addColorStop(0, "#FF6347");
        sunGradient.addColorStop(0.7, "#FF4500");
        sunGradient.addColorStop(1, "#8B0000");
        ctx.fillStyle = sunGradient;
        ctx.fill();
        ctx.restore();

        // Вечерние облака
        ctx.fillStyle = "rgba(200, 100, 80, 0.3)";
        for (let i = 0; i < 4; i++) {
          const cloudX = (i * 220 + time * 10) % (w + 200) - 100;
          ctx.beginPath();
          ctx.arc(cloudX, h * 0.45, 35, 0, Math.PI * 2);
          ctx.arc(cloudX + 50, h * 0.42, 30, 0, Math.PI * 2);
          ctx.arc(cloudX - 30, h * 0.48, 25, 0, Math.PI * 2);
          ctx.fill();
        }

        // Первые звёзды
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#FFFFFF";
        for (let i = 0; i < 30; i++) {
          ctx.beginPath();
          ctx.arc((i * 137) % w, (i * 89) % (h * 0.3), 1, 0, Math.PI * 2);
          ctx.fill();
        }

        // Горы
        ctx.save();
        ctx.translate(0, h * 0.6);
        ctx.fillStyle = "#2A1A3A";
        ctx.beginPath();
        ctx.moveTo(0, h * 0.2);
        for (let x = 0; x <= w; x += 25) {
          const nx = x / w;
          const y = Math.sin(nx * 3.5) * 18 + Math.cos(nx * 5) * 8 + 25;
          ctx.lineTo(x + offsetX * 0.2, h * 0.2 - y);
        }
        ctx.lineTo(w, h * 0.3);
        ctx.lineTo(0, h * 0.3);
        ctx.fill();
        ctx.restore();
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
  }, [timeOfDay, mousePos]);

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

  const timeNames: Record<TimeOfDay, string> = {
    dawn: "🌅 Рассвет",
    morning: "☀️ Утро",
    day: "🌤️ День",
    evening: "🌆 Вечер",
    night: "🌙 Ночь",
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-3">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Индикатор времени суток */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-24 left-4 z-20 hidden sm:block"
      >
        <div className="px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md text-white/60 text-xs">
          {timeNames[timeOfDay]}
        </div>
      </motion.div>

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