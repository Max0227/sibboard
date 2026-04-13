import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  Heart, 
  MapPin, 
  Eye, 
  Clock, 
  Star, 
  MessageCircle, 
  Phone, 
  Shield, 
  Award,
  Mic,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertCircle,
  Share2,
  Flag,
  ZoomIn,
  CheckCircle,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import AIAssistant from "@/components/feature/AIAssistant";
import { supabase, formatPrice, getImageUrl, type Ad } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

// ============================================
// ТИПЫ
// ============================================

interface SellerProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  rating: number;
  deals_count: number;
  badges: string[];
  is_verified: boolean;
  voice_intro_url: string | null;
  home_district: string | null;
  created_at: string;
  phone: string | null;
}

interface SimilarAd {
  id: number;
  title: string;
  price: number | null;
  is_gift: boolean;
  photos: string[];
  district: string | null;
}

// ============================================
// КОМПОНЕНТЫ
// ============================================

// Скелетон загрузки
const AdSkeleton = () => (
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-20">
    <div className="h-6 w-48 bg-white/10 rounded-lg animate-pulse mb-6" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2">
        <div className="rounded-3xl h-[450px] bg-white/5 animate-pulse mb-6" />
        <div className="rounded-3xl p-6 bg-white/5 animate-pulse space-y-4">
          <div className="h-8 w-32 bg-white/10 rounded" />
          <div className="h-6 w-full bg-white/10 rounded" />
          <div className="h-20 w-full bg-white/10 rounded" />
        </div>
      </div>
      <div className="rounded-3xl p-6 bg-white/5 h-96 animate-pulse" />
    </div>
  </div>
);

