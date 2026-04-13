import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  Heart, 
  Eye, 
  Star, 
  MapPin, 
  Clock,
  Loader2,
  Package,
  ChevronDown,
  Filter
} from "lucide-react";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import AIAssistant from "@/components/feature/AIAssistant";
import { supabase, formatPrice, getImageUrl, type Ad } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

// ============================================
// КОНСТАНТЫ
// ============================================

const CATEGORIES = [
  { id: "", name: "Все категории", icon: "🗂️" },
  { id: "1", name: "Авто", icon: "🚗" },
  { id: "2", name: "Недвижимость", icon: "🏠" },
  { id: "3", name: "Электроника", icon: "📱" },
  { id: "4", name: "Одежда", icon: "👕" },
  { id: "5", name: "Мебель", icon: "🛋️" },
  { id: "6", name: "Игры", icon: "🎮" },
  { id: "7", name: "Детское", icon: "👶" },
  { id: "8", name: "Спорт", icon: "🚲" },
  { id: "9", name: "Животные", icon: "🐕" },
  { id: "10", name: "Услуги", icon: "💼" },
];

const DISTRICTS = [
  "", "Академгородок", "Центр", "Левый берег", "Калининский", 
  "Октябрьский", "Советский", "Железнодорожный", "Заельцовский",
  "Дзержинский", "Кировский", "Ленинский", "Первомайский"
];

const SORT_OPTIONS = [
  { value: "new", label: "Новые" },
  { value: "cheap", label: "Дешевле" },
  { value: "expensive", label: "Дороже" },
  { value: "popular", label: "Популярные" },
];

// ============================================
// УТИЛИТЫ
// ============================================

const formatTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин назад`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч назад`;
  return `${Math.floor(hrs / 24)} дн назад`;
};

// ============================================
// КОМПОНЕНТЫ
// ============================================

const AdCardSkeleton = () => (
  <div className="rounded-3xl overflow-hidden animate-pulse bg-white/5 border border-white/10">
    <div className="w-full h-48 bg-white/10" />
    <div className="p-4 flex flex-col gap-2">
      <div className="h-6 rounded-lg w-2/3 bg-white/10" />
      <div className="h-4 rounded-lg w-full bg-white/5" />
      <div className="h-4 rounded-lg w-1/2 bg-white/5" />
    </div>
  </div>
);

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Состояния фильтров
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("cat") || "");
  const [district, setDistrict] = useState(searchParams.get("district") || "");
  const [priceMin, setPriceMin] = useState(searchParams.get("min") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("max") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "new");
  const [onlyFree, setOnlyFree] = useState(searchParams.get("free") === "1");
  const [onlyNew, setOnlyNew] = useState(searchParams.get("new") === "1");

  // Состояния данных
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // ЗАГРУЗКА ДАННЫХ
  // ============================================

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let q = supabase
        .from("ads")
        .select(`
          id, title, price, is_gift, photos, district, condition_text, 
          created_at, views, status,
          users!ads_user_id_fkey(name, avatar_url, rating)
        `, { count: "exact" })
        .eq("status", "active");

      if (query.trim()) q = q.ilike("title", `%${query.trim()}%`);
      if (category) q = q.eq("category_id", parseInt(category));
      if (district) q = q.eq("district", district);
      if (priceMin) q = q.gte("price", parseFloat(priceMin));
      if (priceMax) q = q.lte("price", parseFloat(priceMax));
      if (onlyFree) q = q.eq("is_gift", true);
      if (onlyNew) q = q.eq("condition_text", "Новое");

      // Сортировка
      if (sortBy === "cheap") q = q.order("price", { ascending: true });
