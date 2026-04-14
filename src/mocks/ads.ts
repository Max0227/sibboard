
// ============================================
// ТИПЫ (СОВМЕСТИМЫ С SUPABASE)
// ============================================

export interface MockAd {
  id: number;
  title: string;
  price: number | null;
  is_gift: boolean;
  category_id: number | null;
  category_name: string;
  category_icon: string;
  district: string | null;
  photos: string[];
  views: number;
  status: "active" | "sold" | "archived";
  created_at: string;
  updated_at: string;
  description: string;
  condition_text: string | null;
  story_text: string | null;
  story_reason: string | null;
  address: string | null;
  geo_lat: number | null;
  geo_lon: number | null;
  voice_url: string | null;
  seller: {
    id: string;
    name: string;
    avatar_url: string | null;
    rating: number;
    deals_count: number;
    badges: string[];
    is_verified: boolean;
    is_online: boolean;
    response_time: string;
    has_voice: boolean;
  };
}

export interface MockCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  gradient: string;
  trend: "up" | "down" | "stable";
}

export interface MockDistrict {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  residents: number;
  ads: number;
  rating: number;
  topCategories: string[];
  image: string;
  image_url?: string | null;
  avgPrice: string;
  trend: "up" | "down" | "stable";
  mapX?: number;
  mapY?: number;
  highlights?: string[];
  popularTags?: string[];
  area?: string;
}

// ============================================
// МОК-ОБЪЯВЛЕНИЯ (10 ШТУК)
// ============================================

