import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, 
  Moon, 
  MessageCircle, 
  User, 
  Plus, 
  Menu, 
  X, 
  ChevronDown,
  LayoutDashboard,
  Heart,
  LogOut,
  Mountain,
  Search,
  MapPin,
  Home,
  Building2,
  HelpCircle,
  Briefcase
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, getImageUrl } from "@/lib/supabase";

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  // Определяем активную ссылку
  const isActive = (path: string) => location.pathname === path;

  // Отслеживание скролла
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Загрузка профиля и непрочитанных сообщений
  useEffect(() => {
    if (!user) {
      setUserName("");
      setUserAvatar("");
      setUnreadCount(0);
      return;
    }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("users")
        .select("name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      
      if (data) {
        setUserName(data.name || "Пользователь");
        setUserAvatar(data.avatar_url || "");
      }
    };

    const fetchUnread = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("buyer_id, seller_id, buyer_unread, seller_unread")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
      
      if (data) {
        const total = data.reduce((sum, c) => {
          return sum + (c.buyer_id === user.id ? c.buyer_unread : c.seller_unread);
        }, 0);
        setUnreadCount(total);
      }
    };

    fetchProfile();
    fetchUnread();

    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Закрытие дропдаунов при клике вне
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks = [
    { label: "Главная", href: "/", icon: Home },
    { label: "Объявления", href: "/search", icon: Search },
    { label: "Районы", href: "/#districts", icon: MapPin },
    { label: "Как работает", href: "/#how", icon: HelpCircle },
    { label: "Бизнес", href: "/#business", icon: Briefcase },
  ];

  const isTransparent = transparent && !scrolled && !mobileOpen;
  const navBg = isTransparent 
    ? "transparent" 
    : isDark 
      ? "rgba(10,24,40,0.92)" 
      : "rgba(255,255,255,0.92)";

  const handleSignOut = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await signOut();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const initials = userName?.charAt(0).toUpperCase() || "?";

  // Schema.org разметка
  const navSchema = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "name": "Главное меню SibBoard",
    "url": "https://sibboard.ru",
    "hasPart": navLinks.map(link => ({
      "@type": "WebPage",
      "name": link.label,
      "url": `https://sibboard.ru${link.href}`
    }))
  };

  return (
    <>
      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navSchema) }}
      />

      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          height: 72,
          background: navBg,
          backdropFilter: isTransparent ? "none" : "blur(20px)",
          borderBottom: isTransparent 
            ? "none" 
            : isDark 
              ? "1px solid rgba(255,255,255,0.06)" 
              : "1px solid rgba(0,0,0,0.06)",
        }}
        itemScope
        itemType="https://schema.org/SiteNavigationElement"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Логотип */}
          <Link 
            to="/" 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
            itemProp="url"
          >
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
              style={{ background: "linear-gradient(135deg, #E6B31E, #F7A31E)" }}
            >
              <Mountain className="w-5 h-5 text-[#0A1828]" />
            </div>
            <span 
              className="text-xl sm:text-2xl font-black tracking-tight"
              style={{
                background: "linear-gradient(135deg, #E6B31E, #F7A31E)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "Nunito, sans-serif",
              }}
              itemProp="name"
            >
              SIBBOARD
            </span>
          </Link>

          {/* Десктопная навигация */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                    active
                      ? "text-[#E6B31E] bg-[#E6B31E]/10"
                      : isDark 
                        ? "text-white/70 hover:text-white hover:bg-white/5" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
                  }`}
                  style={{ fontFamily: "Nunito, sans-serif" }}
                  itemProp="hasPart"
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {active && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#E6B31E] rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Правые действия */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Поиск (десктоп) */}
            <div ref={searchRef} className="relative hidden sm:block">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                }}
              >
                <Search className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.form
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: 20 }}
                    transition={{ duration: 0.15 }}
                    onSubmit={handleSearch}
                    className="absolute right-0 top-12 w-80 p-3 rounded-2xl shadow-xl"
                    style={{
                      background: isDark ? "rgba(10,24,40,0.98)" : "rgba(255,255,255,0.98)",
                      border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск объявлений..."
                        className="flex-1 bg-transparent text-sm outline-none"
                        style={{ color: isDark ? "#FFFFFF" : "#1A1A2E" }}
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="text-white/30 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Переключатель темы */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              }}
              aria-label={isDark ? "Светлая тема" : "Тёмная тема"}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? "sun" : "moon"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-[#E6B31E]" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-700" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Блок авторизации */}
            {user ? (
              <>
                {/* Сообщения */}
                <button
                  onClick={() => navigate("/messages")}
                  className="relative w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  }}
                >
                  <MessageCircle className={`w-5 h-5 ${isDark ? "text-white/70" : "text-gray-600"}`} />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black text-[#0A1828] flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #E6B31E, #F7A31E)" }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                  )}
                </button>

                {/* Профиль */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full cursor-pointer transition-all"
                    style={{
                      background: profileOpen 
                        ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)")
                        : "transparent",
                    }}
                  >
                    <div
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                      style={{
                        background: userAvatar ? "transparent" : "linear-gradient(135deg, #E6B31E, #F7A31E)",
                      }}
                    >
                      {userAvatar ? (
                        <img
                          src={getImageUrl(String(userAvatar)) || String(userAvatar)}
                          alt={userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[#0A1828] font-black text-sm">{initials}</span>
                      )}
                    </div>
                    <span
                      className="hidden sm:block text-sm font-bold max-w-[80px] truncate"
                      style={{
                        color: isDark ? "rgba(255,255,255,0.8)" : "#1A1A2E",
                        fontFamily: "Nunito, sans-serif",
                      }}
                    >
                      {userName.split(" ")[0] || "Профиль"}
                    </span>
                    <ChevronDown
                      className={`hidden sm:block w-4 h-4 transition-transform ${
                        profileOpen ? "rotate-180" : ""
                      } ${isDark ? "text-white/50" : "text-gray-500"}`}
                    />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-56 rounded-2xl overflow-hidden shadow-xl"
                        style={{
                          background: isDark ? "rgba(10,24,40,0.98)" : "rgba(255,255,255,0.98)",
                          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
                          backdropFilter: "blur(20px)",
                        }}
                      >
                        <div 
                          className="p-4 border-b"
                          style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}
                        >
                          <div 
                            className="text-sm font-bold truncate"
                            style={{ color: isDark ? "rgba(255,255,255,0.9)" : "#1A1A2E" }}
                          >
                            {userName}
                          </div>
                          <div 
                            className="text-xs truncate mt-0.5"
                            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
                          >
                            {user.phone || ""}
                          </div>
                        </div>

                        {[
                          { 
                            icon: LayoutDashboard, 
                            label: "Мой кабинет", 
                            action: () => { navigate("/dashboard"); setProfileOpen(false); } 
                          },
                          { 
                            icon: Plus, 
                            label: "Подать объявление", 
                            action: () => { navigate("/post"); setProfileOpen(false); } 
                          },
                          { 
                            icon: Heart, 
                            label: "Избранное", 
                            action: () => { navigate("/dashboard?tab=favorites"); setProfileOpen(false); } 
                          },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={item.action}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left"
                            style={{ color: isDark ? "rgba(255,255,255,0.8)" : "#1A1A2E" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <item.icon className="w-4 h-4 text-[#E6B31E]" />
                            {item.label}
                          </button>
                        ))}

                        <div style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)" }}>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left text-red-400 hover:bg-red-500/10"
                          >
                            <LogOut className="w-4 h-4" />
                            Выйти
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/auth")}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    color: isDark ? "rgba(255,255,255,0.8)" : "#1A1A2E",
                    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <User className="w-4 h-4" />
                  Войти
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/post")}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-[#0A1828] text-sm shadow-lg"
                  style={{ background: "linear-gradient(135deg, #E6B31E, #F7A31E)" }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Разместить</span>
                </motion.button>
              </>
            )}

            {/* Мобильное меню */}
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                color: isDark ? "#fff" : "#1A1A2E",
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Меню"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden backdrop-blur-xl border-t px-4 py-4 flex flex-col gap-2"
              style={{
                background: isDark ? "rgba(10,24,40,0.98)" : "rgba(255,255,255,0.98)",
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              }}
            >
              {/* Мобильный поиск */}
              <form onSubmit={handleSearch} className="mb-2">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <Search className="w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск..."
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: isDark ? "#FFFFFF" : "#1A1A2E" }}
                  />
                </div>
              </form>

              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-colors"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.8)" : "#1A1A2E",
                      background: isActive(link.href) 
                        ? (isDark ? "rgba(230,179,30,0.1)" : "rgba(230,179,30,0.08)")
                        : "transparent",
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="w-5 h-5 text-[#E6B31E]" />
                    {link.label}
                  </Link>
                );
              })}

              {user ? (
                <>
                  <div className="h-px my-2" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }} />
                  
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold"
                    style={{ color: isDark ? "rgba(255,255,255,0.8)" : "#1A1A2E" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5 text-[#E6B31E]" />
                    Мой кабинет
                  </Link>
                  
                  <Link
                    to="/messages"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold"
                    style={{ color: isDark ? "rgba(255,255,255,0.8)" : "#1A1A2E" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    <MessageCircle className="w-5 h-5 text-[#E6B31E]" />
                    Сообщения
                    {unreadCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-black text-[#0A1828] bg-gradient-to-r from-[#E6B31E] to-[#F7A31E]">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold"
                    style={{ color: isDark ? "rgba(255,255,255,0.8)" : "#1A1A2E" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="w-5 h-5 text-[#E6B31E]" />
                    Войти
                  </Link>
                </>
              )}

              <Link
                to="/post"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-[#0A1828] text-base mt-2"
                style={{ background: "linear-gradient(135deg, #E6B31E, #F7A31E)" }}
                onClick={() => setMobileOpen(false)}
              >
                <Plus className="w-5 h-5" />
                Разместить объявление
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}