import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

const initialToken = localStorage.getItem("chat_token");

// Debounce function for syncing preferences
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(initialToken));
  const [translationPreferences, setTranslationPreferences] = useState(() => {
    const stored = localStorage.getItem("translationPrefs");
    return stored
      ? JSON.parse(stored)
      : { autoTranslate: true, displayMode: "classic", audioEnabled: false };
  });
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Debounced sync function
  const syncPreferencesToServer = useCallback(
    debounce(async (prefs) => {
      if (!token || !user) return;
      try {
        setSyncInProgress(true);
        await api.patch("/users/translation-preferences", prefs, token);
      } catch (error) {
        console.error("Failed to sync translation preferences:", error);
      } finally {
        setSyncInProgress(false);
      }
    }, 5000),
    [token, user],
  );

  // Update local preferences and sync to server
  const updateTranslationPreferences = useCallback(
    (newPrefs) => {
      const updated =
        typeof newPrefs === "function"
          ? newPrefs(translationPreferences)
          : { ...translationPreferences, ...newPrefs };
      setTranslationPreferences(updated);
      localStorage.setItem("translationPrefs", JSON.stringify(updated));
      syncPreferencesToServer(updated);
    },
    [translationPreferences, syncPreferencesToServer],
  );

  const toggleAutoTranslate = useCallback(() => {
    updateTranslationPreferences((prev) => ({
      ...prev,
      autoTranslate: !prev.autoTranslate,
    }));
  }, [updateTranslationPreferences]);

  const setDisplayMode = useCallback(
    (mode) => {
      updateTranslationPreferences((prev) => ({ ...prev, displayMode: mode }));
    },
    [updateTranslationPreferences],
  );

  const toggleAudioEnabled = useCallback(() => {
    updateTranslationPreferences((prev) => ({
      ...prev,
      audioEnabled: !prev.audioEnabled,
    }));
  }, [updateTranslationPreferences]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    api
      .get("/auth/me", token)
      .then((data) => {
        setUser(data.user);
        // Load user's stored preferences if available
        if (data.user?.translationPreferences) {
          setTranslationPreferences(data.user.translationPreferences);
          localStorage.setItem(
            "translationPrefs",
            JSON.stringify(data.user.translationPreferences),
          );
        }
      })
      .catch(() => {
        localStorage.removeItem("chat_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    localStorage.setItem("chat_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (payload) => {
    return api.post("/auth/register", payload);
  };

  const logout = () => {
    localStorage.removeItem("chat_token");
    localStorage.removeItem("translationPrefs");
    setToken(null);
    setUser(null);
    setTranslationPreferences({
      autoTranslate: true,
      displayMode: "classic",
      audioEnabled: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        translationPreferences,
        updateTranslationPreferences,
        toggleAutoTranslate,
        setDisplayMode,
        toggleAudioEnabled,
        syncInProgress,
        login,
        register,
        logout,
        setUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
