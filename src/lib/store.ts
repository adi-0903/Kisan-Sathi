import { get, set } from 'idb-keyval';
import { useState, useEffect } from 'react';

export function useSyncState<T>(key: string, initialValue: T): [T, (val: T) => void] {
  const [state, setState] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    get(key).then((val) => {
      if (val !== undefined) {
        setState(val);
      }
      setLoaded(true);
    });
  }, [key]);

  const setAndSave = (newValue: T) => {
    setState(newValue);
    set(key, newValue);
  };

  return [state, setAndSave];
}
