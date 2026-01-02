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
import { Colors } from '../../enums/Colors';
import { StageIDS } from '../../enums/StageIDS';
import { Grid } from '../data/Grid';
import { GridData } from '../data/GridData';
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
      x = col * tileW;
      y = row * tileH;
      rectangles.push(new Rectangle(x, y, tileW, tileH));
    }
    return rectangles;
  }

  private calculateGridInTextureSpace(): Rectangle[] {
    const rects: Rectangle[] = [];

    // This is the region inside the base texture that this Texture represents
    const tf = this.image.frame; // Rectangle in base texture pixels
    const tileW = tf.width / this.columns;
    const tileH = tf.height / this.rows;

    for (let i = 0; i < this.columns * this.rows; i++) {
      const col = i % this.columns;
      const row = Math.floor(i / this.columns);

      rects.push(
        new Rectangle(
          tf.x + col * tileW,
          tf.y + row * tileH,
          tileW,
          tileH
        )
      );
    }

    return rects;
  }

  private buildGridData(): GridData[] {
    const gridData: GridData[] = [];
    const tilesN = this.columns * this.rows;
    const tf = this.image.frame;
    const gs = { width: this.width, height: this.height };
    for (let i = 0; i < tilesN; i++) {
      gridData.push(new GridData(i, this.columns, this.rows, tf, gs))
    }
    return gridData;
  }

  private grid2SpriteDataV1(rects: Rectangle[]): SpritesheetData {
    // Use the underlying source size (pixel size), not layout width/height.
    // const texW = this.width //this.image.source.width;
    const texW = this.image.source.width;
    // const texH = this.height //this.image.source.height;
    const texH = this.image.source.height;

    const data: SpritesheetData = {
      meta: { scale: "1",  size: { w: texW, h: texH }, },
      frames: {},
      animations: {},
    };

    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      // Avoid fractional atlas coordinates
      const x = r.x;//Math.round(r.x);
      const y = r.y//Math.round(r.y);
      const w = r.width//Math.round(r.width);
      const h = r.height//Math.round(r.height);

      const frameName = `image_${i + 1}.png`;

      data.frames![frameName] = {
        frame: { x, y, w, h },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w, h },
        sourceSize: { w, h },
        // anchor: { x: 0.5, y: 0.5 }, // optional, only if you want it
      };

      data.animations![frameName] = [frameName];
    }
    return data;
  }

  private grid2SpriteDataV2(rects: Rectangle[]): SpritesheetData {
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

    for (let index = 0; index < rects.length; index++) {
      const r = rects[index];
      const frameName = `image_${index + 1}.png`;

      data.frames![frameName] = {
        frame: { x: r.x, y: r.y, w: r.width, h: r.height },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: r.width, h: r.height },
        sourceSize: { w: r.width, h: r.height },
      };

      data.animations![frameName] = [frameName];
    }

    return data;
  }
  private gridData2SpriteData(grid: GridData[]): SpritesheetData {
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

    for (let index = 0; index < grid.length; index++) {
      const gridData = grid[index];
      const frameName = gridData.gridID;//`gridImg_${gridData.gridID}.png`;
      const rect = gridData.frameRect;
      data.frames![frameName] = {
        frame: {...rect},
        rotated: false,
        trimmed: false,
        spriteSourceSize: {...rect, x: 0, y: 0},
        sourceSize: {...rect},
      }
      data.animations![gridData.gridID] = [frameName];
    }

    return data;
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
  async initV1(app: Application): Promise<void> {
    const grids = this.calculateGrid();

    const data = this.grid2SpriteDataV1(grids);
    this.sheet = new Spritesheet(this.image, data)
    await this.sheet.parse();
    console.log('Spritesheet ready to use!', data);
    let index = 1;
    // let index = this.rows * this.rows;
    for (const grid of grids) {
      // const frameName = `image_${index + 1}.png`;
      const frameName = `image_${index}.png`;
      console.log('frameName', frameName)
      const sprite = new Sprite(this.sheet.textures[frameName])
      sprite.x = grid.x;
      sprite.y = grid.y;
      sprite.width = grid.width;
      sprite.height = grid.height;
      this.container.addChild(sprite)
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

  async initV2(app: Application): Promise<void> {
    const sliceRects = this.calculateGridInTextureSpace(); // for spritesheet frames (pixels)

    const data = this.grid2SpriteDataV2(sliceRects);
    this.sheet = new Spritesheet(this.image.source, data);
    await this.sheet.parse();

    // display grid sizes (world/display space)
    const tileW = this.width / this.columns;
    const tileH = this.height / this.rows;

    const size = this.columns * this.rows
    for (let i = 0; i < size; i++) {
      const frameName = `image_${(size + 1) - (i + 1)}.png`;
      // const frameName = `image_${(i + 1)}.png`;

      const col = i % this.columns;
      const row = Math.floor(i / this.columns);

      const sprite = new Sprite(this.sheet.textures[frameName]);
      sprite.x = col * tileW;
      sprite.y = row * tileH;
      sprite.width = tileW;
      sprite.height = tileH;
      console.log(
        col * tileW, row * tileH, tileW, tileH,
        sliceRects[i],
      );
      this.container.addChild(sprite);
      this.container.addChild(
        new Graphics()
          .rect(col * tileW, row * tileH, tileW, tileH)
          // .fill(Colors.Separator)
          .stroke({
            width: 2,
            color: Colors.Secondary,
            alignment: 1,
          })
      )
    }
  }

  async initV3(app: Application): Promise<void> {
    const grid = this.buildGridData();
    const spritesheetData = this.gridData2SpriteData(grid);

    console.log(grid);
    console.log(spritesheetData);
    this.sheet = new Spritesheet(this.image.source, spritesheetData);
    await this.sheet.parse();
    console.log('Spritesheet ready to use!', grid);
    for (let index = 0; index < grid.length; index++) {
      const gridData = grid[(grid.length - 1) - index];
      const sprite = new Sprite(this.sheet.textures[gridData.gridID]);
      sprite.x = gridData.tileX;
      sprite.y = gridData.tileY;
      sprite.width = gridData.tileW;
      sprite.height = gridData.tileH;

      this.container.addChild(sprite);
      this.container.addChild(
        new Graphics()
          .rect(gridData.tileX, gridData.tileY, gridData.tileW, gridData.tileH)
          // .fill(Colors.Separator)
          .stroke({
            width: 2,
            color: Colors.Secondary,
            alignment: 1,
          })
      )
    }
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
