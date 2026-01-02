import {
  Application,
  Container,
  Texture,
  Spritesheet,
  Rectangle,
  Graphics,
  Color,
  SpritesheetData,
  Dict, Sprite
} from 'pixi.js';
import { SpritesheetFrameData } from 'pixi.js/lib/spritesheet/Spritesheet';
import { Colors } from '../enums/Colors';
import { StageIDS } from '../enums/StageIDS';
import { IPixiSkeleton } from './IPixiSkeleton';


export class ImageGrid implements IPixiSkeleton {
  private readonly container: Container;
  private sheet!: Spritesheet;
  private isActive: boolean = true;

  constructor(
    public readonly image: Texture,
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
    public readonly columns: number,
    public readonly rows: number,
  ) {
      this.container = new Container();
      this.container.x = x;
      this.container.y = y;
  }

  private calculateGrid(): Rectangle[] {
    const rectangles: Rectangle[] = [];
    const tileW = this.width / this.columns;
    const tileH = this.height / this.rows;
    let x = 0;
    let y = 0;
    const tiles = this.columns * this.rows;
    for (let i = 0; i < tiles; i++) {
      const col = (i % this.columns);
      const row = Math.floor(i / this.columns);
      //             5x5
      // (0,0) (1,0) (2,0) (3,0) (4,0)
      //   0.    1.    2.    3.    4.
      //   0.    1.    2.    3.    4.
      // (0,1) (1,1) (2,1) (3,1) (4,1)
      //   0.    1.    2.    3.    4.
      //   5.    6.    7.    8.    9.
      // (0,2) (1,2) (2,2) (3,2) (4,2)
      //  10.    11.   12.   13.   14.
      // (0,3) (1,3) (2,3) (3,3) (4,3)
      //  15.    16.   17.   18.   19.
      // (0,4) (1,4) (2,4) (3,4) (4,4)
      //   20.   21.   22.   23.   24.
      x = col * tileW;
      y = row * tileH;
      rectangles.push(new Rectangle(x, y, tileW, tileH));
    }
    return rectangles;
  }

  private grid2SpriteData(rects: Rectangle[]): SpritesheetData {
    const texW = this.image.width;
    const texH = this.image.height;
    const data = {
      meta: {
        scale: "1",
        size: {
          w: texW,
          h: texH,
        }
      },
      animations: {} as Dict<string[]>,
      frames: {} as Dict<SpritesheetFrameData>,
    } as SpritesheetData;

    for (let index = 0; index < rects.length; index++) {
        const rect = rects[index];
        const frameName = 'image_' + (index + 1) + '.png';
        const frame: SpritesheetFrameData = {
          frame: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
          spriteSourceSize: { x: 0, y: 0, w: rect.width, h: rect.width },
          sourceSize: { w: rect.width, h: rect.width },
          // anchor: { x:0.5, y: 0.5 },
        }
        data.frames[frameName] = frame;
        data.animations![frameName] = [frameName];
    }

    return data;
  }
  async init(app: Application): Promise<void> {
    const grids = this.calculateGrid();

    const data = this.grid2SpriteData(grids);
    this.sheet = new Spritesheet(this.image, data)
    await this.sheet.parse();
    console.log('Spritesheet ready to use!', data);

    let index = 0;
    // let index = this.rows * this.rows;
    for (const grid of grids) {
      const frameName = 'image_' + (index + 1) + '.png';
      console.log('frameName', frameName)
      const sprite = new Sprite(this.sheet.textures[frameName])
      sprite.x = grid.x;
      sprite.y = grid.y;
      sprite.width = grid.width;
      sprite.height = grid.height;
      // sprite.anchor.set(0.5)
      this.container.addChild(
        sprite
      )
      index++;
      // index--;
      this.container.addChild(
        new Graphics()
          .rect(grid.x, grid.y, grid.width, grid.height)
          // .fill(Colors.Separator)
          .stroke({
            width: 2,
            color: Colors.Secondary,
            alignment: 1,
          })
      )
    }
  }

  set active(active: boolean) {
    this.isActive = active;
    this.container.visible = active;
  }
  get active() {
    return this.isActive;
  }
  get graphic(): Container {
    return this.container;
  }

  getStageID(): StageIDS | null {
    return StageIDS.Main;
  }
}
