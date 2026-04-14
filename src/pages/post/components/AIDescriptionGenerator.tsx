import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  X, 
  RefreshCw, 
  Check, 
  TrendingUp,
  Loader2,
  MapPin,
  Tag,
  Camera,
  Wand2,
  Copy,
  ThumbsUp,
  Zap,
  AlertCircle
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

// ============================================
// ТИПЫ
// ============================================

interface AIDescriptionGeneratorProps {
  title: string;
  category: string;
  condition: string;
  photos?: string[];
  onGenerated: (desc: string, price: number) => void;
}

// ============================================
// OPENROUTER КОНФИГУРАЦИЯ
// ============================================

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Модели в порядке приоритета
const MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "google/gemini-2.0-flash-001",
  "meta-llama/llama-3.3-70b-instruct:free",
  "deepseek/deepseek-chat-v3-0324:free",
  "qwen/qwen2.5-vl-72b-instruct:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
];

const TYPING_SPEED = 12;
const LOADING_MESSAGES = [
  "Анализирую рынок Новосибирска",
  "Подбираю лучшее описание",
  "Считаю оптимальную цену",
  "Проверяю похожие объявления",
  "Добавляю сибирский вайб",
  "Почти готово...",
];

// ============================================
// КОМПОНЕНТ
// ============================================

