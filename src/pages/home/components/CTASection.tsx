import { useEffect, useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  ArrowRight, 
  Search, 
  TrendingUp, 
  Users, 
  Package, 
  Sparkles,
  Shield,
  Bot,
  Gift,
  ChevronRight,
  Star,
  MapPin
} from "lucide-react";

// ============================================
// КОМПОНЕНТ СЧЁТЧИКА С АНИМАЦИЕЙ
// ============================================

const AnimatedCounter = ({ value, duration = 2 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let start = 0;
    const increment = value / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value, duration, isInView]);

  return <span ref={nodeRef}>{count.toLocaleString()}</span>;
};

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function CTASection() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const [stats, setStats] = useState({
    totalAds: 47291,
    activeUsers: 12847,
    todayDeals: 234,
    avgRating: 4.8,
  });
  const [loading, setLoading] = useState(true);

  // Загружаем статистику
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [{ count: adsCount }, { count: usersCount }, { count: dealsCount }] = await Promise.all([
          supabase.from("ads").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase.from("transactions").select("*", { count: "exact", head: true })
            .eq("status", "completed")
            .gte("created_at", new Date().toISOString().split('T')[0]),
        ]);

        setStats({
          totalAds: adsCount || 47291,
          activeUsers: usersCount || 12847,
          todayDeals: dealsCount || 234,
          avgRating: 4.8,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStartSelling = () => {
    if (user) {
      navigate("/post");
    } else {
      navigate("/auth", { state: { from: "/post", mode: "signup" } });
    }
  };

  const handleBrowseAds = () => {
    navigate("/search");
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 lg:py-40 px-4 sm:px-6 overflow-hidden"
    >
      {/* Фоновое изображение с параллаксом */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.2 }}
        animate={isInView ? { scale: 1 } : { scale: 1.2 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <img
          src={isDark 
            ? "https://readdy.ai/api/search-image?query=Novosibirsk%20Opera%20Theatre%20night%20aerial%20city%20lights%20snow%20siberia&width=1920&height=800"
            : "https://readdy.ai/api/search-image?query=Novosibirsk%20Opera%20Theatre%20summer%20sunny%20blue%20sky%20green%20park%20aerial&width=1920&height=800"
          }
          alt="Новосибирск"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </motion.div>
      
      {/* Градиентный оверлей */}
      <div 
        className="absolute inset-0"
        style={{
          background: isDark 
            ? "linear-gradient(135deg, rgba(11,79,108,0.95) 0%, rgba(10,24,40,0.9) 40%, rgba(26,59,46,0.95) 100%)"
            : "linear-gradient(135deg, rgba(37,99,235,0.9) 0%, rgba(124,58,237,0.85) 50%, rgba(16,185,129,0.85) 100%)",
        }}
      />

      {/* Анимированные частицы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              scale: 0,
            }}
            animate={isInView ? {
              y: ["0%", "-100%"],
              x: ["0%", Math.random() * 20 - 10 + "%"],
              opacity: [0, 1, 0],
              scale: [1, 1.5, 1],
            } : {}}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Декоративные круги */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-400/10 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Текстовая часть */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl text-center lg:text-left"
          >
            {/* Бейдж */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-white/90 text-sm font-bold">
                Присоединяйся к {stats.activeUsers.toLocaleString()}+ пользователей
              </span>
            </motion.div>

            <h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6"
              style={{ 
                fontFamily: "Nunito, sans-serif", 
                textShadow: "0 4px 32px rgba(0,0,0,0.4)" 
              }}
            >
              Стань частью<br />
              <span className="relative">
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                  сибирского
                </span>
                <motion.span
                  className="absolute -right-8 top-0 text-2xl"
                  animate={{ rotate: [0, 20, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🌟
                </motion.span>
              </span>
              <br />
              комьюнити
            </h2>
            
            <p 
              className="text-white/80 text-lg leading-relaxed mb-8 max-w-xl"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              Размещай объявления бесплатно. Продавай быстрее с AI-помощником. 
              Встречайся с соседями безопасно.
            </p>

            {/* Статистика */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <motion.div 
                className="text-center sm:text-left"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center">
                    <Package className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-white/60 text-xs uppercase tracking-wider">Объявлений</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {loading ? "—" : <AnimatedCounter value={stats.totalAds} />}
                </div>
              </motion.div>
              
              <motion.div 
                className="text-center sm:text-left"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-white/60 text-xs uppercase tracking-wider">Пользователей</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {loading ? "—" : <AnimatedCounter value={stats.activeUsers} />}
                </div>
              </motion.div>
              
              <motion.div 
                className="text-center sm:text-left"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                  <div className="w-8 h-8 rounded-lg bg-blue-400/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-white/60 text-xs uppercase tracking-wider">Сделок сегодня</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {loading ? "—" : <AnimatedCounter value={stats.todayDeals} />}
                </div>
              </motion.div>

              <motion.div 
                className="text-center sm:text-left"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                  <div className="w-8 h-8 rounded-lg bg-purple-400/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-white/60 text-xs uppercase tracking-wider">Рейтинг</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {stats.avgRating.toFixed(1)}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Кнопки действий */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="w-full lg:w-auto min-w-[300px]"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              {/* Основная кнопка */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -12px rgba(230,179,30,0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartSelling}
                className="w-full group flex items-center justify-between gap-4 px-6 py-5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 cursor-pointer shadow-xl transition-all duration-300 mb-4"
              >
                <span 
                  className="text-gray-900 font-black text-lg"
                  style={{ fontFamily: "Nunito, sans-serif" }}
                >
                  {user ? "Подать объявление" : "Начать продавать"}
                </span>
                <motion.div
                  className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0 group-hover:bg-white/40"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <ArrowRight className="text-gray-900 w-5 h-5" />
                </motion.div>
              </motion.button>

              {/* Вторичная кнопка */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBrowseAds}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-white text-base backdrop-blur-sm transition-all duration-300 mb-6"
                style={{ 
                  border: "2px solid rgba(255,255,255,0.2)", 
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <Search className="w-5 h-5" />
                Найти объявления
                <ChevronRight className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </motion.button>

              {/* Доверительные бейджи */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <Shield className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <div className="text-white font-bold text-sm">Безопасная сделка</div>
                    <div className="text-white/40 text-xs">Деньги замораживаются до получения</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <Bot className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <div className="text-white font-bold text-sm">AI-помощник</div>
                    <div className="text-white/40 text-xs">Создаст описание за тебя</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <Gift className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <div className="text-white font-bold text-sm">0₽ размещение</div>
                    <div className="text-white/40 text-xs">Бесплатно навсегда</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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
            "description": "Современная доска объявлений Новосибирска. Безопасные сделки, AI-помощник, бесплатное размещение.",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Новосибирск",
              "addressRegion": "Новосибирская область",
              "addressCountry": "RU"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "12847"
            }
          })
        }}
      />
    </section>
  );
}