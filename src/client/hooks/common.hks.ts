import { Dispatch, SetStateAction, useCallback, useState } from 'react';


export function useCounter(initialNumber: number = 0): [number, Dispatch<SetStateAction<number>>, () => void, () => void] {
  const [counter, setCounter] = useState(initialNumber);
  const increase = useCallback(() => setCounter((counter) => counter + 1), [setCounter]);
  const decrease = useCallback(() => setCounter((counter) => counter - 1), [setCounter]);
  return [counter, setCounter, increase, decrease];
}
