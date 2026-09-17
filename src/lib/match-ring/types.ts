/** Match-ring types for G12 — clean-room names (design-g12.md §13). */

export type TileHue = "coral" | "mint" | "sky" | "sand";

export const TILE_HUES: readonly TileHue[] = [
  "coral",
  "mint",
  "sky",
  "sand",
] as const;

export type Tile = {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  readonly hue: TileHue;
};

export type RingGrid = {
  readonly size: number;
  readonly tiles: ReadonlyArray<ReadonlyArray<Tile>>;
};

export type ColorCluster = {
  readonly hue: TileHue;
  readonly tiles: readonly Tile[];
  readonly size: number;
};

export type ShiftAxis = "row" | "col";

export type PreviewResult = {
  readonly grid: RingGrid;
  readonly clusters: readonly ColorCluster[];
  readonly steps: number;
};
