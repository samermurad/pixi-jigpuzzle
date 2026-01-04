// jsx-runtime.ts
export type Child =
  | Node
  | string
  | number
  | boolean
  | null
  | undefined
  | Child[];

export type Ref<T extends Element> =
  | { current: T | null }
  | ((el: T | null) => void);

type Props = Record<string, any> & { ref?: Ref<any> };

function isNode(x: any): x is Node {
  return x instanceof Node;
}

function flattenChildren(children: Child[]): Node[] {
  const out: Node[] = [];

  const walk = (c: Child) => {
    if (c == null || c === false || c === true) return;
    if (Array.isArray(c)) return c.forEach(walk);
    if (isNode(c)) return out.push(c);
    if (typeof c === "string") return out.push(document.createTextNode(c));
    if (typeof c === "number") return out.push(document.createTextNode(String(c)));
    // fallback: stringify unknown
    out.push(document.createTextNode(String(c)));
  };

  children.forEach(walk);
  return out;
}

function setRef<T extends Element>(ref: Ref<T> | undefined, el: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(el);
  else ref.current = el;
}

function setProp(el: Element, key: string, value: any) {
  // ignore internal-ish props
  if (key === "children" || key === "ref") return;

  // class / className
  if (key === "class" || key === "className") {
    (el as HTMLElement).className = value ?? "";
    return;
  }

  // style: string or object
  if (key === "style") {
    const h = el as HTMLElement;
    if (value == null) {
      h.removeAttribute("style");
    } else if (typeof value === "string") {
      h.setAttribute("style", value);
    } else if (typeof value === "object") {
      Object.assign(h.style, value);
    }
    return;
  }

  // onClick / onclick / on:click
  if (key.startsWith("on")) {
    // supports: onClick, onclick, on:click
    const evt =
      key.startsWith("on:")
        ? key.slice(3)
        : key.slice(2).toLowerCase();

    if (typeof value === "function") {
      el.addEventListener(evt, value);
    }
    return;
  }

  // aria-* / data-* should be attributes
  if (key.startsWith("aria-") || key.startsWith("data-")) {
    if (value == null) el.removeAttribute(key);
    else el.setAttribute(key, String(value));
    return;
  }

  // boolean-ish attrs: disabled, checked, etc.
  if (typeof value === "boolean") {
    if (value) (el as any)[key] = true, el.setAttribute(key, "");
    else (el as any)[key] = false, el.removeAttribute(key);
    return;
  }

  // Prefer property when it exists, otherwise attribute
  if (key in el) {
    (el as any)[key] = value;
  } else {
    if (value == null) el.removeAttribute(key);
    else el.setAttribute(key, String(value));
  }
}

export function DOMcreateElement(
  element: any,
  props: Props | null,
  ...children: Child[]
): any {
  // function component
  if (typeof element === "function") {
    return element({ ...(props ?? {}), children });
  }

  // fragment support: <>...</>
  if (element === Fragment) {
    return DOMcreateFragment(children);
  }

  const el = document.createElement(element);

  const p = props ?? {};
  Object.keys(p).forEach((k) => setProp(el, k, p[k]));

  const nodes = flattenChildren(children);
  nodes.forEach((n) => el.appendChild(n));

  setRef(p.ref, el as any);
  return el;
}

export const Fragment = Symbol("Fragment");

export function DOMcreateFragment(...children: Child[]): DocumentFragment {
  const frag = document.createDocumentFragment();
  flattenChildren(children).forEach((n) => frag.appendChild(n));
  return frag;
}

export function createRef<T extends Element>() {
  return { current: null as T | null };
}
