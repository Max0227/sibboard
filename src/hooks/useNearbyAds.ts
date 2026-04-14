import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, type Ad } from "@/lib/supabase";

// ============================================
// ТИПЫ
// ============================================

interface UseNearbyAdsOptions {
  radiusKm?: number;
  limit?: number;
  sortBy?: "distance" | "recent" | "popular" | "price_asc" | "price_desc";
  categoryId?: number | null;
  district?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  isGift?: boolean;
  condition?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  useRealtime?: boolean;
}

export interface AdsWithDistance extends Ad {
  distance_meters?: number;
  distance_km?: number;
}

interface NearbyAdsState {
  ads: AdsWithDistance[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  isRefreshing: boolean;
}

// ============================================
// УТИЛИТЫ
// ============================================

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000;
};

export const formatDistance = (meters: number | undefined): string => {
  if (meters === undefined) return "—";
  if (meters < 1000) {
    return `${Math.round(meters)} м`;
  }
  return `${(meters / 1000).toFixed(1)} км`;
};

// ============================================
// ХУК
// ============================================

export function useNearbyAds(
  lat: number | null,
  lon: number | null,
  options: UseNearbyAdsOptions = {}
) {
  const {
    radiusKm = 50,
    limit = 50,
    sortBy = "recent",
    categoryId = null,
    district = null,
    minPrice = null,
    maxPrice = null,
    isGift = false,
    condition = null,
    autoRefresh = false,
    refreshInterval = 30000,
    useRealtime = true,
  } = options;

  const [state, setState] = useState<NearbyAdsState>({
    ads: [],
    loading: true,
    error: null,
    totalCount: 0,
    hasMore: false,
    isRefreshing: false,
  });

  const [page, setPage] = useState(0);
  const pageSize = 20;
  
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ============================================
  // ЗАГРУЗКА ОБЪЯВЛЕНИЙ (БЕЗ RPC)
  // ============================================

  const fetchAds = useCallback(async (isRefresh = false, pageNum = 0) => {
    if (!lat || !lon) {
      setState(prev => ({ ...prev, loading: false, error: null }));
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!isRefresh) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    } else {
      setState(prev => ({ ...prev, isRefreshing: true }));
    }

    try {
      // Обычный запрос без RPC
      let query = supabase
        .from("ads")
        .select("*", { count: "exact" })
        .eq("status", "active");

      if (categoryId) query = query.eq("category_id", categoryId);
      if (district) query = query.eq("district", district);
      if (minPrice !== null) query = query.gte("price", minPrice);
      if (maxPrice !== null) query = query.lte("price", maxPrice);
      if (isGift) query = query.eq("is_gift", true);
      if (condition) query = query.eq("condition_text", condition);

      // Сортировка
      if (sortBy === "recent") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "popular") {
        query = query.order("views", { ascending: false });
      } else if (sortBy === "price_asc") {
        query = query.order("price", { ascending: true });
      } else if (sortBy === "price_desc") {
        query = query.order("price", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const from = pageNum * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query.abortSignal(abortControllerRef.current.signal);

      if (error) throw error;
      
      const adsData = (data as Ad[]) || [];
      const totalCount = count || 0;

      // Добавляем расстояние
      const adsWithDistance: AdsWithDistance[] = adsData.map(ad => {
        let distance_meters: number | undefined;
        let distance_km: number | undefined;
        
        if (ad.geo_lat && ad.geo_lon) {
          distance_meters = getDistance(lat, lon, ad.geo_lat, ad.geo_lon);
          distance_km = distance_meters / 1000;
        }
        
        return {
          ...ad,
          distance_meters,
          distance_km,
        };
      });

      // Сортируем по расстоянию если нужно
      if (sortBy === "distance") {
        adsWithDistance.sort((a, b) => {
          if (!a.distance_meters) return 1;
          if (!b.distance_meters) return -1;
          return a.distance_meters - b.distance_meters;
        });
      }

      if (mountedRef.current) {
        if (pageNum === 0) {
          setState(prev => ({
            ...prev,
            ads: adsWithDistance,
            loading: false,
            isRefreshing: false,
            error: null,
            totalCount,
            hasMore: totalCount > (pageNum + 1) * pageSize,
          }));
        } else {
          setState(prev => ({
            ...prev,
            ads: [...prev.ads, ...adsWithDistance],
            loading: false,
            isRefreshing: false,
            error: null,
            totalCount,
            hasMore: totalCount > (pageNum + 1) * pageSize,
          }));
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      
      console.error("Failed to fetch ads:", err);
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          isRefreshing: false,
          error: err.message || "Не удалось загрузить объявления",
        }));
      }
    }
  }, [lat, lon, categoryId, district, minPrice, maxPrice, isGift, condition, sortBy, pageSize]);

  // ============================================
  // ПАГИНАЦИЯ
  // ============================================

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAds(false, nextPage);
    }
  }, [state.loading, state.hasMore, page, fetchAds]);

  // ============================================
  // ОБНОВЛЕНИЕ
  // ============================================

  const refresh = useCallback(() => {
    setPage(0);
    fetchAds(true, 0);
  }, [fetchAds]);

  // ============================================
  // REALTIME ПОДПИСКА
  // ============================================

  useEffect(() => {
    if (!useRealtime) return;

    const filter = district ? `status=eq.active AND district=eq.${district}` : "status=eq.active";
    
    channelRef.current = supabase
      .channel("nearby-ads")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ads", filter },
        (payload) => {
          const newAd = payload.new as Ad;
          
          let distance_meters: number | undefined;
          let distance_km: number | undefined;
          
          if (lat && lon && newAd.geo_lat && newAd.geo_lon) {
            distance_meters = getDistance(lat, lon, newAd.geo_lat, newAd.geo_lon);
            distance_km = distance_meters / 1000;
            
            // Проверяем фильтры
            let shouldAdd = true;
            if (categoryId && newAd.category_id !== categoryId) shouldAdd = false;
            if (district && newAd.district !== district) shouldAdd = false;
            if (minPrice !== null && (newAd.price || 0) < minPrice) shouldAdd = false;
            if (maxPrice !== null && (newAd.price || 0) > maxPrice) shouldAdd = false;
            if (isGift && !newAd.is_gift) shouldAdd = false;
            if (condition && newAd.condition_text !== condition) shouldAdd = false;
            
            if (shouldAdd) {
              setState(prev => ({
                ...prev,
                ads: [{ ...newAd, distance_meters, distance_km }, ...prev.ads],
                totalCount: prev.totalCount + 1,
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [useRealtime, district, lat, lon, categoryId, minPrice, maxPrice, isGift, condition]);

  // ============================================
  // АВТООБНОВЛЕНИЕ
  // ============================================

  useEffect(() => {
    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => {
        refresh();
      }, refreshInterval);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, refresh]);

  // ============================================
  // ОСНОВНОЙ ЭФФЕКТ
  // ============================================

  useEffect(() => {
    mountedRef.current = true;
    setPage(0);
    fetchAds(false, 0);

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [lat, lon, categoryId, district, minPrice, maxPrice, isGift, condition, sortBy]);

  // ============================================
  // ВОЗВРАЩАЕМЫЕ ЗНАЧЕНИЯ
  // ============================================

  return {
    ...state,
    refresh,
    loadMore,
    formatDistance: (meters: number | undefined) => formatDistance(meters),
    isEmpty: state.ads.length === 0 && !state.loading,
    retry: refresh,
  };
}