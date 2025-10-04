import { useEffect, useState } from 'react';

export function useCountdown(initialSeconds: number): [number, (seconds: number) => void] {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const id = window.setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(id);
  }, [seconds]);

  const reset = (value: number) => {
    setSeconds(value);
  };

  return [seconds, reset];
}
