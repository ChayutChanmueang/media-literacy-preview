/** Pure board ops for G12 match-ring (design-g12.md §13.3–13.4). */

import type { PreviewResult, RingGrid, ShiftAxis, Tile, TileHue } from "./types";
import { TILE_HUES } from "./types";
import { findColorClusters } from "./cluster-find";

export function wrapIndex(index: number, size: number): number {
  return ((index % size) + size) % size;
}

let tileSeq = 0;

export function resetTileIdCounter(next = 0): void {
  tileSeq = next;
}

export function createTile(row: number, col: number, hue: TileHue): Tile {
  tileSeq += 1;
  return { id: `t${tileSeq}`, row, col, hue };
}

export function createRingGrid(
  size: number,
  fill: (row: number, col: number) => TileHue
): RingGrid {
  const tiles = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => createTile(row, col, fill(row, col)))
  );
  return { size, tiles };
}

export function randomHue(exclude?: ReadonlySet<TileHue>): TileHue {
  const pool = exclude
    ? TILE_HUES.filter((hue) => !exclude.has(hue))
    : [...TILE_HUES];
  const choices = pool.length > 0 ? pool : [...TILE_HUES];
  return choices[Math.floor(Math.random() * choices.length)]!;
}

/** steps > 0 = shift right; steps < 0 = shift left. */
export function shiftRow(grid: RingGrid, rowIndex: number, steps: number): RingGrid {
  const size = grid.size;
  const normalized = wrapIndex(steps, size);
  if (normalized === 0) return grid;

  const tiles = grid.tiles.map((row, r) => {
    if (r !== rowIndex) return row;
    const next = Array.from({ length: size }, (_, col) => {
      const sourceCol = wrapIndex(col - normalized, size);
      const source = row[sourceCol]!;
      return { ...source, row: r, col };
    });
    return next;
  });
  return { size, tiles };
}

/** steps > 0 = shift down; steps < 0 = shift up. */
export function shiftColumn(
  grid: RingGrid,
  colIndex: number,
  steps: number
): RingGrid {
  const size = grid.size;
  const normalized = wrapIndex(steps, size);
  if (normalized === 0) return grid;

  const tiles = grid.tiles.map((row, r) =>
    row.map((tile, c) => {
      if (c !== colIndex) return tile;
      const sourceRow = wrapIndex(r - normalized, size);
      const source = grid.tiles[sourceRow]![colIndex]!;
      return { ...source, row: r, col: c };
    })
  );
  return { size, tiles };
}

/** Round offset then wrap into shortest signed steps for preview/commit. */
export function previewShiftSimple(
  grid: RingGrid,
  axis: ShiftAxis,
  index: number,
  offset: number,
  minSize: number
): PreviewResult {
  const rounded = Math.round(offset);
  const size = grid.size;
  let steps = wrapIndex(rounded, size);
  if (steps > size / 2) steps -= size;
  const next =
    axis === "row" ? shiftRow(grid, index, steps) : shiftColumn(grid, index, steps);
  return { grid: next, clusters: findColorClusters(next, minSize), steps };
}
