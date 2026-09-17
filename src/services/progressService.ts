/**
 * Progress & Session Persistence Service (Hybrid LocalStorage & Cookie Backup)
 * Optimized for LINE In-App Browser to prevent data loss.
 */
import { apiClient } from "./apiClient";
import { UAParser } from "ua-parser-js";
import { LEADERBOARD_PLAYER_KEY } from "./leaderboardPlayerService";
import { LEADERBOARD_PENDING_SCORE_KEY } from "./leaderboardScoreService";

const SESSION_KEY = "naplab_ml_session";
const PROGRESS_KEY = "naplab_ml_progress";
const COOKIE_MAX_AGE_DAYS = 365;

// Helper to set cookie
function setCookie(name: string, value: any, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "; expires=" + date.toUTCString();
  // SameSite=Lax
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}${expires}; path=/; SameSite=Lax`;
}

// Helper to get cookie
function getCookie(name: string) {
  const nameEQ = name + "=";
  if (typeof document === "undefined") return null;
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

// Helper to generate a valid RFC4122 v4 UUID
function generateUUID() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const progressService = {
  /**
   * Helper to parse and retrieve device metadata using UAParser.js
   */
  getDeviceMetadata() {
    if (typeof window === "undefined") return null;
    try {
      const parser = new UAParser();
      const device = parser.getDevice();
      const os = parser.getOS();
      const browser = parser.getBrowser();
      return {
        device_vendor: device.vendor || "Unknown",
        device_model: device.model || "Unknown",
        device_type: device.type || "mobile",
        os_name: os.name || "Unknown",
        os_version: os.version || "Unknown",
        browser_name: browser.name || "Unknown",
        browser_version: browser.version || "Unknown",
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
      };
    } catch (e) {
      console.error("Failed to parse user agent:", e);
      return null;
    }
  },

  /**
   * Initializes or retrieves the session data (anonymous user session).
   */
  getOrCreateSession() {
    if (typeof window === "undefined") return null;

    // 1. Try to load from LocalStorage
    let session: any = null;
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) session = JSON.parse(stored);
    } catch (e) {
      console.error("Error reading localStorage session", e);
    }

    // 2. Try to load from Cookie
    const cookieSession = getCookie(SESSION_KEY);

    // 3. Reconcile
    if (session && !cookieSession) {
      // Sync LocalStorage to Cookie
      setCookie(SESSION_KEY, session, COOKIE_MAX_AGE_DAYS);
    } else if (!session && cookieSession) {
      // Sync Cookie to LocalStorage
      session = cookieSession;
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } catch (e) {}
    }

    // 4. Create new if not exists anywhere
    if (!session) {
      session = {
        sessionId: generateUUID(),
        ageGroup: null,
        consentGiven: false,
        location: {
          province: "",
          district: "",
          subdistrict: "",
          source: "none",
        },
        deviceMetadata: this.getDeviceMetadata(),
        createdAt: new Date().toISOString(),
      };
      this.saveSession(session);
    } else if (!session.deviceMetadata) {
      // Populate device metadata for existing sessions on load
      session.deviceMetadata = this.getDeviceMetadata();
      this.saveSession(session);
    }

    return session;
  },

  /**
   * Saves session details.
   */
  async saveSession(session: any) {
    if (typeof window === "undefined") return;

    // Save to LocalStorage
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error("Failed to write session to localStorage", e);
    }
    // Save to Cookie
    setCookie(SESSION_KEY, session, COOKIE_MAX_AGE_DAYS);

    // Sync session to backend if consent is given and age group is selected
    if (session.consentGiven && session.ageGroup) {
      try {
        await apiClient.saveSession(session);
        console.log("[ProgressService] Session synced to backend successfully.");
      } catch (err) {
        console.error("[ProgressService] Network error syncing session:", err);
      }
    }
  },

  /**
   * Initializes or retrieves progress information.
   */
  getProgress() {
    if (typeof window === "undefined") {
      return {
        currentStep: "landing",
        completedLessons: [],
        stars: {},
        currentLessonId: "topic-1",
        lastUpdated: new Date().toISOString(),
      };
    }

    let progress: any = null;
    try {
      const stored = localStorage.getItem(PROGRESS_KEY);
      if (stored) progress = JSON.parse(stored);
    } catch (e) {}

    const cookieProgress = getCookie(PROGRESS_KEY);

    if (progress && !cookieProgress) {
      setCookie(PROGRESS_KEY, progress, COOKIE_MAX_AGE_DAYS);
    } else if (!progress && cookieProgress) {
      progress = cookieProgress;
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      } catch (e) {}
    }

    if (!progress) {
      progress = {
        currentStep: "landing", // 'landing' | 'consent' | 'video' | 'game' | 'reward'
        completedLessons: [], // list of lesson IDs completed
        stars: {}, // { lessonId: numberOfStars }
        currentLessonId: "topic-1", // active lesson
        lastUpdated: new Date().toISOString(),
      };
      this.saveProgress(progress);
    }

    return progress;
  },

  /**
   * Saves progress details.
   */
  saveProgress(progress: any) {
    if (typeof window === "undefined") return;
    progress.lastUpdated = new Date().toISOString();
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {}
    setCookie(PROGRESS_KEY, progress, COOKIE_MAX_AGE_DAYS);
  },

  /**
   * Resets all progress (useful for testing or starting over).
   */
  resetAll() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(PROGRESS_KEY);
      localStorage.removeItem(LEADERBOARD_PLAYER_KEY);
      sessionStorage.removeItem(LEADERBOARD_PENDING_SCORE_KEY);
    } catch (e) {}
    document.cookie = `${SESSION_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${PROGRESS_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },
};
