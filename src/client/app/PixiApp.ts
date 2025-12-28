import PixiAppStyles from './PixiApp.module.css';

console.log(PixiAppStyles)
export class PixiApp {
  canvas!: HTMLCanvasElement;

  constructor(public readonly root: HTMLDivElement) {
    this.root.innerHTML = `
<div class="${PixiAppStyles.container}">
    <p>This is the start</p>
</div>
    `
  }
}
