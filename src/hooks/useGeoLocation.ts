import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useGeoLocation() {
  const [location, setLocation] = useState<any>(null);
  const [district, setDistrict] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem("sibboard_geo");
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < 30 * 60 * 1000) {
          setLocation(data.location);
          setDistrict(data.district);
          setLoading(false);
        }
      } catch (e) {
        console.error("Cache parse error:", e);
      }
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lon, accuracy } = position.coords;
          const newLocation = { lat, lon, accuracy };
          setLocation(newLocation);

          try {
            // @ts-ignore
            const { data, error } = await supabase.rpc("find_district_by_point", {
              point_lat: lat,
              point_lon: lon,
            });

            if (!error && data) {
              setDistrict(data);
              localStorage.setItem("sibboard_geo", JSON.stringify({
                location: newLocation,
                district: data,
                timestamp: Date.now(),
              }));
            }
          } catch (err) {
            console.error("District detection error:", err);
          }

          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
          setLocation({ lat: 55.0302, lon: 82.9204, accuracy: 5000 });
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000,
        }
      );
    } else {
      setError("Геолокация не поддерживается");
      setLoading(false);
      setLocation({ lat: 55.0302, lon: 82.9204, accuracy: 5000 });
    }
  }, []);

  return { location, district, error, loading };
}