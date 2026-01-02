import { Size, Rectangle, Point } from 'pixi.js';

export class GridData {
  // display space
  public readonly tileX: number;
  public readonly tileY: number;

  public readonly tileW: number;
  public readonly tileH: number;

  // texture space
  public readonly texTileX: number;
  public readonly texTileY: number;
  public readonly texTileW: number;
  public readonly texTileH: number;


  public readonly col: number;
  public readonly row: number;



  // private readonly texFrame: Rectangle;
  // private readonly gridSize: Size;

  constructor(
    public readonly index: number,
    public readonly columns: number,
    public readonly rows: number,
    texFrame: Rectangle,
    gridSize: Size,
    // public readonly col: number,
    // public readonly row: number,
  ) {
    // this.texFrame = texFrame.clone();
    // this.gridSize = { ...gridSize };

    this.col = this.index % this.columns;
    this.row = Math.floor(this.index / this.columns);

    // display grid sizes (world/display space)
    this.tileW = gridSize.width / this.columns;
    this.tileH = gridSize.height / this.rows;
    // frame grid sizes (texture/image space)
    this.texTileW = texFrame.width / this.columns;
    this.texTileH = texFrame.height / this.rows;


    this.texTileX = texFrame.x + this.col * this.texTileW;
    this.texTileY = texFrame.y + this.row * this.texTileH;


    this.tileX = this.col * this.tileW;
    this.tileY = this.row * this.tileH;
    // this.x = col * tileW;
    // this.y = row * tileW;
  }

  get gridID(): string {
    return `${this.row}x${this.col}`;
  }

  get frameRect(): { x: number; y: number; w: number; h: number } {
      return {
        x: this.texTileX,
        y: this.texTileY,
        w: this.texTileW,
        h: this.texTileH,
      }
  }
}
