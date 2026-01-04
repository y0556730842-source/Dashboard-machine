import { useEffect, useState } from 'react';

const dateReviver = (_key: string, value: unknown) => {
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return value;
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  seed?: T
) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);

    if (stored) {
      return JSON.parse(stored, dateReviver);
    }

    if (seed !== undefined) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }

    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
