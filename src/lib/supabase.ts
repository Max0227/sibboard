import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Типизированный клиент
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "sibboard_auth",
  },
  db: {
    schema: "public",
  },
});

// Экспорт типов
export type { Database };
export type Ad = Database["public"]["Tables"]["ads"]["Row"];
export type AdInsert = Database["public"]["Tables"]["ads"]["Insert"];
export type AdUpdate = Database["public"]["Tables"]["ads"]["Update"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type District = Database["public"]["Tables"]["districts"]["Row"];
export type City = Database["public"]["Tables"]["cities"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

// ============================================
// API ХЕЛПЕРЫ (полностью типизированные)
// ============================================

export const api = {
  ads: {
    nearby: (lat: number, lon: number, radiusKm = 10) =>
      supabase.rpc("nearby_ads", { lat, lon, radius_km: radiusKm }),
    
    getWithSeller: (id: number) =>
      supabase
        .from("ads")
        .select(`
          *,
          seller:users!ads_user_id_fkey(
            id, name, avatar_url, rating, deals_count, 
            is_verified, badges, home_district
          )
        `)
        .eq("id", id)
        .single(),
    
    incrementViews: (adId: number) =>
      supabase.rpc("increment_ad_views", { ad_id: adId }),
    
    search: (query: string, filters?: { district?: string; categoryId?: number }) => {
      let q = supabase
        .from("ads")
        .select("*")
        .eq("status", "active")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false });
      
      if (filters?.district) q = q.eq("district", filters.district);
      if (filters?.categoryId) q = q.eq("category_id", filters.categoryId);
      
      return q;
    },
  },
  
  users: {
    getProfile: (userId: string) =>
      supabase.from("users").select("*").eq("id", userId).single(),
    
    getUserAds: (userId: string) =>
      supabase
        .from("ads")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    
    getFavorites: (userId: string) =>
      supabase
        .from("favorites")
        .select("ad_id, ads(*)")
        .eq("user_id", userId),
    
    addToFavorites: (userId: string, adId: number) =>
      supabase.from("favorites").insert({ user_id: userId, ad_id: adId }),
    
    removeFromFavorites: (userId: string, adId: number) =>
      supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("ad_id", adId),
  },
  
  categories: {
    getAll: () =>
      supabase.from("categories").select("*").order("sort_order"),
    
    getTop: (limit = 8) =>
      supabase
        .from("categories")
        .select(`
          *,
          ads_count:ads(count)
        `)
        .eq("ads.status", "active")
        .order("sort_order")
        .limit(limit),
  },
  
  districts: {
    getAll: () =>
      supabase.from("districts").select("*").eq("is_active", true),
    
    findDistrict: (lat: number, lon: number) =>
      supabase.rpc("find_district_by_point", { point_lat: lat, point_lon: lon }),
  },
  
  cities: {
    getAll: () =>
      supabase.from("cities").select("*").eq("is_active", true),
  },
  
  conversations: {
    getUserConversations: (userId: string) =>
      supabase
        .from("conversations")
        .select(`
          *,
          ad:ads(id, title, photos, price),
          buyer:users!conversations_buyer_id_fkey(id, name, avatar_url),
          seller:users!conversations_seller_id_fkey(id, name, avatar_url)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order("last_message_at", { ascending: false }),
    
    getMessages: (conversationId: number) =>
      supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }),
    
    sendMessage: (conversationId: number, senderId: string, text: string) =>
      supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: senderId, text }),
    
    markAsRead: (conversationId: number, userId: string, isBuyer: boolean) =>
      supabase
        .from("conversations")
        .update(isBuyer ? { buyer_unread: 0 } : { seller_unread: 0 })
        .eq("id", conversationId),
  },
  
  storage: {
    uploadImage: (file: File, userId: string) =>
      supabase.storage
        .from("ad-images")
        .upload(`${userId}/${Date.now()}_${file.name}`, file, {
          cacheControl: "3600",
          upsert: false,
        }),
    
    getPublicUrl: (path: string) =>
      supabase.storage.from("ad-images").getPublicUrl(path).data.publicUrl,
  },
  
  realtime: {
    subscribeToNewAds: (callback: (ad: Ad) => void) =>
      supabase
        .channel("public:ads")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "ads" },
          (payload) => callback(payload.new as Ad)
        )
        .subscribe(),
    
    subscribeToMessages: (conversationId: number, callback: (msg: Message) => void) =>
      supabase
        .channel(`conversation:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => callback(payload.new as Message)
        )
        .subscribe(),
  },
};

// ============================================
// УТИЛИТЫ
// ============================================

export const getImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return api.storage.getPublicUrl(path);
};

export const formatPrice = (price: number | null, isGift: boolean = false) => {
  if (isGift) return "Отдам даром";
  if (price === null || price === 0) return "Цена не указана";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
};