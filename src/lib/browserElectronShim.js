/**
 * Browser mock for window.electronAPI.
 *
 * When the React frontend is viewed directly in a web browser (e.g. during UI
 * development at http://127.0.0.1:5183/ or preview), Electron's preload script is
 * not present. This shim provides safe fallbacks so components do not throw
 * unhandled TypeErrors.
 *
 * Inside Electron, window.electronAPI is already injected by preload.js, so this
 * shim does nothing.
 */

if (typeof window !== "undefined" && !window.electronAPI) {
  const baseShim = {
    isBrowserMock: true,
    getPlatform: () => {
      const ua = navigator.userAgent;
      if (ua.includes("Win")) return "win32";
      if (ua.includes("Mac")) return "darwin";
      return "linux";
    },
    getLogLevel: async () => "info",
    log: async (entry) => {
      // no-op or debug in browser
    },
    openExternal: (url) => {
      window.open(url, "_blank");
    },
    checkMicrophoneAccess: async () => ({ granted: true }),
    requestMicrophoneAccess: async () => ({ granted: true }),
    openMicrophoneSettings: async () => ({ success: true }),
    openAccessibilitySettings: async () => ({ success: true }),
    getFolders: async () => [],
    getNotes: async () => [],
    getSpaces: async () => [],
    getNoteUndos: async () => [],
    getSttConfig: async () => ({ success: false }),
    getTranscriptionHistory: async () => [],
    getAvailableModels: async () => [],
    getCurrentHotkey: () => "Control+Super",
    getActivationMode: () => "tap",
    setActivationMode: async () => ({ success: true }),
    saveHotkey: async () => ({ success: true }),
    restoreDefaultHotkey: async () => ({ success: true }),
    setOnboardingWindowMode: async () => true,
    setOnboardingActive: async () => true,
    onboardingSetWindowMode: async () => true,
    onboardingSetActive: async () => true,
    setFloatingIconAutoHide: () => {},
    setScreenContextEnabled: () => {},
    claimNoteUndo: async () => false,
    discardNoteUndo: async () => {},
    undoNoteUpdate: async () => ({ success: true }),
  };

  window.electronAPI = new Proxy(baseShim, {
    get(target, prop) {
      if (typeof prop !== "string") return target[prop];
      if (prop in target) return target[prop];

      // Handle event listener registration (on*, removeListener, etc.)
      if (
        prop.startsWith("on") ||
        prop.startsWith("remove") ||
        prop.includes("Listener")
      ) {
        return (_callback) => () => {}; // Return unregister function
      }

      // Default async function returning safe objects
      return async (..._args) => {
        if (
          prop.startsWith("get") ||
          prop.startsWith("list") ||
          prop.startsWith("fetch")
        ) {
          if (
            prop.endsWith("s") ||
            prop.endsWith("List") ||
            prop.endsWith("History")
          ) {
            return [];
          }
          return null;
        }
        if (
          prop.startsWith("is") ||
          prop.startsWith("has") ||
          prop.startsWith("check")
        ) {
          return true;
        }
        return { success: true };
      };
    },
  });
}