export const mockAds: MockAd[] = [
  {
    id: 1,
    title: "iPhone 15 Pro Max 256GB Natural Titanium",
    price: 89900,
    is_gift: false,
    category_id: 3,
    category_name: "Электроника",
    category_icon: "📱",
    district: "Академгородок",
    photos: [
      "https://readdy.ai/api/search-image?query=iPhone%2015%20Pro%20Max%20titanium%20product%20photography&width=800&height=600&seq=ad1_1",
      "https://readdy.ai/api/search-image?query=iPhone%2015%20Pro%20Max%20back%20camera%20closeup&width=800&height=600&seq=ad1_2",
      "https://readdy.ai/api/search-image?query=iPhone%2015%20Pro%20Max%20side%20titanium%20frame&width=800&height=600&seq=ad1_3",
    ],
    views: 1247,
    status: "active",
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    description: "Продаю iPhone 15 Pro Max 256GB в цвете Natural Titanium. Куплен в декабре 2024, использовался аккуратно. Всегда в чехле и с защитным стеклом. Батарея 97%. Полный комплект: коробка, кабель, документы. Торг уместен при осмотре.",
    condition_text: "Отличное",
    story_text: "Купил новый iPhone 16 Pro, поэтому продаю этот. Телефон в идеальном состоянии, всегда был в чехле и с защитным стеклом.",
    story_reason: "💎 Купил обновку",
    address: "ул. Академика Лаврентьева, 6",
    geo_lat: 54.8516,
    geo_lon: 83.1066,
    voice_url: null,
    seller: {
      id: "seller-1",
      name: "Алексей К.",
      avatar_url: "https://readdy.ai/api/search-image?query=young%20russian%20man%20smiling%20portrait&width=80&height=80&seq=seller1",
      rating: 4.9,
      deals_count: 47,
      badges: ["🏔️ Столбист", "📸 Папарацци"],
      is_verified: true,
      is_online: true,
      response_time: "~5 мин",
      has_voice: true,
    },
  },
  {
    id: 2,
    title: "Диван угловой IKEA KIVIK серый",
    price: 28000,
    is_gift: false,
    category_id: 5,
    category_name: "Мебель",
    category_icon: "🛋️",
    district: "Центральный",
    photos: [
      "https://readdy.ai/api/search-image?query=IKEA%20KIVIK%20corner%20sofa%20gray%20living%20room&width=800&height=600&seq=ad2_1",
      "https://readdy.ai/api/search-image?query=gray%20sofa%20fabric%20texture%20closeup&width=800&height=600&seq=ad2_2",
    ],
    views: 389,
    status: "active",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    description: "Продаю угловой диван IKEA KIVIK. Покупали 2 года назад, состояние хорошее. Чехлы снимаются и стираются. Самовывоз из центра Новосибирска. Помогу с погрузкой.",
    condition_text: "Хорошее",
    story_text: "Переезжаем в другой город, распродаём мебель. Диван очень удобный, на нём спали гости — все хвалили.",
    story_reason: "🚚 Переезд",
    address: "Красный проспект, 25",
    geo_lat: 55.0285,
    geo_lon: 82.9207,
    voice_url: null,
    seller: {
      id: "seller-2",
      name: "Марина В.",
      avatar_url: "https://readdy.ai/api/search-image?query=young%20russian%20woman%20smiling%20portrait&width=80&height=80&seq=seller2",
      rating: 5.0,
      deals_count: 12,
      badges: ["☕ Бариста"],
      is_verified: true,
      is_online: false,
      response_time: "~1 час",
      has_voice: false,
    },
  },
  {
    id: 3,
    title: "Велосипед горный Trek Marlin 7 2023",
    price: 45000,
    is_gift: false,
    category_id: 8,
    category_name: "Спорт",
    category_icon: "🚲",
    district: "Левобережный",
    photos: [
      "https://readdy.ai/api/search-image?query=Trek%20Marlin%207%20mountain%20bike%20red%20black&width=800&height=600&seq=ad3_1",
      "https://readdy.ai/api/search-image?query=mountain%20bike%20details%20gears%20suspension&width=800&height=600&seq=ad3_2",
    ],
    views: 756,
    status: "active",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    description: "Trek Marlin 7 2023 года. Проехал около 500 км, всегда обслуживался. Новая цепь, тормозные колодки. Идеален для трейлов Академгородка и лесных прогулок.",
    condition_text: "Отличное",
    story_text: "Купил новый велосипед, этот стал не нужен. Велосипед в отличном состоянии, все механизмы работают как часы.",
    story_reason: "⬆️ Апгрейд",
    address: "ул. Станиславского, 10",
    geo_lat: 54.9500,
    geo_lon: 82.8700,
    voice_url: "https://example.com/voice/ad3.mp3",
    seller: {
      id: "seller-3",
      name: "Дмитрий Н.",
      avatar_url: "https://readdy.ai/api/search-image?query=russian%20man%2030s%20outdoor%20portrait&width=80&height=80&seq=seller3",
      rating: 4.7,
      deals_count: 8,
      badges: ["🏔️ Столбист"],
      is_verified: true,
      is_online: true,
      response_time: "~15 мин",
      has_voice: true,
    },
  },
  {
    id: 4,
    title: "PlayStation 5 Digital + 3 игры + 2 геймпада",
    price: 52000,
    is_gift: false,
    category_id: 6,
    category_name: "Игры",
    category_icon: "🎮",
    district: "Академгородок",
    photos: [
      "https://readdy.ai/api/search-image?query=PlayStation%205%20console%20white%20gaming%20setup&width=800&height=600&seq=ad4_1",
      "https://readdy.ai/api/search-image?query=PS5%20controller%20and%20games%20collection&width=800&height=600&seq=ad4_2",
    ],
    views: 1892,
    status: "active",
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    description: "PS5 Digital Edition, куплена год назад. В комплекте 2 геймпада DualSense и 3 игры: Spider-Man 2, God of War Ragnarök, EA FC 24. Консоль в идеальном состоянии, без царапин.",
    condition_text: "Отличное",
    story_text: "Нет времени играть из-за работы. Консоль стоит без дела, пусть радует нового владельца.",
    story_reason: "💼 Нет времени",
    address: "ул. Академика Коптюга, 4",
    geo_lat: 54.8480,
    geo_lon: 83.0950,
    voice_url: null,
    seller: {
      id: "seller-4",
      name: "Игорь С.",
      avatar_url: "https://readdy.ai/api/search-image?query=young%20man%20gamer%20portrait&width=80&height=80&seq=seller4",
      rating: 4.8,
      deals_count: 23,
      badges: ["📸 Папарацци", "🏔️ Столбист"],
      is_verified: true,
      is_online: true,
      response_time: "~10 мин",
      has_voice: false,
    },
  },
  {
    id: 5,
    title: "Пуховик Canada Goose Expedition Parka женский M",
    price: 35000,
    is_gift: false,
    category_id: 4,
    category_name: "Одежда",
    category_icon: "👕",
    district: "Центральный",
    photos: [
      "https://readdy.ai/api/search-image?query=Canada%20Goose%20black%20down%20jacket%20women&width=800&height=600&seq=ad5_1",
      "https://readdy.ai/api/search-image?query=Canada%20Goose%20logo%20detail%20fur%20hood&width=800&height=600&seq=ad5_2",
    ],
    views: 234,
    status: "active",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    description: "Canada Goose Expedition Parka, размер M. Носила 2 сезона, состояние хорошее. Оригинал, есть все бирки и документы. Тёплая до -40°C. Идеально для сибирской зимы.",
    condition_text: "Хорошее",
    story_text: "Переезжаю в тёплые края, пуховик больше не нужен. Вещь качественная, прослужит ещё много лет.",
    story_reason: "🌴 Переезд на юг",
    address: "Красный проспект, 17",
    geo_lat: 54.9900,
    geo_lon: 82.9100,
    voice_url: null,
    seller: {
      id: "seller-5",
      name: "Ольга Т.",
      avatar_url: "https://readdy.ai/api/search-image?query=russian%20woman%2035%20portrait%20smile&width=80&height=80&seq=seller5",
      rating: 4.6,
      deals_count: 5,
      badges: [],
      is_verified: false,
      is_online: false,
      response_time: "~2 часа",
      has_voice: false,
    },
  },
  {
    id: 6,
    title: "MacBook Pro 14\" M3 Pro 18GB / 512GB",
    price: 145000,
    is_gift: false,
    category_id: 3,
    category_name: "Электроника",
    category_icon: "💻",
    district: "Академгородок",
    photos: [
      "https://readdy.ai/api/search-image?query=MacBook%20Pro%2014%20inch%20M3%20silver%20laptop&width=800&height=600&seq=ad6_1",
      "https://readdy.ai/api/search-image?query=MacBook%20Pro%20keyboard%20and%20trackpad%20closeup&width=800&height=600&seq=ad6_2",
    ],
    views: 2156,
    status: "active",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    description: "MacBook Pro 14\" M3 Pro, 18GB RAM, 512GB SSD. Куплен 6 месяцев назад, использовался для работы. Батарея 98 циклов. Полный комплект: коробка, зарядка, документы.",
    condition_text: "Отличное",
    story_text: "Купил новый MacBook Pro M4, этот продаю. Ноутбук в идеальном состоянии, всегда был в чехле.",
    story_reason: "💎 Купил обновку",
    address: "ул. Академика Лаврентьева, 17",
    geo_lat: 54.8550,
    geo_lon: 83.1100,
    voice_url: "https://example.com/voice/ad6.mp3",
    seller: {
      id: "seller-6",
      name: "Павел Р.",
      avatar_url: "https://readdy.ai/api/search-image?query=russian%20man%20developer%20glasses%20portrait&width=80&height=80&seq=seller6",
      rating: 5.0,
      deals_count: 31,
      badges: ["🏔️ Столбист", "☕ Бариста", "📸 Папарацци"],
      is_verified: true,
      is_online: true,
      response_time: "~5 мин",
      has_voice: true,
    },
  },
  {
    id: 7,
    title: "Детская коляска Bugaboo Fox 5 Forest Green",
    price: 42000,
    is_gift: false,
    category_id: 7,
    category_name: "Детское",
    category_icon: "👶",
    district: "Левобережный",
    photos: [
      "https://readdy.ai/api/search-image?query=Bugaboo%20Fox%205%20baby%20stroller%20green&width=800&height=600&seq=ad7_1",
      "https://readdy.ai/api/search-image?query=Bugaboo%20stroller%20folded%20compact&width=800&height=600&seq=ad7_2",
    ],
    views: 189,
    status: "active",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Коляска Bugaboo Fox 5 в цвете Forest Green. Использовали 1.5 года. Все механизмы работают отлично. Есть дождевик и сумка для мамы. Колёса не стёрты.",
    condition_text: "Хорошее",
    story_text: "Ребёнок вырос, коляска больше не нужна. Вещь в отличном состоянии, все механизмы работают плавно.",
    story_reason: "👶 Ребёнок вырос",
    address: "ул. Связистов, 15",
    geo_lat: 54.9200,
    geo_lon: 82.8500,
    voice_url: null,
    seller: {
      id: "seller-7",
      name: "Светлана М.",
      avatar_url: "https://readdy.ai/api/search-image?query=young%20mother%20russian%20woman%20portrait&width=80&height=80&seq=seller7",
      rating: 4.9,
      deals_count: 7,
      badges: ["☕ Бариста"],
      is_verified: true,
      is_online: false,
      response_time: "~30 мин",
      has_voice: false,
    },
  },
  {
    id: 8,
    title: "Кофемашина DeLonghi Magnifica Evo с капучинатором",
    price: 38000,
    is_gift: false,
    category_id: 10,
    category_name: "Бытовая техника",
    category_icon: "☕",
    district: "Центральный",
    photos: [
      "https://readdy.ai/api/search-image?query=DeLonghi%20Magnifica%20Evo%20coffee%20machine&width=800&height=600&seq=ad8_1",
      "https://readdy.ai/api/search-image?query=coffee%20machine%20making%20espresso%20closeup&width=800&height=600&seq=ad8_2",
    ],
    views: 567,
    status: "active",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: "DeLonghi Magnifica Evo ECAM290.61.SB. Куплена год назад, использовалась дома. Регулярно обслуживалась. Делает отличный эспрессо и капучино.",
    condition_text: "Отличное",
    story_text: "Купили профессиональную кофемашину для маленькой кофейни, эта стала не нужна.",
    story_reason: "☕ Купил профессиональную",
    address: "ул. Гоголя, 42",
    geo_lat: 54.9750,
    geo_lon: 82.9200,
    voice_url: null,
    seller: {
      id: "seller-8",
      name: "Андрей Б.",
      avatar_url: "https://readdy.ai/api/search-image?query=russian%20man%2040s%20portrait%20casual&width=80&height=80&seq=seller8",
      rating: 4.5,
      deals_count: 15,
      badges: ["☕ Бариста"],
      is_verified: true,
      is_online: true,
      response_time: "~20 мин",
      has_voice: false,
    },
  },
  {
    id: 9,
    title: "Отдам даром: книги по программированию",
    price: null,
    is_gift: true,
    category_id: 11,
    category_name: "Книги",
    category_icon: "📚",
    district: "Академгородок",
    photos: [
      "https://readdy.ai/api/search-image?query=programming%20books%20stack%20JavaScript%20Python&width=800&height=600&seq=ad9_1",
    ],
    views: 892,
    status: "active",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    description: "Отдам бесплатно книги по программированию: JavaScript, Python, алгоритмы. Состояние хорошее, некоторые новые. Самовывоз из Академгородка.",
    condition_text: "Хорошее",
    story_text: "Освобождаю полки, книги уже прочитаны. Пусть приносят пользу другим.",
    story_reason: "📦 Расхламление",
    address: "ул. Терешковой, 12",
    geo_lat: 54.8500,
    geo_lon: 83.1000,
    voice_url: null,
    seller: {
      id: "seller-9",
      name: "Екатерина Д.",
      avatar_url: "https://readdy.ai/api/search-image?query=russian%20woman%20developer%20portrait&width=80&height=80&seq=seller9",
      rating: 4.9,
      deals_count: 18,
      badges: ["📸 Папарацци"],
      is_verified: true,
      is_online: true,
      response_time: "~10 мин",
      has_voice: false,
    },
  },
  {
    id: 10,
    title: "Акустическая гитара Yamaha F310",
    price: 12500,
    is_gift: false,
    category_id: 12,
    category_name: "Музыка",
    category_icon: "🎸",
    district: "Октябрьский",
    photos: [
      "https://readdy.ai/api/search-image?query=Yamaha%20F310%20acoustic%20guitar%20natural%20wood&width=800&height=600&seq=ad10_1",
      "https://readdy.ai/api/search-image?query=acoustic%20guitar%20closeup%20strings%20soundhole&width=800&height=600&seq=ad10_2",
    ],
    views: 445,
    status: "active",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Акустическая гитара Yamaha F310. Идеальна для начинающих. Струны новые, звук чистый. В комплекте чехол и медиаторы.",
    condition_text: "Отличное",
    story_text: "Купил электрогитару, акустика больше не нужна. Гитара в отличном состоянии, играть одно удовольствие.",
    story_reason: "🎸 Перешёл на электро",
    address: "ул. Бориса Богаткова, 15",
    geo_lat: 55.0200,
    geo_lon: 82.9500,
    voice_url: null,
    seller: {
      id: "seller-10",
      name: "Артём М.",
      avatar_url: "https://readdy.ai/api/search-image?query=young%20man%20musician%20portrait&width=80&height=80&seq=seller10",
      rating: 4.7,
      deals_count: 6,
      badges: [],
      is_verified: false,
      is_online: false,
      response_time: "~1 час",
      has_voice: false,
    },
  },
  {
    id: 11,
    title: "Холодильник LG Door-in-Door",
    price: 65000,
    is_gift: false,
    category_id: 10,
    category_name: "Бытовая техника",
    category_icon: "🧊",
    district: "Заельцовский",
    photos: [
      "https://readdy.ai/api/search-image?query=LG%20Door%20in%20Door%20refrigerator%20stainless%20steel&width=800&height=600&seq=ad11_1",
    ],
    views: 678,
    status: "active",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Холодильник LG с функцией Door-in-Door. Объём 600 литров. Куплен 2 года назад, в отличном состоянии. Все полки целые, морозилка работает отлично.",
    condition_text: "Отличное",
    story_text: "Переезжаем в новую квартиру с встроенной техникой.",
    story_reason: "🚚 Переезд",
    address: "ул. Заельцовская, 15",
    geo_lat: 55.0592,
    geo_lon: 82.9128,
    voice_url: null,
    seller: {
      id: "seller-11",
      name: "Татьяна П.",
      avatar_url: "https://readdy.ai/api/search-image?query=russian%20woman%2040s%20portrait&width=80&height=80&seq=seller11",
      rating: 4.8,
      deals_count: 22,
      badges: ["🏔️ Столбист"],
      is_verified: true,
      is_online: false,
      response_time: "~45 мин",
      has_voice: false,
    },
  },
  {
    id: 12,
    title: "Квартира-студия в центре",
    price: 4200000,
    is_gift: false,
    category_id: 2,
    category_name: "Недвижимость",
    category_icon: "🏠",
    district: "Центральный",
    photos: [
      "https://readdy.ai/api/search-image?query=modern%20studio%20apartment%20interior%20bright%20minimalist&width=800&height=600&seq=ad12_1",
    ],
    views: 3456,
    status: "active",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Продаётся уютная студия 28 м² в центре Новосибирска. Свежий ремонт, вся мебель остаётся. Окна во двор, тихо. 5 минут до метро.",
    condition_text: "Отличное",
    story_text: "Переезжаю в другой город.",
    story_reason: "🚚 Переезд",
    address: "ул. Советская, 18",
    geo_lat: 55.0285,
    geo_lon: 82.9207,
    voice_url: null,
    seller: {
      id: "seller-12",
      name: "Сергей В.",
      avatar_url: "https://readdy.ai/api/search-image?query=russian%20man%2035%20business%20portrait&width=80&height=80&seq=seller12",
      rating: 4.9,
      deals_count: 3,
      badges: ["📸 Папарацци"],
      is_verified: true,
      is_online: true,
      response_time: "~30 мин",
      has_voice: true,
    },
  },
];

