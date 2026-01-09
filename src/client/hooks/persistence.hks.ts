import { Dispatch, SetStateAction, useCallback, useState } from 'react';

type SetStateFn<T> = ((prevState: T) => T);
const isSetStateAction = <T>(value: SetStateAction<T>): value is SetStateFn<T> => {
  return typeof value === 'function';
}
export function useLocalStorage<T>(key: string, initialVal: T): [T, Dispatch<SetStateAction<T>>] {
  const storedValue: T = JSON.parse(<string>localStorage.getItem(key)) || initialVal;

  const [state, setState] = useState<T>(storedValue);

  const updateValue = useCallback((value: SetStateAction<T>) => {
        let newValue: T;
        if (isSetStateAction(value)) {
          setState(prevState => {
            newValue = value(prevState);
            localStorage.setItem(key, JSON.stringify(newValue));
            return newValue;
          })
        } else {
          newValue = value;
          setState(value);
          localStorage.setItem(key, JSON.stringify(newValue));
        }
  }, [setState])


  return [state, updateValue];
}
