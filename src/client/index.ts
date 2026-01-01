import './app.styles.css'
import { PixiApp } from './app/PixiApp';

class Main {
  root: HTMLDivElement;
  app: PixiApp;
  constructor(public readonly name: string) {
    this.root = document.getElementById('root')! as HTMLDivElement;
    // this.root.innerHTML = 'This definitely succeeded';
    this.app = new PixiApp(this.root);

    this.app.setup()
      .then(() => {
        console.log('App Setup Done');
      })
      .catch((err) => {
        console.error('App Setup Failed', err);
      })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  (globalThis as any).main = new Main('app');
})
