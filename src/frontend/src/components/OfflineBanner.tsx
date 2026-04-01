import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

const QUEUE_KEY = "offlineAttendanceQueue";

function getQueueCount(): number {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return 0;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(() => window.navigator.onLine);
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);
  const [queueCount, setQueueCount] = useState(getQueueCount);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineBanner(true);
      setTimeout(() => setShowOnlineBanner(false), 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineBanner(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Poll queue count every 5 seconds
    const interval = setInterval(() => setQueueCount(getQueueCount()), 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && showOnlineBanner) {
    return (
      <div
        className="flex items-center justify-center gap-2 bg-green-500 text-white text-sm px-4 py-2 transition-all"
        data-ocid="offline.toast"
      >
        <Wifi size={15} />
        <span className="font-medium">Back online.</span>
        <span className="text-green-100">Syncing your data...</span>
        <RefreshCw size={13} className="animate-spin ml-1" />
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div
        className="flex items-center justify-center gap-2 bg-amber-500 text-white text-sm px-4 py-2"
        data-ocid="offline.toast"
      >
        <WifiOff size={15} />
        <span className="font-medium">You are offline.</span>
        <span className="text-amber-100">
          Changes will sync when reconnected.
        </span>
        {queueCount > 0 && (
          <span className="ml-2 bg-white/20 rounded-full px-2 py-0.5 text-xs font-semibold">
            Queued Items: {queueCount}
          </span>
        )}
      </div>
    );
  }

  return null;
}
