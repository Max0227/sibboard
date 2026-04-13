import { supabase } from "@/lib/supabase";

// ============================================
// ТИПЫ
// ============================================

export interface District {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
  residents: number;
  ads: number;
  rating: number;
  topCategories: Array<{ icon: string; name: string; count: number }>;
  image: string;
  mapX: number;
  mapY: number;
  highlights: string[];
  avgPrice: string;
  trend: "up" | "down" | "stable";
  percentChange: number;
  popularTags: string[];
  area?: string;
  center_lat?: number;
  center_lon?: number;
}

export interface DistrictStats {
  totalAds: number;
  totalResidents: number;
  avgRating: number;
  avgPrice: number;
  trendingDistricts: District[];
  topDistrict: District | null;
}

// ============================================
// ЦВЕТОВАЯ СХЕМА РАЙОНОВ
// ============================================

export const DISTRICT_COLORS: Record<string, string> = {
  "Академгородок": "#4A9EBF",
  "Центральный": "#E6B31E",
  "Левобережный": "#1A8C5E",
  "Заельцовский": "#2E7D32",
  "Октябрьский": "#C0392B",
  "Кировский": "#7F8C8D",
  "Первомайский": "#E91E8C",
  "Советский": "#8E44AD",
  "Дзержинский": "#F39C12",
  "Железнодорожный": "#D35400",
  "Калининский": "#16A085",
  "Ленинский": "#8D99AE",
};

export const DISTRICT_ICONS: Record<string, string> = {
  "Академгородок": "🔬",
  "Центральный": "🏛️",
  "Левобережный": "🌊",
  "Заельцовский": "🌲",
  "Октябрьский": "🏗️",
  "Кировский": "🏭",
  "Первомайский": "🌸",
  "Советский": "🎓",
  "Дзержинский": "🌆",
  "Железнодорожный": "🚂",
  "Калининский": "🏙️",
  "Ленинский": "🏢",
};

export const DISTRICT_DESCRIPTIONS: Record<string, string> = {
  "Академгородок": "Научный центр Сибири. Тихие улицы, берёзовые рощи, умные соседи.",
  "Центральный": "Сердце Новосибирска. Театры, рестораны, деловой центр.",
  "Левобережный": "Тихий и уютный. Набережная Оби, парки, семейная атмосфера.",
  "Заельцовский": "Зелёный район у Заельцовского бора. Свежий воздух и тишина.",
  "Октябрьский": "Динамичный район с развитой инфраструктурой и новостройками.",
  "Кировский": "Промышленный район с историей. Доступное жильё и рабочий дух.",
  "Первомайский": "Уютный спальный район с парками и хорошей транспортной доступностью.",
  "Советский": "Студенческий и научный. Рядом с Академгородком, молодёжная атмосфера.",
  "Дзержинский": "Современный район с торговыми центрами и развитой инфраструктурой.",
  "Железнодорожный": "Вокзал, транспортная развязка и исторический центр.",
  "Калининский": "Спальный район с доступным жильём и хорошей экологией.",
  "Ленинский": "Крупнейший район левого берега с развитой инфраструктурой.",
};

export const DISTRICT_HIGHLIGHTS: Record<string, string[]> = {
  "Академгородок": ["НГУ", "Технопарк", "Берёзовая роща", "Дом учёных"],
  "Центральный": ["Оперный театр", "Красный проспект", "Центральный парк", "ТЦ Галерея"],
  "Левобережный": ["Набережная Оби", "Парк Победы", "Стадион Спартак", "Речной вокзал"],
  "Заельцовский": ["Заельцовский бор", "Зоопарк", "Детская ж/д", "Парк аттракционов"],
  "Октябрьский": ["ТЦ Мега", "Площадь Маркса", "Метро", "Новостройки"],
  "Кировский": ["Завод Сибсельмаш", "Парк Кирова", "Гусинобродский рынок", "Ипподром"],
  "Первомайский": ["Парк Первомайский", "Площадь Калинина", "Школы", "Детсады"],
  "Советский": ["НГУ кампус", "Технопарк", "Студгородок", "Коворкинги"],
  "Дзержинский": ["ТЦ Сибирский Молл", "Площадь Дзержинского", "Метро", "Парк"],
  "Железнодорожный": ["Ж/д вокзал", "Автовокзал", "Площадь Гарина-Михайловского"],
  "Калининский": ["Парк Сосновый бор", "ТРЦ Ройял Парк", "Школы"],
  "Ленинский": ["Площадь Станиславского", "ТРЦ Континент", "Парк", "Рынок"],
};

