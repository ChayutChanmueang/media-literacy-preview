/**
 * Progress & Session Persistence Service (Hybrid LocalStorage & Cookie Backup)
 * Optimized for LINE In-App Browser to prevent data loss.
 */

const SESSION_KEY = 'naplab_ml_session';
const PROGRESS_KEY = 'naplab_ml_progress';
const COOKIE_MAX_AGE_DAYS = 365;

// Helper to set cookie
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  // SameSite=Lax and Secure (if https)
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}${expires}; path=/; SameSite=Lax`;
}

// Helper to get cookie
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
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

// Helper to generate UUID
function generateUUID() {
  return 'ml-' + Math.random().toString(36).substring(2, 15) + '-' + Math.random().toString(36).substring(2, 15);
}

export const progressService = {
  /**
   * Initializes or retrieves the session data (anonymous user session).
   */
  getOrCreateSession() {
    // 1. Try to load from LocalStorage
    let session = null;
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) session = JSON.parse(stored);
    } catch (e) {
      console.error('Error reading localStorage session', e);
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
          province: '',
          district: '',
          subdistrict: '',
          source: 'none' // 'auto' (cloudflare cf/region) or 'manual'
        },
        createdAt: new Date().toISOString()
      };
      this.saveSession(session);
    }

    return session;
  },

  /**
   * Saves session details.
   */
  saveSession(session) {
    // Save to LocalStorage
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to write session to localStorage', e);
    }
    // Save to Cookie
    setCookie(SESSION_KEY, session, COOKIE_MAX_AGE_DAYS);
  },

  /**
   * Initializes or retrieves progress information.
   */
  getProgress() {
    let progress = null;
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
        currentStep: 'landing', // 'landing' | 'consent' | 'video' | 'game' | 'reward'
        completedLessons: [], // list of lesson IDs completed
        stars: {}, // { lessonId: numberOfStars }
        currentLessonId: 'topic-1', // active lesson
        lastUpdated: new Date().toISOString()
      };
      this.saveProgress(progress);
    }

    return progress;
  },

  /**
   * Saves progress details.
   */
  saveProgress(progress) {
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
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(PROGRESS_KEY);
    } catch (e) {}
    document.cookie = `${SESSION_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${PROGRESS_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};
