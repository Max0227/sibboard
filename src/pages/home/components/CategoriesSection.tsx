import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase, type Category } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Sparkles, 
  TrendingUp, 
  ArrowRight
} from "lucide-react";

// ============================================
// ТИПЫ
// ============================================

interface CategoryWithStats extends Category {
  ads_count: number;
  trend: "up" | "down" | "stable";
  icon: string;
}

// ============================================
// КОНСТАНТЫ
// ============================================

const CATEGORY_ICONS: Record<string, string> = {
  "Авто": "🚗",
  "Недвижимость": "🏠",
  "Электроника": "📱",
  "Одежда": "👕",
  "Мебель": "🛋️",
  "Игры": "🎮",
  "Детское": "👶",
  "Спорт": "🚲",
  "Животные": "🐕",
  "Услуги": "💼",
  "Хобби": "🎨",
  "Бытовая техника": "🧺",
};

// ============================================
// КОМПОНЕНТ КАРТОЧКИ КАТЕГОРИИ
// ============================================

const CategoryCard = ({ 
  category, 
  index, 
  onClick,
  isDark 
}: { 
  category: CategoryWithStats; 
  index: number;
  onClick: () => void;
  isDark: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.05, y: -8 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative cursor-pointer group"
    >
      <div
        className="relative rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-300"
        style={{
          background: isDark 
            ? "rgba(255,255,255,0.03)" 
            : "rgba(255,255,255,0.8)",
          border: isDark 
            ? "1px solid rgba(255,255,255,0.06)" 
            : "1px solid rgba(0,0,0,0.04)",
          boxShadow: isHovered 
            ? "0 20px 40px -12px rgba(0,0,0,0.3)" 
            : "0 4px 12px rgba(0,0,0,0.05)",
          transform: isHovered ? "scale(1.05) translateY(-8px)" : "scale(1) translateY(0)",
        }}
      >
        {/* Градиентная подложка при ховере */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${isDark ? '#E6B31E20' : '#2563EB10'}, ${isDark ? '#F7A31E20' : '#7C3AED10'})`,
          }}
        />

        {/* Контент */}
        <div className="relative p-5 sm:p-6 flex flex-col items-center text-center gap-3">
          {/* Иконка с анимацией */}
          <motion.div
            animate={isHovered ? { rotate: [0, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-lg"
              style={{
                background: isDark 
                  ? "rgba(230,179,30,0.1)" 
                  : "rgba(37,99,235,0.08)",
              }}
            >
              {category.icon}
            </div>
            
            {/* Индикатор тренда */}
            {category.trend === "up" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
              >
                <TrendingUp className="w-3 h-3 text-white" />
              </motion.div>
            )}
            
            {/* Индикатор популярности */}
            {category.ads_count > 100 && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -bottom-1 -left-1"
              >
                <Sparkles className="w-5 h-5 text-[#E6B31E]" />
              </motion.div>
            )}
          </motion.div>

          {/* Название */}
          <div>
            <h3 
              className="text-sm sm:text-base font-black mb-1"
              style={{ 
                color: isDark ? "#FFFFFF" : "#1A1A2E",
                fontFamily: "Nunito, sans-serif",
              }}
            >
              {category.name_ru}
            </h3>
            
            {/* Счётчик */}
            <p 
              className="text-xs font-medium"
              style={{ 
                color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                fontFamily: "Nunito, sans-serif",
                opacity: isHovered ? 1 : 0.6,
              }}
            >
              {category.ads_count.toLocaleString()} объявлений
            </p>
          </div>

          {/* Кнопка "Смотреть" */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
            className="mt-1"
          >
            <span 
              className="inline-flex items-center gap-1 text-xs font-bold"
              style={{ color: isDark ? "#E6B31E" : "#2563EB" }}
            >
              Смотреть <ArrowRight className="w-3 h-3" />
            </span>
          </motion.div>
        </div>

        {/* Декоративная линия снизу */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `linear-gradient(90deg, ${isDark ? '#E6B31E' : '#2563EB'}, ${isDark ? '#F7A31E' : '#7C3AED'})`,
            transformOrigin: "left",
          }}
        />
      </div>
    </motion.div>
  );
};

// ============================================
// СКЕЛЕТОН ЗАГРУЗКИ
// ============================================

const CategorySkeleton = ({ isDark }: { isDark: boolean }) => (
  <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="rounded-3xl p-5 sm:p-6 flex flex-col items-center gap-3 animate-pulse"
        style={{
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
          border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10" />
        <div className="w-20 h-4 rounded bg-white/10" />
        <div className="w-12 h-3 rounded bg-white/5" />
      </div>
    ))}
  </div>
);

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function CategoriesSection() {
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from("categories")
          .select(`
            id,
            name,
            name_ru,
            icon,
            parent_id,
            sort_order,
            created_at,
            ads_count:ads(count)
          `)
          .eq("ads.status", "active")
          .order("sort_order", { ascending: true })
          .limit(8);

        if (error) throw error;
        
        if (data) {
          const enriched: CategoryWithStats[] = data.map((cat: any) => ({
            ...cat,
            ads_count: cat.ads_count?.[0]?.count || 0,
            trend: Math.random() > 0.5 ? "up" : "stable",
            icon: CATEGORY_ICONS[cat.name] || cat.icon || "📦",
          }));
          
          enriched.sort((a, b) => b.ads_count - a.ads_count);
          setCategories(enriched);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Не удалось загрузить категории");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: number, categoryName: string) => {
    navigate(`/search?category=${categoryId}&name=${encodeURIComponent(categoryName)}`);
  };

  const handleViewAll = () => {
    navigate("/categories");
  };

  const totalAds = categories.reduce((sum, cat) => sum + cat.ads_count, 0);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden"
      style={{
        background: isDark 
          ? "linear-gradient(180deg, #0A1828 0%, #0D2135 50%, #0A1828 100%)" 
          : "linear-gradient(180deg, #F0F6FF 0%, #E8F0FE 50%, #F0F6FF 100%)",
      }}
    >
      {/* Декоративные элементы фона */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{ background: isDark ? "#E6B31E" : "#2563EB" }}
        />
        <div 
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{ background: isDark ? "#4A9EBF" : "#7C3AED" }}
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-12 gap-4"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
              style={{
                background: isDark ? "rgba(230,179,30,0.1)" : "rgba(37,99,235,0.08)",
                border: isDark ? "1px solid rgba(230,179,30,0.2)" : "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: isDark ? "#E6B31E" : "#2563EB" }} />
              <span 
                className="text-xs font-bold"
                style={{ color: isDark ? "#E6B31E" : "#2563EB" }}
              >
                {categories.length} категорий
              </span>
            </motion.div>
            
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight"
              style={{ 
                fontFamily: "Nunito, sans-serif",
                color: isDark ? "#FFFFFF" : "#1A1A2E"
              }}
            >
              Что ищешь?
            </h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="text-sm sm:text-base mt-2"
              style={{ 
                fontFamily: "Nunito, sans-serif",
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"
              }}
            >
              {totalAds.toLocaleString()} актуальных объявлений в Новосибирске
            </motion.p>
          </div>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            onClick={handleViewAll}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:gap-3"
            style={{ 
              fontFamily: "Nunito, sans-serif",
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.06)",
              color: isDark ? "#E6B31E" : "#2563EB",
            }}
          >
            Все категории
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>

        {/* Сетка категорий */}
        {loading ? (
          <CategorySkeleton isDark={isDark} />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-[#E6B31E] text-[#0A1828] font-bold text-sm"
            >
              Попробовать снова
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
                onClick={() => handleCategoryClick(category.id, category.name_ru)}
                isDark={isDark}
              />
            ))}
          </div>
        )}

        {/* Популярные теги */}
        {!loading && !error && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            <span 
              className="text-xs font-medium mr-1"
              style={{ 
                fontFamily: "Nunito, sans-serif",
                color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)"
              }}
            >
              Популярное:
            </span>
            {categories
              .filter(cat => cat.ads_count > 30)
              .slice(0, 6)
              .map(cat => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick(cat.id, cat.name_ru)}
                  className="px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: isDark 
                      ? "rgba(255,255,255,0.04)" 
                      : "rgba(0,0,0,0.02)",
                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                    fontFamily: "Nunito, sans-serif",
                    border: isDark 
                      ? "1px solid rgba(255,255,255,0.08)" 
                      : "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  {cat.icon} {cat.name_ru}
                </motion.button>
              ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}