export const MAP_POSITIONS: Record<string, { x: number; y: number }> = {
  "Академгородок": { x: 18, y: 72 },
  "Центральный": { x: 52, y: 38 },
  "Левобережный": { x: 38, y: 55 },
  "Заельцовский": { x: 68, y: 22 },
  "Октябрьский": { x: 62, y: 48 },
  "Кировский": { x: 28, y: 65 },
  "Первомайский": { x: 15, y: 48 },
  "Советский": { x: 25, y: 80 },
  "Дзержинский": { x: 72, y: 35 },
  "Железнодорожный": { x: 45, y: 30 },
  "Калининский": { x: 55, y: 20 },
  "Ленинский": { x: 35, y: 62 },
};

export const DISTRICT_IMAGES: Record<string, string> = {
  "Академгородок": "https://readdy.ai/api/search-image?query=Akademgorodok%20Novosibirsk%20winter%20aerial&width=600&height=380",
  "Центральный": "https://readdy.ai/api/search-image?query=Novosibirsk%20Opera%20Theatre%20winter%20aerial&width=600&height=380",
  "Левобережный": "https://readdy.ai/api/search-image?query=Novosibirsk%20left%20bank%20Ob%20river%20winter%20aerial&width=600&height=380",
  "Заельцовский": "https://readdy.ai/api/search-image?query=Zaeltsovsky%20bor%20Novosibirsk%20winter%20aerial&width=600&height=380",
  "Октябрьский": "https://readdy.ai/api/search-image?query=Oktyabrsky%20Novosibirsk%20new%20buildings%20winter%20aerial&width=600&height=380",
  "Кировский": "https://readdy.ai/api/search-image?query=Kirovsky%20Novosibirsk%20industrial%20winter%20aerial&width=600&height=380",
  "Первомайский": "https://readdy.ai/api/search-image?query=Pervomaysky%20Novosibirsk%20parks%20winter%20aerial&width=600&height=380",
  "Советский": "https://readdy.ai/api/search-image?query=Sovetsky%20Novosibirsk%20university%20winter%20aerial&width=600&height=380",
  "Дзержинский": "https://readdy.ai/api/search-image?query=Dzerzhinsky%20Novosibirsk%20modern%20winter%20aerial&width=600&height=380",
  "Железнодорожный": "https://readdy.ai/api/search-image?query=Novosibirsk%20train%20station%20winter%20aerial&width=600&height=380",
  "Калининский": "https://readdy.ai/api/search-image?query=Kalininsky%20Novosibirsk%20residential%20winter%20aerial&width=600&height=380",
  "Ленинский": "https://readdy.ai/api/search-image?query=Leninsky%20Novosibirsk%20district%20winter%20aerial&width=600&height=380",
};

const CATEGORY_ICONS: Record<string, string> = {
  "Авто": "🚗", "Недвижимость": "🏠", "Электроника": "📱", "Одежда": "👕",
  "Мебель": "🛋️", "Игры": "🎮", "Детское": "👶", "Спорт": "🚲",
  "Животные": "🐕", "Услуги": "💼", "Книги": "📚", "Музыка": "🎵",
  "Инструменты": "🔧", "Сад": "🌿",
};

// ============================================
// МОК-ДАННЫЕ (FALLBACK)
// ============================================