// Галерея с зумом
function ImageGallery({ photos, title }: { photos: string[]; title: string }) {
  const [activeImg, setActiveImg] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const mainImage = photos[activeImg] || null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imgRef.current) return;
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handlePrev = () => {
    if (photos.length === 0) return;
    setActiveImg((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (photos.length === 0) return;
    setActiveImg((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  if (photos.length === 0) {
    return (
      <div className="rounded-3xl h-[450px] bg-white/5 border border-white/10 flex items-center justify-center">
        <Package className="w-20 h-20 text-white/20" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Главное изображение */}
      <div 
        className="relative rounded-3xl overflow-hidden bg-black/20"
        style={{ height: 450 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImg}
            ref={imgRef}
            src={getImageUrl(String(mainImage)) || String(mainImage)}
            alt={title}
            className="w-full h-full object-contain"
            style={isZoomed ? {
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              transform: "scale(2)",
            } : {}}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {/* Кнопки навигации */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Индикатор зума */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white/70 text-xs flex items-center gap-1">
          <ZoomIn className="w-3.5 h-3.5" />
          Наведи для увеличения
        </div>

        {/* Счётчик фото */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white/70 text-xs">
          {activeImg + 1} / {photos.length}
        </div>
      </div>

      {/* Миниатюры */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((img, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveImg(i)}
              className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                i === activeImg ? "border-[#E6B31E] shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img 
                src={getImageUrl(String(img)) || String(img)} 
                alt="" 
                className="w-full h-full object-cover" 
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

// Карточка продавца
function SellerCard({ seller, onMessage, onShowPhone, showPhone, startingChat }: {
  seller: SellerProfile;
  onMessage: () => void;
  onShowPhone: () => void;
  showPhone: boolean;
  startingChat: boolean;
}) {
  const { isDark } = useTheme();

  return (
    <div 
      className="rounded-3xl p-6 sticky top-24"
      style={{ 
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Профиль */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl overflow-hidden">
            {seller.avatar_url ? (
              <img 
                src={getImageUrl(seller.avatar_url) || seller.avatar_url} 
                alt={seller.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #E6B31E, #F7A31E)" }}
              >
                <span className="text-[#0A1828] font-black text-2xl">
                  {seller.name?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
            )}
          </div>
          {seller.is_verified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-[#0A1828] flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        <div>
          <div className="text-white font-black text-lg flex items-center gap-2">
            {seller.name}
            {seller.is_verified && (
              <span className="text-blue-400 text-xs font-medium">✓ Проверен</span>
            )}
          </div>
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                className={`w-3.5 h-3.5 ${s <= Math.round(seller.rating) ? "fill-[#E6B31E] text-[#E6B31E]" : "text-white/20"}`} 
              />
            ))}
            <span className="text-white/50 text-xs ml-1">{seller.rating.toFixed(1)}</span>
          </div>
          <div className="text-white/40 text-xs">{seller.deals_count} сделок</div>
        </div>
      </div>

      {/* Бейджи */}
      {seller.badges && seller.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {seller.badges.slice(0, 3).map((badge) => (
            <span 
              key={badge} 
              className="px-3 py-1 rounded-full text-xs font-bold text-[#E6B31E] bg-[#E6B31E]/10 border border-[#E6B31E]/20"
            >
              <Award className="w-3 h-3 inline mr-1" />
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Голосовое интро */}
      {seller.voice_intro_url && (
        <div 
          className="rounded-2xl p-4 mb-5 flex items-center gap-3 bg-[#E6B31E]/5 border border-[#E6B31E]/20 cursor-pointer hover:bg-[#E6B31E]/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[#E6B31E]/20 flex items-center justify-center">
            <Mic className="w-5 h-5 text-[#E6B31E]" />
          </div>
          <div>
            <div className="text-white/80 text-xs font-bold">Аудио-визитка</div>
            <div className="text-white/40 text-[10px]">Нажми, чтобы прослушать</div>
          </div>
        </div>
      )}

      {/* Кнопки */}
      <div className="flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShowPhone}
          className="w-full py-4 rounded-2xl font-black text-[#0A1828] text-base flex items-center justify-center gap-2 shadow-lg"
          style={{ background: "linear-gradient(135deg, #E6B31E, #F7A31E)" }}
        >
          {showPhone ? (
            <>
              <Phone className="w-4 h-4" />
              {seller.phone || "+7 (XXX) XXX-XX-XX"}
            </>
          ) : (
            "Показать номер"
          )}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onMessage}
          disabled={startingChat}
          className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-50 flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          {startingChat ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Открываем чат...
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4" />
              Написать сообщение
            </>
          )}
        </motion.button>
      </div>

      {/* Время ответа */}
      <p className="text-white/30 text-xs text-center mt-4 flex items-center justify-center gap-1">
        <Clock className="w-3 h-3" />
        Обычно отвечает в течение 15 минут
      </p>
    </div>
  );
}

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function AdDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  
  const [ad, setAd] = useState<Ad | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [similarAds, setSimilarAds] = useState<SimilarAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showPhone, setShowPhone] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const photos = Array.isArray(ad?.photos) ? ad.photos : [];

  // ============================================
  // ЗАГРУЗКА ДАННЫХ
  // ============================================

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }
    fetchAd();
    incrementViews();
  }, [id]);

  const fetchAd = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const adId = parseInt(id!);
      
      const { data: adData, error: adError } = await supabase
        .from("ads")
        .select(`
          *,
          seller:users!ads_user_id_fkey(
            id, name, avatar_url, rating, deals_count, 
            badges, is_verified, voice_intro_url, home_district, created_at, phone
          )
        `)
        .eq("id", adId)
        .single();

      if (adError) throw adError;
      
      setAd(adData as Ad);
      setSeller((adData as any).seller as SellerProfile);

      if (user) {
        const { data: favData } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("ad_id", adId)
          .maybeSingle();
        
        setIsFavorite(!!favData);
      }

      if (adData.category_id) {
        const { data: similarData } = await supabase
          .from("ads")
          .select("id, title, price, is_gift, photos, district")
          .eq("category_id", adData.category_id)
          .eq("status", "active")
          .neq("id", adId)
          .limit(6);
        
        setSimilarAds((similarData as SimilarAd[]) || []);
      }
    } catch (err) {
      console.error("Failed to fetch ad:", err);
      setError("Не удалось загрузить объявление");
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    if (!id) return;
    try {
      await supabase.rpc("increment_ad_views", { ad_id: parseInt(id) });
    } catch (err) {
      console.error("Failed to increment views:", err);
    }
  };

  // ============================================
  // ОБРАБОТЧИКИ
  // ============================================

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate("/auth", { state: { from: `/ads/${id}` } });
      return;
    }
    
    if (!ad) return;
    
    setFavoriteLoading(true);
    
    try {
      const adId = parseInt(id!);
      
      if (isFavorite) {
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("ad_id", adId);
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, ad_id: adId });
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Favorite error:", err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleWriteMessage = async () => {
    if (!user) {
      navigate("/auth", { state: { from: `/ads/${id}` } });
      return;
    }
    
    if (!ad || !seller) return;
    
    if (user.id === seller.id) {
      navigate("/messages");
      return;
    }
    
    setStartingChat(true);
    
    try {
      const adId = parseInt(id!);
      
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("ad_id", adId)
        .eq("buyer_id", user.id)
        .maybeSingle();

      if (existing) {
        navigate(`/messages/${existing.id}`);
        return;
      }

      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({ ad_id: adId, buyer_id: user.id, seller_id: seller.id })
        .select("id")
        .single();

      if (error) throw error;
      
      navigate(`/messages/${newConv.id}`);
    } catch (err) {
      console.error("Failed to start chat:", err);
      navigate("/messages");
    } finally {
      setStartingChat(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const handleReport = () => {
    navigate(`/report?ad=${id}`);
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "только что";
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} мин назад`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ч назад`;
    return `${Math.floor(hrs / 24)} дн назад`;
  };

  // ============================================
  // РЕНДЕР
  // ============================================

  if (loading) return <AdSkeleton />;

  if (error || !ad) {
    return (
      <div style={{ background: isDark ? "#0A1828" : "#F0F6FF", minHeight: "100vh" }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-4">Объявление не найдено</h2>
          <p className="text-white/60 mb-8">{error || "Возможно, оно было удалено или перемещено"}</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 bg-[#E6B31E] text-[#0A1828] rounded-xl font-bold">
            На главную
          </button>
        </div>
      </div>
    );
  }

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
        {/* Хлебные крошки + действия */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-white/30 text-sm">
            <button onClick={() => navigate("/")} className="hover:text-white transition-colors">Главная</button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => navigate("/search")} className="hover:text-white transition-colors">Объявления</button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white/70 truncate max-w-[200px]">{ad.title}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReport}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-red-400 transition-colors"
            >
              <Flag className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Левая колонка */}
          <div className="lg:col-span-2 space-y-6">
            {/* Галерея */}
            <ImageGallery photos={photos as string[]} title={ad.title} />

            {/* Основная информация */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-6"
              style={{ 
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)",
                border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="text-3xl sm:text-4xl font-black mb-2 text-[#E6B31E]">
                    {formatPrice(ad.price, ad.is_gift)}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {ad.title}
                  </h1>
                </div>
                
                <button
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl flex-shrink-0 transition-all disabled:opacity-50"
                  style={{ 
                    background: isFavorite ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${isFavorite ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-400 text-red-400" : "text-white/50"}`} />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs text-white/60 bg-white/5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {ad.district || "Новосибирск"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs text-white/60 bg-white/5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatTimeAgo(ad.created_at)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs text-white/60 bg-white/5 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {ad.views || 0} просмотров
                </span>
                {ad.condition_text && (
                  <span className="px-3 py-1 rounded-full text-xs text-white/60 bg-white/5">{ad.condition_text}</span>
                )}
                {ad.story_reason && (
                  <span className="px-3 py-1 rounded-full text-xs text-[#E6B31E] bg-[#E6B31E]/10">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {ad.story_reason}
                  </span>
                )}
              </div>
              
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                {ad.description}
              </p>
            </motion.div>

            {/* История вещи */}
            {ad.story_text && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl p-6 bg-[#E6B31E]/5 border border-[#E6B31E]/20"
              >
                <h3 className="text-white font-black text-lg mb-3 flex items-center gap-2">
                  <span>📖</span> История вещи
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">{ad.story_text}</p>
              </motion.div>
            )}

            {/* Адрес */}
            <div 
              className="rounded-3xl p-5 flex items-center gap-3"
              style={{ 
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)",
                border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#E6B31E]/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#E6B31E]" />
              </div>
              <div>
                <div className="text-white/50 text-xs mb-0.5">Адрес встречи</div>
                <div className="text-white/80 text-sm">{ad.address || ad.district || "Новосибирск"}</div>
              </div>
            </div>
          </div>

          {/* Правая колонка */}
          <div className="space-y-5">
            {seller && (
              <SellerCard
                seller={seller}
                onMessage={handleWriteMessage}
                onShowPhone={() => setShowPhone(!showPhone)}
                showPhone={showPhone}
                startingChat={startingChat}
              />
            )}

            {/* Безопасная сделка */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl p-5 bg-emerald-500/10 border border-emerald-500/30"
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-bold text-sm">Безопасная сделка</span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">
                Деньги замораживаются до подтверждения получения товара. Встречайтесь в безопасных местах.
              </p>
            </motion.div>

            {/* Похожие объявления */}
            {similarAds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-3xl p-5"
                style={{ 
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)",
                  border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <h4 className="text-white font-black text-sm mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E6B31E]" />
                  Похожие объявления
                </h4>
                <div className="space-y-3">
                  {similarAds.slice(0, 4).map((a) => {
                    const adPhotos = Array.isArray(a.photos) ? a.photos : [];
                    return (
                      <motion.button
                        key={a.id}
                        whileHover={{ x: 4 }}
                        onClick={() => navigate(`/ads/${a.id}`)}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all text-left group"
                      >
                        {adPhotos[0] ? (
                          <img 
                            src={getImageUrl(String(adPhotos[0])) || String(adPhotos[0])} 
                            alt={a.title}
                            className="w-14 h-12 rounded-xl object-cover flex-shrink-0" 
                          />
                        ) : (
                          <div className="w-14 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-white/30" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-white/80 text-xs font-semibold truncate">{a.title}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#E6B31E] text-sm font-black">
                              {formatPrice(a.price, a.is_gift)}
                            </span>
                            <span className="text-white/30 text-[10px] flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />
                              {a.district || "Новосибирск"}
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
      <AIAssistant />

      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": ad.title,
            "description": ad.description,
            "image": photos[0] || null,
            "offers": {
              "@type": "Offer",
              "price": ad.price,
              "priceCurrency": "RUB",
              "availability": ad.status === "active" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
              "seller": {
                "@type": "Person",
                "name": seller?.name || "Продавец",
              }
            }
          })
        }}
      />

      {/* Тост "Ссылка скопирована" */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-green-500 text-white text-sm font-bold shadow-xl flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Ссылка скопирована!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}