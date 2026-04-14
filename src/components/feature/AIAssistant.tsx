import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Send, 
  Bot, 
  X, 
  Loader2, 
  MapPin, 
  Package, 
  Shield, 
  Camera,
  Zap,
  RefreshCw,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

// ============================================
// ТИПЫ
// ============================================

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  color: string;
}

// ============================================
// КОНСТАНТЫ
// ============================================

const OPENROUTER_API_KEY = "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";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Модели (в порядке приоритета)
const MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "google/gemini-2.0-flash-001",
  "meta-llama/llama-3.3-70b-instruct:free",
  "deepseek/deepseek-chat-v3-0324:free",
  "qwen/qwen2.5-vl-72b-instruct:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "describe",
    label: "Написать описание",
    icon: <Sparkles className="w-4 h-4" />,
    prompt: "Помоги написать продающее описание для моего товара. Я расскажу что продаю, а ты создашь крутой текст.",
    color: "#E6B31E",
  },
  {
    id: "price",
    label: "Оценить товар",
    icon: <Package className="w-4 h-4" />,
    prompt: "Помоги оценить товар. Проанализируй рынок Новосибирска и скажи справедливую цену.",
    color: "#4A9EBF",
  },
  {
    id: "fraud",
    label: "Проверить на мошенничество",
    icon: <Shield className="w-4 h-4" />,
    prompt: "Проверь сделку на безопасность. Я опишу ситуацию, а ты скажешь, есть ли риски.",
    color: "#E76F51",
  },
  {
    id: "photo",
    label: "Советы по фото",
    icon: <Camera className="w-4 h-4" />,
    prompt: "Дай советы как сделать крутые фото для объявления, чтобы оно выделялось.",
    color: "#2A9D8F",
  },
  {
    id: "upgrade",
    label: "Улучшить объявление",
    icon: <Zap className="w-4 h-4" />,
    prompt: "Посмотри моё объявление и скажи, как его улучшить, чтобы быстрее продать.",
    color: "#8E44AD",
  },
];

// Системный промпт с контекстом
const SYSTEM_PROMPT = `Ты — Сибиряк AI, умный помощник для доски объявлений SibBoard (Новосибирск). 

Твои возможности:
- Помогаешь писать продающие описания товаров
- Оцениваешь справедливую цену на основе рынка Новосибирска
- Даёшь советы по безопасным сделкам
- Рекомендуешь как сделать качественные фото
- Анализируешь объявления и предлагаешь улучшения

Стиль общения:
- Дружелюбный, с сибирским колоритом (используй слова "однако", "однозначно", "по-соседски")
- Краткий и полезный
- Используй эмодзи для живости

О районе: если пользователь спрашивает про конкретный район Новосибирска, знай особенности каждого района.

Будь полезным, честным и помогай людям совершать безопасные сделки по-соседски! 🏔️`;

