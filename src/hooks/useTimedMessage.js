import { useEffect, useState } from "react";

export function useTimedMessage(durationMs = 2000) {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => {
      setMessage(null);
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [durationMs, message]);

  return [message, setMessage];
}
