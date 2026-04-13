import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Mountain, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight,
  Heart,
  Shield,
  Sparkles,
  Globe,
  ArrowUp,
  Send,
  CheckCircle,
  Loader2
} from "lucide-react";

// ============================================
// СОЦСЕТИ
// ============================================

const SOCIALS = [
  { 
    name: "Telegram", 
    icon: "📱", 
    url: "https://t.me/sibboard", 
    color: "#26A5E4" 
  },
  { 
    name: "VK", 
    icon: "💬", 
    url: "https://vk.com/sibboard", 
    color: "#0077FF" 
  },
  { 
    name: "YouTube", 
    icon: "▶️", 
    url: "https://youtube.com/@sibboard", 
    color: "#FF0000" 
  },
  { 
    name: "WhatsApp", 
    icon: "💚", 
    url: "https://wa.me/79137065770", 
    color: "#25D366" 
  },
];

// ============================================
// КОЛОНКИ ФУТЕРА
// ============================================

const BUYER_LINKS = [
  { label: "Как купить", href: "/how" },
  { label: "Безопасная сделка", href: "/safety" },
  { label: "Защита покупателя", href: "/protection" },
  { label: "Отзывы продавцов", href: "/reviews" },
  { label: "Карта районов", href: "/#districts" },
];

const SELLER_LINKS = [
  { label: "Разместить объявление", href: "/post" },
  { label: "AI-описание", href: "/ai" },
  { label: "Аудио-визитка", href: "/voice" },
  { label: "Продвижение", href: "/promote" },
  { label: "Статистика", href: "/dashboard" },
];

const COMPANY_LINKS = [
  { label: "О нас", href: "/about" },
  { label: "Блог", href: "/blog" },
  { label: "Партнёрам", href: "/partners" },
  { label: "Вакансии", href: "/careers" },
  { label: "Контакты", href: "/contacts" },
];

