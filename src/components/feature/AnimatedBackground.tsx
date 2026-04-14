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
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

const rgba = (r: number, g: number, b: number, a: number): string => {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const hsl = (h: number, s: number, l: number): string => {
  return `hsl(${h}, ${s}%, ${l}%)`;
};

// ============================================
// КЛАССЫ ЧАСТИЦ
// ============================================

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: "star" | "dust" | "light" | "cloud";

  constructor(x: number, y: number, type: "star" | "dust" | "light" | "cloud") {
    this.x = x;
    this.y = y;
    this.type = type;
    this.maxLife = Math.random() * 2 + 1;
    this.life = this.maxLife;

    if (type === "dust") {
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = Math.random() * 0.3 - 0.1;
      this.size = Math.random() * 2 + 0.5;
      this.color = rgba(255, 255, 255, Math.random() * 0.3 + 0.1);
    } else if (type === "light") {
      this.vx = (Math.random() - 0.5) * 1;
      this.vy = Math.random() * 0.5 - 0.25;
      this.size = Math.random() * 1.5 + 0.5;
      this.color = rgba(255, 200, 100, Math.random() * 0.4);
    } else if (type === "star") {
      this.vx = 0;
      this.vy = 0;
      this.size = Math.random() * 1.5 + 0.5;
      this.color = "#FFFFFF";
    } else {
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = Math.random() * 0.2 - 0.1;
      this.size = Math.random() * 3 + 1;
      this.color = rgba(255, 255, 255, Math.random() * 0.2);
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.01;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  isAlive() {
    return this.life > 0;
  }
}

class FloatingObject {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  type: "cloud" | "orb";

  constructor(x: number, y: number, type: "cloud" | "orb") {
    this.x = x;
    this.y = y;
    this.type = type;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.2;
    this.size = Math.random() * 40 + 20;
    this.opacity = Math.random() * 0.3 + 0.1;
  }

  update(w: number, h: number) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < -this.size) this.x = w + this.size;
    if (this.x > w + this.size) this.x = -this.size;
    if (this.y < -this.size) this.y = h + this.size;
    if (this.y > h + this.size) this.y = -this.size;
  }

  draw(ctx: CanvasRenderingContext2D, time: number) {
    ctx.globalAlpha = this.opacity;
    if (this.type === "cloud") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.arc(this.x + this.size * 0.6, this.y - this.size * 0.3, this.size * 0.7, 0, Math.PI * 2);
      ctx.arc(this.x - this.size * 0.6, this.y - this.size * 0.2, this.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      gradient.addColorStop(0, "rgba(255, 200, 100, 0.3)");
      gradient.addColorStop(1, "rgba(255, 100, 50, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function AnimatedBackground({ activeDistrict }: AnimatedBackgroundProps) {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getTimeOfDay());

  function getTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 7) return "dawn";
    if (hour >= 7 && hour < 11) return "morning";
    if (hour >= 11 && hour < 17) return "day";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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
  // АНИМАЦИЯ CANVAS
  // ============================================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrame: number;
    let time = 0;
    let particles: Particle[] = [];
    const floatingObjects: FloatingObject[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    const drawGradientSky = (colors: Array<{ stop: number; color: string }>, h: number) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      colors.forEach(({ stop, color }) => gradient.addColorStop(stop, color));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, window.innerWidth, h);
    };

    const drawMountains = (baseY: number, color: string, complexity: number, offsetX: number) => {
      const w = window.innerWidth;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, baseY + 200);
      for (let x = 0; x <= w; x += 15) {
        const nx = x / w;
        const y = Math.sin(nx * complexity) * 40 + Math.cos(nx * (complexity + 2)) * 20 + Math.sin(nx * (complexity * 0.5)) * 15;
        ctx.lineTo(x + offsetX * 0.2, baseY - y);
      }
      ctx.lineTo(w, baseY + 200);
      ctx.lineTo(0, baseY + 200);
      ctx.fill();
    };

    const drawNight = (w: number, h: number, offsetX: number, offsetY: number) => {
      drawGradientSky([
        { stop: 0, color: "#0A0E27" },
        { stop: 0.3, color: "#1A1F4A" },
        { stop: 0.7, color: "#2A1F5A" },
        { stop: 1, color: "#1A2A4A" },
      ], h);

      // Млечный путь
      ctx.save();
      ctx.globalAlpha = 0.08;
      const milkyWayGradient = ctx.createLinearGradient(0, h * 0.1, w, h * 0.5);
      milkyWayGradient.addColorStop(0, "#6A7ABA");
      milkyWayGradient.addColorStop(0.5, "#4A5A9A");
      milkyWayGradient.addColorStop(1, "transparent");
      ctx.fillStyle = milkyWayGradient;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.15);
      ctx.quadraticCurveTo(w * 0.5, h * 0.25, w, h * 0.1);
      ctx.quadraticCurveTo(w * 0.5, h * 0.35, 0, h * 0.2);
      ctx.fill();
      ctx.restore();

      // Звёзды
      ctx.globalAlpha = 1;
      for (let i = 0; i < 200; i++) {
        const starX = (i * 127 + Math.sin(i * 0.5) * 100) % w;
        const starY = (i * 83 + Math.cos(i * 0.3) * 100) % (h * 0.65);
        const size = Math.sin(i * 0.7) * 0.5 + 0.8;
        const twinkle = 0.3 + Math.sin(time * 2 + i * 0.5) * 0.4;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = i % 15 === 0 ? "#FFE4B5" : "#FFFFFF";
        ctx.beginPath();
        ctx.arc(starX, starY, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Луна
      ctx.save();
      const moonX = w * 0.8 + offsetX * 0.15;
      const moonY = h * 0.2 + offsetY * 0.1;
      ctx.globalAlpha = 0.15;
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 100);
      moonGlow.addColorStop(0, "#FFE4B5");
      moonGlow.addColorStop(0.5, "#E6B31E");
      moonGlow.addColorStop(1, "transparent");
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 100, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.95;
      const moonGradient = ctx.createRadialGradient(moonX - 10, moonY - 10, 0, moonX, moonY, 35);
      moonGradient.addColorStop(0, "#FFFACD");
      moonGradient.addColorStop(0.7, "#F5DEB3");
      moonGradient.addColorStop(1, "#DAA520");
      ctx.fillStyle = moonGradient;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#8B7355";
      for (let i = 0; i < 5; i++) {
        const craterX = moonX + (Math.sin(i * 1.2) * 20 - 10);
        const craterY = moonY + (Math.cos(i * 1.5) * 15 - 5);
        ctx.beginPath();
        ctx.arc(craterX, craterY, 3 + i * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      drawMountains(h * 0.65, "#0D1A2A", 3.5, offsetX);

      // Падающие звёзды
      ctx.save();
      ctx.globalAlpha = 0.8;
      for (let i = 0; i < 2; i++) {
        const shootingX = (time * 80 + i * 400) % (w + 200) - 100;
        const shootingY = 80 + i * 60;
        if (shootingX > -50 && shootingX < w + 50) {
          const gradient = ctx.createLinearGradient(shootingX, shootingY, shootingX - 60, shootingY + 30);
          gradient.addColorStop(0, "#FFFFFF");
          gradient.addColorStop(0.7, "#FFE4B5");
          gradient.addColorStop(1, "transparent");
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(shootingX, shootingY);
          ctx.lineTo(shootingX - 60, shootingY + 30);
          ctx.stroke();
        }
      }
      ctx.restore();

      if (Math.random() > 0.95) {
        particles.push(new Particle(Math.random() * w, Math.random() * h, "dust"));
      }
    };

    const drawDawn = (w: number, h: number, offsetX: number, offsetY: number) => {
      drawGradientSky([
        { stop: 0, color: "#1A1A4A" },
        { stop: 0.3, color: "#5A3A6A" },
        { stop: 0.6, color: "#E87A5A" },
        { stop: 0.85, color: "#FFD4A0" },
        { stop: 1, color: "#FFE4B0" },
      ], h);

      const sunX = w * 0.5 + offsetX * 0.1;
      const sunY = h * 0.65;
      ctx.save();
      ctx.globalAlpha = 0.2;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 120);
      sunGlow.addColorStop(0, "#FFD700");
      sunGlow.addColorStop(0.5, "#FF6347");
      sunGlow.addColorStop(1, "transparent");
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.85;
      const sunGradient = ctx.createRadialGradient(sunX, sunY - 5, 0, sunX, sunY, 45);
      sunGradient.addColorStop(0, "#FFF8DC");
      sunGradient.addColorStop(0.6, "#FFD700");
      sunGradient.addColorStop(1, "#FF6347");
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.globalAlpha = 0.4 - i * 0.08;
        ctx.fillStyle = hsl(25, 100, 65 - i * 10);
        const cloudX = (i * 280 + time * 8) % (w + 200) - 100;
        const cloudY = h * 0.45 + i * 20;
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, 45, 0, Math.PI * 2);
        ctx.arc(cloudX + 60, cloudY - 10, 40, 0, Math.PI * 2);
        ctx.arc(cloudX - 40, cloudY + 5, 35, 0, Math.PI * 2);
        ctx.arc(cloudX + 90, cloudY + 10, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.globalAlpha = 0.15;
      ctx.fillStyle = "#FFFFFF";
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc((i * 173) % w, (i * 97) % (h * 0.4), 1, 0, Math.PI * 2);
        ctx.fill();
      }

      drawMountains(h * 0.6, "#3A2A4A", 4, offsetX);
    };

    const drawMorning = (w: number, h: number, offsetX: number, offsetY: number) => {
      drawGradientSky([
        { stop: 0, color: "#4A90D9" },
        { stop: 0.5, color: "#87CEEB" },
        { stop: 1, color: "#B8E4A0" },
      ], h);

      const sunX = w * 0.3 + offsetX * 0.2;
      const sunY = h * 0.25 + offsetY * 0.1;
      ctx.save();
      ctx.globalAlpha = 0.3;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 80);
      sunGlow.addColorStop(0, "#FFD700");
      sunGlow.addColorStop(1, "transparent");
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.85;
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 40);
      sunGradient.addColorStop(0, "#FFFACD");
      sunGradient.addColorStop(1, "#FFD700");
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        const cloudX = (i * 200 + time * 12) % (w + 200) - 100;
        ctx.beginPath();
        ctx.arc(cloudX, h * 0.35 + i * 15, 35, 0, Math.PI * 2);
        ctx.arc(cloudX + 50, h * 0.32 + i * 15, 30, 0, Math.PI * 2);
        ctx.arc(cloudX - 30, h * 0.38 + i * 15, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      drawMountains(h * 0.55, "#4A7A5A", 3.5, offsetX);

      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.55);
      for (let x = 0; x <= w; x += 20) {
        const nx = x / w;
        const y = Math.sin(nx * 3.5) * 15 + Math.cos(nx * 5) * 10 + 20;
        if (y > 25) ctx.lineTo(x + offsetX * 0.3, h * 0.55 - y + 8);
      }
      ctx.fill();
      ctx.restore();

      if (Math.random() > 0.92) {
        particles.push(new Particle(Math.random() * w, Math.random() * (h * 0.5), "light"));
      }
    };

    const drawDay = (w: number, h: number, offsetX: number, offsetY: number) => {
      drawGradientSky([
        { stop: 0, color: "#1E90FF" },
        { stop: 0.6, color: "#87CEEB" },
        { stop: 1, color: "#C8E6A0" },
      ], h);

      const sunX = w * 0.5 + offsetX * 0.1;
      const sunY = h * 0.15 + offsetY * 0.05;
      ctx.save();
      ctx.globalAlpha = 0.25;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 100);
      sunGlow.addColorStop(0, "#FFD700");
      sunGlow.addColorStop(1, "transparent");
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 100, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 35);
      sunGradient.addColorStop(0, "#FFFACD");
      sunGradient.addColorStop(1, "#FFD700");
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 3;
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + time * 0.01;
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(sunX + Math.cos(angle) * 120, sunY + Math.sin(angle) * 120);
        ctx.stroke();
      }
      ctx.restore();

      for (let i = 0; i < 7; i++) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        const cloudX = (i * 180 + time * 15) % (w + 200) - 100;
        const cloudY = h * 0.3 + i * 18;
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, 40, 0, Math.PI * 2);
        ctx.arc(cloudX + 55, cloudY - 8, 35, 0, Math.PI * 2);
        ctx.arc(cloudX - 35, cloudY + 5, 30, 0, Math.PI * 2);
        ctx.arc(cloudX + 80, cloudY + 8, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      drawMountains(h * 0.55, "#5A8A6A", 4, offsetX);
      drawMountains(h * 0.6, "#3A6A4A", 5, offsetX);

      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.55);
      for (let x = 0; x <= w; x += 20) {
        const nx = x / w;
        const y = Math.sin(nx * 4) * 18 + Math.cos(nx * 7) * 8 + 25;
        if (y > 28) ctx.lineTo(x + offsetX * 0.3, h * 0.55 - y + 7);
      }
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const birdX = (i * 200 + time * 35) % (w + 100) - 50;
        const birdY = h * 0.2 + Math.sin(time * 2 + i) * 15;
        ctx.beginPath();
        ctx.moveTo(birdX, birdY);
        ctx.quadraticCurveTo(birdX + 10, birdY - 6, birdX + 20, birdY);
        ctx.moveTo(birdX + 20, birdY);
        ctx.quadraticCurveTo(birdX + 30, birdY - 6, birdX + 40, birdY);
        ctx.stroke();
      }
      ctx.restore();

      if (Math.random() > 0.94) {
        particles.push(new Particle(Math.random() * w, Math.random() * h, "dust"));
      }
    };

    const drawEvening = (w: number, h: number, offsetX: number, offsetY: number) => {
      drawGradientSky([
        { stop: 0, color: "#1A1A4A" },
        { stop: 0.25, color: "#8B3A5A" },
        { stop: 0.55, color: "#E87A5A" },
        { stop: 0.8, color: "#FFB46A" },
        { stop: 1, color: "#FFD4A0" },
      ], h);

      const sunX = w * 0.7 + offsetX * 0.1;
      const sunY = h * 0.5 + offsetY * 0.05;
      ctx.save();
      ctx.globalAlpha = 0.3;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 110);
      sunGlow.addColorStop(0, "#FF6347");
      sunGlow.addColorStop(0.5, "#FF4500");
      sunGlow.addColorStop(1, "transparent");
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 110, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.9;
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 45);
      sunGradient.addColorStop(0, "#FF6347");
      sunGradient.addColorStop(0.7, "#FF4500");
      sunGradient.addColorStop(1, "#8B0000");
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.globalAlpha = 0.35 - i * 0.05;
        ctx.fillStyle = hsl(15, 100, 60 - i * 8);
        const cloudX = (i * 220 + time * 10) % (w + 200) - 100;
        const cloudY = h * 0.4 + i * 20;
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, 40, 0, Math.PI * 2);
        ctx.arc(cloudX + 55, cloudY - 8, 35, 0, Math.PI * 2);
        ctx.arc(cloudX - 35, cloudY + 5, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.globalAlpha = 0.25;
      ctx.fillStyle = "#FFFFFF";
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc((i * 137) % w, (i * 89) % (h * 0.35), 1, 0, Math.PI * 2);
        ctx.fill();
      }

      drawMountains(h * 0.6, "#2A1A3A", 3.5, offsetX);

      if (Math.random() > 0.93) {
        particles.push(new Particle(Math.random() * w, Math.random() * h, "light"));
      }
    };

    const draw = () => {
      time += 0.005;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const offsetX = (mousePos.x - 0.5) * 100;
      const offsetY = (mousePos.y - 0.5) * 60;

      if (timeOfDay === "night") drawNight(w, h, offsetX, offsetY);
      else if (timeOfDay === "dawn") drawDawn(w, h, offsetX, offsetY);
      else if (timeOfDay === "morning") drawMorning(w, h, offsetX, offsetY);
      else if (timeOfDay === "day") drawDay(w, h, offsetX, offsetY);
      else if (timeOfDay === "evening") drawEvening(w, h, offsetX, offsetY);

      ctx.globalAlpha = 1;
      particles = particles.filter((p) => p.isAlive());
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      floatingObjects.forEach((obj) => {
        obj.update(w, h);
        obj.draw(ctx, time);
      });

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
    center: "🏛️ Центр",
    akadem: "🔬 Академгородок",
    leviy: "🌊 Левый берег",
    zaeltsov: "🌲 Заельцовский",
    oktyabr: "🏗️ Октябрьский",
    kirovsky: "🏭 Кировский",
    pervomay: "🌸 Первомайский",
    sovetsky: "🎓 Советский",
    dzerzh: "🌆 Дзержинский",
    zhelezn: "🚂 Железнодорожный",
    kalinin: "🏙️ Калининский",
    leninsky: "🏢 Ленинский",
  };

  const timeNames: Record<TimeOfDay, string> = {
    dawn: "🌅 Рассвет",
    morning: "☀️ Утро",
    day: "🌤️ День",
    evening: "🌆 Вечер",
    night: "🌙 Ночь",
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-24 left-6 z-20 hidden sm:block"
      >
        <div className="px-4 py-2 rounded-xl bg-black/20 backdrop-blur-xl text-white/70 text-xs font-medium border border-white/10 shadow-2xl">
          {timeNames[timeOfDay]}
        </div>
      </motion.div>

      <AnimatePresence>
        {activeDistrict && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="px-6 py-3 rounded-2xl bg-black/30 backdrop-blur-2xl text-white text-sm font-semibold border border-white/20 shadow-2xl">
              {districtNames[activeDistrict] || activeDistrict}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}