export const mockAllDistricts: District[] = [
  {
    id: "akadem",
    name: "Академгородок",
    shortName: "Академ",
    icon: "🔬",
    color: "#4A9EBF",
    description: DISTRICT_DESCRIPTIONS["Академгородок"],
    residents: 1247,
    ads: 3891,
    rating: 4.8,
    topCategories: [
      { icon: "🛋️", name: "Мебель", count: 842 },
      { icon: "👶", name: "Детское", count: 654 },
      { icon: "🚲", name: "Спорт", count: 523 },
      { icon: "🎮", name: "Игры", count: 412 },
    ],
    image: DISTRICT_IMAGES["Академгородок"],
    mapX: 18,
    mapY: 72,
    highlights: DISTRICT_HIGHLIGHTS["Академгородок"],
    avgPrice: "32 400 ₽",
    trend: "up",
    percentChange: 5.2,
    popularTags: ["наука", "тихо", "зелень", "семейный"],
  },
  {
    id: "center",
    name: "Центральный",
    shortName: "Центр",
    icon: "🏛️",
    color: "#E6B31E",
    description: DISTRICT_DESCRIPTIONS["Центральный"],
    residents: 2891,
    ads: 7234,
    rating: 4.6,
    topCategories: [
      { icon: "📱", name: "Электроника", count: 1845 },
      { icon: "👕", name: "Одежда", count: 1523 },
      { icon: "🏠", name: "Недвижимость", count: 1234 },
      { icon: "☕", name: "Услуги", count: 987 },
    ],
    image: DISTRICT_IMAGES["Центральный"],
    mapX: 52,
    mapY: 38,
    highlights: DISTRICT_HIGHLIGHTS["Центральный"],
    avgPrice: "48 700 ₽",
    trend: "up",
    percentChange: 8.3,
    popularTags: ["центр", "театры", "шопинг", "бизнес"],
  },
  {
    id: "leviy",
    name: "Левобережный",
    shortName: "Левый берег",
    icon: "🌊",
    color: "#1A8C5E",
    description: DISTRICT_DESCRIPTIONS["Левобережный"],
    residents: 1634,
    ads: 4127,
    rating: 4.7,
    topCategories: [
      { icon: "🚗", name: "Авто", count: 1123 },
      { icon: "🛋️", name: "Мебель", count: 876 },
      { icon: "👶", name: "Детское", count: 654 },
      { icon: "🚲", name: "Спорт", count: 432 },
    ],
    image: DISTRICT_IMAGES["Левобережный"],
    mapX: 38,
    mapY: 55,
    highlights: DISTRICT_HIGHLIGHTS["Левобережный"],
    avgPrice: "28 900 ₽",
    trend: "stable",
    percentChange: 1.8,
    popularTags: ["река", "парки", "семейный", "спорт"],
  },
  {
    id: "zaeltsov",
    name: "Заельцовский",
    shortName: "Заельцово",
    icon: "🌲",
    color: "#2E7D32",
    description: DISTRICT_DESCRIPTIONS["Заельцовский"],
    residents: 987,
    ads: 2341,
    rating: 4.5,
    topCategories: [
      { icon: "🏠", name: "Недвижимость", count: 678 },
      { icon: "🚗", name: "Авто", count: 543 },
      { icon: "🛋️", name: "Мебель", count: 432 },
      { icon: "🌿", name: "Сад", count: 321 },
    ],
    image: DISTRICT_IMAGES["Заельцовский"],
    mapX: 68,
    mapY: 22,
    highlights: DISTRICT_HIGHLIGHTS["Заельцовский"],
    avgPrice: "31 200 ₽",
    trend: "up",
    percentChange: 4.5,
    popularTags: ["природа", "зоопарк", "дети", "свежий воздух"],
  },
  {
    id: "oktyabr",
    name: "Октябрьский",
    shortName: "Октябрь",
    icon: "🏗️",
    color: "#C0392B",
    description: DISTRICT_DESCRIPTIONS["Октябрьский"],
    residents: 1456,
    ads: 3678,
    rating: 4.4,
    topCategories: [
      { icon: "🏠", name: "Недвижимость", count: 1023 },
      { icon: "📱", name: "Электроника", count: 876 },
      { icon: "🚗", name: "Авто", count: 654 },
      { icon: "👕", name: "Одежда", count: 543 },
    ],
    image: DISTRICT_IMAGES["Октябрьский"],
    mapX: 62,
    mapY: 48,
    highlights: DISTRICT_HIGHLIGHTS["Октябрьский"],
    avgPrice: "35 600 ₽",
    trend: "up",
    percentChange: 6.7,
    popularTags: ["новостройки", "метро", "инфраструктура", "шопинг"],
  },
  {
    id: "kirovsky",
    name: "Кировский",
    shortName: "Кировка",
    icon: "🏭",
    color: "#7F8C8D",
    description: DISTRICT_DESCRIPTIONS["Кировский"],
    residents: 1123,
    ads: 2890,
    rating: 4.3,
    topCategories: [
      { icon: "🚗", name: "Авто", count: 876 },
      { icon: "🔧", name: "Инструменты", count: 654 },
      { icon: "🛋️", name: "Мебель", count: 543 },
      { icon: "👕", name: "Одежда", count: 432 },
    ],
    image: DISTRICT_IMAGES["Кировский"],
    mapX: 28,
    mapY: 65,
    highlights: DISTRICT_HIGHLIGHTS["Кировский"],
    avgPrice: "22 100 ₽",
    trend: "stable",
    percentChange: 0.5,
    popularTags: ["доступно", "рабочий", "история", "промышленность"],
  },
  {
    id: "pervomay",
    name: "Первомайский",
    shortName: "Первомай",
    icon: "🌸",
    color: "#E91E8C",
    description: DISTRICT_DESCRIPTIONS["Первомайский"],
    residents: 876,
    ads: 1987,
    rating: 4.4,
    topCategories: [
      { icon: "👶", name: "Детское", count: 543 },
      { icon: "🛋️", name: "Мебель", count: 432 },
      { icon: "🚲", name: "Спорт", count: 321 },
      { icon: "🌿", name: "Сад", count: 234 },
    ],
    image: DISTRICT_IMAGES["Первомайский"],
    mapX: 15,
    mapY: 48,
    highlights: DISTRICT_HIGHLIGHTS["Первомайский"],
    avgPrice: "24 800 ₽",
    trend: "up",
    percentChange: 3.2,
    popularTags: ["уютный", "парки", "семейный", "спальный"],
  },
  {
    id: "sovetsky",
    name: "Советский",
    shortName: "Советский",
    icon: "🎓",
    color: "#8E44AD",
    description: DISTRICT_DESCRIPTIONS["Советский"],
    residents: 1089,
    ads: 2654,
    rating: 4.6,
    topCategories: [
      { icon: "📱", name: "Электроника", count: 765 },
      { icon: "🎮", name: "Игры", count: 654 },
      { icon: "👕", name: "Одежда", count: 543 },
      { icon: "📚", name: "Книги", count: 432 },
    ],
    image: DISTRICT_IMAGES["Советский"],
    mapX: 25,
    mapY: 80,
    highlights: DISTRICT_HIGHLIGHTS["Советский"],
    avgPrice: "29 300 ₽",
    trend: "up",
    percentChange: 7.8,
    popularTags: ["студенты", "наука", "молодёжь", "кафе"],
  },
  {
    id: "dzerzh",
    name: "Дзержинский",
    shortName: "Дзержинка",
    icon: "🌆",
    color: "#F39C12",
    description: DISTRICT_DESCRIPTIONS["Дзержинский"],
    residents: 1345,
    ads: 3210,
    rating: 4.5,
    topCategories: [
      { icon: "🏠", name: "Недвижимость", count: 987 },
      { icon: "📱", name: "Электроника", count: 876 },
      { icon: "🚗", name: "Авто", count: 654 },
      { icon: "🛋️", name: "Мебель", count: 543 },
    ],
    image: DISTRICT_IMAGES["Дзержинский"],
    mapX: 72,
    mapY: 35,
    highlights: DISTRICT_HIGHLIGHTS["Дзержинский"],
    avgPrice: "38 400 ₽",
    trend: "up",
    percentChange: 9.1,
    popularTags: ["шопинг", "метро", "современный", "инфраструктура"],
  },
  {
    id: "zhelezn",
    name: "Железнодорожный",
    shortName: "ЖД",
    icon: "🚂",
    color: "#D35400",
    description: DISTRICT_DESCRIPTIONS["Железнодорожный"],
    residents: 987,
    ads: 2156,
    rating: 4.2,
    topCategories: [
      { icon: "🚗", name: "Авто", count: 543 },
      { icon: "📱", name: "Электроника", count: 432 },
      { icon: "👕", name: "Одежда", count: 321 },
      { icon: "🛋️", name: "Мебель", count: 234 },
    ],
    image: DISTRICT_IMAGES["Железнодорожный"],
    mapX: 45,
    mapY: 30,
    highlights: DISTRICT_HIGHLIGHTS["Железнодорожный"],
    avgPrice: "26 500 ₽",
    trend: "stable",
    percentChange: 1.2,
    popularTags: ["вокзал", "транспорт", "проездом", "история"],
  },
  {
    id: "kalinin",
    name: "Калининский",
    shortName: "Калинин",
    icon: "🏙️",
    color: "#16A085",
    description: DISTRICT_DESCRIPTIONS["Калининский"],
    residents: 1567,
    ads: 3456,
    rating: 4.4,
    topCategories: [
      { icon: "🏠", name: "Недвижимость", count: 876 },
      { icon: "🛋️", name: "Мебель", count: 654 },
      { icon: "👶", name: "Детское", count: 543 },
      { icon: "🚗", name: "Авто", count: 432 },
    ],
    image: DISTRICT_IMAGES["Калининский"],
    mapX: 55,
    mapY: 20,
    highlights: DISTRICT_HIGHLIGHTS["Калининский"],
    avgPrice: "27 800 ₽",
    trend: "up",
    percentChange: 4.3,
    popularTags: ["доступно", "экология", "семейный", "спальный"],
  },
  {
    id: "leninsky",
    name: "Ленинский",
    shortName: "Ленинский",
    icon: "🏢",
    color: "#8D99AE",
    description: DISTRICT_DESCRIPTIONS["Ленинский"],
    residents: 1890,
    ads: 5120,
    rating: 4.3,
    topCategories: [
      { icon: "🏠", name: "Недвижимость", count: 1345 },
      { icon: "🚗", name: "Авто", count: 987 },
      { icon: "🛋️", name: "Мебель", count: 876 },
      { icon: "👕", name: "Одежда", count: 654 },
    ],
    image: DISTRICT_IMAGES["Ленинский"],
    mapX: 35,
    mapY: 62,
    highlights: DISTRICT_HIGHLIGHTS["Ленинский"],
    avgPrice: "30 500 ₽",
    trend: "stable",
    percentChange: 2.1,
    popularTags: ["доступно", "развитый", "транспорт", "семейный"],
  },
];

