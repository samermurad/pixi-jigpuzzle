export abstract class Component {
  protected el: Element | null = null;
  protected disposers: Array<() => void> = [];

  abstract view(): Element;

  mount(parent: Element) {
    this.willMount?.();
    this.el = this.view();
    parent.appendChild(this.el);
    this.didMount?.();
    return this.el;
  }

  unmount() {
    this.onUnmount?.();
    this.disposers.forEach((d) => d());
    this.disposers = [];
    this.el?.remove();
    this.el = null;
  }

  // optional hooks
  protected willMount?(): void;
  protected didMount?(): void;
  protected onUnmount?(): void;

  // helper for event listeners with auto-cleanup
  protected listen<K extends keyof HTMLElementEventMap>(
    target: Element,
    type: K,
    handler: (ev: HTMLElementEventMap[K]) => any,
    options?: AddEventListenerOptions
  ) {
    target.addEventListener(type as any, handler as any, options);
    this.disposers.push(() =>
      target.removeEventListener(type as any, handler as any, options)
    );
  }
}
