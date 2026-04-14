import { lazy, Suspense, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import AIAssistant from "@/components/feature/AIAssistant";
import HeroSection from "./components/HeroSection";
import CategoriesSection from "./components/CategoriesSection";
import DistrictsSection from "./components/DistrictsSection";
import CTASection from "./components/CTASection";
import { useTheme } from "@/contexts/ThemeContext";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useNearbyAds } from "@/hooks/useNearbyAds";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArrowUp } from "lucide-react";

// ============================================
// КОНСТАНТЫ
// ============================================

const SCROLL_THRESHOLD = 500;
const ADS_SKELETON_COUNT = 8;
const NEARBY_ADS_CONFIG = { radiusKm: 50, sortBy: "recent", limit: 20 } as const;

// ============================================
// LAZY LOAD
// ============================================

const AdsSection = lazy(() => import("./components/AdsSection"));

// ============================================
// СКЕЛЕТОН
// ============================================

const AdsSectionSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-12">
    <div className="h-8 w-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg mb-8 animate-pulse" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(ADS_SKELETON_COUNT)].map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
          <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-2/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ============================================
// КНОПКА НАВЕРХ (С ДЕБАУНСОМ)
// ============================================

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setVisible(window.scrollY > SCROLL_THRESHOLD);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-[#E6B31E] to-[#F7A31E] text-[#0A1828] flex items-center justify-center shadow-xl hover:shadow-2xl transition-all"
          aria-label="Наверх"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function HomePage() {
  const { isDark } = useTheme();
  const { location, district } = useGeoLocation();
  const { ads, loading: adsLoading } = useNearbyAds(
    location?.lat ?? null,
    location?.lon ?? null,
    NEARBY_ADS_CONFIG
  );

  const pageRef = useRef<HTMLDivElement>(null);

  // ============================================
  // МЕМОИЗИРОВАННЫЕ SEO ДАННЫЕ
  // ============================================

  const seoData = useMemo(() => {
    const districtName = district?.name;
    const districtSlug = districtName?.toLowerCase().replace(/\s+/g, "-");
    const adsCount = ads.length;

    return {
      title: districtName
        ? `Объявления в районе ${districtName} | SibBoard Новосибирск`
        : "SibBoard — доска объявлений Новосибирска | Круче Авито и Юлы",
      description: districtName
        ? `Купить и продать в районе ${districtName} Новосибирска. ${adsCount} актуальных объявлений. Безопасные сделки, AI-помощник.`
        : "SibBoard — современная доска объявлений Новосибирска. Голосовые объявления, AI-генератор описаний, безопасные сделки, рейтинг продавцов.",
      canonical: districtName
        ? `https://sibboard.ru/novosibirsk/${districtSlug}`
        : "https://sibboard.ru",
      districtSlug,
    };
  }, [district?.name, ads.length]);

  // ============================================
  // МЕМОИЗИРОВАННЫЕ SCHEMA.ORG
  // ============================================

  const schemas = useMemo(() => {
    const baseUrl = "https://sibboard.ru";
    
    const website = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SibBoard",
      "alternateName": ["Сибирская доска объявлений", "SibBoard Новосибирск"],
      "url": baseUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "inLanguage": "ru-RU"
    };

    const localBusiness = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "SibBoard Новосибирск",
      "image": `${baseUrl}/og-image.jpg`,
      "@id": baseUrl,
      "url": baseUrl,
      "telephone": "+7-913-706-57-70",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Красный проспект, 1",
        "addressLocality": "Новосибирск",
        "addressRegion": "Новосибирская область",
        "postalCode": "630007",
        "addressCountry": { "@type": "Country", "name": "RU" }
      },
      "geo": { "@type": "GeoCoordinates", "latitude": 55.0302, "longitude": 82.9204 },
      "areaServed": { "@type": "City", "name": "Новосибирск" },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "12847",
        "bestRating": "5",
        "worstRating": "1"
      }
    };

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Главная", "item": baseUrl },
        district?.name ? {
          "@type": "ListItem",
          "position": 2,
          "name": district.name,
          "item": `${baseUrl}/novosibirsk/${district.name.toLowerCase().replace(/\s+/g, "-")}`
        } : null
      ].filter(Boolean)
    };

    const itemList = ads.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "numberOfItems": Math.min(ads.length, 10),
      "itemListElement": ads.slice(0, 10).map((ad, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${baseUrl}/ads/${ad.id}`,
        "name": ad.title
      }))
    } : null;

    return { website, localBusiness, breadcrumb, itemList };
  }, [district?.name, ads]);

  // ============================================
  // ФОН
  // ============================================

  const backgroundStyle = useMemo(() => ({
    background: isDark 
      ? "linear-gradient(180deg, #0A1828 0%, #0D2135 100%)" 
      : "linear-gradient(180deg, #F0F6FF 0%, #E8F0FE 100%)",
    minHeight: "100vh",
    fontFamily: "Nunito, sans-serif",
  }), [isDark]);

  // ============================================
  // РЕНДЕР
  // ============================================

  return (
    <>
      <Helmet>
        <html lang="ru" />
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content="объявления Новосибирск, доска объявлений, купить Новосибирск, продать Новосибирск, SibBoard" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="geo.region" content="RU-NVS" />
        <meta name="geo.placename" content="Новосибирск" />
        <meta name="geo.position" content="55.0302;82.9204" />
        <meta name="ICBM" content="55.0302, 82.9204" />
        
        <link rel="canonical" href={seoData.canonical} />
        <link rel="alternate" href="https://sibboard.ru" hrefLang="ru" />
        <link rel="alternate" href="https://sibboard.ru/en" hrefLang="en" />
        <link rel="alternate" href="https://sibboard.ru" hrefLang="x-default" />
        
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SibBoard" />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:url" content={seoData.canonical} />
        <meta property="og:image" content="https://sibboard.ru/og-image.jpg" />
        <meta property="og:locale" content="ru_RU" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content="https://sibboard.ru/og-image.jpg" />
        
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="SibBoard" />
        <meta name="theme-color" content={isDark ? "#0A1828" : "#F0F6FF"} />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//bnelnjawwqdvhhxeiqrt.supabase.co" />
        
        <script type="application/ld+json">{JSON.stringify(schemas.website)}</script>
        <script type="application/ld+json">{JSON.stringify(schemas.localBusiness)}</script>
        <script type="application/ld+json">{JSON.stringify(schemas.breadcrumb)}</script>
        {schemas.itemList && <script type="application/ld+json">{JSON.stringify(schemas.itemList)}</script>}
      </Helmet>

      <JsonLd schema={schemas.website} />
      <JsonLd schema={schemas.localBusiness} />
      <JsonLd schema={schemas.breadcrumb} />
      {schemas.itemList && <JsonLd schema={schemas.itemList} />}

      <div ref={pageRef} className="relative" style={backgroundStyle} itemScope itemType="https://schema.org/WebPage">
        <meta itemProp="name" content="SibBoard Новосибирск" />
        <meta itemProp="description" content={seoData.description} />
        
        <Navbar transparent />
        
        <main>
          <HeroSection />
          <CategoriesSection />
          
          <Suspense fallback={<AdsSectionSkeleton />}>
            <AdsSection ads={ads} loading={adsLoading} districtName={district?.name} />
          </Suspense>
          
          <DistrictsSection />
          <CTASection />
        </main>
        
        <Footer />
        <AIAssistant />
        <ScrollToTop />
      </div>
    </>
  );
}