export class GridTile {
  constructor(
    public readonly index: number,
    public readonly columns: number,
    public readonly rows: number,

    public readonly col: number,
    public readonly row: number,
    // display space
    public readonly tileX: number,
    public readonly tileY: number,
    public readonly tileW: number,
    public readonly tileH: number,
    // texture space
    public readonly texTileX: number,
    public readonly texTileY: number,
    public readonly texTileW: number,
    public readonly texTileH: number,
  ) {
  }

  get gridTileID(): string {
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

  get gridRect(): { x: number; y: number; w: number; h: number } {
    return {
      x: this.texTileX,
      y: this.texTileY,
      w: this.texTileW,
      h: this.texTileH,
    }
  }
}
