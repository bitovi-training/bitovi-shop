import { useEffect, useRef } from 'react';

const DEFAULT_REFRESH_INTERVAL_MS = 3000;

export default function useLiveRefresh(
  refresh,
  { enabled = true, intervalMs = DEFAULT_REFRESH_INTERVAL_MS } = {},
) {
  const refreshRef = useRef(refresh);
  const isRefreshingRef = useRef(false);
  const pendingRefreshRef = useRef(false);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let timeoutId = null;
    let isDisposed = false;

    const scheduleNext = () => {
      if (isDisposed || intervalMs <= 0) {
        return;
      }

      timeoutId = window.setTimeout(() => {
        if (document.visibilityState === 'visible') {
          void runRefresh();
          return;
        }

        scheduleNext();
      }, intervalMs);
    };

    const runRefresh = async () => {
      if (isRefreshingRef.current) {
        pendingRefreshRef.current = true;
        return;
      }

      isRefreshingRef.current = true;

      try {
        await refreshRef.current?.();
      } finally {
        isRefreshingRef.current = false;

        if (pendingRefreshRef.current && !isDisposed && document.visibilityState === 'visible') {
          pendingRefreshRef.current = false;
          void runRefresh();
          return;
        }

        pendingRefreshRef.current = false;
        scheduleNext();
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        void runRefresh();
      }
    };

    scheduleNext();

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      isDisposed = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      pendingRefreshRef.current = false;
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [enabled, intervalMs]);
}