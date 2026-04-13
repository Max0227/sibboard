import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  Tag, 
  Star, 
  Handshake, 
  Camera, 
  Loader2, 
  Edit, 
  Trash2, 
  LogOut,
  Plus,
  CheckCircle,
  MapPin,
  Package,
  Award,
  Settings,
  Image as ImageIcon
} from "lucide-react";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import AIAssistant from "@/components/feature/AIAssistant";
import { supabase, formatPrice, getImageUrl } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

// ============================================
// ТИПЫ
// ============================================

interface UserProfile {
  id: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  home_district: string | null;
  rating: number;
  deals_count: number;
  badges: string[];
  created_at: string;
  updated_at: string;
}

interface Ad {
  id: number;
  title: string;
  price: number | null;
  is_gift: boolean;
  photos: string[];
  district: string | null;
  status: string;
  views: number;
  created_at: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  desc: string;
  total: number;
  earned: boolean;
  progress: number;
}

// ============================================
// КОНСТАНТЫ
// ============================================

const DISTRICTS = [
  "Академгородок", 
  "Центр", 
  "Левый берег", 
  "Калининский", 
  "Октябрьский", 
  "Советский",
  "Железнодорожный",
  "Заельцовский",
  "Дзержинский",
  "Кировский",
  "Ленинский",
  "Первомайский"
];

const BADGES_CONFIG = [
  { id: "stolbist", name: "Столбист", icon: "🏔️", desc: "10 успешных сделок", total: 10 },
  { id: "barista", name: "Бариста", icon: "☕", desc: "Встречи у кофеен", total: 5 },
  { id: "paparazzi", name: "Папарацци", icon: "📸", desc: "Качественные фото", total: 5 },
  { id: "neighbor", name: "Сосед", icon: "🏘️", desc: "Сделки в своём ЖК", total: 8 },
  { id: "veteran", name: "Ветеран", icon: "🎖️", desc: "На платформе больше года", total: 1 },
  { id: "superstar", name: "Суперзвезда", icon: "🌟", desc: "Рейтинг 5.0", total: 1 },
];

// ============================================
// КОМПОНЕНТЫ
// ============================================

// Скелетон загрузки
const DashboardSkeleton = () => (
  <div className="flex items-center justify-center py-32">
    <Loader2 className="w-12 h-12 text-[#E6B31E] animate-spin" />
  </div>
);

