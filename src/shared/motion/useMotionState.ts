import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { navigationMotion, transition } from './transition';

/** Use for navigation/presentation state; text input and gameplay updates stay immediate. */
export function useMotionState<T>(initial: T | (() => T), mode: 'navigation' | 'fade' | 'sheet' | 'overlay' = 'navigation'):
  [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(initial);
  const latest = useRef(value);
  const setAnimated = useCallback<Dispatch<SetStateAction<T>>>((action) => {
    const previous = latest.current;
    const next = typeof action === 'function' ? (action as (state: T) => T)(previous) : action;
    if (Object.is(previous, next)) return;
    latest.current = next;
    if (mode === 'sheet') {
      setValue(next);
      return;
    }
    const kind = mode === 'overlay' ? (next == null || next === false ? 'sheet-out' : 'sheet-in')
      : mode === 'fade' ? 'fade' : navigationMotion(previous, next);
    transition(kind, () => setValue(next));
  }, [mode]);
  return [value, setAnimated];
}