// ============================================
// МОК-КАТЕГОРИИ (12 ШТУК)
// ============================================

export const mockCategories: MockCategory[] = [
  { id: "1", name: "Авто", icon: "🚗", count: 3241, gradient: "from-blue-500 to-cyan-500", trend: "up" },
  { id: "2", name: "Недвижимость", icon: "🏠", count: 1847, gradient: "from-emerald-500 to-teal-500", trend: "up" },
  { id: "3", name: "Электроника", icon: "📱", count: 5632, gradient: "from-purple-500 to-pink-500", trend: "up" },
  { id: "4", name: "Одежда", icon: "👕", count: 4218, gradient: "from-orange-500 to-red-500", trend: "stable" },
  { id: "5", name: "Мебель", icon: "🛋️", count: 2156, gradient: "from-amber-500 to-yellow-500", trend: "up" },
  { id: "6", name: "Игры", icon: "🎮", count: 1893, gradient: "from-indigo-500 to-purple-500", trend: "up" },
  { id: "7", name: "Детское", icon: "👶", count: 3047, gradient: "from-rose-500 to-pink-500", trend: "up" },
  { id: "8", name: "Спорт", icon: "🚲", count: 2341, gradient: "from-green-500 to-emerald-500", trend: "up" },
  { id: "9", name: "Животные", icon: "🐕", count: 876, gradient: "from-yellow-500 to-amber-500", trend: "stable" },
  { id: "10", name: "Бытовая техника", icon: "🧺", count: 1534, gradient: "from-sky-500 to-blue-500", trend: "up" },
  { id: "11", name: "Книги", icon: "📚", count: 2345, gradient: "from-gray-500 to-slate-500", trend: "down" },
  { id: "12", name: "Музыка", icon: "🎵", count: 987, gradient: "from-red-500 to-orange-500", trend: "stable" },
];

