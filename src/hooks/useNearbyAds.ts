import { useEffect, useState } from "react";
import { supabase, type Ad } from "@/lib/supabase";

export function useNearbyAds(
  lat: number | null,
  lon: number | null,
  radiusKm: number = 10
) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lon) {
      setLoading(false);
      return;
    }

    const fetchNearbyAds = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // @ts-ignore - Supabase RPC функция nearby_ads
        const { data, error } = await supabase.rpc("nearby_ads", {
          lat,
          lon,
          radius_km: radiusKm,
        });

        if (error) throw error;
        setAds((data as Ad[]) || []);
      } catch (err) {
        console.error("Failed to fetch nearby ads:", err);
        setError("Не удалось загрузить объявления");
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyAds();
  }, [lat, lon, radiusKm]);

  return { ads, loading, error };
}