else if (sortBy === "expensive") q = q.order("price", { ascending: false });
      else if (sortBy === "popular") q = q.order("views", { ascending: false });
      else q = q.order("created_at", { ascending: false });

      q = q.limit(48);

      const { data, count, error } = await q;
      
      if (error) throw error;
      
      setAds((data as any[]) || []);
      setTotal(count || 0);
    } catch (err) {
      console.error("Search error:", err);
      setError("Не удалось загрузить объявления");
    } finally {
      setLoading(false);
    }
  }, [query, category, district, priceMin, priceMax, sortBy, onlyFree, onlyNew]);

  // Загрузка избранного
  useEffect(() => {
    if (!user) return;
    
    const fetchFavorites = async () => {
      const { data } = await supabase
        .from("favorites")
        .select("ad_id")
        .eq("user_id", user.id);
      
      if (data) {
        setFavorites(new Set(data.map((f: any) => f.ad_id)));
      }
    };
    
    fetchFavorites();
  }, [user]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // ============================================
  // ОБРАБОТЧИКИ
  // ============================================

  const applyFilters = () => {
    const params: Record<string, string> = {};
    if (query) params.q = query;
    if (category) params.cat = category;
    if (district) params.district = district;
    if (priceMin) params.min = priceMin;
    if (priceMax) params.max = priceMax;
    if (sortBy !== "new") params.sort = sortBy;
    if (onlyFree) params.free = "1";
    if (onlyNew) params.new = "1";
    setSearchParams(params);
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setQuery("");
    setCategory("");
    setDistrict("");
    setPriceMin("");
    setPriceMax("");
    setOnlyFree(false);
    setOnlyNew(false);
    setSortBy("new");
    setSearchParams({});
  };

  const toggleFavorite = async (adId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      navigate("/auth", { state: { from: "/search" } });
      return;
    }
    
    const isFav = favorites.has(adId);
    
    // Оптимистичное обновление
    setFavorites(prev => {
      const next = new Set(prev);
      isFav ? next.delete(adId) : next.add(adId);
      return next;
    });
    
    try {
      if (isFav) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("ad_id", adId);
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: user.id, ad_id: adId });
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
      // Откат при ошибке
      setFavorites(prev => {
        const next = new Set(prev);
        isFav ? next.add(adId) : next.delete(adId);
        return next;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  // ============================================
  // СТИЛИ
  // ============================================

  const inputClasses = `
    w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all
    bg-white/5 border border-white/10
    focus:border-[#E6B31E] focus:bg-white/10
    placeholder:text-white/30
  `;

  // ============================================
  // РЕНДЕР
  // ============================================

  return (
    <div 
      style={{ 
        background: isDark ? "#0A1828" : "#F0F6FF", 
        minHeight: "100vh",
        fontFamily: "Nunito, sans-serif" 
      }}
    >
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-20">
        {/* Заголовок */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8"
        >
          <h1 className="text-3xl font-black text-white mb-6">Поиск объявлений</h1>

          {/* Поисковая строка */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
              <Search className="text-white/40 w-5 h-5 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Поиск по объявлениям Новосибирска..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
              />
              {query && (
                <button 
                  onClick={() => setQuery("")} 
                  className="text-white/30 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={applyFilters}
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl font-bold text-[#0A1828] text-sm"
                style={{ 
                  background: "linear-gradient(135deg,#E6B31E,#F7A31E)",
                  boxShadow: "0 6px 20px rgba(230,179,30,0.4)" 
                }}
              >
                Найти
              </motion.button>
              
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="px-4 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2"
                style={{ 
                  background: filtersOpen ? "rgba(230,179,30,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${filtersOpen ? "rgba(230,179,30,0.4)" : "rgba(255,255,255,0.1)"}`,
                  color: filtersOpen ? "#E6B31E" : "rgba(255,255,255,0.6)" 
                }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Фильтры</span>
              </button>
            </div>
          </div>

          {/* Чипсы категорий */}
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: category === cat.id ? "rgba(230,179,30,0.15)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${category === cat.id ? "rgba(230,179,30,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: category === cat.id ? "#E6B31E" : "rgba(255,255,255,0.5)",
                }}
              >
                <span>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Расширенные фильтры */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 bg-white/5 border border-white/10">
                  {/* Район */}
                  <div>
                    <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 block">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      Район
                    </label>
                    <select 
                      value={district} 
                      onChange={(e) => setDistrict(e.target.value)} 
                      className={inputClasses}
                      style={{ color: district ? "white" : "rgba(255,255,255,0.3)" }}
                    >
                      <option value="">Все районы</option>
                      {DISTRICTS.filter(Boolean).map((d) => (
                        <option key={d} value={d} style={{ background: isDark ? "#0A1828" : "#FFFFFF" }}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Цена от */}
                  <div>
                    <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 block">
                      Цена от, ₽
                    </label>
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="0"
                      className={inputClasses}
                    />
                  </div>
                  
                  {/* Цена до */}
                  <div>
                    <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 block">
                      Цена до, ₽
                    </label>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="∞"
                      className={inputClasses}
                    />
                  </div>
                  
                  {/* Сортировка */}
                  <div>
                    <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 block">
                      Сортировка
                    </label>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)} 
                      className={inputClasses}
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} style={{ background: isDark ? "#0A1828" : "#FFFFFF" }}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Тогглы */}
                  <div className="flex items-center gap-6 col-span-full">
                    <button 
                      onClick={() => setOnlyFree(!onlyFree)} 
                      className="flex items-center gap-2"
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        onlyFree 
                          ? "bg-gradient-to-r from-[#E6B31E] to-[#F7A31E]" 
                          : "bg-white/10 border border-white/20"
                      }`}>
                        {onlyFree && <Check className="w-3 h-3 text-[#0A1828]" />}
                      </div>
                      <span className="text-white/60 text-sm">Только бесплатно 🎁</span>
                    </button>
                    
                    <button 
                      onClick={() => setOnlyNew(!onlyNew)} 
                      className="flex items-center gap-2"
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        onlyNew 
                          ? "bg-gradient-to-r from-[#E6B31E] to-[#F7A31E]" 
                          : "bg-white/10 border border-white/20"
                      }`}>
                        {onlyNew && <Check className="w-3 h-3 text-[#0A1828]" />}
                      </div>
                      <span className="text-white/60 text-sm">Только новое ✨</span>
                    </button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={applyFilters}
                      className="ml-auto px-5 py-2 rounded-xl font-bold text-[#0A1828] text-sm"
                      style={{ background: "linear-gradient(135deg,#E6B31E,#F7A31E)" }}
                    >
                      Применить
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Результаты */}
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-sm">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ищем...
                </span>
              ) : (
                <>Найдено: {total} объявлений</>
              )}
              {district && <span className="text-[#E6B31E] ml-1">в {district}</span>}
            </p>
            
            <div className="hidden sm:flex gap-2">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setSortBy(o.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: sortBy === o.value ? "rgba(230,179,30,0.15)" : "rgba(255,255,255,0.04)",
                    color: sortBy === o.value ? "#E6B31E" : "rgba(255,255,255,0.4)",
                    border: `1px solid ${sortBy === o.value ? "rgba(230,179,30,0.3)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Сетка результатов */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <AdCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl p-20 text-center bg-white/5 border border-dashed border-white/10"
          >
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-black text-white mb-2">Ошибка загрузки</h3>
            <p className="text-white/40 text-sm mb-6">{error}</p>
            <button
              onClick={fetchAds}
              className="px-6 py-3 rounded-2xl font-bold text-[#0A1828]"
              style={{ background: "linear-gradient(135deg,#E6B31E,#F7A31E)" }}
            >
              Попробовать снова
            </button>
          </motion.div>
        ) : ads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl p-20 text-center bg-white/5 border border-dashed border-white/10"
          >
            <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">Ничего не найдено</h3>
            <p className="text-white/40 text-sm mb-6">
              Попробуй изменить запрос или убрать фильтры
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 rounded-2xl font-bold text-[#0A1828]"
              style={{ background: "linear-gradient(135deg,#E6B31E,#F7A31E)" }}
            >
              Сбросить фильтры
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ads.map((ad, i) => {
              const photo = Array.isArray(ad.photos) ? ad.photos[0] : null;
              const seller = (ad as any).users;
              
              return (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/ads/${ad.id}`)}
                  className="rounded-3xl overflow-hidden cursor-pointer group bg-white/5 border border-white/10"
                >
                  {/* Изображение */}
                  <div className="relative w-full h-48 overflow-hidden">
                    {photo ? (
                      <img
  src={getImageUrl(String(photo)) || String(photo)}
  alt={ad.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/10">
                        <Package className="w-10 h-10 text-white/30" />
                      </div>
                    )}
                    
                    {/* Бейджи */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {ad.is_gift && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black text-white bg-gradient-to-r from-green-600 to-emerald-600">
                          БЕСПЛАТНО
                        </span>
                      )}
                      {ad.condition_text === "Новое" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black text-[#0A1828] bg-gradient-to-r from-[#E6B31E] to-[#F7A31E]">
                          НОВОЕ
                        </span>
                      )}
                    </div>
                    
                    {/* Избранное */}
                    <button
                      onClick={(e) => toggleFavorite(ad.id, e)}
                      className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-all hover:bg-black/60"
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          favorites.has(ad.id) 
                            ? "fill-red-400 text-red-400" 
                            : "text-white/70"
                        }`} 
                      />
                    </button>
                    
                    {/* Просмотры */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md">
                      <Eye className="w-3 h-3 text-white/50" />
                      <span className="text-white/50 text-xs">{ad.views || 0}</span>
                    </div>
                  </div>
                  
                  {/* Контент */}
                  <div className="p-4">
                    <div className="text-xl sm:text-2xl font-black mb-1 text-[#E6B31E]">
                      {formatPrice(ad.price, ad.is_gift)}
                    </div>
                    
                    <div className="text-white font-semibold text-sm mb-2 line-clamp-2">
                      {ad.title}
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {ad.district && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] text-white/50 bg-white/5 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {ad.district}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] text-white/50 bg-white/5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTimeAgo(ad.created_at)}
                      </span>
                    </div>
                    
                    {/* Продавец */}
                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-r from-[#E6B31E] to-[#F7A31E]">
                        {seller?.avatar_url ? (
                          <img src={getImageUrl(seller.avatar_url) || seller.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#0A1828] font-black text-xs">
                            {(seller?.name || "?").charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-white/50 text-xs flex-1 truncate">
                        {seller?.name || "Пользователь"}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#E6B31E] text-[#E6B31E]" />
                        <span className="text-white/50 text-xs">
                          {seller?.rating?.toFixed(1) || "5.0"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      <Footer />
      <AIAssistant />
    </div>
  );
}

// Добавить Check иконку (пропущена в импорте)
import { Check } from "lucide-react";