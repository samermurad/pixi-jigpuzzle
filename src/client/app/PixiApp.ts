import { Colors } from '../enums/Colors';
import { StageIDS } from '../enums/StageIDS';
import { ImageGrid } from '../models/pixi/ImageGrid';
import { IPixiSkeleton } from '../models/pixi/IPixiSkeleton';
import { SquareLoader } from '../models/pixi/SquareLoader';
import PixiAppStyles from './PixiApp.module.css';
import { Application, Assets, Container, Sprite, extensions, ExtensionType, Texture, Graphics } from 'pixi.js';
import DefaultWallpaper from '../assets/img/ExamplePuzzle.jpg'
import axios from 'axios';

export class PixiApp {
  canvas!: HTMLCanvasElement;
  app!: Application;
  stages: Record<StageIDS, Container> = {} as Record<StageIDS, Container>;
  updateAble: IPixiSkeleton[] = []

  private imageGrid!: ImageGrid;

  VIRTUAL_WIDTH: number = 350;
  VIRTUAL_HEIGHT: number = 600;

  constructor(public readonly root: HTMLDivElement) {
    this.canvas = document.createElement('canvas');
    const div = document.createElement('div');
    div.classList.add(PixiAppStyles.container);
    div.appendChild(this.canvas);
    this.root.appendChild(div);
    const button = document.createElement('button');
    button.className = PixiAppStyles.playButton;
    button.innerHTML = `<span>Reset</span>`;
    button.onclick = () => {this.reset()}
    div.appendChild(button);
  }

  private initStages(): void {
      for (const stageID of Object.values(StageIDS)) {
          this.stages[stageID] = new Container();
      }
      this.app.stage.addChild(...Object.values(this.stages));
  }

  public addToStage(element: IPixiSkeleton): void {
    let stageId = element.getStageID() || StageIDS.Main;
    this.stages[stageId]!.addChild(element.graphic);
    if (element.update) {
      this.updateAble.push(element);
    }
  }

  public async setup() {
    const vw = this.VIRTUAL_WIDTH;
    const vh = this.VIRTUAL_HEIGHT;
    this.app = new Application();
    // Renderer runs in virtual space; we scale it later to fit container
    await this.app.init({
      canvas: this.canvas,
      width: vw,
      height: vh,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });

    this.initStages();
    this.setupConfettiLoop();


    // const size = 65;
    // const loader = new SquareLoader(
    //   vw  / 2 - size / 4,
    //   vh / 2 - size / 4,
    //   size,
    //   Colors.Primary
    // );
    // await loader.init(this.app);
    // this.addToStage(loader);
    const unsplashImageLoading = {
      extension: ExtensionType.LoadParser,
      test: (url: string) => url.startsWith('https://images.unsplash.com/'),
      async load(src: string): Promise<void> {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          // @ts-ignore
          img.onload = () => resolve(Texture.from(img))
          img.onerror = reject
          img.src = src
        })
      },
    }

    extensions.add(unsplashImageLoading)

    await this.startGame(3, 3)

    this.app.ticker.add(
      () => this.update()
    )
  }

  async startGame(columns: number, rows: number): Promise<void> {
    const img = await this.loadImg()
    const imgGrid = new ImageGrid(img, 0, 0, this.VIRTUAL_WIDTH, this.VIRTUAL_HEIGHT, columns, rows);
    await imgGrid.init(this.app);
    this.imageGrid = imgGrid;
    this.addToStage(imgGrid);
  }

  cleanUp(): void {

  }

  async reset(): Promise<void> {
      this.imageGrid.graphic.parent?.removeChild(this.imageGrid.graphic)
      // @ts-ignore
      this.imageGrid = null;
      await this.startGame(3, 3);
  }

  colors = [0xff3b3b, 0xffd93b, 0x3bff6f, 0x3bb7ff, 0xb83bff];
  confetti: Graphics[] = [];

  public setupConfettiLoop(): void {
    this.app.ticker.add((ticker) => {
      for (let i = this.confetti.length - 1; i >= 0; i--) {
        const c = this.confetti[i];
        // @ts-ignore
        c.x += c.vx;
        // @ts-ignore
        c.y += c.vy;
        // @ts-ignore
        c.rotation += c.vr;
        // @ts-ignore
        c.life -= ticker.deltaMS;
        // @ts-ignore
        c.alpha = c.life / c.maxLife;
        // @ts-ignore
        if (c.y > this.app.screen.height + 20 || c.life <= 0) {
          // c.y = -20;
          // c.x = Math.random() * this.app.screen.width;
          // this.app.stage.removeChild(c);
          this.stages[StageIDS.FX].removeChild(c);
          c.destroy();
          this.confetti.splice(i, 1);
        }
      }
    });
  }
  public confettiAnim(amount: number = 200): void {
    const spawn = (c: Graphics) => {
      c.x = Math.random() * this.app.screen.width;
      c.y = -20 - Math.random() * this.app.screen.height;

      // @ts-ignore
      c.vx = (Math.random() - 0.5) * 4;
      // @ts-ignore
      c.vy = Math.random() * 7 + 2;
      // @ts-ignore
      c.vr = (Math.random() - 0.5) * 0.2;
      // @ts-ignore
      c.life = 1.75 * 1000; // ((Math.random() + 0.5) * 1.4)
      // @ts-ignore
      c.maxLife = c.life / 2
      c.rotation = Math.random() * Math.PI;
    };

    for (let i = 0; i < amount; i++) {
      const g = new Graphics()
        .rect(0, 0, 6, 10)
        .fill(this.colors[(Math.random() * this.colors.length) | 0]);

      spawn(g);
      this.confetti.push(g);
      this.stages[StageIDS.FX].addChild(g);
    }
  }

  public async loadImg(): Promise<Texture> {
    const res = await axios.get(`/api/public/imgs/random/${this.VIRTUAL_WIDTH}/${this.VIRTUAL_HEIGHT}`);

    if (res.data == null) {
      return await Assets.load(DefaultWallpaper);
    }
    // @ts-ignore
    const { url } = res.data;
    return await Assets.load({ src: url, format: 'jpeg' });
  }
  public update() {
    for (const updates of this.updateAble) {
      if (updates.update) updates.update();
    }

    if (this.imageGrid) {
      if (this.imageGrid.isGameSolved) {
        if (this.imageGrid.getInteractionEnabled()) {
          this.imageGrid.setInteractionEnabled(false);
          this.confettiAnim(240)
          this.imageGrid.toast(["Amazing!", "Good Job!", "Well done!!", "YUUUUUUUUHUUUU"][Math.floor(Math.random() * 4)], true);
        }
      }
    }
  }
}
