import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Loader2,
  Package,
  MapPin,
  Phone,
  Tag,
  Gift,
  Camera,
  Sparkles,
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import AIAssistant from "@/components/feature/AIAssistant";
import PhotoUploader from "./components/PhotoUploader";
import AIDescriptionGenerator from "./components/AIDescriptionGenerator";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

// ============================================
// КОНСТАНТЫ
// ============================================

const CATEGORIES = [
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
  { id: "11", name: "Хобби", icon: "🎨" },
  { id: "12", name: "Бытовая техника", icon: "🧺" },
];

const CONDITIONS = ["Новое", "Отличное", "Хорошее", "Удовлетворительное"];
const DISTRICTS = [
  "Академгородок", "Центр", "Левый берег", "Калининский", 
  "Октябрьский", "Советский", "Железнодорожный", "Заельцовский",
  "Дзержинский", "Кировский", "Ленинский", "Первомайский"
];

const STORY_CHIPS = [
  { label: "Купил обновку", emoji: "💎" },
  { label: "Переезд", emoji: "🚚" },
  { label: "Ребёнок вырос", emoji: "👶" },
  { label: "Не пригодилось", emoji: "📦" },
  { label: "Подарок", emoji: "🎁" },
  { label: "Апгрейд", emoji: "⬆️" },
  { label: "Другое", emoji: "💬" },
];

const STEPS = [
  { name: "Категория", icon: "📂" },
  { name: "Фото", icon: "📸" },
  { name: "Описание", icon: "📝" },
  { name: "Детали", icon: "⚙️" },
];

// ============================================
// ТИПЫ
// ============================================

interface FormData {
  category: string;
  photos: string[];
  title: string;
  description: string;
  price: string;
  condition: string;
  district: string;
  address: string;
  story: string;
  isGift: boolean;
  phone: string;
}

interface FormErrors {
  category?: string;
  photos?: string;
  title?: string;
  description?: string;
  price?: string;
  district?: string;
  phone?: string;
}

// ============================================
// КОМПОНЕНТ
// ============================================

