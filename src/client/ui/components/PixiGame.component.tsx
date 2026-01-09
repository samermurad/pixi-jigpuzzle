import axios from 'axios';
import { Application, Assets, Container, extensions, ExtensionType, Graphics, Texture, Ticker } from 'pixi.js';
import DefaultWallpaper from '../../assets/img/ExamplePuzzle.jpg';
import { StageIDS } from '../../enums/StageIDS';
import { GridTileCoords } from '../../models/Grid';
import { LocalStorageObject } from '../../models/LocalStorageObject';
import { ImageGrid } from '../../pixi/ImageGrid';
import { IPixiSkeleton } from '../../pixi/IPixiSkeleton';
import PixiAppStyles from 'styles/PixiApp.module.css';
import React, { Component, createRef } from 'react';

export class PixiGame extends Component {
  private container = createRef<HTMLDivElement>();
  private gameViewport = createRef<HTMLDivElement>();
  private canvasRef = createRef<HTMLCanvasElement>();
  private lvlSpan = createRef<HTMLSpanElement>();
  private dataSpan = createRef<HTMLSpanElement>();
  private mainBtn = createRef<HTMLButtonElement>();
  private btsContainer = createRef<HTMLDivElement>();
  private app!: Application;
  stages: Record<StageIDS, Container> = {} as Record<StageIDS, Container>;
  updateAble: IPixiSkeleton[] = []

  private resizeObs?: ResizeObserver;

  colors = [0xff3b3b, 0xffd93b, 0x3bff6f, 0x3bb7ff, 0xb83bff];
  confetti: Graphics[] = [];
  private imageGrid!: ImageGrid;

  VIRTUAL_WIDTH: number = 350;
  VIRTUAL_HEIGHT: number = 500;

  levels: GridTileCoords[] = [
    // { col: 2, row: 2 },
    { col: 3, row: 3 },
    { col: 4, row: 3},
    { col: 5, row: 4 },
    { col: 6, row: 5 },
    { col: 7, row: 6 },
  ]

  currentLevel: number = 0;

  puzzlesSolved = new LocalStorageObject<{ solved: number }>('puzzlesSolved', { solved: 0 });

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
      // resizeTo: this.gameViewport.current!,
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

    this.bindResizeHandling();
    this.puzzlesSolved.load();
    this.updatePuzzlesSolved();
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

  higherLevel() {

    this.currentLevel++;
    if (this.currentLevel >= this.levels.length) {
      this.currentLevel = this.levels.length - 1;
    }
    const lvl = this.levels[this.currentLevel];
    const str = `Col:${lvl.col} x Row:${lvl.row}`;
    this.lvlSpan.current!.innerHTML = str;
  }

  lowerLevel() {
    this.currentLevel--;
    if (this.currentLevel <= 0) {
      this.currentLevel = 0;
    }
    const lvl = this.levels[this.currentLevel];
    const str = `Col:${lvl.col} x Row:${lvl.row}`;
    this.lvlSpan.current!.innerHTML = str;
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
          this.popButtonForNext(true);
          this.bumpPuzzleSolved();
          this.updatePuzzlesSolved();
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
    const coords = this.levels[this.currentLevel];
    const img = await this.loadImg()
    const imgGrid = new ImageGrid(img, 0, 0, this.VIRTUAL_WIDTH, this.VIRTUAL_HEIGHT, coords.col, coords.row);
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
    this.popButtonForNext(false);
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

  componentDidMount() {
    this.setup()
  }

  // protected didMount() {
  //   this.setup()
  // }

  public popButtonForNext(yes: boolean): void {
    if (yes) {
      this.btsContainer.current!.className = `${PixiAppStyles.buttons} ${PixiAppStyles.next}`;
      this.mainBtn.current!.innerHTML = `<span>Next</span>`;
    } else {
      this.btsContainer.current!.className = `${PixiAppStyles.buttons}`;
      this.mainBtn.current!.innerHTML = `<span>Reset</span>`;
    }
  }

  public bumpPuzzleSolved(): void {
    this.puzzlesSolved.value!.solved++;
    this.puzzlesSolved.save()
  }
  public updatePuzzlesSolved(): void {
    this.dataSpan.current!.innerHTML = 'Puzzles Solved: ' + (this.puzzlesSolved.value?.solved ?? 0);
  }
  render() {
    const lvl = this.levels[this.currentLevel];
    const str = `Col:${lvl.col} x Row:${lvl.row}`;
    const PuzzlesSolved = 'Puzzles Solved: ' + (this.puzzlesSolved.value?.solved ?? 0)
    return (
      <div ref={this.container} className={PixiAppStyles.container}>
        <div ref={this.gameViewport}>
          <canvas id="pixi-canvas" ref={this.canvasRef}></canvas>
        </div>
        <span className={PixiAppStyles.colsXrows} ref={this.lvlSpan}>{str}</span>
        <span className={PixiAppStyles.colsXrows} ref={this.dataSpan}>{PuzzlesSolved} </span>
        <div ref={this.btsContainer} className={PixiAppStyles.buttons}>
          <button className={PixiAppStyles.playButtonSmall} onClick={() => {
            this.lowerLevel();
            this.reset()
          } }>
            <span>Easier</span>
          </button>
          <button ref={this.mainBtn} className={PixiAppStyles.playButton} onClick={() => {
            this.reset()
          }}>
            <span>Reset</span>
          </button>
          <button className={PixiAppStyles.playButtonSmall} onClick={() => {
            this.higherLevel();
            this.reset()
          }}>
            <span>Harder</span>
          </button>
        </div>
      </div>
    )
  }
  // endregion

  // region Virtual Size
  private updateViewportScale() {
    const containerEl = this.gameViewport?.current;
    if (!containerEl || !this.app || !this.stages[StageIDS.Main] || !this.imageGrid) return;
    // what the layout says
    const rect = containerEl.getBoundingClientRect();

    const vw = this.VIRTUAL_WIDTH;
    const vh = this.VIRTUAL_HEIGHT;
    // actual available size
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    // very important: never let the game canvas be taller than the viewport
    // const topY = this.gameFieldLayer.y;
    // const further = 50
    const topY = this.imageGrid.y - this.imageGrid.height / 2
    const bottomY = this.imageGrid.graphic.height + this.imageGrid.graphic.height / 2;
    const contentHeight = bottomY - topY;
    const contentWidth = vw;

    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY);

    // uniform scale to fit in this box
    // we keep the canvas the size of the container visually,
    // but the game content is scaled down to always fit
    this.app.renderer.resize(containerWidth, containerHeight);
    this.app.stage.scale.set(scale);

    const scaledContentWidth = contentWidth * scale;
    const offsetX = (containerWidth - scaledContentWidth) / 2;

    const scaledContentHeight = contentHeight * scale;
    let offsetY;
    // If the content fits vertically → center it
    if (scaledContentHeight < containerHeight) {
      offsetY = (containerHeight - scaledContentHeight) / 2 - topY * scale;
    } else {
      // Otherwise stick to top (prevents clipping)
      offsetY = -topY * scale;
    }
    this.app.stage.position.set(offsetX, offsetY);
  }


  // endregion

  // region Window Resizing
  private bindResizeHandling() {
    if (!this.container?.current) return;

    // this.resizeObs = new ResizeObserver(() => {
    //   console.log('resizeObs');
    //   this.handleResize();
    // });
    // this.resizeObs.observe(this.container!.current);
  }

  private handleResize() {
    // if (!this.app || !this.isReady()) return;
    if (!this.app) return;

    this.updateViewportScale();
  }
  // endregion
}
