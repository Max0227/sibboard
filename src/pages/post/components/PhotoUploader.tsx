import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  ImagePlus, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Star,
  Move
} from "lucide-react";
import { supabase, getImageUrl } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

// ============================================
// ТИПЫ
// ============================================

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  maxSizeMB?: number;
}

// ============================================
// КОМПОНЕНТ
// ============================================

export default function PhotoUploader({ 
  photos, 
  onChange, 
  maxPhotos = 8,
  maxSizeMB = 10 
}: PhotoUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { isDark } = useTheme();

  // ============================================
  // ЗАГРУЗКА В SUPABASE STORAGE
  // ============================================

  const uploadToStorage = async (file: File): Promise<string> => {
    // Валидация размера
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`Файл больше ${maxSizeMB} МБ`);
    }

    // Валидация типа
    if (!file.type.startsWith("image/")) {
      throw new Error("Можно загружать только изображения");
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const userId = user?.id || "anon";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `${userId}/${timestamp}_${random}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("ad-images")
      .upload(fileName, file, { 
        cacheControl: "3600", 
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("ad-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  // ============================================
  // ОБРАБОТЧИКИ ФАЙЛОВ
  // ============================================

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      
      setError("");
      setSuccess("");
      
      const remaining = maxPhotos - photos.length;
      if (remaining <= 0) {
        setError(`Максимум ${maxPhotos} фото`);
        return;
      }

      const toProcess = Array.from(files).slice(0, remaining);
      
      // Валидация перед загрузкой
      for (const file of toProcess) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`Файл "${file.name}" больше ${maxSizeMB} МБ`);
          return;
        }
        if (!file.type.startsWith("image/")) {
          setError(`Файл "${file.name}" не является изображением`);
          return;
        }
      }

      if (user) {
        // Загрузка в Supabase Storage
        setUploading(true);
        setUploadProgress(0);
        const urls: string[] = [];
        
        for (let i = 0; i < toProcess.length; i++) {
          try {
            const url = await uploadToStorage(toProcess[i]);
            urls.push(url);
            setUploadProgress(Math.round(((i + 1) / toProcess.length) * 100));
          } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.message || "Ошибка загрузки фото");
            break;
          }
        }
        
        setUploading(false);
        setUploadProgress(0);
        
        if (urls.length > 0) {
          onChange([...photos, ...urls]);
          setSuccess(`Загружено ${urls.length} фото`);
          setTimeout(() => setSuccess(""), 3000);
        }
      } else {
        // Fallback: base64 для неавторизованных (не рекомендуется)
        const readFileAsDataUrl = (file: File): Promise<string> =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        
        const results = await Promise.all(toProcess.map(readFileAsDataUrl));
        onChange([...photos, ...results]);
      }
      
      // Очищаем input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [photos, onChange, user, maxPhotos, maxSizeMB]
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  // ============================================
  // УПРАВЛЕНИЕ ФОТО
  // ============================================

  const removePhoto = async (idx: number) => {
    const url = photos[idx];
    
    // Удаляем из Supabase Storage
    if (url.includes("supabase") && url.includes("ad-images")) {
      try {
        const parts = url.split("/ad-images/");
        if (parts[1]) {
          await supabase.storage.from("ad-images").remove([parts[1]]);
        }
      } catch (err) {
        console.error("Failed to delete from storage:", err);
      }
    }
    
    onChange(photos.filter((_, i) => i !== idx));
  };

  const movePhoto = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    const next = [...photos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const setAsMain = (idx: number) => {
    if (idx === 0) return;
    movePhoto(idx, 0);
  };

  // ============================================
  // РЕНДЕР
  // ============================================

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <label className="text-white font-bold text-sm flex items-center gap-1">
          <ImagePlus className="w-4 h-4 text-[#E6B31E]" />
          Фотографии
          <span className="text-[#E6B31E]">*</span>
        </label>
        <span className="text-white/30 text-xs">
          {photos.length}/{maxPhotos} фото
        </span>
      </div>

      {/* Зона загрузки */}
      {photos.length < maxPhotos && (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          animate={{ 
            borderColor: dragging ? "#E6B31E" : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
            background: dragging 
              ? "rgba(230,179,30,0.06)" 
              : isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
          }}
          className="w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-10 transition-all cursor-pointer"
          style={{ cursor: uploading ? "not-allowed" : "pointer" }}
          whileHover={!uploading ? { background: "rgba(230,179,30,0.05)" } : {}}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#E6B31E]/10">
                <Loader2 className="text-[#E6B31E] w-7 h-7 animate-spin" />
              </div>
              <div className="text-white/70 font-semibold text-sm">Загружаем фото...</div>
              <div className="w-48 h-1.5 rounded-full overflow-hidden bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#E6B31E] to-[#F7A31E]"
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="text-white/40 text-xs">{uploadProgress}%</div>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#E6B31E]/10">
                <Upload className="text-[#E6B31E] w-7 h-7" />
              </div>
              <div className="text-center">
                <div className="text-white/70 font-semibold text-sm">
                  {dragging ? "Отпустите файлы здесь" : "Перетащите фото или нажмите"}
                </div>
                <div className="text-white/30 text-xs mt-1">
                  JPG, PNG, WEBP · до {maxSizeMB} МБ
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1828] bg-gradient-to-r from-[#E6B31E] to-[#F7A31E]">
                Выбрать файлы
              </div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
        </motion.div>
      )}

      {/* Сообщения */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-xl"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 px-3 py-2 rounded-xl"
          >
            <CheckCircle className="w-4 h-4" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Сетка фото */}
      {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <AnimatePresence>
            {photos.map((src, idx) => {
              const imageUrl = getImageUrl(src) || src;
              
              return (
                <motion.div
                  key={`${idx}-${src.slice(-20)}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group rounded-xl overflow-hidden"
                  style={{ aspectRatio: "1/1" }}
                >
                  <img 
                    src={imageUrl} 
                    alt={`Фото ${idx + 1}`} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Бейдж главного фото */}
                  {idx === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-[10px] font-black text-[#0A1828] bg-gradient-to-r from-[#E6B31E] to-[#F7A31E] flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-[#0A1828]" />
                      Главное
                    </div>
                  )}
                  
                  {/* Оверлей с действиями */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {idx > 0 && (
                      <button
                        onClick={() => movePhoto(idx, idx - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                        title="Переместить влево"
                      >
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => setAsMain(idx)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#E6B31E]/80 hover:bg-[#E6B31E] transition-colors"
                      title="Сделать главным"
                    >
                      <Star className="w-4 h-4 text-white" />
                    </button>
                    
                    <button
                      onClick={() => removePhoto(idx)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/70 hover:bg-red-500 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                    
                    {idx < photos.length - 1 && (
                      <button
                        onClick={() => movePhoto(idx, idx + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                        title="Переместить вправо"
                      >
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                  
                  {/* Номер фото */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] text-white/80 bg-black/40 backdrop-blur-sm">
                    {idx + 1}/{photos.length}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Подсказка */}
      {photos.length > 0 && (
        <div className="flex items-center gap-2 text-white/30 text-xs">
          <Move className="w-3 h-3" />
          <span>Первое фото — главное. Наведите для управления.</span>
        </div>
      )}
    </div>
  );
}