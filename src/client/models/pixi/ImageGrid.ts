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
import { Colors } from '../../enums/Colors';
import { StageIDS } from '../../enums/StageIDS';
import { Grid } from '../data/Grid';
import { IPixiSkeleton } from './IPixiSkeleton';

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

  private initGrid(): Grid {
      return new Grid(
        this.columns,
        this.rows,
        this.image.frame,
        { width: this.width, height: this.height },
      )
  }

  private grid2SpriteData(grid: Grid): SpritesheetData {
    const baseW = this.image.source.width;
    const baseH = this.image.source.height;
    const data: SpritesheetData = {
      meta: {
        scale: "1",
        size: { w: baseW, h: baseH },
      },
      frames: {},
      animations: {},
    };

    for (let index = 0; index < grid.size; index++) {
      const gridData = grid.tileByIndex(index);
      const frameName = gridData.gridTileID;
      const rect = gridData.frameRect;
      data.frames![frameName] = {
        frame: {...rect},
        rotated: false,
        trimmed: false,
        spriteSourceSize: {...rect, x: 0, y: 0},
        sourceSize: {...rect},
      }
      data.animations![gridData.gridTileID] = [frameName];
    }

    return data;
  }
  async initV4(app: Application): Promise<void> {
      const grid = this.initGrid();
      const spritesheetData = this.grid2SpriteData(grid);
      this.sheet = new Spritesheet(this.image.source, spritesheetData);
      await this.sheet.parse();
      // console.log('Spritesheet ready to use!');
      console.log(grid, spritesheetData);
      for (let index = 0; index < grid.size; index++) {
          const tile = grid.tileByIndex(index);
        // const flippedTile = grid.tileIdByIndex((grid.size - 1) - index)
        const flippedTile = grid.tileIdByIndex(index)
        // console.log('Spritesheet ready to use!', tile, 'current Index', tile.gridTileID, 'flipped id', flippedTile);

        const sprite = new Sprite(this.sheet.textures[flippedTile]);

        sprite.x = tile.tileX;
        sprite.y = tile.tileY;
        sprite.width = tile.tileW;
        sprite.height = tile.tileH;
        this.container.addChild(sprite);
        this.container.addChild(
          new Graphics()
            .rect(tile.tileX, tile.tileY, tile.tileW, tile.tileH)
            .stroke({
              width: 2,
              color: Colors.Secondary,
              alignment: 1,
            })
        )
      }
  }

  async init(app: Application): Promise<void> {
    return this.initV4(app)
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
