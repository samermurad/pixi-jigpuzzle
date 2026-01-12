import { ReactElement, useCallback, useMemo, useRef, useState } from 'react';


type PagePairs = Record<string, (props: any) => ReactElement>
export function useSimpleSinglePageSwitcher<T extends PagePairs>(pairs: T, initialPage: keyof T): [keyof T, (props: any) => ReactElement, (key: keyof T) => void] {

  const [bum, setBump] = useState(initialPage);

  const cached = useMemo(() => pairs, [])
  const Element = useRef<(props: any) => ReactElement>(pairs[bum])
  const setPage = useCallback(
    (key: keyof T) => {
      Element.current = pairs[key]
      setBump(key);
    },
    [setBump]
  )


  return [bum, Element.current, setPage]
}