// ============================================
// МОК-РАЙОНЫ (ВСЕ 12 РАЙОНОВ НОВОСИБИРСКА)
// ============================================

export const mockDistricts: MockDistrict[] = [
  {
    id: "akadem",
    name: "Академгородок",
    shortName: "Академ",
    description: "Научный центр Сибири. Тихие улицы, берёзовые рощи, умные соседи.",
    icon: "🔬",
    color: "#4A9EBF",
    residents: 1247,
    ads: 3891,
    rating: 4.8,
    topCategories: ["🛋️ Мебель", "👶 Детское", "🚲 Спорт", "🎮 Игры"],
    image: "https://readdy.ai/api/search-image?query=Akademgorodok%20Novosibirsk%20winter%20aerial&width=600&height=400",
    avgPrice: "32 400 ₽",
    trend: "up",
    mapX: 18,
    mapY: 72,
    highlights: ["НГУ", "Технопарк", "Берёзовая роща"],
    popularTags: ["наука", "тихо", "зелень"],
    area: "Советский",
  },
  {
    id: "center",
    name: "Центральный",
    shortName: "Центр",
    description: "Сердце Новосибирска. Театры, рестораны, деловой центр.",
    icon: "🏛️",
    color: "#E6B31E",
    residents: 2891,
    ads: 7234,
    rating: 4.6,
    topCategories: ["📱 Электроника", "👕 Одежда", "🏠 Недвижимость", "☕ Услуги"],
    image: "https://readdy.ai/api/search-image?query=Novosibirsk%20Opera%20Theatre%20winter&width=600&height=400",
    avgPrice: "48 700 ₽",
    trend: "up",
    mapX: 52,
    mapY: 38,
    highlights: ["Оперный театр", "Красный проспект"],
    popularTags: ["центр", "театры", "шопинг"],
    area: "Центральный",
  },
  {
    id: "leviy",
    name: "Левобережный",
    shortName: "Левый берег",
    description: "Тихий и уютный. Набережная Оби, парки, семейная атмосфера.",
    icon: "🌊",
    color: "#1A8C5E",
    residents: 1634,
    ads: 4127,
    rating: 4.7,
    topCategories: ["🚗 Авто", "🛋️ Мебель", "👶 Детское", "🚲 Спорт"],
    image: "https://readdy.ai/api/search-image?query=Novosibirsk%20left%20bank%20Ob%20river%20winter&width=600&height=400",
    avgPrice: "28 900 ₽",
    trend: "stable",
    mapX: 38,
    mapY: 55,
    highlights: ["Набережная Оби", "Парк Победы"],
    popularTags: ["река", "парки", "семейный"],
    area: "Кировский/Ленинский",
  },
  {
    id: "zaeltsov",
    name: "Заельцовский",
    shortName: "Заельцово",
    description: "Зелёный район у Заельцовского бора. Свежий воздух и тишина.",
    icon: "🌲",
    color: "#2E7D32",
    residents: 987,
    ads: 2341,
    rating: 4.5,
    topCategories: ["🏠 Недвижимость", "🚗 Авто", "🛋️ Мебель", "🌿 Сад"],
    image: "https://readdy.ai/api/search-image?query=Zaeltsovsky%20bor%20Novosibirsk%20winter%20aerial&width=600&height=400",
    avgPrice: "31 200 ₽",
    trend: "up",
    mapX: 68,
    mapY: 22,
    highlights: ["Заельцовский бор", "Зоопарк"],
    popularTags: ["природа", "зоопарк", "дети"],
    area: "Заельцовский",
  },
  {
    id: "oktyabr",
    name: "Октябрьский",
    shortName: "Октябрь",
    description: "Динамичный район с развитой инфраструктурой и новостройками.",
    icon: "🏗️",
    color: "#C0392B",
    residents: 1456,
    ads: 3678,
    rating: 4.4,
    topCategories: ["🏠 Недвижимость", "📱 Электроника", "🚗 Авто", "👕 Одежда"],
    image: "https://readdy.ai/api/search-image?query=Oktyabrsky%20Novosibirsk%20new%20buildings%20winter%20aerial&width=600&height=400",
    avgPrice: "35 600 ₽",
    trend: "up",
    mapX: 62,
    mapY: 48,
    highlights: ["ТЦ Мега", "Площадь Маркса"],
    popularTags: ["новостройки", "метро", "инфраструктура"],
    area: "Октябрьский",
  },
  {
    id: "kirovsky",
    name: "Кировский",
    shortName: "Кировка",
    description: "Промышленный район с историей. Доступное жильё и рабочий дух.",
    icon: "🏭",
    color: "#7F8C8D",
    residents: 1123,
    ads: 2890,
    rating: 4.3,
    topCategories: ["🚗 Авто", "🔧 Инструменты", "🛋️ Мебель", "👕 Одежда"],
    image: "https://readdy.ai/api/search-image?query=Kirovsky%20Novosibirsk%20industrial%20winter%20aerial&width=600&height=400",
    avgPrice: "22 100 ₽",
    trend: "stable",
    mapX: 28,
    mapY: 65,
    highlights: ["Завод Сибсельмаш", "Парк Кирова"],
    popularTags: ["доступно", "рабочий", "история"],
    area: "Кировский",
  },
  {
    id: "pervomay",
    name: "Первомайский",
    shortName: "Первомай",
    description: "Уютный спальный район с парками и хорошей транспортной доступностью.",
    icon: "🌸",
    color: "#E91E8C",
    residents: 876,
    ads: 1987,
    rating: 4.4,
    topCategories: ["👶 Детское", "🛋️ Мебель", "🚲 Спорт", "🌿 Сад"],
    image: "https://readdy.ai/api/search-image?query=Pervomaysky%20Novosibirsk%20parks%20winter%20aerial&width=600&height=400",
    avgPrice: "24 800 ₽",
    trend: "up",
    mapX: 15,
    mapY: 48,
    highlights: ["Парк Первомайский", "Площадь Калинина"],
    popularTags: ["уютный", "парки", "семейный"],
    area: "Первомайский",
  },
  {
    id: "sovetsky",
    name: "Советский",
    shortName: "Советский",
    description: "Студенческий и научный. Рядом с Академгородком, молодёжная атмосфера.",
    icon: "🎓",
    color: "#8E44AD",
    residents: 1089,
    ads: 2654,
    rating: 4.6,
    topCategories: ["📱 Электроника", "🎮 Игры", "👕 Одежда", "📚 Книги"],
    image: "https://readdy.ai/api/search-image?query=Sovetsky%20Novosibirsk%20university%20winter%20aerial&width=600&height=400",
    avgPrice: "29 300 ₽",
    trend: "up",
    mapX: 25,
    mapY: 80,
    highlights: ["НГУ кампус", "Технопарк"],
    popularTags: ["студенты", "наука", "молодёжь"],
    area: "Советский",
  },
  {
    id: "dzerzh",
    name: "Дзержинский",
    shortName: "Дзержинка",
    description: "Современный район с торговыми центрами и развитой инфраструктурой.",
    icon: "🌆",
    color: "#F39C12",
    residents: 1345,
    ads: 3210,
    rating: 4.5,
    topCategories: ["🏠 Недвижимость", "📱 Электроника", "🚗 Авто", "🛋️ Мебель"],
    image: "https://readdy.ai/api/search-image?query=Dzerzhinsky%20Novosibirsk%20modern%20winter%20aerial&width=600&height=400",
    avgPrice: "38 400 ₽",
    trend: "up",
    mapX: 72,
    mapY: 35,
    highlights: ["ТЦ Сибирский Молл", "Площадь Дзержинского"],
    popularTags: ["шопинг", "метро", "современный"],
    area: "Дзержинский",
  },
  {
    id: "zhelezn",
    name: "Железнодорожный",
    shortName: "ЖД",
    description: "Вокзал, транспортная развязка и исторический центр.",
    icon: "🚂",
    color: "#D35400",
    residents: 987,
    ads: 2156,
    rating: 4.2,
    topCategories: ["🚗 Авто", "📱 Электроника", "👕 Одежда", "🛋️ Мебель"],
    image: "https://readdy.ai/api/search-image?query=Novosibirsk%20train%20station%20winter%20aerial&width=600&height=400",
    avgPrice: "26 500 ₽",
    trend: "stable",
    mapX: 45,
    mapY: 30,
    highlights: ["Ж/д вокзал", "Автовокзал"],
    popularTags: ["вокзал", "транспорт", "проездом"],
    area: "Железнодорожный",
  },
  {
    id: "kalinin",
    name: "Калининский",
    shortName: "Калинин",
    description: "Спальный район с доступным жильём и хорошей экологией.",
    icon: "🏙️",
    color: "#16A085",
    residents: 1567,
    ads: 3456,
    rating: 4.4,
    topCategories: ["🏠 Недвижимость", "🛋️ Мебель", "👶 Детское", "🚗 Авто"],
    image: "https://readdy.ai/api/search-image?query=Kalininsky%20Novosibirsk%20residential%20winter%20aerial&width=600&height=400",
    avgPrice: "27 800 ₽",
    trend: "up",
    mapX: 55,
    mapY: 20,
    highlights: ["Парк Сосновый бор", "ТРЦ Ройял Парк"],
    popularTags: ["доступно", "экология", "семейный"],
    area: "Калининский",
  },
  {
    id: "leninsky",
    name: "Ленинский",
    shortName: "Ленинский",
    description: "Крупнейший район левого берега с развитой инфраструктурой.",
    icon: "🏢",
    color: "#8D99AE",
    residents: 1890,
    ads: 5120,
    rating: 4.3,
    topCategories: ["🏠 Недвижимость", "🚗 Авто", "🛋️ Мебель", "👕 Одежда"],
    image: "https://readdy.ai/api/search-image?query=Leninsky%20Novosibirsk%20district%20winter%20aerial&width=600&height=400",
    avgPrice: "30 500 ₽",
    trend: "stable",
    mapX: 35,
    mapY: 62,
    highlights: ["Площадь Станиславского", "ТРЦ Континент"],
    popularTags: ["доступно", "развитый", "транспорт"],
    area: "Ленинский",
  },
];

