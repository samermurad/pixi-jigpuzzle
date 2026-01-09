import './styles/app.styles.css'
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { PixiApp } from './app/PixiApp';
// import { Component } from './ui/Component';
import { PixiGame } from './ui/components/PixiGame.component';
import Game from './ui/pages/Game';

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
// let current: Component | null = null;
//
// function show(next: Component) {
//   current?.unmount();
//   current = next;
//   current.mount(document.getElementById("root")!);
// }

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
  // show(new PixiGame())
})
// createRoot()


// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

// Render your React component instead
const root = createRoot(document.getElementById('app')!);
root.render(<App />);
// root.render(<Game />);