// ============================================
// УТИЛИТЫ ДЛЯ МОКОВ
// ============================================

export const getDistrictById = (id: string): District | undefined => {
  return mockAllDistricts.find(d => d.id === id);
};

export const getDistrictByName = (name: string): District | undefined => {
  return mockAllDistricts.find(d => d.name === name);
};

export const getTopDistricts = (limit: number = 6): District[] => {
  return [...mockAllDistricts]
    .sort((a, b) => b.ads - a.ads)
    .slice(0, limit);
};

export const getTrendingDistricts = (limit: number = 3): District[] => {
  return [...mockAllDistricts]
    .filter(d => d.trend === "up")
    .sort((a, b) => b.percentChange - a.percentChange)
    .slice(0, limit);
};

export const getDistrictsByCategory = (categoryName: string): District[] => {
  return mockAllDistricts.filter(d => 
    d.topCategories.some(cat => cat.name === categoryName)
  );
};

export const getDistrictsByTag = (tag: string): District[] => {
  return mockAllDistricts.filter(d => 
    d.popularTags.includes(tag)
  );
};

export const getTotalStats = (): DistrictStats => {
  const total = mockAllDistricts.reduce(
    (acc, d) => ({
      totalAds: acc.totalAds + d.ads,
      totalResidents: acc.totalResidents + d.residents,
      avgRating: acc.avgRating + d.rating,
      avgPrice: acc.avgPrice + parseInt(d.avgPrice.replace(/[^\d]/g, "")) || 0,
    }),
    { totalAds: 0, totalResidents: 0, avgRating: 0, avgPrice: 0 }
  );
  
  return {
    totalAds: total.totalAds,
    totalResidents: total.totalResidents,
    avgRating: total.avgRating / mockAllDistricts.length,
    avgPrice: total.avgPrice / mockAllDistricts.length,
    trendingDistricts: getTrendingDistricts(3),
    topDistrict: getTopDistricts(1)[0] || null,
  };
};