export default function PostPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  
  const { user, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadingAd, setLoadingAd] = useState(!!editId);
  
  const [form, setForm] = useState<FormData>({
    category: "",
    photos: [],
    title: "",
    description: "",
    price: "",
    condition: "Отличное",
    district: "",
    address: "",
    story: "",
    isGift: false,
    phone: "",
  });

  // ============================================
  // ЭФФЕКТЫ
  // ============================================

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { state: { from: "/post" } });
    }
  }, [user, authLoading, navigate]);

  // Загрузка объявления для редактирования
  useEffect(() => {
    if (!editId || !user) return;
    
    const fetchAd = async () => {
      setLoadingAd(true);
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("id", parseInt(editId))
        .eq("user_id", user.id)
        .single();
      
      if (!error && data) {
        setForm({
          category: String(data.category_id || ""),
          photos: Array.isArray(data.photos) ? data.photos.filter((p): p is string => typeof p === "string") : [],
          title: data.title || "",
          description: data.description || "",
          price: data.price ? String(data.price) : "",
          condition: data.condition_text || "Отличное",
          district: data.district || "",
          address: data.address || "",
          story: data.story_reason || "",
          isGift: data.is_gift || false,
          phone: user.phone || "",
        });
      }
      setLoadingAd(false);
    };
    
    fetchAd();
  }, [editId, user]);

  // Заполняем телефон из профиля
  useEffect(() => {
    if (user?.phone && !form.phone) {
      setForm(prev => ({ ...prev, phone: user.phone || "" }));
    }
  }, [user, form.phone]);

  // ============================================
  // ВАЛИДАЦИЯ
  // ============================================

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: FormErrors = {};
    
    if (stepIndex === 0) {
      if (!form.category) newErrors.category = "Выбери категорию";
    }
    
    if (stepIndex === 1) {
      if (form.photos.length === 0) newErrors.photos = "Добавь хотя бы одно фото";
    }
    
    if (stepIndex === 2) {
      if (form.title.trim().length < 3) newErrors.title = "Название должно быть не короче 3 символов";
      if (form.description.trim().length < 10) newErrors.description = "Описание должно быть не короче 10 символов";
    }
    
    if (stepIndex === 3) {
      if (!form.isGift && !form.price) newErrors.price = "Укажи цену или отметь 'Отдам даром'";
      if (!form.district) newErrors.district = "Выбери район";
      if (!form.phone) newErrors.phone = "Укажи телефон для связи";
      if (form.phone && !form.phone.match(/^\+?[0-9\s\-()]{10,}$/)) {
        newErrors.phone = "Некорректный номер телефона";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // ОБРАБОТЧИКИ
  // ============================================

  const set = (key: keyof FormData, val: unknown) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    // Очищаем ошибку поля при изменении
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3) || !user) return;
    
    setSubmitting(true);
    setSubmitError("");
    
    try {
      const adData = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: form.isGift ? null : parseFloat(form.price) || null,
        is_gift: form.isGift,
        category_id: parseInt(form.category) || null,
        city_id: 1,
        district: form.district,
        address: form.address.trim() || null,
        photos: form.photos,
        condition_text: form.condition,
        story_reason: form.story || null,
        user_id: user.id,
        status: "active",
        updated_at: new Date().toISOString(),
      };
      
      let error;
      
      if (editId) {
        // Обновление существующего
        const { error: updateError } = await supabase
          .from("ads")
          .update(adData)
          .eq("id", parseInt(editId))
          .eq("user_id", user.id);
        error = updateError;
      } else {
        // Создание нового
        const { error: insertError } = await supabase
          .from("ads")
          .insert({ ...adData, created_at: new Date().toISOString() });
        error = insertError;
      }
      
      if (error) throw error;
      
      setSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError("Ошибка при публикации. Попробуй ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = CATEGORIES.find((c) => c.id === form.category);

  // ============================================
  // СТИЛИ
  // ============================================

  const inputClasses = `
    w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200
    bg-white/5 border border-white/10
    focus:border-[#E6B31E] focus:bg-white/10
    placeholder:text-white/30
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const labelClasses = "text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block";

  // ============================================
  // РЕНДЕР
  // ============================================

  if (authLoading || loadingAd) {
    return (
      <div style={{ background: isDark ? "#0A1828" : "#F0F6FF", minHeight: "100vh" }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 text-[#E6B31E] animate-spin" />
        </div>
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
      
      <div className="max-w-2xl mx-auto px-4 pt-24 sm:pt-28 pb-20">
        {/* Заголовок */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Назад
          </button>
          <h1 className="text-3xl font-black text-white">
            {editId ? "Редактировать объявление" : "Подать объявление"}
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Бесплатно · {editId ? "Изменения сохранятся сразу" : "AI-помощник включён"}
          </p>
        </motion.div>

        {/* Шаги */}
        {!submitted && (
          <div className="flex items-center gap-0 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.name} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <motion.div
                    animate={{
                      background: i < step 
                        ? "linear-gradient(135deg,#E6B31E,#F7A31E)" 
                        : i === step 
                          ? "linear-gradient(135deg,#0B4F6C,#1A3B2E)" 
                          : "rgba(255,255,255,0.08)",
                      borderColor: i <= step ? "#E6B31E" : "rgba(255,255,255,0.1)",
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border"
                    style={{ color: i <= step ? "white" : "rgba(255,255,255,0.3)" }}
                  >
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </motion.div>
                  <span 
                    className="text-[10px] font-semibold whitespace-nowrap hidden sm:block"
                    style={{ color: i === step ? "#E6B31E" : "rgba(255,255,255,0.3)" }}
                  >
                    {s.name}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div 
                    className="flex-1 h-0.5 mx-1" 
                    style={{ 
                      background: i < step 
                        ? "linear-gradient(90deg,#E6B31E,#F7A31E)" 
                        : "rgba(255,255,255,0.08)" 
                    }} 
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl p-6 md:p-8"
              style={{ 
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {/* ШАГ 1: Категория */}
              {step === 0 && (
                <div>
                  <h2 className="text-xl font-black text-white mb-2">Выбери категорию</h2>
                  <p className="text-white/40 text-sm mb-6">Это поможет покупателям найти твоё объявление</p>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {CATEGORIES.map((cat) => (
                      <motion.button
                        key={cat.id}
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => set("category", cat.id)}
                        className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all"
                        style={{
                          background: form.category === cat.id 
                            ? "rgba(230,179,30,0.15)" 
                            : "rgba(255,255,255,0.04)",
                          border: `1px solid ${form.category === cat.id 
                            ? "rgba(230,179,30,0.5)" 
                            : "rgba(255,255,255,0.07)"}`,
                        }}
                      >
                        <span className="text-2xl sm:text-3xl">{cat.icon}</span>
                        <span 
                          className="text-xs font-bold text-center"
                          style={{ 
                            color: form.category === cat.id ? "#E6B31E" : "rgba(255,255,255,0.6)" 
                          }}
                        >
                          {cat.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  
                  {errors.category && (
                    <p className="text-red-400 text-sm mt-4 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.category}
                    </p>
                  )}
                </div>
              )}

              {/* ШАГ 2: Фото */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-black text-white mb-2">Добавь фотографии</h2>
                  <p className="text-white/40 text-sm mb-6">
                    Объявления с фото получают в 5 раз больше откликов
                  </p>
                  
                  <PhotoUploader 
                    photos={form.photos} 
                    onChange={(photos) => set("photos", photos)} 
                  />
                  
                  {errors.photos && (
                    <p className="text-red-400 text-sm mt-4 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.photos}
                    </p>
                  )}
                  
                  <div 
                    className="mt-5 rounded-2xl p-4 flex gap-3"
                    style={{ 
                      background: "rgba(11,79,108,0.2)", 
                      border: "1px solid rgba(11,79,108,0.4)" 
                    }}
                  >
                    <Camera className="w-5 h-5 text-[#4A9EBF] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white/70 text-xs font-bold mb-1">
                        Советы от Сибиряка AI
                      </div>
                      <ul className="text-white/40 text-xs space-y-0.5">
                        <li>• Снимай при дневном свете</li>
                        <li>• Чистый однотонный фон</li>
                        <li>• Покажи все ракурсы и дефекты</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ШАГ 3: Описание */}
              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <h2 className="text-xl font-black text-white">Опиши товар</h2>
                  
                  <div>
                    <label className={labelClasses}>
                      Название <span className="text-[#E6B31E]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => set("title", e.target.value.slice(0, 80))}
                      placeholder="Например: iPhone 15 Pro Max 256GB"
                      className={inputClasses}
                      style={{ color: isDark ? "#FFFFFF" : "#1A1A2E" }}
                      maxLength={80}
                    />
                    <div className="text-right text-white/20 text-xs mt-1">
                      {form.title.length}/80
                    </div>
                    {errors.title && (
                      <p className="text-red-400 text-xs mt-1">{errors.title}</p>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelClasses}>
                        Описание <span className="text-[#E6B31E]">*</span>
                      </label>
                      <AIDescriptionGenerator
                        title={form.title}
                        category={selectedCategory?.name || ""}
                        condition={form.condition}
                        onGenerated={(desc, price) => {
                          set("description", desc);
                          if (price) set("price", String(price));
                        }}
                      />
                    </div>
                    <textarea
  value={form.description}
  onChange={(e) => set("description", e.target.value.slice(0, 500))}
  placeholder="Расскажи о товаре подробнее: состояние, комплектация, причина продажи..."
  rows={5}
  className={inputClasses}
  style={{ resize: "none", color: isDark ? "#FFFFFF" : "#1A1A2E" }}
/>
<div className="text-right text-white/20 text-xs mt-1">
  {form.description.length}/500
</div>
                    {errors.description && (
                      <p className="text-red-400 text-xs mt-1">{errors.description}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className={labelClasses}>Почему продаёшь?</label>
                    <div className="flex flex-wrap gap-2">
                      {STORY_CHIPS.map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => set("story", form.story === chip.label ? "" : chip.label)}
                          className="px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                          style={{
                            background: form.story === chip.label 
                              ? "rgba(230,179,30,0.15)" 
                              : "rgba(255,255,255,0.05)",
                            border: `1px solid ${form.story === chip.label 
                              ? "rgba(230,179,30,0.4)" 
                              : "rgba(255,255,255,0.08)"}`,
                            color: form.story === chip.label ? "#E6B31E" : "rgba(255,255,255,0.5)",
                          }}
                        >
                          {chip.emoji} {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ШАГ 4: Детали */}
              {step === 3 && (
                <div className="flex flex-col gap-5">
                  <h2 className="text-xl font-black text-white">Детали объявления</h2>
                  
                  {/* Цена */}
                  <div>
                    <label className={labelClasses}>
                      Цена, ₽ <span className="text-[#E6B31E]">*</span>
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => set("price", e.target.value)}
                        placeholder="0"
                        className={`${inputClasses} pl-11 pr-16`}
                        style={{ color: isDark ? "#FFFFFF" : "#1A1A2E" }}
                        disabled={form.isGift}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-bold">
                        ₽
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        set("isGift", !form.isGift);
                        if (!form.isGift) set("price", "");
                      }}
                      className="flex items-center gap-2 mt-2"
                    >
                      <div 
                        className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                        style={{ 
                          background: form.isGift 
                            ? "linear-gradient(135deg,#E6B31E,#F7A31E)" 
                            : "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        {form.isGift && <Check className="w-3 h-3 text-[#0A1828]" />}
                      </div>
                      <span className="text-white/50 text-sm flex items-center gap-1">
                        <Gift className="w-4 h-4" /> Отдам бесплатно
                      </span>
                    </button>
                    
                    {errors.price && (
                      <p className="text-red-400 text-xs mt-1">{errors.price}</p>
                    )}
                  </div>
                  
                  {/* Состояние */}
                  <div>
                    <label className={labelClasses}>Состояние</label>
                    <div className="flex flex-wrap gap-2">
                      {CONDITIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => set("condition", c)}
                          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                          style={{
                            background: form.condition === c 
                              ? "rgba(230,179,30,0.15)" 
                              : "rgba(255,255,255,0.05)",
                            border: `1px solid ${form.condition === c 
                              ? "rgba(230,179,30,0.4)" 
                              : "rgba(255,255,255,0.08)"}`,
                            color: form.condition === c ? "#E6B31E" : "rgba(255,255,255,0.5)",
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Район */}
                  <div>
                    <label className={labelClasses}>
                      Район <span className="text-[#E6B31E]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <select
                        value={form.district}
                        onChange={(e) => set("district", e.target.value)}
                        className={`${inputClasses} pl-11`}
                        style={{ color: form.district ? (isDark ? "#FFFFFF" : "#1A1A2E") : "rgba(255,255,255,0.3)" }}
                      >
                        <option value="" disabled>Выбери район</option>
                        {DISTRICTS.map((d) => (
                          <option key={d} value={d} style={{ background: isDark ? "#0A1828" : "#FFFFFF" }}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.district && (
                      <p className="text-red-400 text-xs mt-1">{errors.district}</p>
                    )}
                  </div>
                  
                  {/* Адрес */}
                  <div>
                    <label className={labelClasses}>Адрес встречи</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      placeholder="Улица, дом или ориентир"
                      className={inputClasses}
                      style={{ color: isDark ? "#FFFFFF" : "#1A1A2E" }}
                    />
                  </div>
                  
                  {/* Телефон */}
                  <div>
                    <label className={labelClasses}>
                      Телефон <span className="text-[#E6B31E]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="+7 (999) 123-45-67"
                        className={`${inputClasses} pl-11`}
                        style={{ color: isDark ? "#FFFFFF" : "#1A1A2E" }}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* Успех */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl p-10 text-center"
              style={{ 
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }} 
                className="text-7xl mb-6"
              >
                {editId ? "✅" : "🎉"}
              </motion.div>
              <h2 className="text-3xl font-black text-white mb-3">
                {editId ? "Объявление обновлено!" : "Объявление подано!"}
              </h2>
              <p className="text-white/50 text-base mb-8 leading-relaxed">
                {form.title ? `«${form.title}» ` : ""}
                {editId ? "Изменения сохранены." : "успешно размещено и появится в ленте."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/dashboard")}
                  className="px-8 py-3.5 rounded-2xl font-bold text-[#0A1828]"
                  style={{ background: "linear-gradient(135deg,#E6B31E,#F7A31E)" }}
                >
                  <Package className="w-4 h-4 inline mr-2" />
                  Мои объявления
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/")}
                  className="px-8 py-3.5 rounded-2xl font-bold text-white"
                  style={{ 
                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  На главную
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Кнопки навигации */}
        {!submitted && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white/50 hover:text-white text-sm transition-colors"
                style={{ 
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                {step === 0 ? "Отмена" : "Назад"}
              </button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={step === STEPS.length - 1 ? handleSubmit : handleNext}
                disabled={submitting}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg,#E6B31E,#F7A31E)",
                  color: "#0A1828",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editId ? "Сохраняем..." : "Публикуем..."}
                  </>
                ) : step === STEPS.length - 1 ? (
                  <>
                    {editId ? "Сохранить" : "Разместить"}
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Далее
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
            
            {submitError && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-red-400 text-sm text-center mt-3 flex items-center justify-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                {submitError}
              </motion.p>
            )}
          </div>
        )}
      </div>
      
      <Footer />
      <AIAssistant />
    </div>
  );
}