import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  MapPin, 
  Eye, 
  Clock, 
  Gift, 
  Mic, 
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  TrendingUp,
  Clock4,
  MapPinned,
  Package,
  Loader2,
  AlertCircle,
  RefreshCw,
  Heart,
  Zap
} from "lucide-react";
import { supabase, formatPrice, getImageUrl, type Ad } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

// ============================================
// ТИПЫ
// ============================================

interface AdsSectionProps {
  ads?: Ad[];
  loading?: boolean;
  districtName?: string | null;
  categoryId?: number | null;
}

type SortOption = "nearby" | "recent" | "popular" | "price_asc" | "price_desc";

type FilterOptions = {
  categoryId?: number;
  isGift?: boolean;
  hasStory?: boolean;
  hasVoice?: boolean;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
};

// ============================================
// УТИЛИТЫ
// ============================================

const formatTimeAgo = (date: string): string => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  
  if (seconds < 60) return "только что";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} дн назад`;
  
  return new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};

// ============================================
// КАРТОЧКА ОБЪЯВЛЕНИЯ
// ============================================

const AdCard = ({ ad, index, isFavorite, onToggleFavorite }: { 
  ad: Ad; 
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (adId: number) => void;
}) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const mainImage = Array.isArray(ad.photos) ? ad.photos[0] : null;
  
  const handleClick = () => {
    void supabase.rpc("increment_ad_views", { ad_id: ad.id });
    navigate(`/ads/${ad.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(ad.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
      style={{
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)",
        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)",
        boxShadow: isHovered ? "0 20px 40px -12px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.05)",
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Бейджи */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
        {ad.is_gift && (
          <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg">
            <Gift className="w-3 h-3" /> Даром
          </span>
        )}
        {ad.story_text && (
          <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg">
            <Sparkles className="w-3 h-3" /> История
          </span>
        )}
        {ad.voice_url && (
          <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg">
            <Mic className="w-3 h-3" /> Голос
          </span>
        )}
        {(ad.views || 0) > 100 && (
          <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg">
            <Zap className="w-3 h-3" /> Топ
          </span>
        )}
      </div>

      {/* Кнопка Избранное */}
      {user && (
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-all hover:bg-black/60"
        >
          <Heart 
            className={`w-4 h-4 transition-all ${isFavorite ? "fill-red-400 text-red-400" : "text-white/80"}`} 
          />
        </button>
      )}

      {/* Изображение */}
<div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
  {!imageLoaded && !imgError && (
    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
  )}
  {mainImage && !imgError ? (
    <img
      src={getImageUrl(String(mainImage)) || String(mainImage)}
      alt={ad.title}
      className={`w-full h-full object-cover transition-transform duration-700 ${
        isHovered ? "scale-110" : "scale-100"
      } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
      onLoad={() => setImageLoaded(true)}
      onError={() => setImgError(true)}
      loading={index < 6 ? "eager" : "lazy"}
      decoding="async"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      <Package className="w-12 h-12 text-gray-400" />
    </div>
  )}
  
  {/* Оверлей при ховере */}
  <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 flex items-end justify-start p-4 ${
    isHovered ? "opacity-100" : "opacity-0"
  }`}>
    <button className="px-4 py-2 bg-white text-gray-900 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors">
      Смотреть объявление
    </button>
  </div>
  
  {/* Индикатор количества фото */}
  {Array.isArray(ad.photos) && ad.photos.length > 1 && (
    <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium">
      📸 {ad.photos.length} фото
    </div>
  )}
</div>

      {/* Контент */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xl sm:text-2xl font-black text-[#E6B31E]">
            {formatPrice(ad.price, ad.is_gift)}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-[#E6B31E] transition-colors min-h-[2.5rem]">
          {ad.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{ad.district || "Новосибирск"}</span>
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {ad.views || 0}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(ad.created_at)}
          </span>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E6B31E] to-[#F7A31E] flex items-center justify-center text-white text-[10px] font-bold">
            {ad.user_id?.slice(0, 2).toUpperCase() || "SB"}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// СКЕЛЕТОН КАРТОЧКИ
// ============================================

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
    <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-2/3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
      <div className="flex justify-between pt-2">
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function AdsSection({ 
  ads: initialAds, 
  loading: externalLoading, 
  districtName,
  categoryId 
}: AdsSectionProps) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>(initialAds || []);
  const [loading, setLoading] = useState(externalLoading ?? true);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [retryCount, setRetryCount] = useState(0);
  const { location } = useGeoLocation();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  // ============================================
  // ЗАГРУЗКА ИЗБРАННОГО
  // ============================================

  useEffect(() => {
    if (!user) return;
    
    const fetchFavorites = async () => {
      const { data } = await supabase
        .from("favorites")
        .select("ad_id")
        .eq("user_id", user.id);
      
      if (data) {
        setFavorites(new Set(data.map(f => f.ad_id)));
      }
    };
    
    fetchFavorites();
  }, [user]);

  // ============================================
  // ЗАГРУЗКА ОБЪЯВЛЕНИЙ
  // ============================================

  useEffect(() => {
    console.log("🔄 AdsSection mounted", { 
      hasInitial: !!initialAds?.length, 
      districtName, 
      categoryId 
    });
    
    if (initialAds && initialAds.length > 0) {
      console.log("📦 Using initial ads:", initialAds.length);
      setAds(initialAds);
      setLoading(false);
      return;
    }

    const fetchAds = async () => {
      console.log("🔄 Fetching ads from Supabase...");
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase
          .from("ads")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(50);

        if (districtName) {
          query = query.eq("district", districtName);
        }
        
        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }

        const { data, error: queryError } = await query;

        console.log("📦 Supabase response:", { 
          count: data?.length || 0, 
          error: queryError?.message 
        });
        
        if (queryError) throw queryError;
        
        console.log("✅ Fetched ads:", data?.length || 0);
        setAds((data as Ad[]) || []);
        setRetryCount(0);
      } catch (err: any) {
        console.error("❌ Failed to fetch ads:", err);
        setError(err.message || "Не удалось загрузить объявления");
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [initialAds, districtName, categoryId, retryCount]);

  // ============================================
  // REALTIME ПОДПИСКА
  // ============================================

  useEffect(() => {
    const channel = supabase
      .channel("public:ads")
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "ads", 
          filter: districtName 
            ? `status=eq.active AND district=eq.${districtName}` 
            : "status=eq.active"
        },
        (payload) => {
          console.log("🆕 New ad received:", payload.new);
          setAds(prev => [payload.new as Ad, ...prev]);
        }
      )
      .subscribe();

    return () => {
      console.log("🔌 Unsubscribing from ads channel");
      channel.unsubscribe();
    };
  }, [districtName]);

  // ============================================
  // ОБРАБОТЧИКИ
  // ============================================

  const handleToggleFavorite = useCallback(async (adId: number) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    const isFav = favorites.has(adId);
    
    setFavorites(prev => {
      const next = new Set(prev);
      isFav ? next.delete(adId) : next.add(adId);
      return next;
    });
    
    try {
      if (isFav) {
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("ad_id", adId);
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, ad_id: adId });
      }
    } catch (err) {
      console.error("Favorite error:", err);
      setFavorites(prev => {
        const next = new Set(prev);
        isFav ? next.add(adId) : next.delete(adId);
        return next;
      });
    }
  }, [user, favorites, navigate]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  // ============================================
  // ФИЛЬТРАЦИЯ И СОРТИРОВКА
  // ============================================

  const filteredAndSortedAds = useMemo(() => {
    let result = [...ads];

    if (filters.categoryId) {
      result = result.filter(ad => ad.category_id === filters.categoryId);
    }
    if (filters.isGift) {
      result = result.filter(ad => ad.is_gift);
    }
    if (filters.hasStory) {
      result = result.filter(ad => ad.story_text);
    }
    if (filters.hasVoice) {
      result = result.filter(ad => ad.voice_url);
    }
    if (filters.condition) {
      result = result.filter(ad => ad.condition_text === filters.condition);
    }
    if (filters.minPrice) {
      result = result.filter(ad => (ad.price || 0) >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      result = result.filter(ad => (ad.price || 0) <= filters.maxPrice!);
    }

    switch (sortBy) {
      case "nearby":
        if (location) {
          result.sort((a, b) => {
            if (!a.geo_lat || !b.geo_lat) return 0;
            const distA = Math.hypot(a.geo_lat - location.lat, a.geo_lon - location.lon);
            const distB = Math.hypot(b.geo_lat - location.lat, b.geo_lon - location.lon);
            return distA - distB;
          });
        }
        break;
      case "recent":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "popular":
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "price_asc":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price_desc":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
    }

    return result;
  }, [ads, sortBy, filters, location]);

  const sortOptions = [
    { value: "nearby" as SortOption, label: "Рядом", icon: <MapPinned className="w-4 h-4" /> },
    { value: "recent" as SortOption, label: "Новые", icon: <Clock4 className="w-4 h-4" /> },
    { value: "popular" as SortOption, label: "Популярные", icon: <TrendingUp className="w-4 h-4" /> },
  ];

  // ============================================
  // РЕНДЕР ОШИБКИ
  // ============================================

  if (error) {
    return (
      <section className="py-12 px-4" ref={sectionRef}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Не удалось загрузить объявления</h3>
          <p className="text-white/60 text-sm mb-6">{error}</p>
          <button 
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#E6B31E] text-[#0A1828] rounded-xl font-bold hover:shadow-lg transition-shadow"
          >
            <RefreshCw className="w-4 h-4" />
            Попробовать снова
          </button>
        </div>
      </section>
    );
  }

  // ============================================
  // РЕНДЕР
  // ============================================

  return (
    <section className="py-12 px-4" ref={sectionRef}>
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
              {districtName 
                ? `Объявления в районе ${districtName}`
                : "Актуальные объявления"
              }
            </h2>
            <p className="text-white/50 text-sm">
              {filteredAndSortedAds.length} предложений {districtName ? `в ${districtName}` : "в Новосибирске"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white/5 rounded-xl p-1 backdrop-blur-sm">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    sortBy === option.value
                      ? "bg-[#E6B31E] text-[#0A1828] shadow-md"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {option.icon}
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl transition-all ${
                showFilters
                  ? "bg-[#E6B31E]/20 text-[#E6B31E]"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Панель фильтров */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Фильтры</h3>
                  <button
                    onClick={() => setFilters({})}
                    className="text-sm text-[#E6B31E] hover:underline"
                  >
                    Сбросить
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.isGift || false}
                      onChange={(e) => setFilters(prev => ({ ...prev, isGift: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-500 text-[#E6B31E] focus:ring-[#E6B31E]"
                    />
                    <span className="text-sm text-white/70">Отдам даром</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasStory || false}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasStory: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-500 text-[#E6B31E] focus:ring-[#E6B31E]"
                    />
                    <span className="text-sm text-white/70">С историей</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasVoice || false}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasVoice: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-500 text-[#E6B31E] focus:ring-[#E6B31E]"
                    />
                    <span className="text-sm text-white/70">С голосом</span>
                  </label>
                </div>

                <div className="mt-4 flex gap-3">
                  <input
                    type="number"
                    placeholder="Цена от"
                    value={filters.minPrice || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) || undefined }))}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30"
                  />
                  <input
                    type="number"
                    placeholder="Цена до"
                    value={filters.maxPrice || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || undefined }))}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Сетка объявлений */}
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
          >
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </motion.div>
        ) : filteredAndSortedAds.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-4">
              <Package className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Объявлений пока нет
            </h3>
            <p className="text-white/50 text-sm mb-6">
              Станьте первым, кто разместит объявление!
            </p>
            <button
              onClick={() => navigate("/post")}
              className="px-6 py-3 bg-gradient-to-r from-[#E6B31E] to-[#F7A31E] text-[#0A1828] rounded-xl font-bold hover:shadow-lg transition-shadow"
            >
              Подать объявление
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredAndSortedAds.map((ad, index) => (
                <AdCard 
                  key={ad.id} 
                  ad={ad} 
                  index={index} 
                  isFavorite={favorites.has(ad.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>

            {filteredAndSortedAds.length >= 12 && (
              <div className="text-center mt-10">
                <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white/70 font-medium hover:bg-white/10 transition-colors inline-flex items-center gap-2">
                  Показать ещё
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": ads.slice(0, 10).map((ad, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "name": ad.title,
                "url": `https://sibboard.ru/ads/${ad.id}`,
                "image": Array.isArray(ad.photos) ? ad.photos[0] : null,
                "offers": {
                  "@type": "Offer",
                  "price": ad.price,
                  "priceCurrency": "RUB"
                }
              }
            }))
          })
        }}
      />
    </section>
  );
}