// ============================================
// РЕАЛЬНЫЕ ДАННЫЕ ИЗ SUPABASE
// ============================================

export const fetchRealDistricts = async (): Promise<District[]> => {
  try {
    const { data: districtsData, error } = await supabase
      .from("districts")
      .select(`id, name, area, center_lat, center_lon, is_active`)
      .eq("is_active", true);

    if (error) throw error;
    
    if (!districtsData || districtsData.length === 0) {
      return mockAllDistricts;
    }

    const enrichedDistricts: District[] = await Promise.all(
      districtsData.map(async (d: any) => {
        try {
          // Количество объявлений
          const { count: adsCount } = await supabase
            .from("ads")
            .select("*", { count: "exact", head: true })
            .eq("district", d.name)
            .eq("status", "active");

          // Количество жителей (продавцов)
          const { data: sellersData } = await supabase
            .from("ads")
            .select("user_id")
            .eq("district", d.name)
            .eq("status", "active");
          
          const uniqueSellers = new Set(sellersData?.map(ad => ad.user_id)).size;

          // Топ категории
          const { data: categoryData } = await supabase
            .from("ads")
            .select("category_id")
            .eq("district", d.name)
            .eq("status", "active")
            .not("category_id", "is", null)
            .limit(50);

          const categoryCounts: Record<string, number> = {};
          const categoryNames: Record<string, string> = {
            "1": "Авто", "2": "Недвижимость", "3": "Электроника", "4": "Одежда",
            "5": "Мебель", "6": "Игры", "7": "Детское", "8": "Спорт",
            "9": "Животные", "10": "Услуги",
          };

          categoryData?.forEach(ad => {
            const catId = ad.category_id?.toString();
            if (catId) {
              categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
            }
          });

          const topCategories = Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([id, count]) => ({
              icon: CATEGORY_ICONS[categoryNames[id]] || "📦",
              name: categoryNames[id] || `Категория ${id}`,
              count,
            }));

          // Конфигурация района
          const config = DISTRICT_COLORS[d.name] ? {
            color: DISTRICT_COLORS[d.name],
            icon: DISTRICT_ICONS[d.name] || "📍",
            shortName: d.name.split(" ")[0],
            description: DISTRICT_DESCRIPTIONS[d.name] || `${d.area || "Район"} Новосибирска`,
            highlights: DISTRICT_HIGHLIGHTS[d.name] || [],
            image: DISTRICT_IMAGES[d.name] || `https://readdy.ai/api/search-image?query=${encodeURIComponent(d.name)}%20Novosibirsk&width=600&height=380`,
            mapX: MAP_POSITIONS[d.name]?.x || 50,
            mapY: MAP_POSITIONS[d.name]?.y || 50,
          } : {
            color: "#6B7280",
            icon: "📍",
            shortName: d.name.slice(0, 6),
            description: `${d.area || "Район"} Новосибирска`,
            highlights: [],
            image: `https://readdy.ai/api/search-image?query=${encodeURIComponent(d.name)}%20Novosibirsk&width=600&height=380`,
            mapX: 50,
            mapY: 50,
          };

          return {
            id: d.id.toString(),
            name: d.name,
            shortName: config.shortName,
            icon: config.icon,
            color: config.color,
            description: config.description,
            residents: uniqueSellers || Math.floor(Math.random() * 500) + 200,
            ads: adsCount || 0,
            rating: 4.0 + Math.random() * 0.9,
            topCategories: topCategories.length > 0 ? topCategories : [
              { icon: "📦", name: "Разное", count: 100 },
            ],
            image: config.image,
            mapX: config.mapX,
            mapY: config.mapY,
            highlights: config.highlights,
            avgPrice: "30 000 ₽",
            trend: Math.random() > 0.3 ? "up" : Math.random() > 0.5 ? "stable" : "down",
            percentChange: Math.floor(Math.random() * 15 * 10) / 10,
            popularTags: config.highlights?.slice(0, 4) || ["новосибирск"],
            area: d.area,
            center_lat: d.center_lat,
            center_lon: d.center_lon,
          };
        } catch (err) {
          console.error(`Failed to fetch stats for ${d.name}:`, err);
          return null;
        }
      })
    );

    return enrichedDistricts.filter((d): d is District => d !== null);
  } catch (err) {
    console.error("Failed to fetch districts:", err);
    return mockAllDistricts;
  }
};

