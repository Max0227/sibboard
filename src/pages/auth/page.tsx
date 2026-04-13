import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Smartphone,
  Lock,
  User,
  Mountain,
  ChevronRight,
  RefreshCw,
  Shield,
  Eye,
  EyeOff,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

type Step = "phone" | "otp" | "name";

// Форматирование телефона для отображения
const maskPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 11) return phone;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
};

// Форматирование номера для API
const formatPhone = (val: string): string => {
  const digits = val.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.startsWith("8")) return "+7" + digits.slice(1);
  if (digits.startsWith("7")) return "+" + digits;
  if (digits.length > 0) return "+7" + digits;
  return "";
};

const validatePhone = (phoneNumber: string): boolean => {
  const digits = phoneNumber.replace(/\D/g, "");
  return digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"));
};

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useAuth();
  const { isDark } = useTheme();
  
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  
  const otpInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Получаем редирект из state
  const from = (location.state as any)?.from || "/";
  const mode = (location.state as any)?.mode || "signin";

  // Таймер для повторной отправки кода
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Автофокус на OTP поле
  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  // Автофокус на поле имени
  useEffect(() => {
    if (step === "name" && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [step]);

  // Обработка вставки кода из SMS
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (step !== "otp") return;
      const pasted = e.clipboardData?.getData("text") || "";
      const digits = pasted.replace(/\D/g, "").slice(0, 6);
      if (digits.length === 6) {
        setOtp(digits);
        setTimeout(() => handleVerifyOTP(digits), 100);
      }
    };
    
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [step]);

  const handleSendOTP = async () => {
    setError("");
    setSuccess("");
    
    const formatted = formatPhone(phone);
    
    if (!validatePhone(phone)) {
      setError("Введи корректный номер телефона (11 цифр, начинается с 7 или 8)");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        phone: formatted,
        options: {
          shouldCreateUser: true,
          channel: "sms",
        },
      });
      
      if (err) {
        console.error("OTP error:", err);
        
        if (err.message.includes("SMS sending is not enabled")) {
          setError("📱 Тестовый режим: используй код 123456");
        } else if (err.message.includes("rate limit")) {
          setError("Слишком много попыток. Подожди немного.");
        } else {
          setError("Ошибка отправки SMS. Попробуй ещё раз.");
        }
        setLoading(false);
      } else {
        setSuccess(`Код отправлен на ${maskPhone(formatted)}`);
        setStep("otp");
        setCountdown(60);
        setCanResend(false);
        setLoading(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Что-то пошло не так. Попробуй позже.");
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (manualOtp?: string) => {
    const codeToVerify = manualOtp || otp;
    
    setError("");
    
    if (codeToVerify.length < 6) {
      setError("Код должен содержать 6 цифр");
      return;
    }
    
    setLoading(true);
    const formatted = formatPhone(phone);
    
    console.log("📱 Verifying OTP for:", formatted);
    
    try {
      const { data, error: err } = await supabase.auth.verifyOtp({
        phone: formatted,
        token: codeToVerify,
        type: "sms",
      });
      
      console.log("✅ Verify result:", { user: data?.user?.id, error: err?.message });
      
      if (err) {
        console.error("❌ Verify error:", err.message);
        
        if (err.message.includes("Invalid")) {
          setError("Неверный код. Проверь и попробуй ещё раз.");
        } else if (err.message.includes("expired")) {
          setError("Код истёк. Запроси новый.");
        } else {
          setError("Ошибка проверки кода");
        }
        setLoading(false);
        return;
      }
      
      if (data.user) {
        console.log("✅ User authenticated:", data.user.id);
        
        // Проверяем профиль
        const { data: profile } = await supabase
          .from("users")
          .select("name, phone")
          .eq("id", data.user.id)
          .maybeSingle();
        
        console.log("✅ Profile check:", profile);
        
        if (!profile) {
          // Создаём профиль
          await supabase.from("users").insert({
            id: data.user.id,
            phone: formatted,
            name: "",
            created_at: new Date().toISOString(),
          });
          setLoading(false);
          setStep("name");
        } else if (!profile.name || profile.name === "Пользователь") {
          setLoading(false);
          setStep("name");
        } else {
          await refreshProfile?.();
          setLoading(false);
          navigate(from);
        }
      } else {
        setLoading(false);
        setError("Не удалось войти. Попробуй ещё раз.");
      }
    } catch (err: any) {
      console.error("❌ Exception:", err.message);
      setError(err.message || "Ошибка соединения");
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      navigate(from);
      return;
    }
    
    if (trimmedName.length < 2) {
      setError("Имя должно быть не короче 2 символов");
      return;
    }
    
    if (trimmedName.length > 50) {
      setError("Имя слишком длинное");
      return;
    }
    
    if (!/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/.test(trimmedName)) {
      setError("Имя может содержать только буквы, пробелы и дефис");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error: updateError } = await supabase
          .from("users")
          .update({ 
            name: trimmedName,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
        
        if (updateError) {
          console.error("Name update error:", updateError);
          setError("Ошибка сохранения имени");
          setLoading(false);
          return;
        }
      }
      
      await refreshProfile?.();
      navigate(from);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Что-то пошло не так");
      setLoading(false);
    }
  };

  const handleSkipName = () => {
    navigate(from);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhone(value);
    
    if (formatted.length <= 12) {
      setPhone(formatted);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    
    // Автоматическая отправка при 6 цифрах
    if (value.length === 6) {
      setTimeout(() => handleVerifyOTP(value), 100);
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setError("");
    setOtp("");
    setSuccess("");
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && otp.length === 6) {
      handleVerifyOTP();
    }
  };

  const inputClasses = `
    w-full px-5 py-4 rounded-2xl text-base outline-none transition-all duration-200
    bg-white/5 border-2 border-white/10
    focus:border-[#E6B31E] focus:bg-white/10
    placeholder:text-white/30
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: isDark 
          ? "linear-gradient(135deg, #020C18 0%, #0A1828 50%, #0D2035 100%)"
          : "linear-gradient(135deg, #F0F6FF 0%, #E8F0FE 50%, #D4E8C2 100%)",
        fontFamily: "Nunito, sans-serif",
      }}
    >
      {/* Декоративные элементы */}
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

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="relative w-full max-w-md"
      >
        {/* Логотип */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #E6B31E, #F7A31E)" }}
            >
              <Mountain className="w-8 h-8 text-[#0A1828]" />
            </div>
            <span 
              className="text-3xl font-black tracking-tight"
              style={{
                background: "linear-gradient(135deg, #E6B31E, #F7A31E)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              SIBBOARD
            </span>
          </motion.div>
          <p className="text-white/40 text-sm">
            {mode === "signup" ? "Создай аккаунт" : "Войди в аккаунт"}
          </p>
        </div>

        {/* Карточка */}
        <div 
          className="rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
          style={{
            background: isDark 
              ? "rgba(255,255,255,0.03)" 
              : "rgba(255,255,255,0.7)",
            border: isDark 
              ? "1px solid rgba(255,255,255,0.08)" 
              : "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <AnimatePresence mode="wait">
            {/* ШАГ 1: Телефон */}
            {step === "phone" && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#E6B31E]/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-[#E6B31E]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-white">
                      Вход по номеру
                    </h1>
                    <p className="text-white/40 text-sm">
                      Пришлём код в SMS
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">
                      Номер телефона
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="+7 (999) 123-45-67"
                      className={inputClasses}
                      style={{ color: isDark ? "#FFFFFF" : "#1A1A2E" }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span className="text-red-400 text-sm">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl font-black text-[#0A1828] text-base disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    style={{
                      background: loading
                        ? "rgba(230,179,30,0.4)"
                        : "linear-gradient(135deg, #E6B31E, #F7A31E)",
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Отправляем...
                      </>
                    ) : (
                      <>
                        Получить код
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-[#E6B31E]/5 border border-[#E6B31E]/20">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#E6B31E] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white/70 text-xs mb-2">
                        Нажимая кнопку, ты соглашаешься с{" "}
                        <button className="text-[#E6B31E] hover:underline">
                          условиями использования
                        </button>
                        {" "}и подтверждаешь, что тебе есть 18 лет.
                      </p>
                      <p className="text-white/40 text-[10px]">
                        Мы отправим SMS с кодом подтверждения. Это бесплатно.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ШАГ 2: OTP */}
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                <button
                  onClick={handleBackToPhone}
                  className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#E6B31E]/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#E6B31E]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      Код из SMS
                    </h2>
                    <p className="text-white/40 text-sm">
                      Отправили на {maskPhone(formatPhone(phone))}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">
                      Шестизначный код
                    </label>
                    <div className="relative">
                      <input
                        ref={otpInputRef}
                        type={showOtp ? "text" : "password"}
                        inputMode="numeric"
                        value={otp}
                        onChange={handleOtpChange}
                        onKeyDown={handleOtpKeyDown}
                        placeholder="••••••"
                        className={`${inputClasses} text-center text-3xl font-bold tracking-[0.5em] pr-12`}
                        style={{ 
                          color: isDark ? "#FFFFFF" : "#1A1A2E",
                          letterSpacing: "0.5em" 
                        }}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOtp(!showOtp)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showOtp ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-white/30 text-[10px] mt-2 text-center">
                      Код можно вставить из буфера обмена (Ctrl+V)
                    </p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span className="text-red-400 text-sm">{error}</span>
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-green-400 text-sm">{success}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleVerifyOTP()}
                    disabled={loading || otp.length !== 6}
                    className="w-full py-4 rounded-2xl font-black text-[#0A1828] text-base disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    style={{
                      background: loading
                        ? "rgba(230,179,30,0.4)"
                        : "linear-gradient(135deg, #E6B31E, #F7A31E)",
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Проверяем...
                      </>
                    ) : (
                      "Войти"
                    )}
                  </motion.button>

                  <button
                    onClick={handleSendOTP}
                    disabled={loading || !canResend}
                    className="flex items-center justify-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors disabled:opacity-30"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {countdown > 0 
                      ? `Отправить повторно (${countdown}с)`
                      : "Отправить код повторно"
                    }
                  </button>
                </div>
              </motion.div>
            )}

            {/* ШАГ 3: Имя */}
            {step === "name" && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">👋</div>
                  <h2 className="text-2xl font-black text-white mb-2">
                    Как тебя зовут?
                  </h2>
                  <p className="text-white/40 text-sm">
                    Это имя увидят покупатели и продавцы
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">
                      Твоё имя
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Например: Алексей"
                        className={`${inputClasses} pl-12`}
                        style={{ color: isDark ? "#FFFFFF" : "#1A1A2E" }}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                        disabled={loading}
                      />
                    </div>
                    {name.trim() && (
                      <button
                        onClick={() => setName("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span className="text-red-400 text-sm">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveName}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl font-black text-[#0A1828] text-base disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #E6B31E, #F7A31E)",
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Сохраняем...
                      </>
                    ) : (
                      <>
                        Начать пользоваться
                        <span className="text-xl">🚀</span>
                      </>
                    )}
                  </motion.button>

                  <button
                    onClick={handleSkipName}
                    className="text-white/30 hover:text-white/60 text-sm text-center transition-colors"
                  >
                    Пропустить (можно указать позже)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ссылка на главную */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-white/30 hover:text-white/60 text-sm transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться на главную
          </button>
        </div>
      </motion.div>
    </div>
  );
}