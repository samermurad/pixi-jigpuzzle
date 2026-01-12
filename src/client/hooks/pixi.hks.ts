import { Application, ApplicationOptions, Container, ContainerChild, Graphics } from 'pixi.js';
import { useEffect, useMemo, useRef } from 'react';


export function usePixiApp(options: Partial<ApplicationOptions>, onInit?: (app: Application) => void): [Application|null] {
  const memed = useMemo(() => options, [options]);


  const App = useRef<Application>(null);
  const app = new Application();
  App.current = app;
  useEffect(
    () => {
      let destroyed = false;
      console.log('usePixiApp.useEffect guard', app);
      // if (!options.resizeTo) return;
      if (destroyed) return;
      console.log('usePixiApp.useEffect setup', app);
      const initApp = async () => {
        await app.init(memed);
        onInit?.(app)
      }
      initApp();

      return () => {
        destroyed = true;
        app.destroy();
      }
    },[memed, options.resizeTo]
  )
  return [App.current];
}

export function useGraphics(): [Graphics] {
  const graphic = useRef(new Graphics())
  return [graphic.current]
}

export function useContainer<T extends ContainerChild= any>(): [Container<T>] {
  const container = useRef(new Container<T>())
  return [container.current]
}

