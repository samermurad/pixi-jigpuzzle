import { Application, Container, FillGradient, Graphics, Sprite, Texture } from 'pixi.js';
import PixiMath, { Mulberry32RngFn } from '../../shared/models/PixiMath';
import { StageIDS } from '../enums/StageIDS';
import { IPixiSkeleton } from './IPixiSkeleton';


export class PixiImageGenerator implements IPixiSkeleton {
  private readonly container!: Container;
  private readonly rng: Mulberry32RngFn;

  // Reused scratch objects (no per-call allocations)
  private gBase = new Graphics();
  private gShapes = new Graphics();
  private gNoise = new Graphics();
  private gVignette = new Graphics();

  private sprite = new Sprite();

  constructor(
    public readonly seed: number,
    public height: number,
    public width: number,
  ) {

    this.container = new Container();
    this.rng = PixiMath.mulberry32(seed)

    this.container.addChild(this.gBase, this.gShapes, this.gNoise, this.gVignette);
  }

  // region IPixiSkeleton Implementation
  get graphic(): Container {
    return this.sprite;
  }

  async init(app: Application): Promise<void> {
  }

  get active(): boolean {
    return true;
  }

  set active(active: boolean) {
    /* noop */
  }

  getStageID(): StageIDS | null {
    /* not for image generator interesting */
    return null;
  }
  // endregion

  // region image generation

  private pick<T>(arr: T[]): T {
    return arr[(this.rng() * arr.length) | 0];
  }
  private r(min: number, max: number): number {
    return min + (max - min) * this.rng();
  }
  private ri(min: number, max: number): number {
    return (this.r(min, max) | 0);
  }
  private addAlpha(value: number, min: number, max: number): number {
    const alpha = Math.round(this.r(min, max) * 255);
    const str = value.toString(16) + alpha.toString(16);
    return parseInt(str, 16);
  }

  public generateImage(app: Application): Texture {
    /* replace with procedural image generation */
    const colors = [0xD5573B, 0x885053, 0x777DA7,0x94C9A9, 0xC6ECAE];
    const color1 = colors[Math.floor(this.rng() * colors.length)];
    const color2 = colors[Math.floor(this.rng() * colors.length)];
    const color3 = colors[Math.floor(this.rng() * colors.length)];

    // Create a vertical linear gradient from red to blue
    const linearGradient = new FillGradient({
      type: 'linear',
      start: { x: 0, y: 0 },  // Start at top
      end: { x: 0, y: 1 },    // End at bottom
      colorStops: [
        { offset: 0, color: color1 },   // Red at start
        { offset: .3, color: color1 },   // Red at start
        { offset: .31, color: color2 },   // Blue at end
        { offset: .67, color: color2 },   // Blue at end
        { offset: .68, color: color3 },   // Blue at end
        { offset: 1, color: color3 }   // Blue at end
      ],
      // Use normalized coordinate system where (0,0) is the top-left and (1,1) is the bottom-right of the shape
      textureSpace: 'local'
    });
    const container = new Container();
    container.addChild(
      new Graphics()
        .rect(0, 0, this.width, this.height)
        .fill(linearGradient)
    )

    const texture = app.renderer.generateTexture(container);

    container.destroy();
    this.sprite.texture = texture;
    return texture;
  }