export default function AIDescriptionGenerator({
  title,
  category,
  condition,
  photos,
  onGenerated,
}: AIDescriptionGeneratorProps) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [generatedPrice, setGeneratedPrice] = useState<number | null>(null);
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [generatedTips, setGeneratedTips] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState(MODELS[0]);
  const [modelIndex, setModelIndex] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingRef = useRef<NodeJS.Timeout | null>(null);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // ============================================
  // АНИМАЦИЯ ЗАГРУЗКИ
  // ============================================

  useEffect(() => {
    if (loading) {
      messageIntervalRef.current = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 1000);
      return () => {
        if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
      };
    }
  }, [loading]);

  // ============================================
  // ОЧИСТКА
  // ============================================

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (typingRef.current) clearInterval(typingRef.current);
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    };
  }, []);

  const stopTyping = useCallback(() => {
    if (typingRef.current) {
      clearInterval(typingRef.current);
      typingRef.current = null;
    }
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
      messageIntervalRef.current = null;
    }
  }, []);

  // ============================================
  // ЗАПРОС К OPENROUTER
  // ============================================

  const callOpenRouter = useCallback(async (modelToUse: string): Promise<string | null> => {
    try {
      const systemPrompt = `Ты — Сибиряк AI, эксперт по продажам на доске объявлений в Новосибирске.
Твоя задача — написать продающее описание для товара.

Правила:
1. Описание должно быть на русском языке
2. Используй сибирский колорит (слова "однако", "по-соседски", "сибирский")
3. Длина: 300-500 символов
4. Укажи состояние товара: ${condition}
5. Добавь 3-5 хештегов в конце
6. Предложи справедливую цену в рублях (отдельно от описания)

Формат ответа:
ОПИСАНИЕ: [текст описания]
ЦЕНА: [число]
ХЕШТЕГИ: [хештеги через пробел]
СОВЕТЫ: [3 коротких совета через запятую]`;

      const userPrompt = `Напиши продающее описание для товара: "${title}" в категории "${category}". Состояние: ${condition}. ${photos && photos.length > 0 ? 'Есть фотографии.' : ''}`;

      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "SibBoard AI Generator",
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 800,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        console.error(`OpenRouter error with ${modelToUse}:`, response.status);
        return null;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (err) {
      console.error(`Failed to call ${modelToUse}:`, err);
      return null;
    }
  }, [title, category, condition, photos]);

  // ============================================
  // ПАРСИНГ ОТВЕТА AI
  // ============================================

  const parseAIResponse = (response: string): { 
    description: string; 
    price: number; 
    hashtags: string[]; 
    tips: string[] 
  } => {
    let description = "";
    let price = 5000;
    const hashtags: string[] = [];
    const tips: string[] = [];

    const lines = response.split("\n");
    
    for (const line of lines) {
      if (line.toUpperCase().includes("ОПИСАНИЕ:")) {
        description = line.replace(/ОПИСАНИЕ:/i, "").trim();
      } else if (line.toUpperCase().includes("ЦЕНА:")) {
        const priceMatch = line.match(/\d+/);
        if (priceMatch) {
          price = parseInt(priceMatch[0]);
        }
      } else if (line.toUpperCase().includes("ХЕШТЕГИ:")) {
        const tagsStr = line.replace(/ХЕШТЕГИ:/i, "").trim();
        tagsStr.split(/\s+/).forEach(tag => {
          if (tag.startsWith("#")) hashtags.push(tag);
        });
      } else if (line.toUpperCase().includes("СОВЕТЫ:")) {
        const tipsStr = line.replace(/СОВЕТЫ:/i, "").trim();
        tipsStr.split(/[.,;]/).forEach(tip => {
          const trimmed = tip.trim();
          if (trimmed) tips.push(trimmed);
        });
      }
    }

    // Fallback если не распарсилось
    if (!description) {
      description = response;
    }
    if (hashtags.length === 0) {
      hashtags.push("#новосибирск", "#sibboard", "#продажа");
    }
    if (tips.length === 0) {
      tips.push("Сделай качественные фото", "Укажи точную цену", "Будь вежлив с покупателями");
    }

    return { description, price, hashtags, tips };
  };

  // ============================================
  // ГЕНЕРАЦИЯ С FALLBACK
  // ============================================

  const generateWithAI = useCallback(async (): Promise<{
    description: string;
    price: number;
    hashtags: string[];
    tips: string[];
  } | null> => {
    setError(null);

    for (let i = 0; i < MODELS.length; i++) {
      const model = MODELS[i];
      setCurrentModel(model);
      setModelIndex(i);
      
      const response = await callOpenRouter(model);
      
      if (response) {
        return parseAIResponse(response);
      }
    }

    return null;
  }, [callOpenRouter]);

  // ============================================
  // ЗАПУСК ГЕНЕРАЦИИ
  // ============================================

  const generate = useCallback(async () => {
    stopTyping();
    setLoading(true);
    setDisplayedText("");
    setDone(false);
    setGeneratedPrice(null);
    setCopied(false);
    setError(null);

    try {
      const result = await generateWithAI();

      if (!result) {
        throw new Error("Не удалось сгенерировать описание");
      }

      const { description, price, hashtags, tips } = result;
      
      const fullText = `${description}\n\n${hashtags.join(" ")}`;
      
      if (mountedRef.current) {
        setLoading(false);
        setGeneratedPrice(price);
        setGeneratedHashtags(hashtags);
        setGeneratedTips(tips);

        // Эффект печатающей машинки
        let i = 0;
        typingRef.current = setInterval(() => {
          i++;
          setDisplayedText(fullText.slice(0, i));
          if (i >= fullText.length) {
            clearInterval(typingRef.current!);
            typingRef.current = null;
            setDone(true);
          }
        }, TYPING_SPEED);
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      if (mountedRef.current) {
        setError(err.message || "Ошибка генерации");
        setLoading(false);
      }
    }
  }, [stopTyping, generateWithAI]);

  // ============================================
  // ОБРАБОТЧИКИ
  // ============================================

  const handleApply = useCallback(() => {
    if (generatedPrice !== null && displayedText) {
      onGenerated(displayedText, generatedPrice);
      setOpen(false);
      stopTyping();
    }
  }, [generatedPrice, displayedText, onGenerated, stopTyping]);

  const handleClose = useCallback(() => {
    setOpen(false);
    stopTyping();
  }, [stopTyping]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(displayedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [displayedText]);

  const handleRetry = useCallback(() => {
    generate();
  }, [generate]);

  // ============================================
  // РЕНДЕР
  // ============================================

  return (
    <div>
      {/* Кнопка активации */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => { setOpen(true); generate(); }}
        className="relative group flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all overflow-hidden"
        style={{
          background: isDark 
            ? "linear-gradient(135deg, rgba(11,79,108,0.8), rgba(26,59,46,0.8))"
            : "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))",
          border: isDark 
            ? "1px solid rgba(230,179,30,0.4)" 
            : "1px solid rgba(37,99,235,0.3)",
          color: isDark ? "#E6B31E" : "#2563EB",
        }}
      >
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: isDark 
              ? "linear-gradient(135deg, rgba(230,179,30,0.1), rgba(247,163,30,0.1))"
              : "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))",
          }}
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        <Sparkles className="w-4 h-4 relative z-10" />
        <span className="relative z-10">AI-генерация</span>
        <Zap className="w-3 h-3 relative z-10 opacity-60" />
      </motion.button>

      {/* Модальное окно */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
              onClick={handleClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="w-full max-w-xl rounded-3xl overflow-hidden pointer-events-auto shadow-2xl"
                style={{
                  background: isDark ? "rgba(10,24,40,0.98)" : "rgba(255,255,255,0.98)",
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {/* Шапка */}
                <div
                  className="px-6 py-5 flex items-center gap-3"
                  style={{
                    background: isDark 
                      ? "linear-gradient(135deg, rgba(11,79,108,0.9), rgba(26,59,46,0.9))"
                      : "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))",
                  }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#E6B31E] to-[#F7A31E] shadow-lg">
                      <Wand2 className="w-6 h-6 text-[#0A1828]" />
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-black text-base flex items-center gap-2">
                      Сибиряк AI
                      <span className="px-2 py-0.5 rounded-full bg-[#E6B31E]/20 text-[#E6B31E] text-[10px] font-bold">
                        BETA
                      </span>
                    </div>
                    <div className="text-[#E6B31E] text-xs font-medium">
                      {title ? `«${title.slice(0, 35)}${title.length > 35 ? "…" : ""}»` : "Генерация описания"}
                    </div>
                    {loading && modelIndex > 0 && (
                      <div className="text-white/40 text-[10px] mt-0.5 flex items-center gap-1">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        Резервная модель...
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Загрузка */}
                  {loading && (
                    <div className="flex flex-col items-center gap-6 py-8">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-[#E6B31E]/20 border-t-[#E6B31E] animate-spin" />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#E6B31E]" />
                      </div>
                      <div className="text-center">
                        <motion.div
                          key={messageIndex}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-white/70 text-sm font-medium"
                        >
                          {LOADING_MESSAGES[messageIndex]}
                        </motion.div>
                        <div className="text-white/30 text-xs mt-1 flex items-center justify-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Новосибирск
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ошибка */}
                  {!loading && error && (
                    <div className="py-8 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-3">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                      </div>
                      <p className="text-red-400 text-sm mb-4">{error}</p>
                      <button
                        onClick={handleRetry}
                        className="px-4 py-2 rounded-xl bg-[#E6B31E] text-[#0A1828] font-bold text-sm"
                      >
                        Попробовать снова
                      </button>
                    </div>
                  )}

                  {/* Результат */}
                  {!loading && !error && (
                    <>
                      <div className="relative">
                        <div
                          className="rounded-2xl p-5 mb-3 text-sm leading-relaxed text-white/85 bg-white/5 border border-white/10 max-h-[200px] overflow-y-auto"
                          style={{ fontFamily: "Nunito, sans-serif" }}
                        >
                          {displayedText}
                          {!done && (
                            <motion.span
                              className="inline-block w-0.5 h-4 bg-[#E6B31E] ml-0.5 align-middle"
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                            />
                          )}
                        </div>
                        
                        {done && (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={handleCopy}
                            className="absolute top-2 right-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-white/50" />
                            )}
                          </motion.button>
                        )}
                      </div>

                      {generatedPrice !== null && done && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 rounded-2xl p-4 mb-4 bg-gradient-to-r from-[#E6B31E]/10 to-[#F7A31E]/10 border border-[#E6B31E]/30"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#E6B31E]/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-[#E6B31E]" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white/50 text-xs">
                              Рекомендуемая цена по рынку НСК
                            </div>
                            <div className="text-2xl font-black text-[#E6B31E]">
                              {generatedPrice.toLocaleString()} ₽
                            </div>
                          </div>
                          <Tag className="w-5 h-5 text-white/30" />
                        </motion.div>
                      )}

                      {done && generatedTips.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="mb-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <ThumbsUp className="w-4 h-4 text-blue-400" />
                            <span className="text-white/70 text-xs font-bold">Советы для лучших продаж:</span>
                          </div>
                          <ul className="text-white/50 text-xs space-y-1">
                            {generatedTips.slice(0, 3).map((tip, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-blue-400">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={generate}
                          className="flex-1 py-3 rounded-xl font-bold text-sm text-white/60 hover:text-white transition-colors bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Сгенерировать ещё
                        </button>
                        
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleApply}
                          disabled={!done}
                          className="flex-1 py-3 rounded-xl font-bold text-sm text-[#0A1828] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                          style={{
                            background: done 
                              ? "linear-gradient(135deg, #E6B31E, #F7A31E)"
                              : "rgba(255,255,255,0.1)",
                          }}
                        >
                          <Check className="w-4 h-4" />
                          Применить
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}