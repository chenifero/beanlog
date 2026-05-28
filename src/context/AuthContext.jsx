import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { profileService } from "@/services/profileService";
import { notificationService } from "@/services/notificationService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async (userId) => {
    if (!userId) return;
    try {
      const count = await notificationService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
    }
  };

  const clearUnreadCount = () => setUnreadCount(0);

  // Carga el perfil desde Supabase
  const refreshProfile = async (userId) => {
    if (!userId) return;
    try {
      const data = await profileService.getProfile(userId);
      setProfile(data);
    } catch (err) {
      console.error("Error cargando perfil:", err);
    }
    await refreshUnreadCount(userId);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentSession = await authService.getSession();
        setSession(currentSession);
        if (currentSession) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          await refreshProfile(currentUser.id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const subscription = authService.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) refreshProfile(session.user.id);
      // añadir esto:
      if (event === "USER_UPDATED") {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    loading,
    error,
    profile,
    refreshProfile,
    isAuthenticated: !!user,
    unreadCount,
    clearUnreadCount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
