import axios from 'axios';
import { Application, Assets, Container, extensions, ExtensionType, Graphics, Texture, Ticker } from 'pixi.js';
import DefaultWallpaper from '../../assets/img/ExamplePuzzle.jpg';
import { StageIDS } from '../../enums/StageIDS';
import { ImageGrid } from '../../pixi/ImageGrid';
import { IPixiSkeleton } from '../../pixi/IPixiSkeleton';
import PixiAppStyles from '../../styles/PixiApp.module.css';
import { Component } from '../Component';
import { createRef, DOMcreateElement } from '../jsx-runtime';


export class PixiGame extends Component {
  private canvasRef = createRef<HTMLCanvasElement>();
  private app!: Application;
  stages: Record<StageIDS, Container> = {} as Record<StageIDS, Container>;
  updateAble: IPixiSkeleton[] = []

  colors = [0xff3b3b, 0xffd93b, 0x3bff6f, 0x3bb7ff, 0xb83bff];
  confetti: Graphics[] = [];
  private imageGrid!: ImageGrid;

  VIRTUAL_WIDTH: number = 350;
  VIRTUAL_HEIGHT: number = 600;
  // region Setup
  public async setup(): Promise<void> {
    // PIXI UNSPLASH IMAGE LOADER
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

    const vw = this.VIRTUAL_WIDTH;
    const vh = this.VIRTUAL_HEIGHT;
    this.app = new Application();
    // Renderer runs in virtual space; we scale it later to fit container
    await this.app.init({
      canvas: this.canvasRef.current!,
      width: vw,
      height: vh,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });
    this.setupStages();
    this.setupLoop();

    await this.startGame(4, 4)
  }
  private setupStages(): void {
    for (const stageID of Object.values(StageIDS)) {
      const stage = new Container();
      this.stages[stageID] = stage;
      this.app.stage.addChild(stage);
    }
  }

  private setupLoop(): void {
    this.app.ticker.add(this.update.bind(this));
  }
  // endregion
  // region UI Handlers
  async reset() {
    this.resetGame();
  }
  // endregion
  // region loops
  private update(ticker: Ticker): void {
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
        // this.removeFromStage()
        this.stages[StageIDS.FX].removeChild(c);
        c.destroy();
        this.confetti.splice(i, 1);
      }
    }

    for (const updates of this.updateAble) {
      if (updates.update) updates.update();
    }

    if (this.imageGrid) {
      if (this.imageGrid.isGameSolved) {
        if (this.imageGrid.getInteractionEnabled()) {
          this.imageGrid.setInteractionEnabled(false);
          this.confettiAnim(240)
          this.imageGrid.toast(["Amazing!", "Good Job!", "Well done!!", "Yuuhuuu!!"][Math.floor(Math.random() * 4)], true);
        }
      }
    }
  }
  // endregion
  // region Stage Management
  public addToStage(element: IPixiSkeleton): void {
    let stageId = element.getStageID() || StageIDS.Main;
    this.stages[stageId]!.addChild(element.graphic);
    if (element.update) {
      this.updateAble.push(element);
    }
  }

  public removeFromStage(element: IPixiSkeleton): void {
    let stageId = element.getStageID() || StageIDS.Main;
    this.stages[stageId]!.removeChild(element.graphic);
    if (element.update) {
      const index = this.updateAble.indexOf(element);
      if (index >= 0) {
        this.updateAble.splice(index, 1)
      }
    }
  }
  // endregion

  // region Confetti
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
  // endregion
  // region GameState
  async startGame(columns: number, rows: number): Promise<void> {
    const img = await this.loadImg()
    const imgGrid = new ImageGrid(img, 0, 0, this.VIRTUAL_WIDTH, this.VIRTUAL_HEIGHT, columns, rows);
    await imgGrid.init(this.app);
    this.imageGrid = imgGrid;
    this.addToStage(imgGrid);
  }

  cleanUp(): void {}

  async resetGame(): Promise<void> {
    this.removeFromStage(this.imageGrid);
    this.imageGrid.graphic.parent?.removeChild(this.imageGrid.graphic)
    // @ts-ignore
    this.imageGrid = null;
    await this.startGame(4, 4);
  }
  // endregion
  // region API
  public async loadImg(): Promise<Texture> {
    const res = await axios.get(`/api/public/imgs/random/${this.VIRTUAL_WIDTH}/${this.VIRTUAL_HEIGHT}`);
    if (res.data == null) return await Assets.load(DefaultWallpaper);
    // @ts-ignore
    const { url } = res.data;
    return await Assets.load({ src: url, format: 'jpeg' });
  }
  // endregion
  // region Component Implementation

  protected didMount() {
    this.setup()
  }

  view(): Element {
    return (
      <div className={PixiAppStyles.container}>
      <canvas id="pixi-canvas" ref={this.canvasRef}></canvas>
      <button className={PixiAppStyles.playButton} onclick={() => this.reset()}>
        <span>Reset</span>
      </button>
      </div>
    )
  }
  // endregion
}