// Карточка статистики
const StatCard = ({ icon: Icon, label, value, change, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="rounded-2xl p-5 bg-white/5 border border-white/10"
  >
    <div className="w-10 h-10 flex items-center justify-center rounded-xl mb-3 bg-[#E6B31E]/10">
      <Icon className="text-[#E6B31E] w-5 h-5" />
    </div>
    <div className="text-2xl font-black text-white mb-0.5">{value}</div>
    <div className="text-white/40 text-xs">{label}</div>
    <div className="text-[#E6B31E]/70 text-xs mt-1 font-semibold">{change}</div>
  </motion.div>
);

// Карточка объявления
const AdCard = ({ ad, onDelete, isDeleting, onEdit }: any) => {
  const navigate = useNavigate();
  const photo = ad.photos?.[0];
  
  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="rounded-2xl overflow-hidden cursor-pointer group bg-white/5 border border-white/10"
      onClick={() => navigate(`/ads/${ad.id}`)}
    >
      <div className="w-full h-36 overflow-hidden relative bg-white/10">
        {photo ? (
          <img
            src={getImageUrl(photo) || photo}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="text-white/20 w-8 h-8" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{
              background: ad.status === "active" ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.1)",
              color: ad.status === "active" ? "#4ade80" : "rgba(255,255,255,0.4)",
            }}
          >
            {ad.status === "active" ? "Активно" : ad.status === "sold" ? "Продано" : "Архив"}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-[#E6B31E] font-black text-lg mb-1">
          {formatPrice(ad.price, ad.is_gift)}
        </div>
        <div className="text-white/80 text-sm font-semibold truncate mb-2">
          {ad.title}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/30 text-xs flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {ad.views || 0}
          </span>
          <div className="flex gap-1">
            <button
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); onEdit(ad.id); }}
            >
              <Edit className="w-3.5 h-3.5 text-white/40" />
            </button>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/15 transition-colors"
              onClick={(e) => { e.stopPropagation(); onDelete(ad.id); }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 text-white/40" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Карточка достижения
const BadgeCard = ({ badge, index }: { badge: Badge; index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    className="rounded-2xl p-6 text-center"
    style={{
      background: badge.earned ? "rgba(230,179,30,0.08)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${badge.earned ? "rgba(230,179,30,0.25)" : "rgba(255,255,255,0.07)"}`,
    }}
  >
    <div className="text-5xl mb-3">{badge.icon}</div>
    <div className={`font-black text-lg mb-1 ${badge.earned ? "text-[#E6B31E]" : "text-white/60"}`}>
      {badge.name}
    </div>
    <div className="text-white/40 text-xs mb-4">{badge.desc}</div>
    <div className="w-full h-2 rounded-full mb-2 bg-white/10">
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${badge.progress}%` }}
        transition={{ duration: 1, delay: index * 0.1 }}
        style={{
          background: badge.earned
            ? "linear-gradient(90deg, #E6B31E, #F7A31E)"
            : "rgba(255,255,255,0.2)",
        }}
      />
    </div>
    <div className="text-white/30 text-xs">
      {badge.earned ? badge.total : Math.min(badge.progress * badge.total / 100, badge.total)} / {badge.total}
    </div>
    {badge.earned && (
      <div className="mt-2 text-green-400 text-xs font-bold flex items-center justify-center gap-1">
        <CheckCircle className="w-3 h-3" /> Получено
      </div>
    )}
  </motion.div>
);

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"ads" | "badges" | "settings">("ads");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, signOut, refreshProfile } = useAuth();
  const { isDark } = useTheme();

  // Form state
  const [formName, setFormName] = useState("");
  const [formDistrict, setFormDistrict] = useState("");

  // ============================================
  // ЗАГРУЗКА ДАННЫХ
  // ============================================

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const [profileRes, adsRes] = await Promise.all([
        supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("ads")
          .select("id,title,price,is_gift,photos,district,status,views,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      
      if (profileRes.data) {
        setProfile(profileRes.data as UserProfile);
        setFormName(profileRes.data.name || "");
        setFormDistrict(profileRes.data.home_district || "");
      }
      
      setMyAds((adsRes.data as Ad[]) || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ============================================
  // ОБРАБОТЧИКИ
  // ============================================

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      await supabase
        .from("users")
        .update({ 
          name: formName.trim(), 
          home_district: formDistrict,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      
      await refreshProfile?.();
      await fetchData();
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAd = async (adId: number) => {
    setDeletingId(adId);
    
    try {
      await supabase
        .from("ads")
        .update({ status: "archived", updated_at: new Date().toISOString() })
        .eq("id", adId);
      
      setMyAds((prev) => prev.filter((a) => a.id !== adId));
    } catch (error) {
      console.error("Failed to delete ad:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditAd = (adId: number) => {
    navigate(`/post?edit=${adId}`);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Валидация
    if (file.size > 5 * 1024 * 1024) {
      alert("Файл слишком большой. Максимум 5 МБ.");
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      alert("Можно загружать только изображения.");
      return;
    }
    
    setAvatarUploading(true);
    
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const path = `avatars/${user.id}_${timestamp}.${ext}`;
      
      // Загружаем в storage
      const { error: uploadError } = await supabase.storage
        .from("ad-images")
        .upload(path, file, { 
          upsert: true,
          cacheControl: "3600",
        });
      
      if (uploadError) throw uploadError;
      
      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from("ad-images")
        .getPublicUrl(path);
      
      // Обновляем профиль
      await supabase
        .from("users")
        .update({ 
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      
      await refreshProfile?.();
      await fetchData();
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("Не удалось загрузить аватар");
    } finally {
      setAvatarUploading(false);
      // Очищаем input
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  // ============================================
  // ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ
  // ============================================

  const activeAds = myAds.filter((a) => a.status === "active");
  const totalViews = myAds.reduce((sum, a) => sum + (a.views || 0), 0);
  const initials = profile?.name?.charAt(0).toUpperCase() || "?";
  
  const dealsCount = profile?.deals_count || 0;
  const userRating = profile?.rating || 5.0;

  // Вычисляем прогресс бейджей
  const badges: Badge[] = BADGES_CONFIG.map((badge) => {
    let progress = 0;
    let earned = false;
    
    switch (badge.id) {
      case "stolbist":
      case "barista":
      case "neighbor":
        progress = Math.min((dealsCount / badge.total) * 100, 100);
        earned = dealsCount >= badge.total;
        break;
      case "paparazzi":
        // Считаем объявления с фото
        const adsWithPhotos = myAds.filter((a) => a.photos?.length >= 3).length;
        progress = Math.min((adsWithPhotos / badge.total) * 100, 100);
        earned = adsWithPhotos >= badge.total;
        break;
      case "veteran":
        if (profile?.created_at) {
          const daysSince = (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24);
          progress = Math.min((daysSince / 365) * 100, 100);
          earned = daysSince >= 365;
        }
        break;
      case "superstar":
        progress = userRating >= 5.0 ? 100 : (userRating / 5.0) * 100;
        earned = userRating >= 5.0;
        break;
    }
    
    return { ...badge, progress, earned };
  });

  const stats = [
    { icon: Eye, label: "Просмотры", value: totalViews.toLocaleString(), change: "всего" },
    { icon: Package, label: "Активных", value: String(activeAds.length), change: "объявлений" },
    { icon: Star, label: "Рейтинг", value: userRating.toFixed(1), change: "из 5.0" },
    { icon: Handshake, label: "Сделок", value: String(dealsCount), change: "завершено" },
  ];

  // ============================================
  // РЕНДЕР
  // ============================================

  if (loading) {
    return (
      <div style={{ background: isDark ? "#0A1828" : "#F0F6FF", minHeight: "100vh" }}>
        <Navbar />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div 
      style={{ 
        background: isDark ? "#0A1828" : "#F0F6FF", 
        minHeight: "100vh",
        fontFamily: "Nunito, sans-serif",
        transition: "background 0.3s",
      }}
    >
      <Navbar />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-20">
        {/* Профиль */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(11,79,108,0.35), rgba(26,59,46,0.35))"
              : "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))",
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/* Аватар */}
          <div className="relative flex-shrink-0 group">
            <div
              className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer"
              style={{
                background: profile?.avatar_url
                  ? "transparent"
                  : "linear-gradient(135deg, #E6B31E, #F7A31E)",
              }}
              onClick={() => avatarInputRef.current?.click()}
            >
              {profile?.avatar_url ? (
                <img
                  src={getImageUrl(profile.avatar_url) || profile.avatar_url}
                  alt="Аватар"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#0A1828] font-black text-4xl">{initials}</span>
              )}
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                {avatarUploading ? (
                  <Loader2 className="text-white w-6 h-6 animate-spin" />
                ) : (
                  <Camera className="text-white w-6 h-6" />
                )}
              </div>
            </div>
            
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-[#0A1828]" />
            
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={avatarUploading}
            />
          </div>

          {/* Инфо */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
              {profile?.name || "Пользователь"}
            </h1>
            
            <p className="text-white/40 text-sm mb-3">
              {profile?.home_district && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {profile.home_district} · 
                </span>
              )}
              {" "}На SIBBOARD с{" "}
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("ru-RU", {
                    month: "long",
                    year: "numeric",
                  })
                : "недавно"}
            </p>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {badges.filter((b) => b.earned).slice(0, 3).map((b) => (
                <span
                  key={b.id}
                  className="px-3 py-1 rounded-full text-xs font-bold text-[#E6B31E]"
                  style={{
                    background: "rgba(230,179,30,0.12)",
                    border: "1px solid rgba(230,179,30,0.25)",
                  }}
                >
                  {b.icon} {b.name}
                </span>
              ))}
            </div>
          </div>

          {/* Рейтинг */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="text-4xl font-black"
              style={{
                background: "linear-gradient(135deg, #E6B31E, #F7A31E)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {userRating.toFixed(1)}
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= Math.round(userRating) ? "text-[#E6B31E] fill-[#E6B31E]" : "text-white/20"}`}
                />
              ))}
            </div>
            <div className="text-white/30 text-xs">{dealsCount} сделок</div>
          </div>
        </motion.div>

        {/* Статистика */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.08} />
          ))}
        </div>

        {/* Табы */}
        <div className="flex gap-2 mb-6 p-1 rounded-2xl w-fit bg-white/5">
          {[
            ["ads", "Мои объявления", Package],
            ["badges", "Достижения", Award],
            ["settings", "Настройки", Settings],
          ].map(([tab, label, Icon]) => (
            <button
              key={tab as string}
              onClick={() => setActiveTab(tab as "ads" | "badges" | "settings")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab ? "text-[#0A1828]" : "text-white/50 hover:text-white"
              }`}
              style={activeTab === tab ? { background: "linear-gradient(135deg, #E6B31E, #F7A31E)" } : {}}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label as string}</span>
            </button>
          ))}
        </div>

        {/* Вкладка: Объявления */}
        {activeTab === "ads" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-black text-white">
                Мои объявления
                <span className="ml-2 text-sm font-semibold text-white/30">({myAds.length})</span>
              </h2>
              
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/post")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[#0A1828] text-sm"
                style={{ background: "linear-gradient(135deg, #E6B31E, #F7A31E)" }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Новое объявление</span>
              </motion.button>
            </div>

            {myAds.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-3xl p-16 text-center bg-white/5 border border-dashed border-white/10"
              >
                <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-black text-white mb-2">Пока нет объявлений</h3>
                <p className="text-white/40 text-sm mb-6">
                  Разместите первое объявление — это бесплатно!
                </p>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate("/post")}
                  className="px-8 py-3 rounded-2xl font-bold text-[#0A1828]"
                  style={{ background: "linear-gradient(135deg, #E6B31E, #F7A31E)" }}
                >
                  Разместить объявление
                </motion.button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                <AnimatePresence>
                  {myAds.map((ad) => (
                    <AdCard
                      key={ad.id}
                      ad={ad}
                      onDelete={handleDeleteAd}
                      onEdit={handleEditAd}
                      isDeleting={deletingId === ad.id}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* Вкладка: Достижения */}
        {activeTab === "badges" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-black text-white mb-5">Достижения</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {badges.map((badge, i) => (
                <BadgeCard key={badge.id} badge={badge} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Вкладка: Настройки */}
        {activeTab === "settings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl">
            <h2 className="text-xl font-black text-white mb-5">Настройки профиля</h2>
            
            <div className="rounded-2xl p-6 flex flex-col gap-5 bg-white/5 border border-white/10">
              {/* Имя */}
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 block">
                  Имя
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ваше имя"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all bg-white/10 border border-white/10 focus:border-[#E6B31E]/60"
                />
              </div>

              {/* Телефон */}
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 block">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={profile?.phone || ""}
                  disabled
                  className="w-full px-4 py-3 rounded-xl text-white/40 text-sm outline-none bg-white/5 border border-white/10"
                />
                <p className="text-white/25 text-xs mt-1">Телефон нельзя изменить</p>
              </div>

              {/* Район */}
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 block">
                  Мой район
                </label>
                <select
                  value={formDistrict}
                  onChange={(e) => setFormDistrict(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none bg-white/10 border border-white/10 focus:border-[#E6B31E]/60"
                >
                  <option value="">Выбери район</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d} style={{ background: "#0A1828" }}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Успех */}
              <AnimatePresence>
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-green-400 text-sm font-semibold bg-green-500/10 border border-green-500/20"
                  >
                    <CheckCircle className="w-4 h-4" /> Профиль сохранён!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Кнопка сохранения */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full py-3 rounded-xl font-bold text-[#0A1828] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: saving
                    ? "rgba(230,179,30,0.4)"
                    : "linear-gradient(135deg, #E6B31E, #F7A31E)",
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Сохраняем...
                  </>
                ) : (
                  "Сохранить изменения"
                )}
              </motion.button>

              {/* Выход */}
              <div className="border-t border-white/10 pt-4">
                <button
                  onClick={signOut}
                  className="w-full py-3 rounded-xl font-bold text-red-400 text-sm transition-colors hover:bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти из аккаунта
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
      <AIAssistant />
    </div>
  );
}