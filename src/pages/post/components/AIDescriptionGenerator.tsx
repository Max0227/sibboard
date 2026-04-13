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
  Zap
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

interface GeneratedData {
  desc: string;
  price: number;
  hashtags: string[];
  tips: string[];
}

// ============================================
// AI-БАЗА ДАННЫХ (расширенная)
// ============================================

const AI_DATABASE: Record<string, GeneratedData & { variations: string[] }> = {
  "Электроника": {
    desc: "Продаю в отличном состоянии, использовался аккуратно. Все функции работают исправно, без царапин и сколов. Полный комплект: коробка, зарядное устройство, документы. Батарея держит заряд отлично.",
    price: 25000,
    hashtags: ["#электроника", "#гаджеты", "#новосибирск"],
    tips: ["Сделай фото включенного экрана", "Покажи серийный номер", "Укажи дату покупки"],
    variations: [
      "Продаю в идеальном состоянии, как новый. Все функции работают безупречно.",
      "Отличный вариант для тех, кто хочет сэкономить. Состояние на 5+.",
    ],
  },
  "Мебель": {
    desc: "Продаю в хорошем состоянии, без серьёзных дефектов. Использовалась в жилом помещении, регулярно чистилась. Все механизмы работают исправно. Самовывоз, помогу с разборкой.",
    price: 15000,
    hashtags: ["#мебель", "#дом", "#новосибирск"],
    tips: ["Укажи точные размеры", "Сфотографируй с разных ракурсов", "Напиши причину продажи"],
    variations: [
      "Мебель в отличном состоянии, прослужит ещё долго. Все механизмы как новые.",
      "Продаю за ненадобностью. Состояние хорошее, без сколов и царапин.",
    ],
  },
  "Одежда": {
    desc: "Продаю вещь в отличном состоянии, носилась несколько раз. Оригинал, все бирки сохранены. Размер соответствует стандартной размерной сетке. Стирка деликатная, форма не потеряна.",
    price: 3500,
    hashtags: ["#одежда", "#стиль", "#новосибирск"],
    tips: ["Укажи точные замеры", "Сфотографируй бирку", "Опиши материал"],
    variations: [
      "Вещь в идеальном состоянии, как из магазина. Надевалась пару раз.",
      "Продаю, потому что не подошёл размер. Вещь новая, все бирки на месте.",
    ],
  },
  "Авто": {
    desc: "Продаю автомобиль в хорошем техническом состоянии. Регулярное ТО, все работы задокументированы. Кузов без серьёзных повреждений, салон чистый. Один владелец. Полный пакет документов.",
    price: 850000,
    hashtags: ["#авто", "#продажаавто", "#новосибирск"],
    tips: ["Сфотографируй пробег", "Покажи VIN", "Укажи расходы на обслуживание"],
    variations: [
      "Автомобиль в отличном состоянии, обслужен, готов к поездкам.",
      "Продаю в связи с покупкой нового. Машина ухоженная, без вложений.",
    ],
  },
  "Недвижимость": {
    desc: "Продаётся квартира в хорошем состоянии. Чистый подъезд, развитая инфраструктура, рядом школа, детский сад, магазины. Один взрослый собственник, документы готовы к сделке.",
    price: 4500000,
    hashtags: ["#недвижимость", "#квартира", "#новосибирск"],
    tips: ["Укажи этаж и площадь", "Сфотографируй вид из окна", "Опиши инфраструктуру"],
    variations: [
      "Квартира с хорошим ремонтом, заезжай и живи. Все документы готовы.",
      "Продаю просторную квартиру в хорошем районе. Торг уместен.",
    ],
  },
  "Игры": {
    desc: "Продаю игру в отличном состоянии. Диск без царапин, коробка целая, все коды активированы/не активированы. Отправка почтой или встреча в центре.",
    price: 2500,
    hashtags: ["#игры", "#ps5", "#xbox", "#новосибирск"],
    tips: ["Сфотографируй диск на свет", "Укажи платформу", "Напиши про онлайн-коды"],
    variations: [
      "Игра в идеальном состоянии, пройдена один раз. Диск как новый.",
      "Продаю коллекционное издание. Все бонусы не активированы.",
    ],
  },
  "Детское": {
    desc: "Продаю детские вещи в хорошем состоянии. Всё чистое, без пятен и повреждений. Ребёнок вырос, поэтому продаю. Пакетом — скидка.",
    price: 2000,
    hashtags: ["#детское", "#длямам", "#новосибирск"],
    tips: ["Укажи возраст ребёнка", "Сфотографируй без складок", "Напиши про комплектность"],
    variations: [
      "Детские вещи в отличном состоянии, всё чистое и аккуратное.",
      "Продаю пакетом — очень выгодно. Вещи как новые.",
    ],
  },
  "Спорт": {
    desc: "Продаю спортивный инвентарь в отличном состоянии. Использовался сезон, без дефектов. Самовывоз или встреча по договорённости.",
    price: 8000,
    hashtags: ["#спорт", "#фитнес", "#новосибирск"],
    tips: ["Сфотографируй в действии", "Укажи бренд и модель", "Напиши о состоянии"],
    variations: [
      "Спортивный инвентарь в идеальном состоянии. Использовался аккуратно.",
      "Продаю за ненадобностью. Всё работает отлично, без нареканий.",
    ],
  },
  "default": {
    desc: "Продаю в отличном состоянии, использовалось аккуратно. Все функции работают исправно. Причина продажи — больше не нужно. Возможен торг при осмотре.",
    price: 5000,
    hashtags: ["#продажа", "#новосибирск", "#sibboard"],
    tips: ["Сделай качественные фото", "Укажи точную цену", "Опиши состояние"],
    variations: [
      "Продаю в хорошем состоянии. Все вопросы в личку.",
      "Отличная вещь, продаю за ненадобностью. Торг уместен.",
    ],
  },
};

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
  const [useAiPhoto, setUseAiPhoto] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingRef = useRef<NodeJS.Timeout | null>(null);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Анимация текста загрузки
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

  // Очистка интервалов
  useEffect(() => {
    return () => {
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

  const generate = useCallback(() => {
    stopTyping();
    setLoading(true);
    setDisplayedText("");
    setDone(false);
    setGeneratedPrice(null);
    setCopied(false);

    // Имитация запроса к AI (можно заменить на реальный API)
    intervalRef.current = setTimeout(() => {
      const categoryData = AI_DATABASE[category] || AI_DATABASE["default"];
      
      // Выбираем случайную вариацию или основное описание
      const useVariation = Math.random() > 0.5 && categoryData.variations?.length > 0;
      const baseDesc = useVariation 
        ? categoryData.variations[Math.floor(Math.random() * categoryData.variations.length)]
        : categoryData.desc;
      
      // Добавляем информацию о фото, если они есть
      const photoHint = photos && photos.length > 0 
        ? `\n\n📸 На фото видно состояние. ` 
        : "";
      
      // Формируем полный текст
      const fullText = `${baseDesc}${photoHint}\n\n📍 ${condition} состояние. ${title ? `«${title}»` : "Товар"} ждёт нового владельца!\n\n${categoryData.hashtags?.join(" ") || ""}`;
      
      setLoading(false);
      setGeneratedPrice(categoryData.price);
      setGeneratedHashtags(categoryData.hashtags || []);
      setGeneratedTips(categoryData.tips || []);

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
    }, 2500);
  }, [category, condition, title, photos, stopTyping]);

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

  // Определяем, можно ли анализировать фото
  const canAnalyzePhoto = photos && photos.length > 0;

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
        {/* Анимированный фон */}
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
            {/* Задник */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
              onClick={handleClose}
            />

            {/* Модалка */}
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

                  {/* Результат */}
                  {!loading && (
                    <>
                      {/* Сгенерированный текст */}
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
                        
                        {/* Кнопка копирования */}
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

                      {/* Рекомендуемая цена */}
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

                      {/* Советы по улучшению */}
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

                      {/* Анализ фото (если есть) */}
                      {canAnalyzePhoto && !useAiPhoto && done && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => setUseAiPhoto(true)}
                          className="w-full mb-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-purple-500/20 transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                          Проанализировать фото с AI
                        </motion.button>
                      )}

                      {useAiPhoto && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mb-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20"
                        >
                          <p className="text-white/60 text-xs">
                            📸 AI проанализировал фото: "Товар выглядит аккуратно, без видимых дефектов. Рекомендую добавить фото с разных ракурсов."
                          </p>
                        </motion.div>
                      )}

                      {/* Кнопки действий */}
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