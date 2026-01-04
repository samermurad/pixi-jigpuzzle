import { Component } from './Component';
import { createRef, DOMcreateElement } from "./jsx-runtime";

type MountProps<T extends Component> = {
  component: T;
};

export function Mount<T extends Component>({ component }: MountProps<T>): Element {
  const ref = createRef<HTMLDivElement>();

  queueMicrotask(() => {
    if (!ref.current) return;
    component.mount(ref.current);
  });

  return <div ref={ref}></div>;
}
