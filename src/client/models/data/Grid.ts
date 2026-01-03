import { Size, Rectangle, Point, Dict, PointData } from 'pixi.js';
import { GridTile } from './GridTile';


type Coords = { col: number; row: number };

export class Grid {
  private _size!: number;
  // display space
  public readonly tileW: number;
  public readonly tileH: number;
  // texture space
  public readonly texTileW: number;
  public readonly texTileH: number;

  gridCache: Dict<GridTile> = {};
  constructor(
    public readonly columns: number,
    public readonly rows: number,
    public readonly texFrame: Rectangle,
    public readonly gridSize: Size,
  ) {
    // display grid sizes (world/display space)
    this.tileW = gridSize.width / this.columns;
    this.tileH = gridSize.height / this.rows;
    // frame grid sizes (texture/image space)
    this.texTileW = texFrame.width / this.columns;
    this.texTileH = texFrame.height / this.rows;

    // for (let i = 0; i < this.columns; i++) {
    //   for (let j = 0; j < this.rows; j++) {
    //       this[i] = this.gridTileForIndex(i);
    //   }
    // }
  }

  get size(): number {
    if (!this._size) {
      this._size = this.columns * this.rows;
    }
    return this._size;
  }

  tileIdByIndex(index: number): string {
    const { col, row } = this.index2Coords(index);
    return `${row}x${col}`;
  }
  tileIdByCoords(col: number, row: number): string {
    return `${row}x${col}`;
  }

  index2Coords(index: number): Coords {
    const col = index % this.columns;
    const row = Math.floor(index / this.columns);
    return { col, row };
  }
  coords2Index(col: number, row: number): number {
    return (row * this.columns) + col;
  }

  tileByIndex(index: number): GridTile {
    const { row, col } = this.index2Coords(index);
    return this.tileByData(col, row, index);
  }

  tileByCoords(col: number, row: number): GridTile {
    return this.tileByData(col, row);
  }

  private tileByData(col: number, row: number, index = this.coords2Index(col, row)): GridTile {
    const tileId = this.tileIdByCoords(col, row);
    if (!this.gridCache[tileId]) this.gridCache[tileId] = this.initNewTile(index, col, row);
    return this.gridCache[tileId];
  }

  private initNewTile(
    index: number,
    col: number,
    row: number,
  ): GridTile {
    return new GridTile(
      index,
      this.columns, this.rows,
      col, row,
      col * this.tileW, row * this.tileH,
      this.tileW, this.tileH,
      this.texFrame.x + col * this.texTileW,
      this.texFrame.y + row * this.texTileH,
      this.texTileW,
      this.texTileH,
    )
  }

  public nearestGridTile(point: PointData): GridTile {
    // Convert point -> grid coords in display/world space
    const col = Math.round(point.x / this.tileW);
    const row = Math.round(point.y / this.tileH);

    // Clamp to valid grid bounds
    const clampedCol = Math.max(0, Math.min(this.columns - 1, col));
    const clampedRow = Math.max(0, Math.min(this.rows - 1, row));

    return this.tileByCoords(clampedCol, clampedRow);
  }
}
