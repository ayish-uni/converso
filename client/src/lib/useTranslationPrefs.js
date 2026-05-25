import { useAuth } from "../state/AuthContext.jsx";

/**
 * Hook to access and manage translation preferences
 * Provides a simple interface for components to interact with translation settings
 */
export function useTranslationPrefs() {
  const auth = useAuth();

  return {
    // State
    autoTranslate: auth.translationPreferences?.autoTranslate ?? true,
    displayMode: auth.translationPreferences?.displayMode ?? "classic",
    audioEnabled: auth.translationPreferences?.audioEnabled ?? false,

    // Actions
    toggleAutoTranslate: auth.toggleAutoTranslate,
    setDisplayMode: auth.setDisplayMode,
    toggleAudioEnabled: auth.toggleAudioEnabled,
    updatePreferences: auth.updateTranslationPreferences,

    // Status
    syncInProgress: auth.syncInProgress,
  };
}