// ============================================
// ПОДПИСКА НА РАССЫЛКУ
// ============================================

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Введи корректный email");
      return;
    }
    
    setStatus("loading");
    setError("");
    
    // Имитация отправки
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    }, 1500);
  };

  return (
    <div>
      <h4 className="text-[#E6B31E] text-xs font-bold uppercase tracking-widest mb-4">
        <Send className="w-3.5 h-3.5 inline mr-1" />
        Рассылка
      </h4>
      <p className="text-white/40 text-xs mb-3">
        Узнавай о новинках и акциях первым
      </p>
      
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Твой email"
          disabled={status === "loading" || status === "success"}
          className="w-full px-4 py-2.5 pr-12 rounded-xl text-sm outline-none transition-all disabled:opacity-50"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#FFFFFF",
          }}
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
          style={{ background: "rgba(230,179,30,0.15)", color: "#E6B31E" }}
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : status === "success" ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </form>
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-xs mt-2"
          >
            {error}
          </motion.p>
        )}
        {status === "success" && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-green-400 text-xs mt-2"
          >
            ✓ Ты подписан!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// КНОПКА "НАВЕРХ"
// ============================================

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useState(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
          style={{
            background: "linear-gradient(135deg, #E6B31E, #F7A31E)",
          }}
        >
          <ArrowUp className="w-5 h-5 text-[#0A1828]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function Footer() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer
        className="relative"
        style={{ 
          background: isDark 
            ? "linear-gradient(180deg, #0A1828 0%, #061220 100%)" 
            : "linear-gradient(180deg, #1A1A2E 0%, #16213E 100%)",
          borderTop: "1px solid rgba(255,255,255,0.06)" 
        }}
      >
        {/* Декоративная волна */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E6B31E]/30 to-transparent" />

        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Бренд */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-4 group">
                <motion.div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
                  style={{ background: "linear-gradient(135deg, #E6B31E, #F7A31E)" }}
                >
                  <Mountain className="w-6 h-6 text-[#0A1828]" />
                </motion.div>
                <span
                  className="text-2xl font-black tracking-tight"
                  style={{
                    background: "linear-gradient(135deg, #E6B31E, #F7A31E)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "Nunito, sans-serif",
                  }}
                >
                  SIBBOARD
                </span>
              </Link>
              
              <p className="text-white/50 text-sm leading-relaxed mb-6" style={{ fontFamily: "Nunito, sans-serif" }}>
                Цифровой соседский центр Новосибирска. Покупай и продавай по-соседски.
              </p>
              
              {/* Контакты */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <MapPin className="w-4 h-4 text-[#E6B31E]" />
                  <span>Новосибирск, Красный проспект, 1</span>
                </div>
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <Phone className="w-4 h-4 text-[#E6B31E]" />
                  <a href="tel:+79137065770" className="hover:text-[#E6B31E] transition-colors">
                    +7 (913) 706-57-70
                  </a>
                </div>
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <Mail className="w-4 h-4 text-[#E6B31E]" />
                  <a href="mailto:hello@sibboard.ru" className="hover:text-[#E6B31E] transition-colors">
                    hello@sibboard.ru
                  </a>
                </div>
              </div>

              {/* Соцсети */}
              <div className="flex gap-2">
                {SOCIALS.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-lg transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Покупателям */}
            <div>
              <h4 className="text-[#E6B31E] text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Покупателям
              </h4>
              <ul className="space-y-2">
                {BUYER_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-white/50 hover:text-white text-sm transition-all hover:translate-x-1 inline-flex items-center gap-1 group"
                      style={{ fontFamily: "Nunito, sans-serif" }}
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all text-[#E6B31E]" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Продавцам */}
            <div>
              <h4 className="text-[#E6B31E] text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Продавцам
              </h4>
              <ul className="space-y-2">
                {SELLER_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-white/50 hover:text-white text-sm transition-all hover:translate-x-1 inline-flex items-center gap-1 group"
                      style={{ fontFamily: "Nunito, sans-serif" }}
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all text-[#E6B31E]" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Компания */}
            <div>
              <h4 className="text-[#E6B31E] text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                Компания
              </h4>
              <ul className="space-y-2">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-white/50 hover:text-white text-sm transition-all hover:translate-x-1 inline-flex items-center gap-1 group"
                      style={{ fontFamily: "Nunito, sans-serif" }}
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all text-[#E6B31E]" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Рассылка */}
            <div className="sm:col-span-2 lg:col-span-1">
              <NewsletterForm />
              
              {/* Платежные системы */}
              <div className="mt-6 pt-6 border-t border-white/6">
                <p className="text-white/30 text-xs mb-3">Принимаем к оплате:</p>
                <div className="flex gap-2">
                  {["💳", "🪙", "📱", "🏦"].map((icon, i) => (
                    <div
                      key={i}
                      className="w-10 h-8 rounded-lg flex items-center justify-center text-lg"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Нижняя часть */}
          <div className="mt-12 pt-6 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm flex items-center gap-1" style={{ fontFamily: "Nunito, sans-serif" }}>
              © {currentYear} SIBBOARD · Новосибирск
              <Heart className="w-3.5 h-3.5 text-red-400 inline mx-1" />
            </p>
            
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="text-white/30 hover:text-white/60 text-sm transition-colors">
                Политика
              </Link>
              <span className="text-white/20">|</span>
              <Link to="/terms" className="text-white/30 hover:text-white/60 text-sm transition-colors">
                Оферта
              </Link>
              <span className="text-white/20">|</span>
              <Link to="/help" className="text-white/30 hover:text-white/60 text-sm transition-colors">
                Помощь
              </Link>
              <span className="text-white/20">|</span>
              <button 
                onClick={() => navigate("/sitemap")}
                className="text-white/30 hover:text-white/60 text-sm transition-colors"
              >
                Карта сайта
              </button>
            </div>
          </div>
        </div>

        {/* SEO Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "SibBoard",
              "url": "https://sibboard.ru",
              "logo": "https://sibboard.ru/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+7-913-706-57-70",
                "contactType": "customer service",
                "email": "hello@sibboard.ru",
                "areaServed": "RU",
                "availableLanguage": ["Russian"]
              },
              "sameAs": SOCIALS.map(s => s.url)
            })
          }}
        />
      </footer>
      
      <ScrollToTop />
    </>
  );
}