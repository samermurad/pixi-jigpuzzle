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
import { ImageTile } from './ImageTile';
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


function shuffleArray(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function shuffledArray(array: number[]): number[] {
  let arr = ([] as number[]).concat(array);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// function shuffledArray(array) {
//   let arr = ([]).concat(array);
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [arr[i], arr[j]] = [arr[j], arr[i]];
//   }
//   return arr;
// }
export class ImageGrid implements IPixiSkeleton {
  private readonly container: Container;
  private sheet!: Spritesheet;
  private isActive: boolean = true;
  private tiles: Dict<ImageTile> = {};

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

  private tileToMove: ImageTile | null = null
  private initializeMouseMove(): void {
    this.container.eventMode = 'static'
    this.container.on('globalpointermove', (event) => {
        // sprite.position.set(event.global.x, event.global.y);
        if (this.tileToMove) {
          this.tileToMove.graphic.position.set(event.global.x, event.global.y);
        }
    });
  }
  private initializeTileClicks(tile: ImageTile): void {
      const pixiObj = tile.graphic;
      pixiObj.eventMode = 'static';
      pixiObj.on('pointerdown', () => {
        // this.minusSprite.alpha = 0.5;
        // this.minusSprite.scale.set(.9);
        this.tileToMove = tile;
      })
      pixiObj.on('pointerup', (event) => {
        this.tileToMove = null;
        tile.resetPosition()
      // this.minusSprite.alpha = 1;
      // this.minusSprite.scale.set(1);
      // this.onSpriteClicked(event, 'minus');
    })
    pixiObj.on('pointerupoutside', (event) => {
      this.tileToMove = null;
      tile.resetPosition()
      // this.minusSprite.alpha = 1;
      // this.minusSprite.scale.set(1);
      // this.onSpriteClicked(event, 'minus');
    })
  }
  async init(app: Application): Promise<void> {
    const grid = this.initGrid();
    const spritesheetData = this.grid2SpriteData(grid);
    this.sheet = new Spritesheet(this.image.source, spritesheetData);
    await this.sheet.parse();
    // console.log('Spritesheet ready to use!');
    console.log(grid, spritesheetData);

    this.initializeMouseMove();

    const shuffledIds =
      shuffledArray(
        Array(grid.size).fill(0).map((_, index)=> index)
      )

    for (let index = 0; index < grid.size; index++) {
      const tile = grid.tileByIndex(index);
      // const flippedTile = grid.tileIdByIndex(index)
      const imgTile = new ImageTile(
        grid,
        this.sheet,
        index,
        shuffledIds[index], // should be randomized
      )
      this.tiles[tile.gridTileID] = imgTile;
      await imgTile.init(app);
      this.container.addChild(
        imgTile.graphic
      )
      this.initializeTileClicks(imgTile);
    }
  }

  // async init(app: Application): Promise<void> {
  //   return this.initV4(app)
  // }

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