// ============================================
// УТИЛИТЫ
// ============================================

export const getMockAdById = (id: number): MockAd | undefined => {
  return mockAds.find(ad => ad.id === id);
};

export const getMockAdsByCategory = (categoryId: number): MockAd[] => {
  return mockAds.filter(ad => ad.category_id === categoryId);
};

export const getMockAdsByDistrict = (district: string): MockAd[] => {
  return mockAds.filter(ad => ad.district === district);
};

export const getPopularMockAds = (limit: number = 6): MockAd[] => {
  return [...mockAds].sort((a, b) => b.views - a.views).slice(0, limit);
};

export const getRecentMockAds = (limit: number = 6): MockAd[] => {
  return [...mockAds].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, limit);
};

export const getFreeMockAds = (): MockAd[] => {
  return mockAds.filter(ad => ad.is_gift);
};

export const getMockCategoryById = (id: string): MockCategory | undefined => {
  return mockCategories.find(cat => cat.id === id);
};

export const getMockDistrictById = (id: string): MockDistrict | undefined => {
  return mockDistricts.find(dist => dist.id === id);
};

export const getMockDistrictByName = (name: string): MockDistrict | undefined => {
  return mockDistricts.find(dist => dist.name === name);
};

export const getTopMockDistricts = (limit: number = 6): MockDistrict[] => {
  return [...mockDistricts].sort((a, b) => b.ads - a.ads).slice(0, limit);
};

export const getTrendingMockDistricts = (limit: number = 3): MockDistrict[] => {
  return [...mockDistricts]
    .filter(d => d.trend === "up")
    .sort((a, b) => b.ads - a.ads)
    .slice(0, limit);
};

export const getTotalMockStats = () => {
  return {
    totalAds: mockAds.length,
    totalViews: mockAds.reduce((sum, ad) => sum + ad.views, 0),
    avgPrice: Math.round(mockAds.reduce((sum, ad) => sum + (ad.price || 0), 0) / mockAds.length),
    activeSellers: new Set(mockAds.map(ad => ad.seller.id)).size,
    totalDistricts: mockDistricts.length,
    totalCategories: mockCategories.length,
  };
};

// ============================================
// ЭКСПОРТ ПО УМОЛЧАНИЮ
// ============================================

export default {
  mockAds,
  mockCategories,
  mockDistricts,
  getMockAdById,
  getMockAdsByCategory,
  getMockAdsByDistrict,
  getPopularMockAds,
  getRecentMockAds,
  getFreeMockAds,
  getMockCategoryById,
  getMockDistrictById,
  getMockDistrictByName,
  getTopMockDistricts,
  getTrendingMockDistricts,
  getTotalMockStats,
};