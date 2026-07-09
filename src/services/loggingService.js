import { supabase } from './supabaseClient';
import { progressService } from './progressService';

const OFFLINE_LOGS_KEY = 'naplab_ml_offline_logs';

// Get queued offline logs
function getOfflineLogs() {
  try {
    const stored = localStorage.getItem(OFFLINE_LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

// Save queued offline logs
function saveOfflineLogs(logs) {
  try {
    localStorage.setItem(OFFLINE_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {}
}

export const loggingService = {
  /**
   * Dispatches an event log asynchronously to Supabase or saves to offline storage.
   * @param {string} eventName - Name of the event (e.g., 'skip_video', 'enter_question')
   * @param {object} payload - Optional extra metadata
   */
  async logEvent(eventName, payload = {}) {
    const session = progressService.getOrCreateSession();
    const sessionId = session?.sessionId || 'unknown-session';
    
    const logData = {
      session_id: sessionId,
      event_name: eventName,
      page_url: window.location.pathname + window.location.search,
      payload: {
        ...payload,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
      },
      created_at: new Date().toISOString()
    };

    console.log(`[LoggingService] Tracked Event: ${eventName}`, logData);

    // If Supabase is not configured or offline, cache the log locally
    if (!supabase) {
      this.queueOfflineLog(logData);
      return;
    }

    // Attempt to write to Supabase asynchronously (non-blocking)
    supabase
      .from('action_logs')
      .insert([logData])
      .then(({ error }) => {
        if (error) {
          console.error('[LoggingService] Failed to send log to Supabase, queueing offline:', error);
          this.queueOfflineLog(logData);
        } else {
          // If insert succeeds, try to sync other cached logs
          this.syncOfflineLogs();
        }
      })
      .catch((err) => {
        console.error('[LoggingService] Network error sending log, queueing offline:', err);
        this.queueOfflineLog(logData);
      });
  },

  /**
   * Save a log locally to be synchronized later.
   */
  queueOfflineLog(logData) {
    try {
      const logs = getOfflineLogs();
      logs.push(logData);
      // Keep queue size capped at 100 to prevent local storage bloat
      if (logs.length > 100) {
        logs.shift();
      }
      saveOfflineLogs(logs);
    } catch (e) {
      console.error('[LoggingService] Error caching offline log', e);
    }
  },

  /**
   * Attempt to sync offline logs to Supabase if connection is available.
   */
  async syncOfflineLogs() {
    if (!supabase) return;
    
    const logs = getOfflineLogs();
    if (logs.length === 0) return;

    console.log(`[LoggingService] Attempting to sync ${logs.length} cached offline logs...`);
    
    try {
      const { error } = await supabase.from('action_logs').insert(logs);
      if (!error) {
        console.log('[LoggingService] Offline logs synchronized successfully.');
        saveOfflineLogs([]); // Clear queue
      } else {
        console.warn('[LoggingService] Failed to sync offline logs:', error);
      }
    } catch (err) {
      console.error('[LoggingService] Error during offline log synchronization:', err);
    }
  }
};

// Auto-trigger sync on mount if online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    loggingService.syncOfflineLogs();
  });
  // Try to sync initially
  setTimeout(() => {
    loggingService.syncOfflineLogs();
  }, 3000);
}