// ============================================
// КОМПОНЕНТ
// ============================================

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "👋 Здарова, сосед! Я Сибиряк AI — твой помощник на SibBoard. Могу помочь с описанием товара, оценкой цены, проверкой сделки или советами по фото. Спрашивай, не стесняйся! 🏔️",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState(MODELS[0]);
  const [modelIndex, setModelIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [contextAds, setContextAds] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { isDark } = useTheme();

  // ============================================
  // ЗАГРУЗКА КОНТЕКСТА (ОБЪЯВЛЕНИЯ ПОЛЬЗОВАТЕЛЯ)
  // ============================================

  useEffect(() => {
    if (!user) return;
    
    const fetchUserAds = async () => {
      const { data } = await supabase
        .from("ads")
        .select("title, price, district, description, condition_text")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(5);
      
      if (data) {
        setContextAds(data);
      }
    };
    
    fetchUserAds();
  }, [user]);

  // ============================================
  // АВТОСКРОЛЛ
  // ============================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ============================================
  // ФОКУС НА ИНПУТ ПРИ ОТКРЫТИИ
  // ============================================

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // ============================================
  // ОТПРАВКА СООБЩЕНИЯ В OPENROUTER
  // ============================================

  const callOpenRouter = useCallback(async (userMessage: string, modelToUse: string): Promise<string | null> => {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "SibBoard AI Assistant",
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.slice(-10).map(m => ({ role: m.role, content: m.text })),
            { role: "user", content: userMessage },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`OpenRouter error with ${modelToUse}:`, errorData);
        return null;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (err) {
      console.error(`Failed to call ${modelToUse}:`, err);
      return null;
    }
  }, [messages]);

  // ============================================
  // ОТПРАВКА С ПЕРЕБОРОМ МОДЕЛЕЙ
  // ============================================

  const sendWithFallback = useCallback(async (userMessage: string): Promise<string> => {
    setError(null);
    
    // Пробуем модели по очереди
    for (let i = 0; i < MODELS.length; i++) {
      const model = MODELS[i];
      setCurrentModel(model);
      setModelIndex(i);
      
      console.log(`🔄 Trying model: ${model}`);
      
      const response = await callOpenRouter(userMessage, model);
      
      if (response) {
        console.log(`✅ Success with model: ${model}`);
        return response;
      }
      
      console.log(`❌ Failed with model: ${model}, trying next...`);
    }
    
    // Если все модели не ответили
    throw new Error("Все модели временно недоступны");
  }, [callOpenRouter]);

  // ============================================
  // ОТПРАВКА СООБЩЕНИЯ
  // ============================================

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);
    
    try {
      // Добавляем контекст объявлений, если есть
      let enhancedMessage = text;
      if (contextAds.length > 0 && (text.includes("объявлен") || text.includes("товар") || text.includes("прода"))) {
        const adsContext = contextAds.map(ad => 
          `- ${ad.title} (${ad.price}₽, ${ad.district}, ${ad.condition_text})`
        ).join("\n");
        enhancedMessage = `${text}\n\nМои активные объявления:\n${adsContext}`;
      }
      
      const response = await sendWithFallback(enhancedMessage);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setError(err.message || "Ошибка соединения");
      
      // Fallback ответ
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "🤔 Однако, что-то пошло не так. Попробуй ещё раз через минутку, сосед! А пока могу подсказать: опиши товар честно, добавь 3-5 качественных фото и поставь цену чуть ниже рынка — так продашь быстрее! 🏔️",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
      setCurrentModel(MODELS[0]);
      setModelIndex(0);
    }
  }, [loading, contextAds, sendWithFallback]);

  // ============================================
  // ОЧИСТКА ЧАТА
  // ============================================

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: "👋 Чат очищен! Я Сибиряк AI — спрашивай что угодно про объявления, цены или безопасные сделки. Всегда рад помочь по-соседски! 🏔️",
        timestamp: new Date(),
      },
    ]);
    setError(null);
  }, []);

  // ============================================
  // РЕНДЕР
  // ============================================

  return (
    <>
      {/* Плавающая кнопка */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-xl"
        style={{
          background: "linear-gradient(135deg, #0B4F6C, #1A3B2E)",
          boxShadow: open ? "0 8px 32px rgba(11,79,108,0.8)" : "0 8px 32px rgba(11,79,108,0.5)",
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
      >
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#E6B31E]/40"
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {open ? (
          <X className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        ) : (
          <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        )}
      </motion.button>

      {/* Окно чата */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[420px] max-h-[600px] rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: isDark ? "rgba(10,24,40,0.98)" : "rgba(255,255,255,0.98)",
              backdropFilter: "blur(30px)",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {/* Шапка */}
            <div
              className="px-5 py-4 flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, rgba(11,79,108,0.9), rgba(26,59,46,0.9))" }}
            >
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-xl bg-white/10">
                  🤖
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0A1828]" />
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                  Сибиряк AI
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E6B31E]/20 text-[#E6B31E]">
                    BETA
                  </span>
                </div>
                <div className="text-[#E6B31E] text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {loading ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {currentModel.split("/")[1]?.split(":")[0] || "AI"}
                    </span>
                  ) : (
                    "Онлайн · Отвечает мгновенно"
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  title="Очистить чат"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Сообщения */}
            <div className="h-80 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "text-[#0A1828] font-medium rounded-br-sm"
                        : "text-white/90 rounded-bl-sm"
                    }`}
                    style={{
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg, #E6B31E, #F7A31E)"
                          : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                      color: msg.role === "user" ? "#0A1828" : (isDark ? "#FFFFFF" : "#1A1A2E"),
                    }}
                  >
                    {msg.text}
                    <div className={`text-[10px] mt-1 opacity-50 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                      {msg.timestamp.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-sm"
                    style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)" }}
                  >
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-[#E6B31E]"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-xs">{error}</span>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Быстрые действия */}
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => sendMessage(action.prompt)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-1.5"
                  style={{
                    background: `${action.color}15`,
                    border: `1px solid ${action.color}30`,
                    color: action.color,
                  }}
                >
                  {action.icon}
                  <span className="hidden sm:inline">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Поле ввода */}
            <div className="px-4 pb-4 pt-2">
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 flex items-center gap-2 rounded-2xl px-4 py-2.5"
                  style={{ 
                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.02)",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                    placeholder="Спроси Сибиряка..."
                    disabled={loading}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30 disabled:opacity-50"
                    style={{ color: isDark ? "#FFFFFF" : "#1A1A2E" }}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ 
                      background: input.trim() && !loading 
                        ? "linear-gradient(135deg, #E6B31E, #F7A31E)" 
                        : "transparent",
                    }}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Send className={`w-4 h-4 ${input.trim() ? "text-[#0A1828]" : "text-white/40"}`} />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Индикатор модели */}
              {loading && modelIndex > 0 && (
                <div className="mt-2 flex items-center justify-center gap-1 text-white/30 text-[10px]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Пробуем резервную модель...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}