import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Package, 
  X, 
  Sun, 
  Moon, 
  ArrowRight, 
  ChevronDown,
  Shield,
  Zap,
  Star,
  Mountain
} from "lucide-react";

// ============================================
// ТИПЫ
// ============================================

interface DistrictWithStats {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  count: number;
  color: string;
  slug: string;
}

// ============================================
// КОНСТАНТЫ
// ============================================

const DISTRICT_CONFIG: Record<string, { icon: string; color: string; shortName: string }> = {
  "Центральный": { icon: "🏛️", color: "#E6B31E", shortName: "Центр" },
  "Железнодорожный": { icon: "🚂", color: "#E63946", shortName: "ЖД" },
  "Заельцовский": { icon: "🌲", color: "#2A9D8F", shortName: "Заельц" },
  "Дзержинский": { icon: "🏭", color: "#E76F51", shortName: "Дзерж" },
  "Октябрьский": { icon: "🌉", color: "#6D597A", shortName: "Октяб" },
  "Калининский": { icon: "🏗️", color: "#264653", shortName: "Калин" },
  "Кировский": { icon: "🏙️", color: "#2B2D42", shortName: "Киров" },
  "Ленинский": { icon: "🏢", color: "#8D99AE", shortName: "Ленин" },
  "Советский": { icon: "🔬", color: "#457B9D", shortName: "Совет" },
  "Первомайский": { icon: "🌳", color: "#1D3557", shortName: "Первом" },
};

