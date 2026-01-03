import { Application, Container, Graphics, Sprite, Spritesheet, Text } from 'pixi.js';
import { Colors } from '../../enums/Colors';
import { StageIDS } from '../../enums/StageIDS';
import { Grid } from '../data/Grid';
import { GridTile } from '../data/GridTile';
import DefaultTextStyle from './DefaultTextStyle';
import { IPixiSkeleton } from './IPixiSkeleton';

export class ImageTile implements IPixiSkeleton {
  public active: boolean = true;
  private readonly container: Container;

  private sprite!: Sprite;
  private texLabel!: Text;
  private locLabel!: Text;


  public texTile!: GridTile;
  public locTile!: GridTile;

  public border!: Graphics;
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
    const locTile = this.grid.tileByIndex(this.initLocIndex);
    this.texTile = texTile;
    this.locTile = locTile;

    this.sprite = new Sprite();
    this.texLabel = new Text({ style: DefaultTextStyle,  text: '' })
    this.locLabel = new Text({ style: DefaultTextStyle,  text: '' })
    this.border = new Graphics()
      .rect(0, 0, locTile.tileW, locTile.tileH)
      .stroke({
        width: 1,
        color: Colors.Separator,
        alignment: 1,
      })
    this.container.addChild(this.sprite);
    this.container.addChild(this.texLabel);
    this.container.addChild(this.locLabel);
    this.container.addChild(this.border)
    this.prepareLayout();
  }

  public setupLocationIndex(locIndex: number): void {
    this.locTile = this.grid.tileByIndex(locIndex);
    this.prepareLayout();
  }
  private prepareLayout(): void {
    const texTile = this.texTile;
    const locTile = this.locTile;

    const isOnRightSpot = texTile.gridTileID === locTile.gridTileID;

    this.container.x = locTile.tileX;
    this.container.y = locTile.tileY;

    this.sprite.texture = this.spritesheet.textures[texTile.gridTileID];
    this.sprite.width = locTile.tileW;
    this.sprite.height = locTile.tileH;

    this.texLabel.text = texTile.gridHumanTileID;

    this.texLabel.anchor.set(0.5, 0.5);
    this.texLabel.x = this.container.width / 2;
    this.texLabel.y = this.container.height / 2;

    this.locLabel.text = locTile.gridHumanTileID;

    this.border.visible = !isOnRightSpot;
    this.locLabel.visible = !isOnRightSpot;
    this.texLabel.visible = !isOnRightSpot;
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
