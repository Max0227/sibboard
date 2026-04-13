import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Send, 
  ArrowLeft, 
  ExternalLink, 
  Loader2, 
  Check, 
  CheckCheck,
  MessageSquare,
  Search,
  Package
} from "lucide-react";
import Navbar from "@/components/feature/Navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

// ============================================
// ТИПЫ
// ============================================

interface Conversation {
  id: number;
  ad_id: number;
  buyer_id: string;
  seller_id: string;
  last_message: string | null;
  last_message_at: string;
  buyer_unread: number;
  seller_unread: number;
  ad: any;
  buyer: any;
  seller: any;
}

interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  text: string;
  is_read: boolean;
  created_at: string;
}

// ============================================
// УТИЛИТЫ
// ============================================

const formatTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} д`;
  return new Date(dateStr).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};

const formatMessageTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};

// ============================================
// КОМПОНЕНТЫ
// ============================================

const Avatar = ({ name, url, size = 40 }: { name: string; url?: string | null; size?: number }) => {
  const initials = name?.charAt(0).toUpperCase() || "?";
  
  return (
    <div className="relative flex-shrink-0">
      <div 
        className="rounded-full flex items-center justify-center overflow-hidden"
        style={{ 
          width: size, 
          height: size,
          background: url ? "transparent" : "linear-gradient(135deg, #E6B31E, #F7A31E)",
        }}
      >
        {url ? (
          <img src={url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span 
            className="font-black text-[#0A1828]"
            style={{ fontSize: size * 0.4 }}
          >
            {initials}
          </span>
        )}
      </div>
    </div>
  );
};

const ConversationSkeleton = () => (
  <div className="flex items-center gap-3 p-3 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }}>
    <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-3 rounded w-2/3" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="h-2.5 rounded w-full" style={{ background: "rgba(255,255,255,0.05)" }} />
    </div>
  </div>
);

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function MessagesPage() {
  const { chatId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<any>(null);

  // ============================================
  // ЭФФЕКТЫ
  // ============================================

  useEffect(() => {
    if (!user) {
      navigate("/auth", { state: { from: "/messages" } });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (chatId && conversations.length > 0) {
      const conv = conversations.find((c) => String(c.id) === chatId);
      if (conv) selectConversation(conv);
    }
  }, [chatId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeConv?.id) return;

    const channel = supabase
      .channel(`messages:${activeConv.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConv.id}`,
        },
        (payload: any) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConv.id
                ? { ...c, last_message: newMsg.text, last_message_at: newMsg.created_at }
                : c
            )
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [activeConv?.id]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  }, [text]);

  // ============================================
  // ЗАГРУЗКА ДАННЫХ
  // ============================================

  const fetchConversations = async () => {
    if (!user) return;
    
    setLoadingConvs(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id, ad_id, buyer_id, seller_id, last_message, last_message_at, buyer_unread, seller_unread,
          ad:ads(id, title, photos, price, status),
          buyer:users!conversations_buyer_id_fkey(id, name, avatar_url),
          seller:users!conversations_seller_id_fkey(id, name, avatar_url)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      
      setConversations((data as Conversation[]) || []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setError("Не удалось загрузить диалоги");
    } finally {
      setLoadingConvs(false);
    }
  };

  const selectConversation = useCallback(async (conv: Conversation) => {
    setActiveConv(conv);
    setLoadingMsgs(true);
    setError(null);
    navigate(`/messages/${conv.id}`, { replace: true });

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      setMessages((data as Message[]) || []);

      if (user) {
        const isBuyer = conv.buyer_id === user.id;
        
        
        await supabase
          .from("conversations")
          .update(isBuyer ? { buyer_unread: 0 } : { seller_unread: 0 })
          .eq("id", conv.id);

        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id);

        setConversations((prev) =>
          prev.map((c) =>
            c.id === conv.id
              ? { ...c, [isBuyer ? "buyer_unread" : "seller_unread"]: 0 }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError("Не удалось загрузить сообщения");
    } finally {
      setLoadingMsgs(false);
    }
  }, [user, navigate]);

  // ============================================
  // ОТПРАВКА СООБЩЕНИЯ
  // ============================================

  const sendMessage = async () => {
    if (!text.trim() || !activeConv || !user || sending) return;
    
    const messageText = text.trim();
    setText("");
    setSending(true);
    setError(null);

    const tempId = -Date.now();
    const tempMsg: Message = {
      id: tempId,
      conversation_id: activeConv.id,
      sender_id: user.id,
      text: messageText,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, tempMsg]);

    try {

      const { data: inserted, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: activeConv.id,
          sender_id: user.id,
          text: messageText,
        })
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? (inserted as Message) : m))
      );

      const isBuyer = activeConv.buyer_id === user.id;
      const unreadField = isBuyer ? "seller_unread" : "buyer_unread";
      
      await supabase
        .from("conversations")
        .update({
          last_message: messageText,
          last_message_at: new Date().toISOString(),
          [unreadField]: (activeConv[unreadField] || 0) + 1,
        })
        .eq("id", activeConv.id);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? {
                ...c,
                last_message: messageText,
                last_message_at: new Date().toISOString(),
                [unreadField]: (c[unreadField] || 0) + 1,
              }
            : c
        )
      );

      textareaRef.current?.focus();
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Не удалось отправить сообщение");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setText(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ============================================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ============================================

  const getOtherUser = (conv: Conversation) => {
    if (!user) return null;
    return conv.buyer_id === user.id ? conv.seller : conv.buyer;
  };

  const getUnread = (conv: Conversation) => {
    if (!user) return 0;
    return conv.buyer_id === user.id ? conv.buyer_unread : conv.seller_unread;
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      const other = getOtherUser(conv);
      return (
        other?.name?.toLowerCase().includes(query) ||
        conv.ad?.title?.toLowerCase().includes(query) ||
        conv.last_message?.toLowerCase().includes(query)
      );
    });
  }, [conversations, searchQuery, user]);

  const totalUnread = conversations.reduce((sum, c) => sum + getUnread(c), 0);

  if (!user) return null;

  // ============================================
  // РЕНДЕР
  // ============================================

  return (
    <div 
      style={{ 
        background: isDark ? "#0A1828" : "#F0F6FF", 
        minHeight: "100vh",
        fontFamily: "Nunito, sans-serif" 
      }}
    >
      <Navbar />
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-4">
        <div 
          className="flex gap-0 h-[calc(100vh-100px)] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl"
          style={{ 
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
            background: isDark ? "#0A1828" : "#FFFFFF",
          }}
        >
          {/* ============================================ */}
          {/* САЙДБАР С ДИАЛОГАМИ */}
          {/* ============================================ */}
          <div 
            className={`flex flex-col ${activeConv ? "hidden md:flex" : "flex"} w-full md:w-[360px] flex-shrink-0`}
            style={{ 
              background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
              borderRight: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div className="p-4 md:p-5 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-black flex items-center gap-2" style={{ color: isDark ? "#FFFFFF" : "#1A1A2E" }}>
                  <MessageSquare className="w-5 h-5 text-[#E6B31E]" />
                  Сообщения
                </h1>
                {totalUnread > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-black text-[#0A1828]" style={{ background: "linear-gradient(135deg,#E6B31E,#F7A31E)" }}>
                    {totalUnread}
                  </span>
                )}
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по диалогам..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                    border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
                    color: isDark ? "#FFFFFF" : "#1A1A2E",
                  }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="flex flex-col gap-2 p-3">
                  {[1, 2, 3, 4].map((i) => <ConversationSkeleton key={i} />)}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="text-5xl mb-4">⚠️</div>
                  <p className="text-white/60 mb-4">{error}</p>
                  <button onClick={fetchConversations} className="px-4 py-2 rounded-xl text-sm font-bold text-[#0A1828]" style={{ background: "linear-gradient(135deg,#E6B31E,#F7A31E)" }}>
                    Попробовать снова
                  </button>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Package className="w-16 h-16 text-white/20 mb-4" />
                  <h3 className="font-black text-lg mb-2" style={{ color: isDark ? "#FFFFFF" : "#1A1A2E" }}>
                    {searchQuery ? "Ничего не найдено" : "Нет диалогов"}
                  </h3>
                  <p className="text-white/40 text-sm mb-4">
                    {searchQuery ? "Попробуйте изменить запрос" : "Напишите продавцу с карточки объявления"}
                  </p>
                  <button onClick={() => navigate("/")} className="px-5 py-2.5 rounded-xl font-bold text-[#0A1828] text-sm" style={{ background: "linear-gradient(135deg,#E6B31E,#F7A31E)" }}>
                    Смотреть объявления
                  </button>
                </div>
              ) : (
                <div className="p-3 flex flex-col gap-1">
                  {filteredConversations.map((conv) => {
                    const other = getOtherUser(conv);
                    const unread = getUnread(conv);
                    const isActive = activeConv?.id === conv.id;
                    
                    return (
                      <motion.button
                        key={conv.id}
                        whileHover={{ x: 2 }}
                        onClick={() => selectConversation(conv)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all cursor-pointer"
                        style={{
                          background: isActive ? (isDark ? "rgba(230,179,30,0.1)" : "rgba(230,179,30,0.08)") : "transparent",
                          border: isActive ? "1px solid rgba(230,179,30,0.2)" : "1px solid transparent",
                        }}
                      >
                        <Avatar name={other?.name || "?"} url={other?.avatar_url} size={48} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-sm font-bold truncate ${unread > 0 ? (isDark ? "text-white" : "text-[#1A1A2E]") : (isDark ? "text-white/60" : "text-gray-500")}`}>
                              {other?.name || "Пользователь"}
                            </span>
                            <span className="text-white/30 text-[10px] flex-shrink-0 ml-2">{formatTimeAgo(conv.last_message_at)}</span>
                          </div>
                          <div className="text-[#E6B31E] text-xs truncate mb-0.5">{conv.ad?.title || "Объявление"}</div>
                          <div className="flex items-center gap-1">
                            <span className={`text-xs truncate flex-1 ${unread > 0 ? (isDark ? "text-white/70 font-semibold" : "text-gray-700 font-semibold") : (isDark ? "text-white/30" : "text-gray-400")}`}>
                              {conv.last_message || "Начните диалог"}
                            </span>
                            {unread > 0 && (
                              <span className="w-5 h-5 rounded-full text-[10px] font-black text-[#0A1828] flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#E6B31E,#F7A31E)" }}>
                                {unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* ОБЛАСТЬ ЧАТА */}
          {/* ============================================ */}
          <div className={`flex-1 flex flex-col ${!activeConv ? "hidden md:flex" : "flex"}`} style={{ background: isDark ? "#0A1828" : "#FFFFFF" }}>
            {!activeConv ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl mb-6">💬</motion.div>
                <h2 className="text-2xl font-black mb-2" style={{ color: isDark ? "#FFFFFF" : "#1A1A2E" }}>Выберите диалог</h2>
                <p className="text-white/40 text-sm">Выберите переписку слева или напишите продавцу с карточки объявления</p>
              </div>
            ) : (
              <>
                {/* Заголовок чата */}
                <div className="flex items-center gap-3 px-4 md:px-5 py-3 border-b flex-shrink-0" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
                  <button onClick={() => { setActiveConv(null); navigate("/messages"); }} className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer transition-colors hover:bg-white/10">
                    <ArrowLeft className="w-5 h-5 text-white/50" />
                  </button>
                  
                  <Avatar name={getOtherUser(activeConv)?.name || "?"} url={getOtherUser(activeConv)?.avatar_url} size={40} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-base truncate" style={{ color: isDark ? "#FFFFFF" : "#1A1A2E" }}>{getOtherUser(activeConv)?.name || "Пользователь"}</div>
                    <button onClick={() => navigate(`/ads/${activeConv.ad_id}`)} className="text-[#E6B31E] text-xs truncate cursor-pointer hover:underline text-left">{activeConv.ad?.title || "Объявление"}</button>
                  </div>
                  
                  <button onClick={() => navigate(`/ads/${activeConv.ad_id}`)} className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors hover:bg-white/5 flex-shrink-0" style={{ border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)" }}>
                    {activeConv.ad?.photos?.[0] ? <img src={activeConv.ad.photos[0]} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" /> : <Package className="w-4 h-4 text-white/30" />}
                    <ExternalLink className="w-4 h-4 text-white/40" />
                  </button>
                </div>

                {/* Сообщения */}
                <div className="flex-1 overflow-y-auto px-4 md:px-5 py-4 flex flex-col gap-2">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-[#E6B31E] animate-spin" /></div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-white/60 mb-4">{error}</p>
                      <button onClick={() => activeConv && selectConversation(activeConv)} className="px-4 py-2 rounded-xl text-sm font-bold text-[#0A1828]" style={{ background: "linear-gradient(135deg,#E6B31E,#F7A31E)" }}>Попробовать снова</button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="text-4xl mb-3">👋</div>
                      <p className="text-white/40 text-sm">Начните диалог — напишите первое сообщение!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, i) => {
                        const isOwn = msg.sender_id === user?.id;
                        const prevMsg = messages[i - 1];
                        const showHeader = !prevMsg || prevMsg.sender_id !== msg.sender_id || new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 5 * 60 * 1000;
                        
                        return (
                          <div key={msg.id}>
                            {showHeader && <div className="text-center text-white/25 text-xs my-2">{formatTimeAgo(msg.created_at)}</div>}
                            <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2 }} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                              <div
                                className="max-w-[75%] md:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed break-words"
                                style={{
                                  background: isOwn ? "linear-gradient(135deg,#E6B31E,#F7A31E)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"),
                                  color: isOwn ? "#0A1828" : (isDark ? "rgba(255,255,255,0.85)" : "#1A1A2E"),
                                  borderRadius: isOwn ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
                                  fontWeight: isOwn ? 500 : 400,
                                }}
                              >
                                {msg.text}
                                <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isOwn ? "text-[#0A1828]/50" : "text-white/30"}`}>
                                  {formatMessageTime(msg.created_at)}
                                  {isOwn && (msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Поле ввода */}
                <div className="px-4 md:px-5 py-4 border-t flex-shrink-0" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
                  <div className="flex items-end gap-2 md:gap-3">
                    <div className="flex-1 rounded-2xl px-4 py-2.5" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)" }}>
                      <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Написать сообщение..."
                        rows={1}
                        className="w-full bg-transparent text-sm outline-none resize-none"
                        style={{ color: isDark ? "#FFFFFF" : "#1A1A2E", maxHeight: 120 }}
                      />
                    </div>
                    
                    <motion.button
                      whileHover={text.trim() ? { scale: 1.05 } : {}}
                      whileTap={text.trim() ? { scale: 0.95 } : {}}
                      onClick={sendMessage}
                      disabled={!text.trim() || sending}
                      className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-2xl flex-shrink-0 cursor-pointer transition-all disabled:opacity-50"
                      style={{ background: text.trim() && !sending ? "linear-gradient(135deg,#E6B31E,#F7A31E)" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)") }}
                    >
                      {sending ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Send className={`w-5 h-5 ${text.trim() ? "text-[#0A1828]" : "text-white/30"}`} />}
                    </motion.button>
                  </div>
                  <p className="text-white/20 text-[10px] mt-2 hidden md:block">Enter — отправить · Shift+Enter — новая строка</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}