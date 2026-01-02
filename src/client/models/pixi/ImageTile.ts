import { Application, Container, Graphics, Sprite, Spritesheet } from 'pixi.js';
import { Colors } from '../../enums/Colors';
import { StageIDS } from '../../enums/StageIDS';
import { Grid } from '../data/Grid';
import { GridTile } from '../data/GridTile';
import { IPixiSkeleton } from './IPixiSkeleton';

export class ImageTile implements IPixiSkeleton {
  public active: boolean = true;
  private readonly container: Container;
  // private sprite!: Sprite;

  constructor(
    private readonly grid: Grid,
    private readonly spritesheet: Spritesheet,
    private readonly texIndex: number, // the index of the tex data for the tile
    private readonly initLocIndex: number
  ) {

    this.container = new Container();
  }

  async init(app: Application): Promise<void> {
    const texTile = this.grid.tileByIndex(this.texIndex)
    const sprite = new Sprite(
      this.spritesheet.textures[texTile.gridTileID]
    )
    const locTile = this.grid.tileByIndex(this.initLocIndex);

    // sprite.x = tile.tileX;
    // sprite.y = tile.tileY;
    sprite.width = locTile.tileW;
    sprite.height = locTile.tileH;
    this.container.addChild(sprite);
    this.container.addChild(
      new Graphics()
        .rect(0, 0, locTile.tileW, locTile.tileH)
        .stroke({
          width: 2,
          color: Colors.Secondary,
          alignment: 1,
        })
    )
    // this.container.addChild(sprite);


    this.container.x = locTile.tileX;
    this.container.y = locTile.tileY;


  }

  getStageID(): StageIDS | null {
    return null;
  }

  get graphic(): Container {
    return this.container;
  }

  public resetPosition(): void {
    const locTile = this.grid.tileByIndex(this.initLocIndex);
    this.container.x = locTile.tileX;
    this.container.y = locTile.tileY;
  }
}
