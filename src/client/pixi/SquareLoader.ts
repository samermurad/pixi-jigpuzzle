import { Application, Color, ColorSource, Container, Graphics, Sprite } from 'pixi.js';
import { StageIDS } from '../enums/StageIDS';
import { IPixiSkeleton } from './IPixiSkeleton';
import PixiMath from '../../shared/models/PixiMath'

export class SquareLoader implements IPixiSkeleton {
  private isActive: boolean = true;
  private readonly container: Container;
  private sprite!: Sprite;

  private hsb: { h: number; s: number, b: number };
  constructor(
    x: number,
    y: number,
    public readonly size: number,
    public readonly color: ColorSource,
    public readonly borderRadius: number = 16
  ) {
    this.container = new Container();
    this.container.x = x;
    this.container.y = y;
    const color2use = new Color(this.color);
    this.hsb = PixiMath.hexToHsb(color2use.toHex());
  }


  set active(active: boolean) {
    this.isActive = active;
    this.container.visible = this.isActive;
  }
  get active(): boolean { return this.isActive; }

  get graphic(): Container {
    return this.container;
  }

  async init(app: Application): Promise<void> {
      const container = new Container();

    const points = PixiMath.polyPointsAroundCircle(8, this.size / 2);
    const points2use = [...points];
    const lines = new Graphics()
    const firstPoint = points[0];
    let prePoint = points2use.shift()!;
    lines.moveTo(prePoint.x, prePoint.y);
    for (const point of points) {
      lines.arcTo(prePoint.x, prePoint.y, point.x, point.y, (this.size / 2) * .8);
      prePoint = point;
    }
    lines.arcTo(prePoint.x, prePoint.y, firstPoint.x, firstPoint.y, 0);
      container
        .addChild(
          lines
            .stroke({
              alignment: 0,
              color: this.color,
              width: 14,
            })
        )

      const texture = app.renderer.generateTexture(container);
      this.sprite = new Sprite(texture);
      this.sprite.anchor.set(0.5);
      this.container.addChild(this.sprite);
      container.destroy()
  }

  getStageID(): StageIDS {
    return StageIDS.Main;
  }

  update(): void {
      if (!this.isActive) return;
      this.container.rotation += PixiMath.deg(4)
  }
}
