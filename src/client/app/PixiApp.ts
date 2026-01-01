import { Colors } from '../enums/Colors';
import { StageIDS } from '../enums/StageIDS';
import { IPixiSkeleton } from '../pixi/IPixiSkeleton';
import { SquareLoader } from '../pixi/SquareLoader';
import PixiAppStyles from './PixiApp.module.css';
import { Application, Assets, Container, Sprite } from 'pixi.js';
import DefaultWallpaper from '../assets/img/ExamplePuzzle.jpg'

export class PixiApp {
  canvas!: HTMLCanvasElement;
  app!: Application;
  stages: Record<StageIDS, Container> = {} as Record<StageIDS, Container>;
  updateAble: IPixiSkeleton[] = []

  VIRTUAL_WIDTH: number = 350;
  VIRTUAL_HEIGHT: number = 700;

  constructor(public readonly root: HTMLDivElement) {
    this.canvas = document.createElement('canvas');
    const div = document.createElement('div');
    div.classList.add(PixiAppStyles.container);
    div.appendChild(this.canvas);
    this.root.appendChild(div);
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
    this.app.ticker.add(
      () => this.update()
    )

    const size = 65;
    const loader = new SquareLoader(
      vw  / 2 - size / 4,
      vh / 2 - size / 4,
      size,
      Colors.Primary
    );
    await loader.init(this.app);
    this.addToStage(loader);
    let sprite = IPixiSkeleton.fromPixiObject(
      new Sprite(
        await Assets.load(DefaultWallpaper)
      )
    );
    sprite.graphic.width = this.VIRTUAL_WIDTH;
    sprite.graphic.height = this.VIRTUAL_HEIGHT;

    this.addToStage(sprite);
  }

  public update() {
    for (const updates of this.updateAble) {
      if (updates.update) updates.update();
    }
  }
}
