import './styles/app.styles.css'
import { PixiApp } from './app/PixiApp';
import { Component } from './ui/Component';
import { PixiGame } from './ui/components/PixiGame.component';

class Main {
  root: HTMLDivElement;
  app: PixiApp;
  constructor(public readonly name: string) {
    this.root = document.getElementById('root')! as HTMLDivElement;
    this.app = new PixiApp(this.root);
  }

  async init(): Promise<void> {
    await this.app.init()
    await this.app.setup()
  }
}
let current: Component | null = null;

function show(next: Component) {
  current?.unmount();
  current = next;
  current.mount(document.getElementById("root")!);
}

// show(new MainMenu());
// show(new GameScreen());
document.addEventListener('DOMContentLoaded', async () => {
  // const main = new Main('app');
  // (globalThis as any).main = main
  // await main.init();
  // try {
  //   await document.body.requestFullscreen()
  // } catch (error) {
  //   alert(error);
  // }
  show(new PixiGame())
})
