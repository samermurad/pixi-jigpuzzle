import { Size, Rectangle, Point, Dict, PointData } from 'pixi.js';
import { GridTile } from './GridTile';


export type GridTileCoords = { col: number; row: number };

export type ShiftedTile = {
  // the tile that originally lived at `fromIndex`
  fromIndex: number;
  fromCol: number;
  fromRow: number;

  // where it should be after the shift
  toIndex: number;
  toCol: number;
  toRow: number;

  // convenience: new display position for anything you want to move
  toX: number;
  toY: number;

  // convenience ids
  fromId: string;
  toId: string;
};

export class Grid implements Iterable<GridTile> {
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

  index2Coords(index: number): GridTileCoords {
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

  // /**
  //  * Reorders tiles by moving the tile at currentCoords to nextCoords (row-major order),
  //  * shifting everything in-between by 1.
  //  *
  //  * Returns an array for ALL tiles describing from -> to, so you can update other elements.
  //  * Does NOT mutate GridTile objects (because GridTile fields are readonly).
  //  */
  // public shiftTiles(currentCoords: GridTileCoords, nextCoords: GridTileCoords): ShiftedTile[] {
  //   const fromIndex = this.coords2Index(currentCoords.col, currentCoords.row);
  //   const toIndex = this.coords2Index(nextCoords.col, nextCoords.row);
  //
  //   // No-op: still return full mapping (identity)
  //   if (fromIndex === toIndex) {
  //     return Array.from({ length: this.size }, (_, i) => {
  //       const { col, row } = this.index2Coords(i);
  //       return {
  //         fromIndex: i,
  //         fromCol: col,
  //         fromRow: row,
  //         toIndex: i,
  //         toCol: col,
  //         toRow: row,
  //         toX: col * this.tileW,
  //         toY: row * this.tileH,
  //         fromId: this.tileIdByCoords(col, row),
  //         toId: this.tileIdByCoords(col, row),
  //       };
  //     });
  //   }
  //
  //   const mapIndex = (i: number): number => {
  //     // tile being moved
  //     if (i === fromIndex) return toIndex;
  //
  //     // shifting down (forward)
  //     if (fromIndex < toIndex) {
  //       // tiles between (fromIndex, toIndex] move one step left (index - 1)
  //       if (i > fromIndex && i <= toIndex) return i - 1;
  //       return i;
  //     }
  //
  //     // shifting up (backward)
  //     // tiles between [toIndex, fromIndex) move one step right (index + 1)
  //     if (i >= toIndex && i < fromIndex) return i + 1;
  //     return i;
  //   };
  //
  //   const result: ShiftedTile[] = [];
  //   for (let i = 0; i < this.size; i++) {
  //     const from = this.index2Coords(i);
  //     const newIndex = mapIndex(i);
  //     const to = this.index2Coords(newIndex);
  //
  //     result.push({
  //       fromIndex: i,
  //       fromCol: from.col,
  //       fromRow: from.row,
  //
  //       toIndex: newIndex,
  //       toCol: to.col,
  //       toRow: to.row,
  //
  //       toX: to.col * this.tileW,
  //       toY: to.row * this.tileH,
  //
  //       fromId: this.tileIdByCoords(from.col, from.row),
  //       toId: this.tileIdByCoords(to.col, to.row),
  //     });
  //   }
  //
  //   return result;
  // }

  /**
   * Reorders tiles by moving the tile at currentCoords to nextCoords (row-major order),
   * shifting everything in-between by 1.
   *
   * Returns an array for ALL tiles describing from -> to, so you can update other elements.
   * Does NOT mutate GridTile objects (because GridTile fields are readonly).
   */
  public shiftTiles(currentCoords: GridTileCoords, nextCoords: GridTileCoords): [GridTile, GridTile] {
    const fromIndex = this.coords2Index(currentCoords.col, currentCoords.row);
    const toIndex = this.coords2Index(nextCoords.col, nextCoords.row);

    const tileFrom = this.tileByIndex(fromIndex);
    const tileTo = this.tileByIndex(toIndex);
    return [tileFrom, tileTo];
  }

  [Symbol.iterator](): Iterator<GridTile> {
      let currentIndex = 0;
      const size = this.size;
      const tileByIndex = this.tileByIndex.bind(this);
      return {
        next(): IteratorResult<GridTile> {
            if (currentIndex < size) {
              const nextData = currentIndex++
              return {
                value: tileByIndex(nextData),
                done: false,
              }
            } else {
              return { done: true, value: undefined };
            }
        }

      }
  }
}
