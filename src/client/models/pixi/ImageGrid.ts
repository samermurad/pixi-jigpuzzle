import {
  Application,
  Container,
  Texture,
  Spritesheet,
  Rectangle,
  Graphics,
  Color,
  SpritesheetData,
  Dict, Sprite, PointData, FederatedPointerEvent, Text
} from 'pixi.js';
import PixiMath from '../../../shared/models/PixiMath';
import { Colors } from '../../enums/Colors';
import { StageIDS } from '../../enums/StageIDS';
import { Grid } from '../data/Grid';
import { Vector2 } from '../data/Vector2';
import DefaultTextStyle from './DefaultTextStyle';
import { ImageTile } from './ImageTile';
import { IPixiSkeleton } from './IPixiSkeleton';
import { PixiStageAnimator } from './PixiStageAnimator';

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

export class ImageGrid implements IPixiSkeleton {
  private readonly container: Container;
  private sheet!: Spritesheet;
  private grid!: Grid;
  private isActive: boolean = true;
  private tiles: Dict<ImageTile> = {};

  private _weakApp!: WeakRef<Application>;

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
    this.container.sortableChildren = true;
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

  private tileToMoveData: {
    tile: ImageTile | null,
    initialOffset: Vector2,
  } = {
    tile: null,
    initialOffset: Vector2.ZERO,
  }
  private initializeMouseMove(): void {
    this.container.eventMode = 'static'
    this.container.on('globalpointermove', (event) => {
        // sprite.position.set(event.global.x, event.global.y);
        if (this.tileToMoveData.tile) {
          const {tile, initialOffset} = this.tileToMoveData;
          const [x, y] = initialOffset.sum(event.global).toArray()
          tile.graphic.position.set(x, y);
        }
    });
  }
  private initializeTileClicks(tile: ImageTile): void {
      const pixiObj = tile.graphic;
      pixiObj.eventMode = 'static';
      pixiObj.on('pointerdown', (event) => this.pickUpTile(tile, event));
      pixiObj.on('pointerup', (event) => this.releaseTile())
      pixiObj.on('pointerupoutside', (event) => this.releaseTile())
  }

  async init(app: Application): Promise<void> {
    this._weakApp = new WeakRef(app);
    const grid = this.initGrid();
    this.grid = grid;
    const spritesheetData = this.grid2SpriteData(grid);
    this.sheet = new Spritesheet(this.image.source, spritesheetData);
    await this.sheet.parse();
    // console.log('Spritesheet ready to use!');
    console.log(grid, spritesheetData);

    this.initializeMouseMove();

    const initialLocationIndices =
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
        initialLocationIndices[index], // should be randomized
      )
      this.tiles[tile.gridTileID] = imgTile;
      await imgTile.init(app);
      imgTile.graphic.zIndex = 0;
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

  // region handle TileMovement
  releaseTile(): void {
    console.log('releaseTile')
    const { tile } = this.tileToMoveData
    if (!tile) return
    this.tileToMoveData.tile = null;
    const pos = Vector2.fromArray([
      tile.graphic.x,
      tile.graphic.y,
    ]);
    tile.resetPosition()
    tile.graphic.zIndex = 0;
    this.container.sortChildren();
    // const fromCoords =
    const coords = this.grid.nearestGridTile(pos)
    void this.toast(
      tile.locTile.gridHumanTileID
      + ' to: ' +
      coords.gridHumanTileID
    )
  }

  pickUpTile(tile: ImageTile, event: FederatedPointerEvent): void {
    this.tileToMoveData.tile = tile;
    // get offset
    const offset = tile.graphic.toGlobal({ x: 0, y: 0 });
    this.tileToMoveData.initialOffset = Vector2
      .fromObject(offset)
      .sub(
        Vector2.fromArray([event.global.x,event.global.y])
      )
    // sort child above rest
    tile.graphic.zIndex = 1;
    this.container.sortChildren();
  }
  // endregion

  // region screen toasting
  public async toast(text: string): Promise<void> {
      const app = this._weakApp.deref();
      if (!app) return;

      const midOfScreen = new Vector2(
        this.container.width / 2,
        this.container.height / 2,
      );
      const downwards = midOfScreen.sumXY(0, this.container.height * .2);
      const upwards = midOfScreen.subXY(0, this.container.height * .2);
      const style = DefaultTextStyle.clone();
      style.fontSize = 40;
      const textToPop = new Text({
        style,
        text: text,
      });
      textToPop.anchor.set(0.5, 0.5);
      textToPop.alpha = 0;
      textToPop.x = midOfScreen.x;
      textToPop.y = midOfScreen.y;
      textToPop.zIndex = 100;
      this.container.addChild(textToPop);

      console.log(text);
      await (
        new PixiStageAnimator()
          .addStage('Appear', null, (_, data)=> {
            data.life += 0.06;
            const { x, y } = Vector2.lerp(downwards, midOfScreen, data.life);
            textToPop.x = x;
            textToPop.y = y;
            textToPop.alpha = PixiMath.lerp(0, 1, data.life)
            return data.life >= 1;
          })
          .addStage('Stay', null, (_, data)=> (data.life += 0.06) >= 4)
          .addStage('Disappear', null, (_, data)=> {
            data.life += 0.06;
            const { x, y } = Vector2.lerp(midOfScreen, upwards, data.life);
            textToPop.x = x;
            textToPop.y = y;
            textToPop.alpha = PixiMath.lerp(1, 0, data.life)
            return data.life >= 1;
          })
          .addStage('remove', null, () => {
            this.container.removeChild(textToPop);
            return true;
          })
          .run(app.ticker)
      )
  }
  // endregion
}
