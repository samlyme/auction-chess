import { useCallback, useEffect, useRef, useState } from "react";

export type UseCountdownTimerOptions = {
  durationMs: number;
  tickMs?: number;
  onExpire?: () => void;
};

export type UseCountdownTimerResult = {
    start: () => void;
    stop: () => void;
    reset: (newDurationMs: number) => void;
    isRunning: boolean;
    remainingMs: number;
}

export function useCountdownTimer({
  durationMs,
  tickMs = 250,
  onExpire,
}: UseCountdownTimerOptions): UseCountdownTimerResult {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [isRunning, setIsRunning] = useState(false);

  const intervalIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const consumedRef = useRef(0);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  const currentDurationRef = useRef(durationMs);

  // Keep callback fresh
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const stop = useCallback(() => {
    if (intervalIdRef.current != null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (startTimeRef.current != null) {
      const now = performance.now();
      consumedRef.current += now - startTimeRef.current;
      startTimeRef.current = null;
    }

    setIsRunning(false);
  }, []);

  const tick = useCallback(() => {
    if (startTimeRef.current == null) return;

    const now = performance.now();
    const elapsed = consumedRef.current + (now - startTimeRef.current);
    const remaining = Math.max(0, currentDurationRef.current - elapsed);

    setRemainingMs(remaining);

    if (remaining === 0 && !expiredRef.current) {
      expiredRef.current = true;
      stop();
      onExpireRef.current?.();
    }
  }, [stop]);

  const start = useCallback(() => {
    if (intervalIdRef.current != null) return;

    expiredRef.current = false;
    startTimeRef.current = performance.now();
    intervalIdRef.current = window.setInterval(tick, tickMs);
    setIsRunning(true);
  }, [tick, tickMs]);

  const reset = useCallback((newDuration: number) => {
    stop();
    consumedRef.current = 0;
    expiredRef.current = false;
    currentDurationRef.current = newDuration;
    setRemainingMs(newDuration);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return {
    start,
    stop,
    reset,
    isRunning,
    remainingMs,
  };
}