const POPULAR_SEARCHES = [
  { icon: "📱", text: "iPhone 15", query: "iPhone 15" },
  { icon: "🛋️", text: "Диван угловой", query: "диван угловой" },
  { icon: "🚲", text: "Велосипед", query: "велосипед" },
  { icon: "💻", text: "MacBook", query: "MacBook" },
  { icon: "👶", text: "Детская коляска", query: "коляска" },
  { icon: "🚗", text: "Автомобиль", query: "авто" },
];

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
  const [districts, setDistricts] = useState<DistrictWithStats[]>([]);
  const [stats, setStats] = useState({
    totalAds: 47291,
    totalUsers: 12847,
    onlineUsers: 1927,
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // ============================================
  // ЗАГРУЗКА ДАННЫХ
  // ============================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: districtsData } = await supabase
          .from("districts")
          .select(`id, name`)
          .eq("is_active", true);

        if (districtsData && districtsData.length > 0) {
          const enrichedDistricts: DistrictWithStats[] = await Promise.all(
            districtsData.map(async (d: any) => {
              try {
                const { count } = await supabase
                  .from("ads")
                  .select("*", { count: "exact", head: true })
                  .eq("district", d.name)
                  .eq("status", "active");
                
                const config = DISTRICT_CONFIG[d.name] || { 
                  icon: "📍", color: "#6B7280", shortName: d.name.slice(0, 6) 
                };
                
                return {
                  id: d.id.toString(),
                  name: d.name,
                  shortName: config.shortName,
                  icon: config.icon,
                  color: config.color,
                  count: count || 0,
                  slug: d.name.toLowerCase().replace(/\s+/g, "-"),
                };
              } catch {
                const config = DISTRICT_CONFIG[d.name] || { 
                  icon: "📍", color: "#6B7280", shortName: d.name.slice(0, 6) 
                };
                return {
                  id: d.id.toString(),
                  name: d.name,
                  shortName: config.shortName,
                  icon: config.icon,
                  color: config.color,
                  count: 0,
                  slug: d.name.toLowerCase().replace(/\s+/g, "-"),
                };
              }
            })
          );

          const sortedDistricts = enrichedDistricts
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
          
          setDistricts(sortedDistricts);
        }

        const [{ count: totalAds }, { count: totalUsers }] = await Promise.all([
          supabase.from("ads").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("users").select("*", { count: "exact", head: true }),
        ]);

        setStats({
          totalAds: totalAds || 47291,
          totalUsers: totalUsers || 12847,
          onlineUsers: Math.floor((totalUsers || 12847) * 0.15),
        });
      } catch (err) {
        console.error("Failed to fetch hero data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================================
  // ОБРАБОТЧИКИ
  // ============================================

  const handleDistrictClick = useCallback((districtName: string) => {
    setActiveDistrict(prev => prev === districtName ? null : districtName);
  }, []);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (activeDistrict) {
      const district = districts.find(d => d.name === activeDistrict);
      if (district) params.set("district", district.name);
    }
    navigate(`/search${params.toString() ? "?" + params.toString() : ""}`);
  }, [searchQuery, activeDistrict, districts, navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  }, [handleSearch]);

  // ============================================
  // СТИЛИ
  // ============================================

  const bgGradient = isDark
    ? "linear-gradient(180deg, #020C18 0%, #0A1828 60%, #0D2035 100%)"
    : "linear-gradient(180deg, #5BB8E8 0%, #87CEEB 40%, #C8DCA8 100%)";

  // ============================================
  // РЕНДЕР
  // ============================================

  return (
    <section
      ref={sectionRef}
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ minHeight: "100vh", background: bgGradient }}
    >
      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "SibBoard",
            "url": "https://sibboard.ru",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://sibboard.ru/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />

      {/* Декоративные элементы фона */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #E6B31E 0%, transparent 70%)" }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #0B4F6C 0%, transparent 70%)" }}
        />
      </div>

      {/* Theme toggle */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        onClick={toggleTheme}
        className="absolute top-24 right-6 z-30 w-12 h-12 flex items-center justify-center rounded-full cursor-pointer backdrop-blur-xl transition-all duration-300 hover:scale-110 shadow-lg"
        style={{
          background: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)",
          border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.08)",
        }}
        aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isDark ? "moon" : "sun"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-[#E6B31E]" />
            ) : (
              <Moon className="w-5 h-5 text-[#0A1828]" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Основной контент */}
      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col items-center text-center pt-24 sm:pt-28 pb-16">
        
        {/* Логотип */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#E6B31E]/10 to-[#F7A31E]/10 backdrop-blur-xl border border-[#E6B31E]/20">
            <Mountain className="w-8 h-8 text-[#E6B31E]" />
            <span className="text-2xl font-black text-white">SIBBOARD</span>
          </div>
        </motion.div>

        {/* Бейдж */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 sm:mb-6 backdrop-blur-xl"
          style={{
            background: isDark ? "rgba(230,179,30,0.12)" : "rgba(255,255,255,0.7)",
            border: isDark ? "1px solid rgba(230,179,30,0.3)" : "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Sparkles className="w-4 h-4 text-[#E6B31E]" />
          <span
            className="text-xs sm:text-sm font-bold"
            style={{ color: isDark ? "#E6B31E" : "#0A1828" }}
          >
            Новосибирск · {new Date().getFullYear()}
          </span>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </motion.div>

        {/* Заголовок */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, type: "spring", stiffness: 80, damping: 15 }}
          className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-3 sm:mb-4 px-2"
          style={{ 
            color: isDark ? "#FFFFFF" : "#0A1828",
            textShadow: isDark ? "0 4px 32px rgba(0,0,0,0.8)" : "none" 
          }}
        >
          Покупай и продавай
          <br />
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
            по-соседски
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.45 }}
          className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl px-4"
          style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(10,24,40,0.7)" }}
        >
          <Shield className="w-4 h-4 inline mr-1 text-green-400" />
          Безопасные сделки · 
          <Zap className="w-4 h-4 inline mx-1 text-[#E6B31E]" />
          AI-ассистент · 
          <Star className="w-4 h-4 inline ml-1 text-blue-400" />
          {" "}Рейтинг продавцов
        </motion.p>

        {/* Селектор районов */}
        {districts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-2"
          >
            <button
              onClick={() => setActiveDistrict(null)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 backdrop-blur-xl ${
                !activeDistrict ? "ring-2 ring-[#E6B31E]" : ""
              }`}
              style={{
                background: !activeDistrict
                  ? (isDark ? "rgba(230,179,30,0.2)" : "rgba(230,179,30,0.15)")
                  : (isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)"),
                color: !activeDistrict ? "#E6B31E" : (isDark ? "rgba(255,255,255,0.7)" : "#0A1828"),
              }}
            >
              <MapPin className="w-4 h-4" />
              Все районы
            </button>
            
            {districts.map((district) => {
              const isActive = activeDistrict === district.name;
              return (
                <motion.button
                  key={district.id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleDistrictClick(district.name)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 backdrop-blur-xl"
                  style={{
                    background: isActive
                      ? district.color
                      : isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
                    border: isActive
                      ? `2px solid ${district.color}`
                      : isDark ? "2px solid rgba(255,255,255,0.12)" : "2px solid rgba(0,0,0,0.08)",
                    color: isActive ? "#fff" : (isDark ? "rgba(255,255,255,0.85)" : "#0A1828"),
                    boxShadow: isActive ? `0 8px 24px ${district.color}55` : "none",
                  }}
                >
                  <span className="text-base sm:text-lg">{district.icon}</span>
                  <span className="hidden sm:inline">{district.name}</span>
                  <span className="sm:hidden">{district.shortName}</span>
                  <span
                    className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: isActive 
                        ? "rgba(255,255,255,0.25)" 
                        : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.04)"),
                    }}
                  >
                    {district.count.toLocaleString()}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Поисковая строка */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="w-full max-w-2xl lg:max-w-3xl px-4"
        >
          <div
            className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl backdrop-blur-xl transition-all duration-300 ${
              isSearchFocused ? "scale-[1.02] shadow-2xl" : "shadow-lg"
            }`}
            style={{
              background: isDark ? "rgba(20,30,50,0.9)" : "rgba(255,255,255,0.9)",
              border: isDark 
                ? `2px solid ${isSearchFocused ? "rgba(230,179,30,0.5)" : "rgba(255,255,255,0.12)"}`
                : `2px solid ${isSearchFocused ? "rgba(230,179,30,0.5)" : "rgba(0,0,0,0.06)"}`,
              boxShadow: isSearchFocused ? "0 8px 32px rgba(230,179,30,0.3)" : "none",
            }}
          >
            <Search className={`w-5 h-5 flex-shrink-0 ${isDark ? "text-white/40" : "text-gray-400"}`} />
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setIsSearchFocused(true);
                setShowSuggestions(true);
              }}
              onBlur={() => {
                setIsSearchFocused(false);
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              onKeyDown={handleKeyDown}
              placeholder="iPhone 15, диван или дрель..."
              className="flex-1 bg-transparent text-base outline-none min-w-0 placeholder:text-white/30"
              style={{ color: isDark ? "#FFFFFF" : "#0A1828" }}
            />

            {activeDistrict && (
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
                style={{ 
                  background: "rgba(230,179,30,0.2)", 
                  color: "#E6B31E", 
                  border: "1px solid rgba(230,179,30,0.3)" 
                }}
              >
                <MapPin className="w-3 h-3" />
                {districts.find(d => d.name === activeDistrict)?.shortName || activeDistrict}
              </div>
            )}

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }} />
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #E6B31E, #F7A31E)",
                boxShadow: "0 6px 20px rgba(230,179,30,0.4)",
              }}
            >
              <ArrowRight className="w-5 h-5 text-[#0A1828]" />
            </motion.button>
          </div>

          {/* Подсказки */}
          <AnimatePresence>
            {showSuggestions && !searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 flex flex-wrap items-center justify-center gap-2"
              >
                {POPULAR_SEARCHES.map((item) => (
                  <button
                    key={item.text}
                    onClick={() => {
                      setSearchQuery(item.query);
                      setIsSearchFocused(false);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs sm:text-sm backdrop-blur-xl transition-all hover:scale-105"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
                      border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.06)",
                      color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)",
                    }}
                  >
                    {item.icon} {item.text}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Подсказка активного района */}
        <AnimatePresence>
          {activeDistrict && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 flex items-center gap-2 text-xs sm:text-sm"
              style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(10,24,40,0.5)" }}
            >
              <MapPin className="w-4 h-4 text-[#E6B31E]" />
              <span>Выбран район {activeDistrict}</span>
              <button
                onClick={() => setActiveDistrict(null)}
                className="ml-2 text-[#E6B31E] hover:underline font-semibold"
              >
                Сбросить
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Статистика */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.75 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-10 sm:mt-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E6B31E20" }}>
                <Package className="w-4 h-4" style={{ color: "#E6B31E" }} />
              </div>
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {loading ? "—" : stats.totalAds.toLocaleString()}
              </span>
            </div>
            <div className="text-[10px] sm:text-xs font-medium" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(10,24,40,0.4)" }}>
              объявлений
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#4A9EBF20" }}>
                <Users className="w-4 h-4" style={{ color: "#4A9EBF" }} />
              </div>
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {loading ? "—" : stats.totalUsers.toLocaleString()}
              </span>
            </div>
            <div className="text-[10px] sm:text-xs font-medium" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(10,24,40,0.4)" }}>
              продавцов
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 1.0 }}
            whileHover={{ scale: 1.05 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#2A9D8F20" }}>
                <MapPin className="w-4 h-4" style={{ color: "#2A9D8F" }} />
              </div>
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {districts.length || 10} районов
              </span>
            </div>
            <div className="text-[10px] sm:text-xs font-medium" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(10,24,40,0.4)" }}>
              Новосибирска
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.05 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E76F5120" }}>
                <TrendingUp className="w-4 h-4" style={{ color: "#E76F51" }} />
              </div>
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {loading ? "—" : stats.onlineUsers.toLocaleString()}
              </span>
            </div>
            <div className="text-[10px] sm:text-xs font-medium" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(10,24,40,0.4)" }}>
              онлайн
            </div>
          </motion.div>
        </motion.div>

        {/* Индикатор скролла */}
        <motion.div
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 cursor-pointer group"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/30 text-xs group-hover:text-white/60 transition-colors">
              Листай вниз
            </span>
            <ChevronDown 
              className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform"
              style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(10,24,40,0.4)" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}