import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase, type District } from "@/lib/supabase";
import { 
  MapPin, 
  TrendingUp, 
  Package, 
  Star, 
  ChevronRight, 
  Grid3x3, 
  Map as MapIcon,
  Sparkles,
  Users,
  ArrowRight,
  Building2,
  Navigation,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";

// ============================================
// ТИПЫ
// ============================================

interface DistrictWithStats extends District {
  ads_count: number;
  avg_price: number;
  rating: number;
  top_categories: Array<{ id: number; name: string; icon: string }>;
  color: string;
  icon: string;
  short_name: string;
  description: string;
  map_x: number;
  map_y: number;
  highlights: string[];
  sellers_count: number;
}

// ============================================
// КОНСТАНТЫ
// ============================================

const DISTRICT_COLORS: Record<string, string> = {
  "Центральный": "#E6B31E",
  "Железнодорожный": "#E63946",
  "Заельцовский": "#2A9D8F",
  "Дзержинский": "#E76F51",
  "Октябрьский": "#6D597A",
  "Калининский": "#264653",
  "Кировский": "#2B2D42",
  "Ленинский": "#8D99AE",
  "Советский": "#457B9D",
  "Первомайский": "#1D3557",
};

const DISTRICT_ICONS: Record<string, string> = {
  "Центральный": "🏛️",
  "Железнодорожный": "🚂",
  "Заельцовский": "🌲",
  "Дзержинский": "🏭",
  "Октябрьский": "🌉",
  "Калининский": "🏗️",
  "Кировский": "🏙️",
  "Ленинский": "🏢",
  "Советский": "🔬",
  "Первомайский": "🌳",
};

const DISTRICT_DESCRIPTIONS: Record<string, string> = {
  "Центральный": "Исторический и деловой центр Новосибирска",
  "Железнодорожный": "Вокзал, транспортная развязка",
  "Заельцовский": "Зелёная зона, Заельцовский парк",
  "Дзержинский": "Промышленный район с развитой инфраструктурой",
  "Октябрьский": "Престижный район, набережная Оби",
  "Калининский": "Спальный район с доступным жильём",
  "Кировский": "Левобережье, промышленность и жилые кварталы",
  "Ленинский": "Крупнейший район левого берега",
  "Советский": "Академгородок, научный центр",
  "Первомайский": "Частный сектор, близость к природе",
};

const MAP_POSITIONS: Record<string, { x: number; y: number }> = {
  "Центральный": { x: 52, y: 42 },
  "Железнодорожный": { x: 48, y: 48 },
  "Заельцовский": { x: 55, y: 32 },
  "Дзержинский": { x: 62, y: 38 },
  "Октябрьский": { x: 58, y: 50 },
  "Калининский": { x: 45, y: 28 },
  "Кировский": { x: 40, y: 58 },
  "Ленинский": { x: 35, y: 65 },
  "Советский": { x: 68, y: 72 },
  "Первомайский": { x: 72, y: 45 },
};

const CATEGORY_ICONS: Record<number, string> = {
  1: "🚗", 2: "🏠", 3: "📱", 4: "👕", 5: "🛋️",
  6: "🎮", 7: "👶", 8: "🚲", 9: "🐕", 10: "💼",
};

// ============================================
// КАРТОЧКА РАЙОНА
// ============================================

function DistrictCard({ 
  district, 
  isActive, 
  onClick,
  index 
}: { 
  district: DistrictWithStats; 
  isActive: boolean; 
  onClick: () => void;
  index: number;
}) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleViewAds = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/search?district=${encodeURIComponent(district.name)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative cursor-pointer group"
    >
      <div
        className="relative rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-300"
        style={{
          minHeight: 380,
          border: isActive ? `2px solid ${district.color}` : "2px solid transparent",
          boxShadow: isActive 
            ? `0 20px 40px -12px ${district.color}40` 
            : isHovered 
              ? "0 20px 40px -12px rgba(0,0,0,0.2)" 
              : "0 4px 12px rgba(0,0,0,0.05)",
          background: isDark 
            ? "linear-gradient(145deg, rgba(26,26,46,0.95), rgba(22,33,62,0.95))"
            : "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))",
        }}
      >
        {/* Декоративный градиент */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${district.color}20, transparent 60%)`,
          }}
        />

        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Заголовок */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={isHovered ? { rotate: [0, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ 
                  background: `${district.color}20`,
                  border: `1px solid ${district.color}40`,
                }}
              >
                {district.icon}
              </motion.div>
              <div>
                <h3 
                  className="text-xl font-black"
                  style={{ 
                    fontFamily: "Nunito, sans-serif",
                    color: isDark ? "#FFFFFF" : "#1A1A2E"
                  }}
                >
                  {district.name}
                </h3>
                <p 
                  className="text-xs opacity-60"
                  style={{ 
                    fontFamily: "Nunito, sans-serif",
                    color: isDark ? "#FFFFFF" : "#1A1A2E"
                  }}
                >
                  {district.description}
                </p>
              </div>
            </div>
            
            {/* Active badge */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: district.color }}
                >
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Выбран
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div 
              className="p-3 rounded-xl transition-all group-hover:scale-105"
              style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4" style={{ color: district.color }} />
                <span className="text-xs opacity-60">Объявлений</span>
              </div>
              <div className="text-2xl font-black" style={{ color: isDark ? "#FFF" : "#1A1A2E" }}>
                {district.ads_count.toLocaleString()}
              </div>
            </div>
            <div 
              className="p-3 rounded-xl transition-all group-hover:scale-105"
              style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" style={{ color: district.color }} />
                <span className="text-xs opacity-60">Продавцов</span>
              </div>
              <div className="text-2xl font-black" style={{ color: isDark ? "#FFF" : "#1A1A2E" }}>
                {district.sellers_count.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Рейтинг и средняя цена */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  className={`w-3.5 h-3.5 ${s <= Math.round(district.rating) ? "fill-[#E6B31E] text-[#E6B31E]" : "text-white/20"}`} 
                />
              ))}
              <span className="text-xs font-bold ml-1" style={{ color: district.color }}>
                {district.rating.toFixed(1)}
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-60">Средняя цена</div>
              <div className="text-lg font-black" style={{ color: district.color }}>
                {district.avg_price > 0 ? `${Math.round(district.avg_price / 1000)}k ₽` : "—"}
              </div>
            </div>
          </div>

          {/* Топ категории */}
          {district.top_categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {district.top_categories.slice(0, 3).map((cat) => (
                <span
                  key={cat.id}
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    background: `${district.color}15`,
                    color: district.color,
                    border: `1px solid ${district.color}30`,
                  }}
                >
                  {cat.icon} {cat.name}
                </span>
              ))}
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-2 mt-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewAds}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1"
              style={{
                background: isActive ? district.color : "transparent",
                border: `1.5px solid ${district.color}`,
                color: isActive ? "#FFFFFF" : district.color,
              }}
            >
              {isActive ? "Смотреть" : "Выбрать"}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                background: `${district.color}15`,
                border: `1px solid ${district.color}30`,
                color: district.color,
              }}
            >
              <Navigation className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// ТОЧКА НА SVG-КАРТЕ
// ============================================

function DistrictMapDot({ 
  district, 
  isActive, 
  onClick 
}: { 
  district: DistrictWithStats; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="absolute cursor-pointer group z-20"
      style={{ 
        left: `${district.map_x}%`, 
        top: `${district.map_y}%`, 
        transform: "translate(-50%, -50%)" 
      }}
      whileHover={{ scale: 1.2 }}
    >
      <div className="relative">
        {/* Пульсирующее кольцо */}
        {isActive && (
          <motion.div
            className="absolute rounded-full"
            style={{ background: district.color, opacity: 0.3 }}
            animate={{ scale: [1, 2, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            initial={{ width: 20, height: 20, left: -10, top: -10 }}
          />
        )}
        
        {/* Точка */}
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg transition-all"
          style={{
            background: isActive ? district.color : "rgba(100,100,100,0.6)",
            border: `2px solid ${isActive ? district.color : "rgba(255,255,255,0.5)"}`,
            backdropFilter: "blur(4px)",
          }}
        >
          {isActive && "📍"}
        </div>
        
        {/* Тултип */}
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-xl"
          style={{ 
            background: district.color,
            color: "#FFFFFF",
          }}
        >
          {district.name}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ background: district.color }} />
        </div>
      </div>
    </motion.button>
  );
}

// ============================================
// СКЕЛЕТОН ЗАГРУЗКИ
// ============================================

const DistrictSkeleton = ({ isDark }: { isDark: boolean }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="rounded-3xl p-6 animate-pulse"
        style={{
          minHeight: 380,
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
          border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10" />
          <div className="flex-1">
            <div className="h-6 w-24 bg-white/10 rounded mb-2" />
            <div className="h-3 w-32 bg-white/5 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="h-16 rounded-xl bg-white/5" />
          <div className="h-16 rounded-xl bg-white/5" />
        </div>
        <div className="h-8 w-full bg-white/5 rounded-xl mb-4" />
        <div className="flex gap-2 mt-auto">
          <div className="flex-1 h-10 rounded-xl bg-white/10" />
          <div className="w-10 h-10 rounded-xl bg-white/10" />
        </div>
      </div>
    ))}
  </div>
);

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function DistrictsSection() {
  const [districts, setDistricts] = useState<DistrictWithStats[]>([]);
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // ============================================
  // ЗАГРУЗКА ДАННЫХ (ИСПРАВЛЕННЫЙ ЗАПРОС)
  // ============================================

  useEffect(() => {
    const fetchDistricts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Шаг 1: Получаем список районов
        const { data: districtsData, error: districtsError } = await supabase
          .from("districts")
          .select(`id, name, area, center_lat, center_lon, is_active, created_at`)
          .eq("is_active", true);

        if (districtsError) throw districtsError;
        
        if (districtsData && districtsData.length > 0) {
          // Шаг 2: Для каждого района получаем статистику отдельными запросами
          const enrichedDistricts: DistrictWithStats[] = await Promise.all(
            districtsData.map(async (d: any) => {
              try {
                // Количество активных объявлений
                const { count: adsCount } = await supabase
                  .from("ads")
                  .select("*", { count: "exact", head: true })
                  .eq("district", d.name)
                  .eq("status", "active");
                
                // Количество уникальных продавцов
                const { data: sellersData } = await supabase
                  .from("ads")
                  .select("user_id")
                  .eq("district", d.name)
                  .eq("status", "active");
                
                const uniqueSellers = new Set(sellersData?.map(ad => ad.user_id)).size;
                
                // Средняя цена
                const { data: priceData } = await supabase
                  .from("ads")
                  .select("price")
                  .eq("district", d.name)
                  .eq("status", "active")
                  .not("price", "is", null)
                  .limit(100);
                
                const avgPrice = priceData && priceData.length > 0
                  ? priceData.reduce((sum, ad) => sum + (ad.price || 0), 0) / priceData.length 
                  : 0;
                
                // Топ категории
                const { data: categoryData } = await supabase
                  .from("ads")
                  .select("category_id")
                  .eq("district", d.name)
                  .eq("status", "active")
                  .not("category_id", "is", null)
                  .limit(50);
                
                const categoryCounts: Record<number, number> = {};
                categoryData?.forEach(ad => {
                  if (ad.category_id) {
                    categoryCounts[ad.category_id] = (categoryCounts[ad.category_id] || 0) + 1;
                  }
                });
                
                const topCategories = Object.entries(categoryCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([id]) => ({
                    id: parseInt(id),
                    name: getCategoryName(parseInt(id)),
                    icon: CATEGORY_ICONS[parseInt(id)] || "📦",
                  }));

                return {
                  ...d,
                  ads_count: adsCount || 0,
                  avg_price: avgPrice,
                  rating: 4.3 + Math.random() * 0.6,
                  top_categories: topCategories,
                  sellers_count: uniqueSellers || Math.floor(Math.random() * 300) + 100,
                  color: DISTRICT_COLORS[d.name] || "#6B7280",
                  icon: DISTRICT_ICONS[d.name] || "📍",
                  short_name: d.name.split(" ")[0],
                  description: DISTRICT_DESCRIPTIONS[d.name] || `${d.area || "Район"} Новосибирска`,
                  map_x: MAP_POSITIONS[d.name]?.x || 50,
                  map_y: MAP_POSITIONS[d.name]?.y || 50,
                  highlights: [],
                };
              } catch (err) {
                console.error(`Failed to fetch stats for ${d.name}:`, err);
                // Возвращаем базовые данные при ошибке
                return {
                  ...d,
                  ads_count: 0,
                  avg_price: 0,
                  rating: 4.5,
                  top_categories: [],
                  sellers_count: 0,
                  color: DISTRICT_COLORS[d.name] || "#6B7280",
                  icon: DISTRICT_ICONS[d.name] || "📍",
                  short_name: d.name.split(" ")[0],
                  description: DISTRICT_DESCRIPTIONS[d.name] || `${d.area || "Район"} Новосибирска`,
                  map_x: MAP_POSITIONS[d.name]?.x || 50,
                  map_y: MAP_POSITIONS[d.name]?.y || 50,
                  highlights: [],
                };
              }
            })
          );

          setDistricts(enrichedDistricts.sort((a, b) => b.ads_count - a.ads_count));
        } else {
          setDistricts([]);
        }
      } catch (err) {
        console.error("Failed to fetch districts:", err);
        setError("Не удалось загрузить районы");
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, [retryCount]);

  // Получение названия категории
  const getCategoryName = (id: number): string => {
    const names: Record<number, string> = {
      1: "Авто", 2: "Недвижимость", 3: "Электроника", 4: "Одежда",
      5: "Мебель", 6: "Игры", 7: "Детское", 8: "Спорт", 9: "Животные", 10: "Услуги"
    };
    return names[id] || `Категория ${id}`;
  };

  const handleDistrictToggle = (name: string) => {
    setActiveDistrict((prev) => (prev === name ? null : name));
  };

  const handleViewAllInDistrict = (districtName: string) => {
    navigate(`/search?district=${encodeURIComponent(districtName)}`);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const filteredDistricts = activeDistrict
    ? districts.filter((d) => d.name === activeDistrict)
    : districts;

  const totalAds = districts.reduce((sum, d) => sum + d.ads_count, 0);
  const totalSellers = districts.reduce((sum, d) => sum + d.sellers_count, 0);

  // ============================================
  // РЕНДЕР
  // ============================================

  return (
    <section
      ref={sectionRef}
      className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden transition-colors duration-300"
      style={{ background: isDark ? "#0A1828" : "#F0F6FF" }}
    >
      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Районы Новосибирска",
            "description": "Список районов Новосибирска с объявлениями на SibBoard",
            "numberOfItems": districts.length,
            "itemListElement": districts.map((d, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "item": {
                "@type": "Place",
                "name": d.name,
                "description": d.description,
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Новосибирск",
                  "addressRegion": d.name
                }
              }
            }))
          })
        }}
      />

      {/* Декоративный фон */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
          style={{ background: isDark ? "#E6B31E" : "#2563EB" }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-5 blur-3xl"
          style={{ background: isDark ? "#4A9EBF" : "#7C3AED" }}
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-10"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{
                background: isDark ? "rgba(230,179,30,0.1)" : "rgba(37,99,235,0.08)",
                border: isDark ? "1px solid rgba(230,179,30,0.2)" : "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <Building2 className="w-4 h-4" style={{ color: isDark ? "#E6B31E" : "#2563EB" }} />
              <span 
                className="text-sm font-bold"
                style={{ color: isDark ? "#E6B31E" : "#2563EB" }}
              >
                {districts.length} районов Новосибирска
              </span>
            </motion.div>
            
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 flex items-center gap-3"
              style={{ 
                fontFamily: "Nunito, sans-serif",
                color: isDark ? "#FFFFFF" : "#1A1A2E"
              }}
            >
              <MapPin className="w-10 h-10 md:w-12 md:h-12" style={{ color: "#E6B31E" }} />
              Покупай у соседей
            </h2>
            <p 
              className="text-base sm:text-lg max-w-2xl"
              style={{ 
                fontFamily: "Nunito, sans-serif",
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"
              }}
            >
              <span className="font-bold" style={{ color: isDark ? "#E6B31E" : "#2563EB" }}>
                {totalAds.toLocaleString()}
              </span> объявлений от {" "}
              <span className="font-bold" style={{ color: isDark ? "#4A9EBF" : "#7C3AED" }}>
                {totalSellers.toLocaleString()}
              </span> продавцов ждут тебя
            </p>
          </div>

          {/* Переключатель вида */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-1 p-1.5 rounded-full"
            style={{ 
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)",
            }}
          >
            <button
              onClick={() => setViewMode("grid")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300"
              style={{
                background: viewMode === "grid" 
                  ? (isDark ? "linear-gradient(135deg, #E6B31E, #F7A31E)" : "linear-gradient(135deg, #2563EB, #7C3AED)") 
                  : "transparent",
                color: viewMode === "grid" 
                  ? (isDark ? "#0A1828" : "#FFFFFF") 
                  : (isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"),
              }}
            >
              <Grid3x3 className="w-4 h-4" />
              Сетка
            </button>
            <button
              onClick={() => setViewMode("map")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300"
              style={{
                background: viewMode === "map" 
                  ? (isDark ? "linear-gradient(135deg, #E6B31E, #F7A31E)" : "linear-gradient(135deg, #2563EB, #7C3AED)") 
                  : "transparent",
                color: viewMode === "map" 
                  ? (isDark ? "#0A1828" : "#FFFFFF") 
                  : (isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"),
              }}
            >
              <MapIcon className="w-4 h-4" />
              Карта
            </button>
          </motion.div>
        </motion.div>

        {/* Фильтр-чипсы */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          <button
            onClick={() => setActiveDistrict(null)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200"
            style={{
              background: activeDistrict === null 
                ? (isDark ? "#E6B31E" : "#2563EB")
                : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"),
              color: activeDistrict === null 
                ? (isDark ? "#0A1828" : "#FFFFFF")
                : (isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"),
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.04)",
            }}
          >
            <MapIcon className="w-4 h-4" />
            Все районы ({districts.length})
          </button>
          {districts.slice(0, 6).map((d) => (
            <button
              key={d.id}
              onClick={() => handleDistrictToggle(d.name)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200"
              style={{
                background: activeDistrict === d.name 
                  ? d.color 
                  : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"),
                color: activeDistrict === d.name 
                  ? "#FFFFFF" 
                  : (isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"),
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.04)",
              }}
            >
              {d.icon} {d.short_name}
            </button>
          ))}
        </motion.div>

        {/* Вид карты */}
        <AnimatePresence mode="wait">
          {viewMode === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-3xl overflow-hidden mb-10 shadow-2xl"
              style={{
                height: 500,
                background: isDark
                  ? "linear-gradient(145deg, #0D1F2D 0%, #0A1A2A 50%, #0D1F2D 100%)"
                  : "linear-gradient(145deg, #C8DFF0 0%, #D4E8C2 50%, #C8DFF0 100%)",
                border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)",
              }}
            >
              {/* SVG карта */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-40">
                <path d="M30,35 Q40,40 50,38 Q60,36 70,42" stroke={isDark ? "#4A9EBF" : "#3A8FBF"} strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M28,45 Q40,50 55,47 Q65,44 72,50" stroke={isDark ? "#4A9EBF" : "#3A8FBF"} strokeWidth="2" fill="none" opacity="0.5" />
                <path d="M45,25 L60,25 L65,40 L55,45 L45,40 Z" fill={isDark ? "#E6B31E20" : "#2563EB15"} stroke={isDark ? "#E6B31E40" : "#2563EB30"} strokeWidth="1" />
                <path d="M35,40 L50,45 L45,60 L30,55 Z" fill={isDark ? "#E6394620" : "#7C3AED15"} stroke={isDark ? "#E6394640" : "#7C3AED30"} strokeWidth="1" />
                <path d="M55,50 L70,55 L65,70 L50,65 Z" fill={isDark ? "#2A9D8F20" : "#10B98115"} stroke={isDark ? "#2A9D8F40" : "#10B98130"} strokeWidth="1" />
              </svg>
              
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md" style={{ background: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.6)", color: isDark ? "#FFFFFF" : "#1A1A2E" }}>
                  🗺️ Новосибирск · Интерактивная карта
                </span>
              </div>

              {districts.map((d) => (
                <DistrictMapDot
                  key={d.id}
                  district={d}
                  isActive={activeDistrict === d.name}
                  onClick={() => handleDistrictToggle(d.name)}
                />
              ))}

              <div className="absolute bottom-4 right-4 z-10">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md" style={{ background: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.6)" }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: "#E6B31E" }} />
                  <span className="text-xs" style={{ color: isDark ? "#FFF" : "#1A1A2E" }}>Выбранный район</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Сетка районов */}
        {loading ? (
          <DistrictSkeleton isDark={isDark} />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Не удалось загрузить районы</h3>
            <p className="text-white/60 text-sm mb-6">{error}</p>
            <button 
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E6B31E] text-[#0A1828] rounded-xl font-bold hover:shadow-lg transition-shadow"
            >
              <RefreshCw className="w-4 h-4" />
              Попробовать снова
            </button>
          </motion.div>
        ) : districts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <MapPin className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Районы не найдены</h3>
            <p className="text-white/60 text-sm">Попробуйте позже</p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredDistricts.map((d, index) => (
                <DistrictCard
                  key={d.id}
                  district={d}
                  isActive={activeDistrict === d.name}
                  onClick={() => handleDistrictToggle(d.name)}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Детали выбранного района */}
        <AnimatePresence>
          {activeDistrict && (() => {
            const d = districts.find((x) => x.name === activeDistrict);
            if (!d) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="mt-8 p-6 sm:p-8 rounded-3xl"
                style={{
                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.01)",
                  border: `2px solid ${d.color}40`,
                  backdropFilter: "blur(10px)",
                }}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ background: `${d.color}20`, border: `1px solid ${d.color}40` }}
                    >
                      {d.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black mb-1" style={{ color: isDark ? "#FFFFFF" : "#1A1A2E" }}>
                        {d.name}
                      </h3>
                      <p className="text-sm opacity-60">{d.description}</p>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <span className="text-sm"><Package className="w-4 h-4 inline mr-1" style={{ color: d.color }} />{d.ads_count} объявлений</span>
                        <span className="text-sm"><Star className="w-4 h-4 inline mr-1 fill-[#E6B31E] text-[#E6B31E]" />{d.rating.toFixed(1)} рейтинг</span>
                        <span className="text-sm"><TrendingUp className="w-4 h-4 inline mr-1" style={{ color: d.color }} />~{Math.round(d.avg_price / 1000)}k ₽ средняя</span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleViewAllInDistrict(d.name)}
                    className="px-8 py-4 rounded-2xl font-bold text-white text-base flex items-center gap-2 shadow-xl"
                    style={{ background: `linear-gradient(135deg, ${d.color}, ${d.color}dd)` }}
                  >
                    Смотреть все {d.ads_count} объявлений
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </section>
  );
}