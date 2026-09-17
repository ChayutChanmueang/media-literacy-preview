import { apiClient } from "./apiClient";
import { progressService } from "./progressService";

const OFFLINE_LOGS_KEY = "naplab_ml_offline_logs";
const MAX_OFFLINE_LOGS = 500;

// Get queued offline logs
function getOfflineLogs(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(OFFLINE_LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

// Save queued offline logs
function saveOfflineLogs(logs: any[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OFFLINE_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {}
}

let isSyncing = false;

export const loggingService = {
  /**
   * Dispatches an event log asynchronously to the backend or saves to offline storage if disconnected.
   * @param eventName - Name of the event (e.g., 'skip_video', 'enter_question')
   * @param payload - Optional extra metadata
   */
  async logEvent(eventName: string, payload: any = {}) {
    if (typeof window === "undefined") return;

    const session = progressService.getOrCreateSession();
    const sessionId = session?.sessionId || "unknown-session";
    
    const logData = {
      session_id: sessionId,
      event_name: eventName,
      page_url: window.location.pathname + window.location.search,
      payload: {
        ...payload,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
      },
      created_at: new Date().toISOString(),
    };

    console.log(`[LoggingService] Tracked Event: ${eventName}`, logData);

    // If browser navigator reports offline, directly queue it
    if (!navigator.onLine) {
      console.warn("[LoggingService] Network is offline, queueing log directly.");
      this.queueOfflineLog(logData);
      this.showOfflineToast();
      return;
    }

    // Try to send log to API Route Handler
    apiClient.logEvent(logData)
      .then(() => {
        // Log succeeded, sync offline logs if not already syncing
        if (!isSyncing && getOfflineLogs().length > 0) {
          this.syncOfflineLogs();
        }
      })
      .catch((err) => {
        console.error("[LoggingService] Error sending log, queueing offline:", err);
        this.queueOfflineLog(logData);
      });
  },

  /**
   * Save a log locally to be synchronized later.
   */
  queueOfflineLog(logData: any) {
    try {
      const logs = getOfflineLogs();
      logs.push(logData);
      // Keep queue size capped at MAX_OFFLINE_LOGS to prevent local storage bloat
      if (logs.length > MAX_OFFLINE_LOGS) {
        logs.shift();
      }
      saveOfflineLogs(logs);
    } catch (e) {
      console.error("[LoggingService] Error caching offline log", e);
    }
  },

  /**
   * Attempt to sync offline logs to backend if connection is available.
   */
  async syncOfflineLogs() {
    if (typeof window === "undefined" || !navigator.onLine || isSyncing) return;

    const logs = getOfflineLogs();
    if (logs.length === 0) return;

    isSyncing = true;
    // Clear offline storage immediately to prevent concurrent/nested sync cascades
    saveOfflineLogs([]);

    console.log(`[LoggingService] Attempting to sync ${logs.length} cached offline logs in FIFO order...`);
    
    const failedLogs: any[] = [];
    try {
      // Send each log sequentially (FIFO order)
      for (const log of logs) {
        try {
          await apiClient.logEvent(log);
        } catch (err) {
          console.error("[LoggingService] Error syncing individual offline log:", err);
          failedLogs.push(log);
        }
      }

      if (failedLogs.length > 0) {
        // Re-queue only the logs that failed
        const remaining = getOfflineLogs();
        saveOfflineLogs([...failedLogs, ...remaining].slice(-MAX_OFFLINE_LOGS));
        console.warn(`[LoggingService] Re-queued ${failedLogs.length} logs that failed to sync.`);
      } else {
        console.log("[LoggingService] Offline logs synchronized successfully.");
        this.showOnlineToast();
      }
    } catch (err) {
      console.error("[LoggingService] Error during offline log synchronization:", err);
    } finally {
      isSyncing = false;
    }
  },

  showOfflineToast() {
    // Show a simple non-blocking overlay or toast alert if in DOM
    if (typeof document !== "undefined") {
      let alertEl = document.getElementById("offline-warning-banner");
      if (!alertEl) {
        alertEl = document.createElement("div");
        alertEl.id = "offline-warning-banner";
        alertEl.className = "fixed bottom-4 left-4 right-4 bg-orange-600 text-white px-4 py-3 rounded-xl shadow-lg z-50 text-center font-bold text-base transition-opacity duration-300";
        alertEl.innerText = "⚠️ ขณะนี้สัญญาณอินเทอร์เน็ตขาดหาย คะแนนและสถิติของท่านจะถูกบันทึกไว้ในเครื่องชั่วคราว";
        document.body.appendChild(alertEl);
      }
    }
  },

  showOnlineToast() {
    if (typeof document !== "undefined") {
      const alertEl = document.getElementById("offline-warning-banner");
      if (alertEl) {
        alertEl.className = "fixed bottom-4 left-4 right-4 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg z-50 text-center font-bold text-base transition-opacity duration-300";
        alertEl.innerText = "✅ เชื่อมต่ออินเทอร์เน็ตแล้ว ซิงค์ข้อมูลการเล่นของท่านขึ้นระบบเรียบร้อย";
        setTimeout(() => {
          alertEl.remove();
        }, 3000);
      }
    }
  }
};

// Auto-trigger sync on online network event
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    loggingService.syncOfflineLogs();
  });
  // Initially try to sync after a short delay
  setTimeout(() => {
    loggingService.syncOfflineLogs();
  }, 3000);
}
