import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const QUICK_ACTIONS = [
  "Помоги написать описание",
  "Какая цена справедливая?",
  "Проверь на мошенничество",
  "Советы для фото",
];

const BOT_RESPONSES: Record<string, string> = {
  "Помоги написать описание":
    "Конечно! Расскажи мне о товаре: что это, в каком состоянии, сколько лет использовался? Я составлю продающее описание за секунды 🚀",
  "Какая цена справедливая?":
    "Чтобы оценить товар, скажи мне: что продаёшь, год покупки и состояние. Я проанализирую рынок Новосибирска и дам рекомендацию 💰",
  "Проверь на мошенничество":
    "Отправь мне ссылку на объявление или опиши ситуацию. Я проверю по базе мошенников и дам оценку безопасности сделки 🛡️",
  "Советы для фото":
    "Для крутых фото: 1) Снимай при дневном свете 2) Чистый фон 3) Несколько ракурсов 4) Покажи дефекты честно — это повышает доверие! 📸",
};

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      text: "Привет! Я Сибиряк — твой AI-помощник 🏔️ Помогу написать описание, оценить товар или проверить сделку на безопасность.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response =
        BOT_RESPONSES[text] ||
        "Отличный вопрос! Я анализирую данные рынка Новосибирска... Могу помочь с описанием товара, оценкой цены или проверкой безопасности сделки. Что именно тебя интересует? 🤔";
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", text: response };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #0B4F6C, #1A3B2E)",
          boxShadow: "0 8px 32px rgba(11,79,108,0.5)",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        animate={{ boxShadow: open ? "0 8px 32px rgba(11,79,108,0.8)" : "0 8px 32px rgba(11,79,108,0.5)" }}
      >
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#E6B31E]/40"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-2xl">{open ? "✕" : "🤖"}</span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-28 right-8 z-50 w-[380px] rounded-3xl overflow-hidden"
            style={{
              background: "rgba(10,24,40,0.95)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, rgba(11,79,108,0.8), rgba(26,59,46,0.8))" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-white/10">
                🤖
              </div>
              <div>
                <div className="text-white font-bold text-sm" style={{ fontFamily: "Nunito, sans-serif" }}>
                  Сибиряк AI
                </div>
                <div className="text-[#E6B31E] text-xs font-medium">Онлайн • Отвечает мгновенно</div>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "text-[#0A1828] font-semibold rounded-br-sm"
                        : "text-white/90 rounded-bl-sm"
                    }`}
                    style={{
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg, #E6B31E, #F7A31E)"
                          : "rgba(255,255,255,0.08)",
                      fontFamily: "Nunito, sans-serif",
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-sm"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-[#E6B31E]"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-white/80 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                  style={{
                    background: "rgba(230,179,30,0.15)",
                    border: "1px solid rgba(230,179,30,0.3)",
                    fontFamily: "Nunito, sans-serif",
                  }}
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2">
              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-2"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Спроси Сибиряка..."
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30"
                  style={{ fontFamily: "Nunito, sans-serif" }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #E6B31E, #F7A31E)" }}
                >
                  <i className="ri-send-plane-fill text-[#0A1828] text-sm" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