  public generateImageV2(app: Application): Texture {
    // clear reused graphics
    this.gBase.clear();
    this.gShapes.clear();
    this.gNoise.clear();
    this.gVignette.clear();

    const W = this.width;
    const H = this.height;

    // --- palette (seeded)
    const palette = [
      0xD5573B, 0x885053, 0x777DA7, 0x94C9A9, 0xC6ECAE,
      0x254441, 0x43AA8B, 0xFF6F59, 0xDB504A,
      0xEC0B43, 0x58355E, 0x7AE7C7, 0xD6FFB7, 0xFFF689,
      0x23f0c7,0xef767a,0x7d7abc,0x6457a6,0xffe347
    ];
    const c1 = this.pick(palette);
    const c2 = this.pick(palette);
    const c3 = this.pick(palette);

    // --- base gradient background
    const grad = new FillGradient({
      type: 'linear',
      start: { x: 0, y: 0 },
      end: { x: this.r(-0.2, 0.2), y: 1 },
      colorStops: [
        { offset: 0.0, color: c1 },
        { offset: 0.55, color: c2 },
        { offset: 1.0, color: c3 },
      ],
      textureSpace: 'local',
    });

    this.gBase
      .rect(0, 0, W, H)
      .fill(grad);

    // --- large soft “blobs” (gives structure)
    const blobCount = this.ri(6, 14);
    for (let i = 0; i < blobCount; i++) {
      const x = this.r(-W * 0.2, W * 1.2);
      const y = this.r(-H * 0.2, H * 1.2);
      const r = this.r(Math.min(W, H) * 0.12, Math.min(W, H) * 0.55);

      const inner = this.pick(palette);
      const outer = this.pick(palette);
      const innerWithAlpha = '#' + this
        .addAlpha(inner,  .22, .55)
        .toString(16)
        .padStart(8, '0');

      // const radial = new FillGradient({
      //   type: 'radial',
      //   start: { x: 0.5, y: 0.5, r: 0.0 },
      //   end: { x: 0.5 + this.r(-0.15, 0.15), y: 0.5 + this.r(-0.15, 0.15), r: 1.0 },
      //   colorStops: [
      //     { offset: 0.0, color: inner, alpha: this.r(0.20, 0.55) },
      //     { offset: 1.0, color: outer, alpha: 0.0 },
      //   ],
      //   textureSpace: 'local',
      // });
      const radial = new FillGradient({
        type: 'radial',
        center: { x: 0.5, y: 0.5 },
        innerRadius: 0,
        outerRadius: 1,
        outerCenter: { x: 0.5 + this.r(-0.15, 0.15), y: 0.5 + this.r(-0.15, 0.15) },
        textureSpace: 'local',
        colorStops: [
              { offset: 0.0, color: innerWithAlpha },
              { offset: 1.0, color: outer },
        ]
      });
      this.gShapes
        .circle(x, y, r)
        .fill(radial);
    }

    // --- some hard geometry (contrast / “interesting” edges)
    const stripeCount = this.ri(3, 9);
    for (let i = 0; i < stripeCount; i++) {
      const y = this.r(-H * 0.2, H * 1.2);
      const h = this.r(8, 40);
      const col = this.pick(palette);
      const alpha = this.r(0.06, 0.18);

      this.gShapes
        .rect(0, y, W, h)
        .fill({ color: col, alpha });
    }

    // --- subtle speckle noise (cheap approach)
    // Don’t do per-pixel noise; just draw many tiny rectangles.
    const specks = this.ri(600, 1600);
    for (let i = 0; i < specks; i++) {
      const x = this.r(0, W);
      const y = this.r(0, H);
      const s = this.r(1, 2.5);
      this.gNoise
        .rect(x, y, s, s)
        .fill({ color: 0x000000, alpha: this.r(0.02, 0.05) });
    }

    // --- vignette (helps “photo-like” look)
    const blackWithAlpha = '#'+this
      .addAlpha(0x000000,  .25, .45)
      .toString(16)
      .padStart(8, '0');
    const vignette = new FillGradient({
      type: 'radial',
      center: { x: 0.5, y: 0.5 },
      innerRadius: .2,
      outerRadius: .9,
      outerCenter: { x: 0.5, y: 0.5 },
      colorStops: [
        { offset: 0.0, color: 0x000000 },
        { offset: 1.0, color:  blackWithAlpha},
      ],
      textureSpace: 'local',
    });

    this.gVignette
      .rect(0, 0, W, H)
      .fill(vignette);

    // Generate texture (v8 “system” API)
    // const texture = app.renderer.textureGenerator.generateTexture(this.container);
    const texture = app.renderer.generateTexture(this.container);
    this.sprite.texture = texture;
    return texture;
  }
  // endregion
}