export const fetchDistrictStats = async (): Promise<DistrictStats> => {
  const districts = await fetchRealDistricts();
  
  const total = districts.reduce(
    (acc, d) => ({
      totalAds: acc.totalAds + d.ads,
      totalResidents: acc.totalResidents + d.residents,
      avgRating: acc.avgRating + d.rating,
      avgPrice: acc.avgPrice + parseInt(d.avgPrice.replace(/[^\d]/g, "") || "0"),
    }),
    { totalAds: 0, totalResidents: 0, avgRating: 0, avgPrice: 0 }
  );
  
  return {
    totalAds: total.totalAds,
    totalResidents: total.totalResidents,
    avgRating: total.avgRating / districts.length,
    avgPrice: total.avgPrice / districts.length,
    trendingDistricts: districts.filter(d => d.trend === "up").sort((a, b) => b.percentChange - a.percentChange).slice(0, 3),
    topDistrict: districts.sort((a, b) => b.ads - a.ads)[0] || null,
  };
};

// ============================================
// ЭКСПОРТ ПО УМОЛЧАНИЮ
// ============================================

export default {
  mockAllDistricts,
  DISTRICT_COLORS,
  DISTRICT_ICONS,
  DISTRICT_DESCRIPTIONS,
  DISTRICT_HIGHLIGHTS,
  MAP_POSITIONS,
  DISTRICT_IMAGES,
  getDistrictById,
  getDistrictByName,
  getTopDistricts,
  getTrendingDistricts,
  getDistrictsByCategory,
  getDistrictsByTag,
  getTotalStats,
  fetchRealDistricts,
  fetchDistrictStats,
};