import React, { useCallback, useMemo, useRef, useState } from 'react';


type ClassesHandlers = {
  push: (...classes: string[]) => void;
  remove: (...classes: string[]) => void;
}
export function useClasses(...classNames: string[]): [string, ClassesHandlers] {
  const [classesStr, setClassesStr] = useState<string>(classNames.join(' '));

  const handler = useRef<ClassesHandlers>(
    {
      push(...classes: string[]) {
        const all = classesStr.split(' ')
        all.push(
          ...classes
        );
        setClassesStr([...new Set(all)].join(' '));
      },
      remove(...classes: string[]) {
          const A = new Set(classesStr.split(' '))
          const B = new Set(classes)
          setClassesStr([...A.difference(B)].join(' '));
      }
    }
  )
  return [classesStr, handler.current];
}

export function useClassesStatic(...classNames: (string|undefined)[]): [string] {
  const classes = classNames.filter(nonNull => !!nonNull).join(' ');
  return [useMemo<string>(() => classes, [classes])];
}

export function useStyles(styleDict: Record<string, unknown>): React.CSSProperties {
  return useMemo(() => styleDict as React.CSSProperties, [JSON.stringify(styleDict)]);
}
