import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase, type User } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

// ============================================
// ТИПЫ
// ============================================

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: Error | null }>;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// ============================================
// КОНТЕКСТ
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// ПРОВАЙДЕР
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  // ============================================
  // ЗАГРУЗКА ПРОФИЛЯ
  // ============================================

  const fetchProfile = useCallback(async (userId: string): Promise<User | null> => {
    try {
      console.log("🔄 Fetching profile for:", userId);
      
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        // Если профиль не найден, создаём его
        if (error.code === "PGRST116") {
          console.log("📝 Profile not found, creating...");
          
          // Получаем телефон из auth.users
          const { data: authData } = await supabase.auth.getUser();
          const phone = authData.user?.phone || null;
          
          const { data: newProfile, error: createError } = await supabase
            .from("users")
            .insert({
              id: userId,
              phone,
              name: "Пользователь",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select("*")
            .single();
          
          if (createError) {
            console.error("❌ Failed to create profile:", createError);
            return null;
          }
          
          console.log("✅ Profile created:", newProfile);
          return newProfile as User;
        }
        
        console.error("❌ Profile fetch error:", error);
        return null;
      }
      
      console.log("✅ Profile fetched:", data);
      return data as User;
    } catch (err) {
      console.error("❌ Unexpected error fetching profile:", err);
      return null;
    }
  }, []);

  // ============================================
  // ОБНОВЛЕНИЕ ПРОФИЛЯ
  // ============================================

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    
    if (!userId) {
      console.log("❌ No user ID in session");
      return;
    }
    
    console.log("🔄 Refreshing profile for:", userId);
    const profile = await fetchProfile(userId);
    if (profile) {
      console.log("✅ Setting user:", profile);
      setState(prev => ({ ...prev, user: profile }));
    }
  }, [fetchProfile]);

  // ============================================
  // ОБНОВЛЕНИЕ ДАННЫХ ПРОФИЛЯ
  // ============================================

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<{ error: Error | null }> => {
    const userId = state.user?.id;
    
    if (!userId) {
      return { error: new Error("No authenticated user") };
    }
    
    try {
      const { error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      
      if (!error) {
        await refreshProfile();
      }
      
      return { error: error as Error | null };
    } catch (err) {
      console.error("❌ Failed to update profile:", err);
      return { error: err as Error };
    }
  }, [state.user?.id, refreshProfile]);

  // ============================================
  // ВЫХОД
  // ============================================

  const signOut = useCallback(async () => {
    console.log("🚪 Signing out...");
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ Sign out error:", error);
        return;
      }
      
      setState({
        user: null,
        session: null,
        loading: false,
      });
      
      // Очищаем локальное хранилище
      localStorage.removeItem("sibboard_auth");
      
      console.log("✅ Signed out successfully");
    } catch (err) {
      console.error("❌ Sign out error:", err);
    }
  }, []);

  // ============================================
  // ИНИЦИАЛИЗАЦИЯ
  // ============================================

  useEffect(() => {
    console.log("🚀 AuthProvider initializing...");
    
    let mounted = true;
    
    // Проверяем начальную сессию
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error("❌ Failed to get session:", error);
          setState(prev => ({ ...prev, loading: false }));
          return;
        }
        
        console.log("📦 Initial session:", session?.user?.id || "none");
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (mounted) {
            setState({
              user: profile,
              session,
              loading: false,
            });
          }
        } else {
          if (mounted) {
            setState({
              user: null,
              session: null,
              loading: false,
            });
          }
        }
      } catch (err) {
        console.error("❌ Init auth error:", err);
        if (mounted) {
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    };
    
    initAuth();

    // Слушаем изменения авторизации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.id || "none");
      
      if (!mounted) return;
      
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) {
          setState({
            user: profile,
            session,
            loading: false,
          });
        }
      } else {
        if (mounted) {
          setState({
            user: null,
            session: null,
            loading: false,
          });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // ============================================
  // МЕМОИЗИРОВАННЫЕ ЗНАЧЕНИЯ
  // ============================================

  const value = useMemo((): AuthContextType => ({
    user: state.user,
    session: state.session,
    loading: state.loading,
    isAuthenticated: !!state.user && !!state.session,
    signOut,
    refreshProfile,
    updateProfile,
  }), [state.user, state.session, state.loading, signOut, refreshProfile, updateProfile]);

  // ============================================
  // РЕНДЕР
  // ============================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// ХУК
// ============================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};

// ============================================
// ЭКСПОРТЫ
// ============================================

export { AuthContext };