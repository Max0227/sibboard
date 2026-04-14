import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

// ============================================
// ТИПЫ
// ============================================

interface Location {
  lat: number;
  lon: number;
  accuracy: number;
}

interface District {
  id: number;
  name: string;
  area: string | null;
  center_lat: number | null;
  center_lon: number | null;
  city_id: number | null;
  is_active: boolean;
  created_at: string;
}

interface DistrictWithMeta extends District {
  short_name?: string;
  slug?: string;
  color?: string;
  icon?: string;
}

interface GeoLocationState {
  location: Location | null;
  district: DistrictWithMeta | null;
  error: string | null;
  loading: boolean;
  permission: "granted" | "denied" | "prompt" | "unknown";
  isWatching: boolean;
}

interface UseGeoLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
  cacheTime?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// ============================================
// КОНСТАНТЫ
// ============================================

const DEFAULT_LOCATION: Location = {
  lat: 55.0302,
  lon: 82.9204,
  accuracy: 5000,
};

const STORAGE_KEY = "sibboard_geo";
const PERMISSION_KEY = "sibboard_geo_permission";

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
  return R * c;
};

// ============================================
// ХУК
// ============================================

export function useGeoLocation(options: UseGeoLocationOptions = {}) {
  const {
    enableHighAccuracy = false,
    timeout = 10000,
    maximumAge = 300000,
    watchPosition = false,
    cacheTime = 30,
    autoRefresh = false,
    refreshInterval = 15,
  } = options;

  const [state, setState] = useState<GeoLocationState>({
    location: null,
    district: null,
    error: null,
    loading: true,
    permission: "unknown",
    isWatching: watchPosition,
  });

  const watchIdRef = useRef<number | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // ============================================
  // ОПРЕДЕЛЕНИЕ РАЙОНА
  // ============================================

  const findDistrict = useCallback(async (lat: number, lon: number): Promise<DistrictWithMeta | null> => {
    try {
      // Пробуем через RPC
      const { data, error } = await supabase.rpc("find_district_by_point", {
        point_lat: lat,
        point_lon: lon,
      });

      if (!error && data) {
        const districtData = data as any;
        return {
          id: districtData.id,
          name: districtData.name,
          area: districtData.area || null,
          center_lat: districtData.center_lat || null,
          center_lon: districtData.center_lon || null,
          city_id: districtData.city_id || null,
          is_active: districtData.is_active ?? true,
          created_at: districtData.created_at || new Date().toISOString(),
          short_name: districtData.short_name || districtData.name?.split(" ")[0],
          slug: districtData.slug || districtData.name?.toLowerCase().replace(/\s+/g, "-"),
        };
      }

      // Fallback: ищем ближайший район
      const { data: districts } = await supabase
        .from("districts")
        .select("*")
        .eq("is_active", true);

      if (districts && districts.length > 0) {
        let nearestDistrict: District | null = null;
        let minDistance = Infinity;

        for (const d of districts) {
          if (d.center_lat && d.center_lon) {
            const distance = getDistance(lat, lon, d.center_lat, d.center_lon);
            if (distance < minDistance) {
              minDistance = distance;
              nearestDistrict = d as District;
            }
          }
        }

        if (nearestDistrict) {
          return {
            ...nearestDistrict,
            short_name: nearestDistrict.name.split(" ")[0],
            slug: nearestDistrict.name.toLowerCase().replace(/\s+/g, "-"),
          };
        }
      }

      return null;
    } catch (err) {
      console.error("Failed to find district:", err);
      return null;
    }
  }, []);

  // ============================================
  // ОБНОВЛЕНИЕ ЛОКАЦИИ
  // ============================================

  const updateLocation = useCallback(async (newLocation: Location) => {
    if (!mountedRef.current) return;

    setState(prev => ({ ...prev, location: newLocation, loading: true }));

    const district = await findDistrict(newLocation.lat, newLocation.lon);

    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        location: newLocation,
        district,
        loading: false,
        error: null,
      }));

      const cacheData = {
        location: newLocation,
        district,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
    }
  }, [findDistrict]);

  // ============================================
  // ОБРАБОТЧИК УСПЕХА
  // ============================================

  const handleSuccess = useCallback(async (position: GeolocationPosition) => {
    const { latitude: lat, longitude: lon, accuracy } = position.coords;
    const newLocation = { lat, lon, accuracy };

    setState(prev => ({ ...prev, permission: "granted" }));
    await updateLocation(newLocation);
  }, [updateLocation]);

  // ============================================
  // ОБРАБОТЧИК ОШИБКИ
  // ============================================

  const handleError = useCallback((error: GeolocationPositionError) => {
    if (!mountedRef.current) return;

    let errorMessage = "Не удалось определить местоположение";
    let permission: GeoLocationState["permission"] = "unknown";

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "Доступ к геолокации запрещён";
        permission = "denied";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Информация о местоположении недоступна";
        break;
      case error.TIMEOUT:
        errorMessage = "Время запроса истекло";
        break;
    }

    localStorage.setItem(PERMISSION_KEY, permission);

    setState(prev => ({
      ...prev,
      error: errorMessage,
      permission,
      loading: false,
      location: prev.location || DEFAULT_LOCATION,
    }));
  }, []);

  // ============================================
  // ЗАПРОС ГЕОЛОКАЦИИ
  // ============================================

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState(prev => ({
        ...prev,
        error: "Геолокация не поддерживается браузером",
        loading: false,
        location: DEFAULT_LOCATION,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    if (watchPosition) {
      const watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        { enableHighAccuracy, timeout, maximumAge }
      );
      watchIdRef.current = watchId;
      setState(prev => ({ ...prev, isWatching: true }));
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        { enableHighAccuracy, timeout, maximumAge }
      );
    }
  }, [watchPosition, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

  // ============================================
  // ОСТАНОВКА ОТСЛЕЖИВАНИЯ
  // ============================================

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setState(prev => ({ ...prev, isWatching: false }));
    }
  }, []);

  // ============================================
  // ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ
  // ============================================

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    if (watchPosition && watchIdRef.current !== null) {
      return;
    }
    
    requestLocation();
  }, [watchPosition, requestLocation]);

  // ============================================
  // ИНИЦИАЛИЗАЦИЯ
  // ============================================

  useEffect(() => {
    mountedRef.current = true;

    const cached = localStorage.getItem(STORAGE_KEY);
    const cachedPermission = localStorage.getItem(PERMISSION_KEY) as GeoLocationState["permission"];

    if (cached) {
      try {
        const data = JSON.parse(cached);
        const cacheAge = Date.now() - data.timestamp;
        
        if (cacheAge < cacheTime * 60 * 1000) {
          setState(prev => ({
            ...prev,
            location: data.location,
            district: data.district,
            loading: false,
            permission: cachedPermission || "unknown",
          }));
        }
      } catch (e) {
        console.error("Cache parse error:", e);
      }
    }

    requestLocation();

    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => {
        refresh();
      }, refreshInterval * 60 * 1000);
    }

    return () => {
      mountedRef.current = false;
      stopWatching();
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  // ============================================
  // ВОЗВРАЩАЕМЫЕ ЗНАЧЕНИЯ
  // ============================================

  return {
    ...state,
    refresh,
    stopWatching,
    isDefaultLocation: state.location?.lat === DEFAULT_LOCATION.lat && 
                       state.location?.lon === DEFAULT_LOCATION.lon,
  };
}