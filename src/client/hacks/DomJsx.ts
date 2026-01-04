//
// function DOMparseChildren(children: any) {
//   return children.map((child: any) => {
//     if(typeof child === 'string') {
//       return document.createTextNode(child);
//     }
//     return child;
//   })
// }
//
// function nonNull(val: any, fallback: any) { return Boolean(val) ? val : fallback };
//
// function DOMparseNode(element: any, properties: any, children: any) {
//   const el = document.createElement(element);
//   Object.keys(nonNull(properties, {})).forEach(key => {
//     el[key] = properties[key];
//   })
//   DOMparseChildren(children).forEach((child: any) => {
//     el.appendChild(child);
//   });
//   return el;
// }
//
// export function DOMcreateElement(element: any, properties: any, ...children: any): any {
//   if(typeof element === 'function') {
//     return element({
//       ...nonNull(properties, {}),
//       children
//     });
//   }
//   return DOMparseNode(element, properties, children);
// }
